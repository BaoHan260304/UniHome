import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, saveAuth } from '../lib/api';

declare global {
  interface Window {
    google?: any;
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

type Props = {
  from?: string;
  onError?: (msg: string) => void;
};

export default function SocialAuthSection({ from = '/', onError }: Props) {
  const nav = useNavigate();
  const googleRef = useRef<HTMLDivElement>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

  // Google state
  const isGoogleConfigured = Boolean(googleClientId && String(googleClientId).trim().length > 0);
  const [googleLoading, setGoogleLoading] = useState(isGoogleConfigured);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // Facebook state
  const isFbConfigured = Boolean(fbAppId && String(fbAppId).trim().length > 0);
  const [fbLoading, setFbLoading] = useState(isFbConfigured);
  const [fbReady, setFbReady] = useState(false);
  const [fbError, setFbError] = useState('');
  const [fbAuthenticating, setFbAuthenticating] = useState(false);

  // Common auth error
  const [actionError, setActionError] = useState('');

  const handleAuthSuccess = (resData: any) => {
    setActionError('');
    if (resData.status === 'REQUIRE_COMPLETION') {
      nav('/social-complete', { state: { ...resData, from } });
      return;
    }
    if (resData.status === 'PENDING_VERIFICATION') {
      nav('/verify-otp', { state: { ...resData, from } });
      return;
    }
    saveAuth(resData);
    nav(from, { replace: true });
  };

  const handleAuthFailure = (msg: string) => {
    setActionError(msg);
    if (onError) onError(msg);
  };

  // Setup Google Identity Services
  useEffect(() => {
    if (!isGoogleConfigured) {
      setGoogleLoading(false);
      return;
    }

    let mounted = true;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !googleRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            try {
              setActionError('');
              const res = await api.post('/auth/google', { idToken: response.credential });
              handleAuthSuccess(res.data);
            } catch (err: any) {
              handleAuthFailure(err.response?.data?.message || 'Đăng nhập Google không thành công');
            }
          }
        });

        window.google.accounts.id.renderButton(googleRef.current, {
          theme: 'outline',
          size: 'large',
          width: 360,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        });

        if (mounted) {
          setGoogleReady(true);
          setGoogleLoading(false);
        }
      } catch (e: any) {
        if (mounted) {
          setGoogleError('Khởi tạo Google Sign-In thất bại');
          setGoogleLoading(false);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (mounted) initializeGoogle();
    };
    script.onerror = () => {
      if (mounted) {
        setGoogleError('Không thể tải Google SDK. Vui lòng kiểm tra kết nối.');
        setGoogleLoading(false);
      }
    };
    document.head.appendChild(script);

    return () => {
      mounted = false;
    };
  }, [isGoogleConfigured, googleClientId, from]);

  // Setup Facebook SDK
  useEffect(() => {
    if (!isFbConfigured) {
      setFbLoading(false);
      return;
    }

    let mounted = true;

    const initializeFb = () => {
      if (mounted) {
        setFbReady(true);
        setFbLoading(false);
      }
    };

    if (window.FB) {
      initializeFb();
      return;
    }

    (window as any).fbAsyncInit = function () {
      window.FB.init({
        appId: fbAppId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      if (mounted) initializeFb();
    };

    const s = document.createElement('script');
    s.src = 'https://connect.facebook.net/vi_VN/sdk.js';
    s.async = true;
    s.defer = true;
    s.onerror = () => {
      if (mounted) {
        setFbError('Không thể tải Facebook SDK. Vui lòng kiểm tra kết nối.');
        setFbLoading(false);
      }
    };
    document.head.appendChild(s);

    return () => {
      mounted = false;
    };
  }, [isFbConfigured, fbAppId]);

  const handleFacebookClick = () => {
    setActionError('');
    if (!isFbConfigured) return;
    if (!window.FB) {
      handleAuthFailure('Facebook SDK chưa sẵn sàng. Vui lòng thử lại sau.');
      return;
    }

    setFbAuthenticating(true);
    window.FB.login(
      (response: any) => {
        if (response.authResponse?.accessToken) {
          api.post('/auth/facebook', { accessToken: response.authResponse.accessToken })
            .then(res => handleAuthSuccess(res.data))
            .catch(err => {
              handleAuthFailure(err.response?.data?.message || 'Đăng nhập Facebook không thành công');
            })
            .finally(() => setFbAuthenticating(false));
        } else {
          setFbAuthenticating(false);
          if (response.status === 'not_authorized') {
            handleAuthFailure('Bạn chưa cấp quyền đăng nhập cho ứng dụng.');
          }
        }
      },
      { scope: 'email,public_profile' }
    );
  };

  return (
    <div className="space-y-3 w-full">
      {actionError && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 text-center font-medium">
          {actionError}
        </div>
      )}

      {/* 1. Google Option */}
      <div className="w-full">
        {!isGoogleConfigured ? (
          <div>
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-200 rounded-xl text-xs font-semibold text-gray-400 bg-gray-50 cursor-not-allowed shadow-xs"
            >
              <GoogleIcon className="w-4 h-4 opacity-50" />
              <span>Tiếp tục với Google</span>
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-1">Google Login chưa được cấu hình.</p>
          </div>
        ) : googleError ? (
          <div>
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-red-200 rounded-xl text-xs font-semibold text-gray-400 bg-red-50/20 cursor-not-allowed shadow-xs"
            >
              <GoogleIcon className="w-4 h-4 opacity-50" />
              <span>Tiếp tục với Google</span>
            </button>
            <p className="text-[11px] text-red-500 text-center mt-1">{googleError}</p>
          </div>
        ) : googleLoading || !googleReady ? (
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 bg-gray-50 cursor-not-allowed shadow-xs"
          >
            <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
            <span>Đang tải Google...</span>
          </button>
        ) : null}

        {/* Real GIS button rendered by Google */}
        {isGoogleConfigured && !googleError && (
          <div
            ref={googleRef}
            className={`w-full flex justify-center ${!googleReady ? 'hidden' : ''}`}
          />
        )}
      </div>

      {/* 2. Facebook Option */}
      <div className="w-full">
        {!isFbConfigured ? (
          <div>
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-200 rounded-xl text-xs font-semibold text-gray-400 bg-gray-50 cursor-not-allowed shadow-xs"
            >
              <FacebookIcon className="w-4 h-4 text-gray-400 opacity-60" />
              <span>Tiếp tục với Facebook</span>
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-1">Facebook Login chưa được cấu hình.</p>
          </div>
        ) : fbError ? (
          <div>
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-red-200 rounded-xl text-xs font-semibold text-gray-400 bg-red-50/20 cursor-not-allowed shadow-xs"
            >
              <FacebookIcon className="w-4 h-4 text-gray-400 opacity-60" />
              <span>Tiếp tục với Facebook</span>
            </button>
            <p className="text-[11px] text-red-500 text-center mt-1">{fbError}</p>
          </div>
        ) : fbLoading && !fbReady ? (
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 bg-gray-50 cursor-not-allowed shadow-xs"
          >
            <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
            <span>Đang tải Facebook...</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFacebookClick}
            disabled={fbAuthenticating}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-60"
          >
            {fbAuthenticating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-[#1877F2] rounded-full animate-spin" />
                <span>Đang kết nối Facebook...</span>
              </>
            ) : (
              <>
                <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                <span>Tiếp tục với Facebook</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
