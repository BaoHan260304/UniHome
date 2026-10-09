import React from 'react';
import { Link } from 'react-router-dom';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : 'Lỗi giao diện không xác định' };
  }

  componentDidCatch(error: unknown) {
    console.error('UniHome page error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-3xl mx-auto bg-white border rounded-2xl p-10 text-center shadow-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-2xl font-extrabold">Trang này đang gặp lỗi hiển thị</h1>
          <p className="mt-2 text-gray-600">Bạn vẫn có thể quay về trang chủ hoặc tải lại trang.</p>
          <p className="mt-4 text-xs text-gray-400 break-all">{this.state.message}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/" className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-medium">Về trang chủ</Link>
            <button onClick={() => window.location.reload()} className="border px-5 py-3 rounded-xl font-medium">Tải lại</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
