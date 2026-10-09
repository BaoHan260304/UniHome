import { useEffect, useState } from 'react';
import { api, getUser } from '../lib/api';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfileSettings from '../components/ProfileSettings';

export default function TenantDashboard({ view }: { view: 'profile' | 'favorites' | 'interests' | 'notifications' }) {
  const nav = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [profile, setProfile] = useState<any>(user || {});
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { nav('/login', { state: { from: location.pathname } }); return; }
    if (view === 'profile') {
      void api.get('/auth/me').then(r => setProfile(r.data)).catch(() => {});
      return;
    }
    setLoading(true);
    const req = view === 'favorites' ? api.get('/listings/favorites') : view === 'interests' ? api.get('/listings/interests') : api.get('/notifications/mine');
    void req.then(r => setData(r.data || [])).finally(() => setLoading(false));
  }, [view]);

  const tabs = [
    ['/tenant/profile', 'Trang cá nhân'], ['/tenant/favorites', 'Yêu thích'], ['/tenant/interests', 'Phòng quan tâm'],
    ['/tenant/matching', 'Hồ sơ Matching'], ['/tenant/wallet', 'Ví & giao dịch'], ['/tenant/notifications', 'Thông báo'], ['/chat', 'Chat']
  ];

  return <div className="space-y-8">
    <div className="flex flex-wrap gap-3 border-b pb-4">{tabs.map(([to, label]) => <button key={to} onClick={() => nav(to)} className={`px-4 py-2 rounded-xl border text-sm font-medium ${location.pathname === to ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white'}`}>{label}</button>)}</div>

    {view === 'profile' && <><div><h1 className="text-4xl font-extrabold tracking-tight">Trang cá nhân & Cài đặt</h1><p className="mt-2 text-lg text-gray-600">Cập nhật thông tin cá nhân, liên hệ, vị trí, bảo mật và hồ sơ công khai.</p></div><ProfileSettings profile={profile} setProfile={setProfile} onSaved={setProfile} showMatching /></>}

    {view === 'favorites' && <ListView title="Phòng đã lưu" subtitle="Danh sách phòng bạn đã đánh dấu để xem lại." loading={loading} empty="Bạn chưa lưu phòng nào." data={data} render={(x: any) => <button onClick={() => nav(`/property/${x.listingId}`)} className="w-full text-left p-5 hover:bg-gray-50"><b>Tin #{x.listingId}</b><span className="text-gray-400 text-sm ml-2">• đã lưu {x.createdAt ? new Date(x.createdAt).toLocaleString('vi-VN') : ''}</span></button>} />}

    {view === 'interests' && <ListView title="Phòng đang quan tâm" subtitle="Những phòng bạn đang theo dõi hoặc bật tìm bạn cùng phòng." loading={loading} empty="Bạn chưa quan tâm phòng nào." data={data} render={(x: any) => <button onClick={() => nav(`/property/${x.listingId}`)} className="w-full text-left p-5 hover:bg-gray-50"><b>Tin #{x.listingId}</b><span className={`ml-3 text-sm ${x.matchingEnabled ? 'text-purple-600' : 'text-gray-500'}`}>{x.matchingEnabled ? '• Đang tìm bạn cùng phòng' : '• Chỉ quan tâm'}</span></button>} />}

    {view === 'notifications' && <><div><h1 className="text-4xl font-extrabold">Thông báo</h1><p className="mt-2 text-lg text-gray-600">Duyệt tin, matching, thanh toán và cập nhật hệ thống.</p></div>{loading ? <Loading /> : <div className="space-y-3">{data.map((n: any) => <div key={n.id} className="bg-white p-5 rounded-xl border shadow-sm"><div className="text-xs text-indigo-600 font-bold">{n.type}</div><div className="mt-1">{n.message}</div><div className="text-xs text-gray-400 mt-2">{n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}</div></div>)}{!data.length && <Empty text="Chưa có thông báo." />}</div>}</>}
  </div>;
}

function ListView({ title, subtitle, loading, empty, data, render }: any) { return <><div><h1 className="text-4xl font-extrabold">{title}</h1><p className="mt-2 text-lg text-gray-600">{subtitle}</p></div>{loading ? <Loading /> : <div className="bg-white rounded-2xl border divide-y overflow-hidden">{data.map((x: any) => <div key={x.id}>{render(x)}</div>)}{!data.length && <Empty text={empty} />}</div>}</>; }
function Loading() { return <div className="h-40 flex items-center justify-center"><div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full" /></div>; }
function Empty({ text }: { text: string }) { return <div className="p-10 text-center text-gray-500">{text}</div>; }
