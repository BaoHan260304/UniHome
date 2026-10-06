import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GEO_DATA: any = {
    "Hà Nội": { "Thạch Thất": ["Thạch Hòa", "Tân Xã", "Bình Yên"], "Cầu Giấy": ["Dịch Vọng", "Mai Dịch"] },
    "Hồ Chí Minh": { "Quận 1": ["Bến Nghé", "Bến Thành"], "Quận 7": ["Tân Phong", "Tân Quy"] }
};

interface Property { id: number; name: string; price: number; area: number; electricityPrice: number; waterPrice: number; province: string; district: string; ward: string; street: string; status: string; description: string; postType: string; totalRooms: number; availableRooms: number; imageUrl: string; furniture: string; }
interface Notification { id: number; senderId: number; message: string; status: string; }

export default function ManagerDashboard({ view }: { view: string }) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const emptyProp = { name: '', postType: 'single', totalRooms: 1, availableRooms: 1, province: '', district: '', ward: '', street: '', priceRaw: '', areaRaw: '', elecRaw: '', waterRaw: '', description: '', status: 'Available', imageUrl: '', furniture: 'full' };
    const [newProp, setNewProp] = useState(emptyProp);
    
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    // Monetization states
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) { navigate('/login'); return; }
        const u = JSON.parse(userStr);
        if (u.role !== 'manager') { navigate('/login'); return; }
        setUser(u);
        
        axios.post(`http://localhost:8080/api/properties/sync-subscription/${u.id}`)
            .then(() => axios.get(`http://localhost:8080/api/auth/users/${u.id}`))
            .then(res => {
                localStorage.setItem('user', JSON.stringify(res.data));
                setUser(res.data);
                return axios.get(`http://localhost:8080/api/properties/landlord/${u.id}`);
            })
            .then(res => setProperties(res.data))
            .catch(err => console.error(err));
            
        axios.get(`http://localhost:8080/api/notifications/receiver/${u.id}`).then(res => setNotifications(res.data));
    }, [navigate]);

    const safeParseMedia = (mediaStr: string) => {
        if (!mediaStr) return [];
        try {
            if (mediaStr.startsWith('[')) return JSON.parse(mediaStr);
            return [mediaStr];
        } catch { return [mediaStr]; }
    };

    const fetchData = () => {
        axios.get(`http://localhost:8080/api/properties/landlord/${user.id}`).then(res => setProperties(res.data));
        axios.get(`http://localhost:8080/api/notifications/receiver/${user.id}`).then(res => setNotifications(res.data));
    }

    const formatCurrency = (val: string) => {
        const numStr = val.replace(/\D/g, '');
        if (!numStr) return '';
        return parseInt(numStr).toLocaleString('vi-VN');
    };

    const handleCreateOrUpdate = (e: React.FormEvent, isDraft: boolean = false) => {
        e.preventDefault();
        
        const activePosts = properties.filter(p => p.status !== 'DRAFT').length;
        const currentLimit = user.postLimit || 3;
        if (!isDraft && !isEditing && activePosts >= currentLimit) {
            setShowUpgradeModal(true);
            return;
        }

        const payload = {
            ...newProp,
            landlordId: user.id,
            status: isDraft ? 'DRAFT' : 'Available',
            price: Number(newProp.priceRaw.replace(/\./g, '')),
            area: Number(newProp.areaRaw.replace(/\./g, '')),
            electricityPrice: Number(newProp.elecRaw.replace(/\./g, '')),
            waterPrice: Number(newProp.waterRaw.replace(/\./g, ''))
        };

        if (isEditing && editingId) {
            axios.put(`http://localhost:8080/api/properties/${editingId}`, payload)
                .then(() => { fetchData(); setIsAdding(false); setIsEditing(false); })
                .catch(() => alert("Lỗi khi cập nhật"));
        } else {
            axios.post('http://localhost:8080/api/properties', payload)
                .then(() => { fetchData(); setIsAdding(false); })
                .catch(() => alert("Lỗi khi tạo bài đăng"));
        }
    }
    
    const publishDraft = (p: Property) => {
        const activePosts = properties.filter(prop => prop.status !== 'DRAFT').length;
        const currentLimit = user.postLimit || 3;
        if (activePosts >= currentLimit) {
            setShowUpgradeModal(true);
            return;
        }
        axios.put(`http://localhost:8080/api/properties/${p.id}/status`, '"Available"', { headers: {'Content-Type': 'application/json'} }).then(fetchData);
    }

    const startEdit = (p: Property) => {
        setNewProp({
            ...p,
            priceRaw: p.price ? p.price.toLocaleString('vi-VN') : '',
            areaRaw: p.area ? p.area.toLocaleString('vi-VN') : '',
            elecRaw: p.electricityPrice ? p.electricityPrice.toLocaleString('vi-VN') : '',
            waterRaw: p.waterPrice ? p.waterPrice.toLocaleString('vi-VN') : ''
        });
        setEditingId(p.id);
        setIsEditing(true);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleDelete = (id: number) => {
        if (confirm('Bạn muốn gỡ bài đăng này?')) {
            axios.delete(`http://localhost:8080/api/properties/${id}`).then(fetchData);
        }
    }

    const handleToggleStatus = (id: number, current: string) => {
        const next = current === 'Available' ? 'Occupied' : 'Available';
        axios.put(`http://localhost:8080/api/properties/${id}/status`, `"${next}"`, { headers: {'Content-Type': 'application/json'} }).then(fetchData);
    }
    
    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        axios.post(`http://localhost:8080/api/auth/change-password/${user.id}`, { oldPassword, newPassword })
            .then(() => { alert('Đổi mật khẩu thành công!'); setOldPassword(''); setNewPassword(''); })
            .catch(err => {
                const data = err.response?.data;
                alert(typeof data === 'string' ? data : "Sai mật khẩu cũ!");
            });
    }

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        axios.put(`http://localhost:8080/api/auth/profile/${user.id}`, user).then(res => {
            alert('Lưu hồ sơ thành công!');
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
        });
    }

    const removeImage = (indexToRemove: number) => {
        try {
            const currentImages = JSON.parse(newProp.imageUrl || "[]");
            const newImages = currentImages.filter((_: any, i: number) => i !== indexToRemove);
            setNewProp({ ...newProp, imageUrl: JSON.stringify(newImages) });
        } catch (e) {
            console.error("Error removing image", e);
        }
    };
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isAvatar: boolean = false) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        if (isAvatar) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) return alert("Ảnh đại diện quá lớn!");
            const reader = new FileReader();
            reader.onload = ev => setUser({...user, avatarUrl: ev.target?.result as string});
            reader.readAsDataURL(file);
        } else {
            const files = Array.from(e.target.files);
            const currentMedia = (newProp.imageUrl && newProp.imageUrl.startsWith('[')) ? JSON.parse(newProp.imageUrl) : (newProp.imageUrl ? [newProp.imageUrl] : []);
            
            let readers = files.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = ev => resolve(ev.target?.result as string);
                    reader.readAsDataURL(file);
                });
            });
            
            Promise.all(readers).then(base64s => {
                const combined = [...currentMedia, ...base64s];
                setNewProp({...newProp, imageUrl: JSON.stringify(combined)});
            });
        }
    }

    const handleAcceptRent = async (n: Notification) => {
        try {
            await axios.put(`http://localhost:8080/api/notifications/${n.id}/status`, '"ACCEPTED"', {headers:{'Content-Type':'application/json'}});
            await axios.post('http://localhost:8080/api/notifications', {
                senderId: user.id, receiverId: n.senderId, type: 'RENT_ACCEPTED', status: 'ACCEPTED',
                message: `Chủ trọ ${user.fullName} đã đồng ý cho thuê! Vui lòng liên hệ SĐT/Zalo: ${user.phone}`
            });
            fetchData();
        } catch(e) { console.error(e); }
    }

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {view === 'posts' && (
                <>
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Quản lý Bài Đăng</h1>
                            <p className="mt-2 text-lg text-gray-600">Bạn có thể đăng thêm <strong className="text-indigo-600">{(user?.postLimit || 3) > 1000 ? 'Vô hạn' : Math.max(0, (user?.postLimit || 3) - properties.filter(p => p.status !== 'DRAFT').length)}</strong> tin đăng mới.</p>
                        </div>
                        <button onClick={() => { setIsAdding(!isAdding); setIsEditing(false); setNewProp(emptyProp); }} className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm">
                            {isAdding ? 'Hủy' : '+ Đăng khu trọ mới'}
                        </button>
                    </div>
                    {isAdding && (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8 border-l-4 border-l-indigo-500">
                            <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Chỉnh sửa bài đăng' : 'Tạo bài đăng mới'}</h2>
                            <form onSubmit={handleCreateOrUpdate} className="space-y-6">
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2"><input type="radio" name="postType" checked={newProp.postType==='single'} onChange={()=>setNewProp({...newProp, postType:'single'})} /> Đăng 1 phòng lẻ</label>
                                    <label className="flex items-center gap-2"><input type="radio" name="postType" checked={newProp.postType==='group'} onChange={()=>setNewProp({...newProp, postType:'group'})} /> Đăng cả khu (Nhiều phòng giống nhau)</label>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="col-span-2"><label className="block text-sm font-medium mb-1">Tên bài đăng / Tên Khu trọ</label><input required className="w-full border-gray-300 rounded-lg p-2.5 border" value={newProp.name} onChange={e => setNewProp({...newProp, name: e.target.value})} placeholder="VD: Trọ Sinh Viên Hoa Lạc" /></div>
                                    {newProp.postType === 'group' && (
                                        <>
                                            <div><label className="block text-sm font-medium mb-1">Tổng số phòng</label><input required type="number" className="w-full border-gray-300 rounded-lg p-2.5 border" value={newProp.totalRooms} onChange={e => setNewProp({...newProp, totalRooms: +e.target.value})} /></div>
                                            <div><label className="block text-sm font-medium mb-1">Số phòng trống</label><input required type="number" className="w-full border-gray-300 rounded-lg p-2.5 border" value={newProp.availableRooms} onChange={e => setNewProp({...newProp, availableRooms: +e.target.value})} /></div>
                                        </>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tỉnh/TP</label>
                                        <select required className="w-full border-gray-300 rounded-lg p-2.5 border" value={newProp.province} onChange={e => setNewProp({...newProp, province: e.target.value, district: '', ward: ''})}>
                                            <option value="">Chọn</option>
                                            {Object.keys(GEO_DATA).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Quận/Huyện</label>
                                        <select required className="w-full border-gray-300 rounded-lg p-2.5 border" value={newProp.district} onChange={e => setNewProp({...newProp, district: e.target.value, ward: ''})}>
                                            <option value="">Chọn</option>
                                            {newProp.province && Object.keys(GEO_DATA[newProp.province]).map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Phường/Xã</label>
                                        <select required className="w-full border-gray-300 rounded-lg p-2.5 border" value={newProp.ward} onChange={e => setNewProp({...newProp, ward: e.target.value})}>
                                            <option value="">Chọn</option>
                                            {newProp.district && GEO_DATA[newProp.province][newProp.district].map((w:any) => <option key={w} value={w}>{w}</option>)}
                                        </select>
                                    </div>
                                    <div><label className="block text-sm font-medium mb-1">Đường/Số nhà</label><input required className="w-full border-gray-300 rounded-lg p-2.5 border" value={newProp.street} onChange={e => setNewProp({...newProp, street: e.target.value})} placeholder="Ngõ 12..." /></div>
                                </div>
                                <div className="grid grid-cols-5 gap-6">
                                    <div><label className="block text-sm font-medium mb-1">Giá thuê (VND)</label><input required type="text" className="w-full border-gray-300 rounded-lg p-2.5 border font-medium text-indigo-700" value={newProp.priceRaw} onChange={e => setNewProp({...newProp, priceRaw: formatCurrency(e.target.value)})} placeholder="2.500.000" /></div>
                                    <div><label className="block text-sm font-medium mb-1">Diện tích (m²)</label><input required type="text" className="w-full border-gray-300 rounded-lg p-2.5 border" value={newProp.areaRaw} onChange={e => setNewProp({...newProp, areaRaw: formatCurrency(e.target.value)})} /></div>
                                    <div><label className="block text-sm font-medium mb-1">Nội thất</label>
                                        <select required className="w-full border-gray-300 rounded-lg p-2.5 border" value={newProp.furniture} onChange={e => setNewProp({...newProp, furniture: e.target.value})}>
                                            <option value="full">Full đồ</option>
                                            <option value="basic">Đồ cơ bản</option>
                                            <option value="none">Không đồ</option>
                                        </select>
                                    </div>
                                    <div><label className="block text-sm font-medium mb-1">Tiền điện (VND/số)</label><input required type="text" className="w-full border-gray-300 rounded-lg p-2.5 border" value={newProp.elecRaw} onChange={e => setNewProp({...newProp, elecRaw: formatCurrency(e.target.value)})} placeholder="3.500" /></div>
                                    <div><label className="block text-sm font-medium mb-1">Tiền nước (VND/ng)</label><input required type="text" className="w-full border-gray-300 rounded-lg p-2.5 border" value={newProp.waterRaw} onChange={e => setNewProp({...newProp, waterRaw: formatCurrency(e.target.value)})} placeholder="100.000" /></div>
                                </div>
                                
                                <div className="flex gap-6 items-center">
                                    <div className="flex-1 border border-dashed border-gray-300 p-6 rounded-lg bg-gray-50 text-center hover:bg-gray-100 transition-colors">
                                        <label className="cursor-pointer block w-full h-full">
                                            <span className="text-indigo-600 font-medium text-lg">📁 Tải lên Ảnh phòng thực tế</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, false)} />
                                            <p className="text-sm text-gray-500 mt-2">Định dạng JPG, PNG (Dưới 2MB)</p>
                                        </label>
                                    </div>
                                    {newProp.imageUrl && (
                                        <div className="flex gap-2 mt-2 overflow-x-auto w-full md:w-auto shrink-0 max-w-lg">
                                            {safeParseMedia(newProp.imageUrl).map((src: string, i: number) => (
                                                <div key={i} className="relative w-24 h-24 rounded-lg border overflow-hidden shadow-sm bg-gray-200 shrink-0">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeImage(i)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow z-10"
                                                        title="Xóa ảnh này"
                                                    >
                                                        &times;
                                                    </button>
                                                    {src.startsWith('data:video') ? (
                                                        <video src={src} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={src} className="w-full h-full object-cover" alt="Preview" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div><label className="block text-sm font-medium mb-1">Mô tả chi tiết</label><textarea required className="w-full border-gray-300 rounded-lg p-2.5 border" rows={3} value={newProp.description} onChange={e => setNewProp({...newProp, description: e.target.value})}></textarea></div>
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 rounded-lg font-medium text-gray-600 bg-gray-100">Hủy bỏ</button>
                                    <button type="button" onClick={(e) => handleCreateOrUpdate(e, true)} className="px-6 py-2.5 rounded-lg font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 shadow-sm hover:bg-indigo-100">Lưu nháp</button>
                                    <button type="button" onClick={(e) => handleCreateOrUpdate(e, false)} className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-medium shadow-md hover:bg-indigo-700">{isEditing ? 'Lưu thay đổi' : 'Đăng bài'}</button>
                                </div>
                            </form>
                        </div>
                    )}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Bài Đăng</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Giá thuê</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th><th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Thao tác</th></tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {properties.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">Chưa có bài đăng nào.</td></tr>}
                                {properties.map(p => {
                                    const mediaList = p.imageUrl && p.imageUrl.startsWith('[') ? JSON.parse(p.imageUrl) : (p.imageUrl ? [p.imageUrl] : []);
                                    return (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {mediaList.length > 0 ? (
                                                    <img src={mediaList[0]} className="w-16 h-12 rounded object-cover border" alt="" />
                                                ) : (
                                                    <div className="w-16 h-12 rounded bg-gray-200 border flex items-center justify-center text-xs text-gray-400">No Image</div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-gray-900">{p.name} {p.postType === 'group' && <span className="text-blue-600 text-xs ml-2">(Trống {p.availableRooms}/{p.totalRooms})</span>}</div>
                                                    <div className="text-sm text-gray-500 mt-1">{p.postType==='group'?'Khu trọ':'Phòng lẻ'} • {p.area} m²</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-indigo-700">{(p.price || 0).toLocaleString('vi-VN')} ₫</td>
                                        <td className="px-6 py-4">
                                            {p.status === 'DRAFT' ? (
                                                <span className="px-3 py-1.5 text-xs font-medium rounded-full border shadow-sm bg-gray-50 text-gray-700 border-gray-200">Bản nháp (Đang ẩn)</span>
                                            ) : (
                                                <button onClick={() => handleToggleStatus(p.id, p.status)} className={`px-3 py-1.5 text-xs font-medium rounded-full border shadow-sm transition-all ${p.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'}`}>
                                                    {p.status === 'Available' ? 'Còn trống (Hiển thị)' : 'Đã thuê (Ẩn)'} ⟳
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-4">
                                            {p.status === 'DRAFT' && <button onClick={() => publishDraft(p)} className="text-green-600 font-bold hover:underline">Đăng bài</button>}
                                            <button onClick={() => startEdit(p)} className="text-indigo-600 font-bold hover:underline">Sửa</button>
                                            <button onClick={() => handleDelete(p.id)} className="text-red-500 font-bold hover:underline">Gỡ bài</button>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                </>
            )}

            {view === 'notifications' && (
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">Thông báo</h1>
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 max-w-4xl">
                        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">🔔 Thông báo yêu cầu thuê</h3>
                        <div className="space-y-3">
                            {notifications.length === 0 && <p className="text-gray-500">Chưa có thông báo nào.</p>}
                            {notifications.map(n => (
                                <div key={n.id} className="bg-white p-5 rounded-xl shadow-sm border border-blue-50 flex justify-between items-center">
                                    <span className="text-gray-800 font-medium">{n.message}</span>
                                    {n.status === 'PENDING' ? (
                                        <button onClick={() => handleAcceptRent(n)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 hover:scale-105 transition-all">Xác nhận liên hệ</button>
                                    ) : (
                                        <span className="text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-lg">✓ Đã gửi liên hệ</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {view === 'profile' && (
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">Trang Cá Nhân Chủ Trọ</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="text-xl font-bold mb-6 border-b pb-4">Hồ sơ cá nhân</h3>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="relative">
                                        <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50 shadow-sm" alt="" />
                                        <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-indigo-700 shadow-md">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, true)} />
                                        </label>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{user.fullName}</h4>
                                        <p className="text-sm text-gray-500">Chủ trọ</p>
                                    </div>
                                </div>

                                <div><label className="block text-sm font-medium mb-1">Email</label><input className="w-full border-gray-300 rounded-lg p-2.5 border bg-gray-50" value={user.email} readOnly /></div>
                                <div><label className="block text-sm font-medium mb-1">Họ và Tên</label><input className="w-full border-gray-300 rounded-lg p-2.5 border" value={user.fullName || ''} onChange={e => { setUser({...user, fullName: e.target.value}) }} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium mb-1">Số điện thoại / Zalo</label><input className="w-full border-gray-300 rounded-lg p-2.5 border" value={user.phone || ''} onChange={e => { setUser({...user, phone: e.target.value}) }} /></div>
                                    <div><label className="block text-sm font-medium mb-1">Giới tính</label>
                                        <select className="w-full border-gray-300 rounded-lg p-2.5 border" value={user.gender || 'Nam'} onChange={e => setUser({...user, gender: e.target.value})}>
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-2"><button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold w-full shadow-md hover:bg-indigo-700">Lưu thông tin</button></div>
                            </form>
                        </div>
                        <div className="flex flex-col gap-8">
                            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-2xl shadow-lg border border-indigo-200 text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">💎 Gói Đăng Bài {user?.currentPackage && user.currentPackage !== 'Mặc định' ? user.currentPackage + ' ' : ''}Của Bạn</h3>
                                    <p className="text-indigo-200 mb-6 text-sm">Quản lý số lượng bài đăng và nâng cấp đặc quyền</p>
                                    
                                    <div className="bg-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm border border-white/20">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-indigo-100">Lượt đăng tối đa</span>
                                            <span className="font-bold text-xl">{user?.postLimit || 3}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-indigo-100">Đã đăng</span>
                                            <span className="font-bold text-xl">{properties.filter(p => p.status !== 'DRAFT').length}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-white/20 pt-2 mt-2">
                                            <span className="text-indigo-100 text-sm">Hạn sử dụng gói</span>
                                            <span className="font-bold text-sm">{user?.packageExpiryDate ? new Date(user.packageExpiryDate).toLocaleDateString('vi-VN') : 'Vĩnh viễn (Mặc định)'}</span>
                                        </div>
                                    </div>
                                    
                                    <button onClick={() => setShowUpgradeModal(true)} className="w-full bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                                        Nâng Cấp Gói Ngay
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    </button>
                                    <button onClick={() => {
                                        if(!user?.packageExpiryDate) { alert('Tài khoản đang ở gói Mặc định nên không có ngày hết hạn để giả lập!'); return; }
                                        const expiredUser = { ...user, packageExpiryDate: new Date(Date.now() - 86400000).toISOString() };
                                        axios.put(`http://localhost:8080/api/auth/profile/${user.id}`, expiredUser)
                                        .then(() => axios.post(`http://localhost:8080/api/properties/sync-subscription/${user.id}`))
                                        .then(() => window.location.reload());
                                    }} className="w-full mt-3 bg-red-600/80 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                                        ⏰ Giả lập hết hạn (Demo)
                                    </button>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-30"></div>
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
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
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => { setShowUpgradeModal(false); setSelectedPackage(null); }} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        
                        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">Nâng cấp Gói Dịch Vụ</h2>
                        <p className="text-center text-gray-600 mb-8 text-lg">Bạn đã sử dụng hết lượt đăng miễn phí. Chọn gói phù hợp để tiếp tục tiếp cận hàng ngàn người thuê!</p>
                        
                        {!selectedPackage ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="border rounded-2xl p-6 text-center hover:border-indigo-600 hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedPackage({name: 'Plus', price: '50.000', amount: 50000, posts: 15})}>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Gói Plus</h3>
                                    <p className="text-3xl font-extrabold text-indigo-600 mb-4">50K<span className="text-sm text-gray-500">/tháng</span></p>
                                    <p className="text-gray-600 font-medium mb-6">Thêm 15 tin đăng mới</p>
                                    <button className="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold">Chọn gói này</button>
                                </div>
                                <div className="border-2 border-indigo-600 rounded-2xl p-6 text-center shadow-md relative cursor-pointer hover:scale-105 transition-transform" onClick={() => setSelectedPackage({name: 'Pro', price: '150.000', amount: 150000, posts: 100})}>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">PHỔ BIẾN NHẤT</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Gói Pro</h3>
                                    <p className="text-3xl font-extrabold text-indigo-600 mb-4">150K<span className="text-sm text-gray-500">/tháng</span></p>
                                    <p className="text-gray-600 font-medium mb-6">Thêm 100 tin đăng mới</p>
                                    <button className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md">Chọn gói này</button>
                                </div>
                                <div className="border rounded-2xl p-6 text-center hover:border-indigo-600 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-purple-900 to-indigo-900 text-white" onClick={() => setSelectedPackage({name: 'VIP', price: '299.000', amount: 299000, posts: 'Vô hạn'})}>
                                    <h3 className="text-xl font-bold mb-2 text-purple-200">Gói VIP</h3>
                                    <p className="text-3xl font-extrabold mb-4">299K<span className="text-sm text-purple-300">/tháng</span></p>
                                    <p className="text-purple-100 font-medium mb-6">Đăng bài VÔ HẠN</p>
                                    <button className="w-full py-2.5 rounded-xl bg-white text-indigo-900 font-bold">Chọn gói này</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6">
                                <button onClick={() => setSelectedPackage(null)} className="self-start text-indigo-600 font-medium mb-4 flex items-center gap-1">← Chọn gói khác</button>
                                <div className="bg-gray-50 p-6 rounded-2xl border text-center max-w-sm w-full shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Thanh toán Gói {selectedPackage.name}</h3>
                                    <p className="text-gray-600 mb-4">Số tiền: <strong className="text-indigo-600 text-xl">{selectedPackage.price} VNĐ</strong></p>
                                    <div className="bg-white p-4 rounded-xl border inline-block mb-4">
                                        <img src={`https://img.vietqr.io/image/mbbank-01169075289698-compact2.png?amount=${selectedPackage.amount}&addInfo=Nap%20Goi%20${selectedPackage.name}%20ID${user.id}&accountName=NGUYEN%20MANH%20QUAN`} alt="QR Code" className="w-48 h-48 object-contain mx-auto" />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-6">Mở app Ngân hàng hoặc VNPay để quét mã QR. Trạng thái sẽ được cập nhật tự động.</p>
                                    <button onClick={() => {
                                        let addedPosts = selectedPackage.posts;
                                        if (addedPosts === 'Vô hạn') addedPosts = 99999;
                                        
                                        const newLimit = (user.postLimit || 3) + addedPosts;
                                        
                                        const currentDate = user.packageExpiryDate ? new Date(user.packageExpiryDate) : new Date();
                                        if (currentDate < new Date()) {
                                            currentDate.setTime(new Date().getTime());
                                        }
                                        currentDate.setMonth(currentDate.getMonth() + 1);
                                        const newExpiryDate = currentDate.toISOString();
                                        const newPackageName = selectedPackage.name;

                                        const updatedUser = { ...user, postLimit: newLimit, packageExpiryDate: newExpiryDate, currentPackage: newPackageName };

                                        axios.put(`http://localhost:8080/api/auth/profile/${user.id}`, updatedUser)
                                            .then(res => {
                                                localStorage.setItem('user', JSON.stringify(res.data));
                                                setUser(res.data);
                                                return axios.post(`http://localhost:8080/api/properties/sync-subscription/${user.id}`);
                                            })
                                            .then(() => axios.get(`http://localhost:8080/api/properties/landlord/${user.id}`))
                                            .then(res => {
                                                setProperties(res.data);
                                                alert(`Xác nhận thanh toán thành công! Bạn đã được cộng thêm ${selectedPackage.posts} lượt đăng tin và gia hạn thêm 1 tháng sử dụng.`);
                                                setShowUpgradeModal(false);
                                                setSelectedPackage(null);
                                                navigate('/manager/profile');
                                            })
                                            .catch(err => {
                                                console.error(err);
                                                alert('Lỗi cập nhật lượt đăng tin');
                                                setShowUpgradeModal(false);
                                                setSelectedPackage(null);
                                                navigate('/manager/profile');
                                            });
                                    }} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-md">Xác nhận VNPay (Demo)</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
