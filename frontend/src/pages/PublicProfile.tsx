import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, getUser, resolveMediaUrl, money } from '../lib/api';

export default function PublicProfile() {
  const { id } = useParams();
  const [p, setP] = useState<any>();
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const me = getUser();

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${id}/public`)
      .then(r => setP(r.data))
      .catch(() => setP(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy người dùng</h2>
        <p className="text-gray-500 mt-2">Hồ sơ người dùng không tồn tại hoặc đã bị khóa.</p>
        <button onClick={() => nav('/')} className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold">
          Về trang chủ
        </button>
      </div>
    );
  }

  const follow = () => {
    if (!me) return nav('/login');
    api.post(`/users/${id}/follow`).then(r => {
      alert(r.data.following ? 'Đã theo dõi' : 'Đã bỏ theo dõi');
      setP((prev: any) => ({
        ...prev,
        followers: (prev.followers || 0) + (r.data.following ? 1 : -1)
      }));
    });
  };

  const chat = () => {
    if (!me) return nav('/login');
    api.post('/chat/conversations', { otherUserId: Number(id), contextType: 'PROFILE', contextId: Number(id) })
      .then(res => nav(`/chat?conversationId=${res.data?.id || res.data?.conversationId || ''}`));
  };

  const avatar = p.avatarUrl
    ? resolveMediaUrl(p.avatarUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName || 'UniHome')}&background=random`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <img
            src={avatar}
            alt={p.fullName}
            className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-indigo-50 shadow-sm"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900">{p.fullName}</h1>
            <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start mt-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700">
                {p.role === 'LANDLORD' ? 'Chủ trọ' : p.role === 'TENANT' ? 'Người thuê' : p.role}
              </span>
              {p.schoolName && <span className="text-xs text-gray-500">🎓 {p.schoolName}</span>}
            </div>

            <p className="text-sm text-gray-700 mt-3 leading-relaxed whitespace-pre-wrap">
              {p.bio || 'Chưa cập nhật phần giới thiệu bản thân.'}
            </p>

            <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500 justify-center md:justify-start">
              <span><b>{p.followers || 0}</b> người theo dõi</span>
              <span><b>{p.following || 0}</b> đang theo dõi</span>
            </div>

            <div className="flex flex-wrap gap-3 mt-5 justify-center md:justify-start items-center">
              {me?.id !== p.id && (
                <>
                  <button onClick={follow} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm">
                    Theo dõi
                  </button>
                  <button onClick={chat} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 px-5 py-2 rounded-xl text-xs font-bold transition-colors">
                    💬 Nhắn tin
                  </button>
                </>
              )}
              {p.facebookUrl && (
                <a href={p.facebookUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:underline px-2 py-1">
                  Facebook
                </a>
              )}
              {p.zaloUrl && (
                <a href={p.zaloUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-500 hover:underline px-2 py-1">
                  Zalo
                </a>
              )}
              {p.phone && (
                <span className="text-xs text-gray-600 font-semibold px-2 py-1 bg-gray-50 border rounded-lg">
                  📞 {p.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Public listings if landlord */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tin đăng công khai ({p.listings?.length || 0})</h2>
        <div className="space-y-3">
          {(p.listings || []).map((l: any) => (
            <button
              key={l.id}
              onClick={() => nav(`/property/${l.id}`)}
              className="w-full text-left p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex justify-between items-center gap-4"
            >
              <div>
                <b className="text-gray-900 text-sm font-bold">{l.title}</b>
                <div className="text-xs text-gray-500 mt-1">
                  {l.propertyType || 'Phòng trọ'} • {l.packageTier !== 'FREE' ? `★ ${l.packageTier}` : 'Tin tiêu chuẩn'}
                </div>
              </div>
              {l.price && <span className="text-indigo-600 font-extrabold text-sm">{money(l.price)}</span>}
            </button>
          ))}
          {!(p.listings || []).length && (
            <div className="text-gray-400 text-sm py-4 text-center">Người dùng chưa có tin đăng công khai nào.</div>
          )}
        </div>
      </div>
    </div>
  );
}
