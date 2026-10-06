import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Notification { id: number; message: string; status: string; type: string; senderId: number; }

export default function TenantDashboard({ view }: { view: string }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [isMatchingFormOpen, setIsMatchingFormOpen] = useState(false);

  const fetchUserAndNotifications = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const u = JSON.parse(userStr);
        setUser(u);
        Promise.all([
            axios.get(`http://localhost:8080/api/notifications/sender/${u.id}`),
            axios.get(`http://localhost:8080/api/notifications/receiver/${u.id}`)
        ]).then(([sentRes, recRes]) => {
            const allNotifs = [
                ...sentRes.data.filter((n:any)=>n.type==='RENT_REQUEST'), 
                ...recRes.data.filter((n:any)=>n.type==='MATCH_REQUEST' || n.type==='RENT_ACCEPTED')
            ];
            allNotifs.sort((a:any, b:any) => b.id - a.id);
            setNotifications(allNotifs);
        });
    }
  }

  useEffect(() => {
    fetchUserAndNotifications();
    
    const uStr = localStorage.getItem('user');
    if (uStr) {
        const u = JSON.parse(uStr);
        // Open form automatically if not set up yet
        if (!u.isLookingForRoommate || !u.characteristics) {
            setIsMatchingFormOpen(true);
        }
        
        const favIds = JSON.parse(localStorage.getItem(`favorites_${u.id}`) || '[]');
        if (favIds.length > 0) {
            axios.get(`http://localhost:8080/api/properties/available`).then(res => setFavorites(res.data.filter((p: any) => favIds.includes(p.id))));
        }
    }
  }, []);

  const handleSaveProfile = () => {
    const payload = {
        ...user,
        gender: user.gender || 'Nam',
        preferredGender: user.preferredGender || 'Bất kỳ'
    };
    axios.put(`http://localhost:8080/api/auth/profile/${user.id}`, payload)
        .then(res => { 
            alert('Lưu thông tin thành công!'); 
            localStorage.setItem('user', JSON.stringify(res.data)); 
            setUser(res.data);
            setIsMatchingFormOpen(false); // Collapse form after save
        });
  };
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post(`http://localhost:8080/api/auth/change-password/${user.id}`, { oldPassword, newPassword })
        .then(() => { alert('Đổi mật khẩu thành công!'); setOldPassword(''); setNewPassword(''); })
        .catch(err => alert(typeof err.response?.data === 'string' ? err.response.data : "Sai mật khẩu cũ!"));
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (file.size > 2 * 1024 * 1024) { alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB."); return; }
          const reader = new FileReader();
          reader.onload = (ev) => { if (ev.target?.result) setUser({...user, avatarUrl: ev.target.result as string}); };
          reader.readAsDataURL(file);
      }
  }

  const handleAcceptMatch = async (notifId: number, senderId: number) => {
      try {
          // Fetch sender info to show to current user
          const senderRes = await axios.get(`http://localhost:8080/api/auth/users/${senderId}`);
          const senderPhone = senderRes.data.phone;
          const senderName = senderRes.data.fullName;

          // Accept current notification
          await axios.put(`http://localhost:8080/api/notifications/${notifId}/status`, '"ACCEPTED"', {headers:{'Content-Type':'application/json'}});
          
          // Send notification to Sender with our contact info
          await axios.post('http://localhost:8080/api/notifications', {
              senderId: user.id, receiverId: senderId, type: 'MATCH_REQUEST', status: 'ACCEPTED',
              message: `${user.fullName} đã đồng ý ghép phòng! Zalo/SĐT: ${user.phone}`
          });

          // Create a system notification for OURSELVES with sender contact info, so we can see it too
          await axios.post('http://localhost:8080/api/notifications', {
              senderId: senderId, receiverId: user.id, type: 'MATCH_REQUEST', status: 'ACCEPTED',
              message: `Bạn đã đồng ý ghép phòng với ${senderName}. Zalo/SĐT của họ: ${senderPhone}`
          });
          
          fetchUserAndNotifications();
      } catch (err) { console.error(err); }
  }

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {view === 'profile' && (
        <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">Trang Cá Nhân Người Thuê</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold mb-6 border-b pb-4">Hồ sơ cá nhân</h3>
                    <form className="space-y-4">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="relative">
                                <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50 shadow-sm" alt="" />
                                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-indigo-700 shadow-md">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </label>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">{user.fullName}</h4>
                                <p className="text-sm text-gray-500">Người thuê</p>
                            </div>
                        </div>
                        <div><label className="block text-sm font-medium mb-1">Email</label><input className="w-full border-gray-300 rounded-lg p-2.5 border bg-gray-50" value={user.email} readOnly /></div>
                        <div><label className="block text-sm font-medium mb-1">Họ và Tên</label><input className="w-full border-gray-300 rounded-lg p-2.5 border" value={user.fullName || ''} onChange={e => setUser({...user, fullName: e.target.value})} /></div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-1">Số điện thoại / Zalo</label><input className="w-full border-gray-300 rounded-lg p-2.5 border" value={user.phone || ''} onChange={e => setUser({...user, phone: e.target.value})} /></div>
                            <div><label className="block text-sm font-medium mb-1">Giới tính</label>
                                <select className="w-full border-gray-300 rounded-lg p-2.5 border" value={user.gender || 'Nam'} onChange={e => setUser({...user, gender: e.target.value})}>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ngày tháng năm sinh</label>
                            <input type="date" className="w-full border-gray-300 rounded-lg p-2.5 border" value={user.dob || ''} onChange={e => setUser({...user, dob: e.target.value})} />
                        </div>
                        <div className="flex justify-end pt-4"><button type="button" onClick={handleSaveProfile} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold w-full shadow-md hover:bg-indigo-700">Lưu thông tin</button></div>
                    </form>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 h-fit">
                    <h3 className="text-xl font-bold mb-6 border-b pb-4">Đổi mật khẩu</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div><label className="block text-sm font-medium mb-1">Mật khẩu cũ</label><input type="password" required className="w-full border-gray-300 rounded-lg p-2.5 border" value={oldPassword} onChange={e => setOldPassword(e.target.value)} /></div>
                        <div><label className="block text-sm font-medium mb-1">Mật khẩu mới</label><input type="password" required className="w-full border-gray-300 rounded-lg p-2.5 border" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
                        <div className="text-right"><button type="button" onClick={() => alert('Đã gửi link khôi phục mật khẩu vào Email của bạn!')} className="text-sm text-indigo-600 font-medium hover:underline">Quên mật khẩu?</button></div>
                        <div className="pt-2"><button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold w-full shadow-md">Cập nhật mật khẩu</button></div>
                    </form>
                </div>
            </div>

            <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-5xl">
                <div className="flex items-center justify-between mb-4 border-b pb-4">
                    <h4 className="font-semibold text-2xl text-gray-900">Thiết lập Roommate Matching</h4>
                    <div className="flex items-center gap-4">
                        {user.isLookingForRoommate && (
                            <button onClick={() => setIsMatchingFormOpen(!isMatchingFormOpen)} className="text-indigo-600 font-bold hover:underline">
                                {isMatchingFormOpen ? 'Thu gọn ▲' : 'Chỉnh sửa ▼'}
                            </button>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                            <span className="font-medium text-indigo-700">Bật tìm bạn cùng phòng</span>
                            <input type="checkbox" checked={user.isLookingForRoommate} onChange={e => {
                                setUser({...user, isLookingForRoommate: e.target.checked});
                                if (e.target.checked) setIsMatchingFormOpen(true);
                            }} className="w-5 h-5 text-indigo-600 rounded" />
                        </label>
                    </div>
                </div>
                {user.isLookingForRoommate && isMatchingFormOpen && (
                    <div className="space-y-8 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Ngày tháng năm sinh</label>
                                <input type="date" className="w-full border-gray-300 rounded-lg p-2.5 border" value={user.dob || ''} onChange={e => setUser({...user, dob: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Muốn ghép với (Giới tính)</label>
                                <select className="w-full border-gray-300 rounded-lg p-2.5 border font-medium text-indigo-700" value={user.preferredGender || 'Bất kỳ'} onChange={e => setUser({...user, preferredGender: e.target.value})}>
                                    <option value="Bất kỳ">Bất kỳ giới tính nào</option>
                                    <option value="Nam">Chỉ Nam</option>
                                    <option value="Nữ">Chỉ Nữ</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-4 text-gray-700">Đặc điểm cơ bản (Hãy chọn các mục mô tả đúng về bạn)</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                {[
                                    'Thích nấu ăn tại nhà', 'Thường xuyên dọn dẹp', 'Hay thức khuya (>12h)', 'Ngủ sớm (trước 11h)', 
                                    'Ngáy to khi ngủ', 'Thích tiệc tùng/tụ tập', 'Ngại giao tiếp (Hướng nội)', 'Thích kết bạn (Hướng ngoại)',
                                    'Có nuôi thú cưng (chó/mèo)', 'Dị ứng lông động vật', 'Không hút thuốc', 'Hay dẫn bạn bè về phòng',
                                    'Thích không gian cực kỳ yên tĩnh', 'Làm việc part-time ca tối', 'Thích chơi nhạc cụ'
                                ].map((q, i) => (
                                    <label key={i} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input type="checkbox" className="rounded text-indigo-600 w-4 h-4" checked={(user.characteristics || '').includes(q)}
                                          onChange={(e) => {
                                              let chars = (user.characteristics || '').split('|').filter(Boolean);
                                              if (e.target.checked) chars.push(q); else chars = chars.filter((c: string) => c !== q);
                                              setUser({...user, characteristics: chars.join('|')});
                                          }}
                                        />
                                        <span className="text-gray-700 leading-tight">{q}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Giới thiệu bản thân & Yêu cầu đặc biệt</label>
                                <textarea className="w-full border-gray-300 rounded-lg p-2.5 border" rows={4} placeholder="Ví dụ: Mình là người hòa đồng, cần tìm bạn cùng phòng sạch sẽ..." 
                                    value={(user.matchingBio || '').split('|||')[0] || ''} 
                                    onChange={e => {
                                        const parts = (user.matchingBio || '').split('|||');
                                        setUser({...user, matchingBio: `${e.target.value}|||${parts[1] || ''}|||${parts[2] || ''}`});
                                    }}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Khung giờ sinh hoạt & Làm việc</label>
                                <textarea className="w-full border-gray-300 rounded-lg p-2.5 border" rows={4} placeholder="Ví dụ: Mình đi học sáng, chiều làm thêm..." 
                                    value={(user.matchingBio || '').split('|||')[1] || ''} 
                                    onChange={e => {
                                        const parts = (user.matchingBio || '').split('|||');
                                        setUser({...user, matchingBio: `${parts[0] || ''}|||${e.target.value}|||${parts[2] || ''}`});
                                    }}
                                ></textarea>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tài chính dự kiến (Ngân sách thuê phòng VND/tháng)</label>
                            <input type="text" className="w-full border-gray-300 rounded-lg p-2.5 border max-w-md font-medium text-indigo-700" placeholder="VD: 1.500.000 đến 2.000.000 VNĐ" 
                                value={(user.matchingBio || '').split('|||')[2] || ''} 
                                onChange={e => {
                                    const numStr = e.target.value.replace(/\D/g, '');
                                    const formatted = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                    const parts = (user.matchingBio || '').split('|||');
                                    setUser({...user, matchingBio: `${parts[0] || ''}|||${parts[1] || ''}|||${formatted}`});
                                }}
                            />
                        </div>
                        <div className="flex justify-end pt-4"><button type="button" onClick={handleSaveProfile} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-indigo-700">Lưu thông tin Matching</button></div>
                    </div>
                )}
            </div>
        </div>
      )}

      {view === 'notifications' && (
        <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">Thông báo</h1>
            <div className="max-w-3xl space-y-4">
                {notifications.length === 0 && <p className="text-gray-500 bg-white p-8 rounded-2xl shadow-sm text-center">Chưa có thông báo nào.</p>}
                {notifications.map(n => (
                    <div key={n.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
                        <div className={`p-3 rounded-full ${n.type === 'MATCH_REQUEST' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </div>
                        <div className="flex-1">
                            {n.type === 'RENT_REQUEST' && (
                                <>
                                    <h4 className="font-bold text-gray-900 text-lg">Yêu cầu thuê phòng</h4>
                                    <p className="text-gray-700 mt-1">Yêu cầu thuê khu trọ của bạn đã được gửi tới chủ trọ.</p>
                                    <p className="text-sm mt-3 font-medium">Trạng thái: {n.status === 'ACCEPTED' ? <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">Chủ trọ đã đồng ý liên hệ</span> : <span className="text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">Đang chờ phản hồi</span>}</p>
                                </>
                            )}
                            {n.type === 'RENT_ACCEPTED' && (
                                <>
                                    <h4 className="font-bold text-green-700 text-lg">Chủ trọ đã xác nhận!</h4>
                                    <p className="text-gray-800 font-medium mt-1">{n.message}</p>
                                </>
                            )}
                            {n.type === 'MATCH_REQUEST' && (
                                (() => {
                                    let parsedMsg = null;
                                    let plainText = n.message;
                                    try {
                                        parsedMsg = JSON.parse(n.message);
                                        plainText = parsedMsg.text;
                                    } catch(e) {}

                                    return (
                                        <>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg">Ghép phòng</h4>
                                                    <p className="text-gray-700 mt-1">{plainText}</p>
                                                </div>
                                                {parsedMsg && (
                                                    <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-black text-xl border-2 border-purple-200">
                                                        {parsedMsg.score}%
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {parsedMsg && (
                                                <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                    <p className="text-gray-800 text-sm italic mb-4">"{parsedMsg.reason}"</p>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-500 block mb-1">Giới tính & Ngày sinh</span>
                                                            <span className="font-medium text-gray-900">{parsedMsg.gender || 'Bí mật'} • {parsedMsg.dob || 'Bí ẩn'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 block mb-1">Tài chính</span>
                                                            <span className="font-medium text-indigo-700">{parsedMsg.budget || 'Thỏa thuận'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <span className="text-gray-500 text-sm block mb-2">Đặc điểm / Thói quen</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(parsedMsg.characteristics || '').split('|').filter(Boolean).map((c:string, i:number) => (
                                                                <span key={i} className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">{c}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-4">
                                                {n.status === 'PENDING' ? (
                                                    <button onClick={() => handleAcceptMatch(n.id, n.senderId)} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-sm">Đồng ý kết nối</button>
                                                ) : (
                                                    <span className="text-green-600 bg-green-50 px-4 py-2 rounded-lg font-bold border border-green-200">Đã kết nối thành công</span>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {view === 'favorites' && (
        <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">Phòng yêu thích</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                {favorites.length === 0 && <p className="text-gray-500 col-span-2 bg-white p-8 rounded-2xl shadow-sm text-center">Bạn chưa lưu phòng nào.</p>}
                {favorites.map(prop => {
                    const mediaList = prop.imageUrl && prop.imageUrl.startsWith('[') ? JSON.parse(prop.imageUrl) : (prop.imageUrl ? [prop.imageUrl] : []);
                    const coverImg = mediaList.length > 0 ? mediaList[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500';
                    return (
                    <div key={prop.id} onClick={() => navigate(`/property/${prop.id}`)} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                        <img src={coverImg} className="w-1/3 object-cover" alt="" />
                        <div className="p-4 flex-1">
                            <h4 className="font-bold text-gray-900 line-clamp-1">{prop.name}</h4>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{prop.street}, {prop.ward}</p>
                            <p className="text-indigo-600 font-bold mt-2 text-lg">{(prop.price).toLocaleString('vi-VN')} ₫</p>
                        </div>
                    </div>
                )})}
            </div>
        </div>
      )}
    </div>
  );
}
