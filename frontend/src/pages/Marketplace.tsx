import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Property {
    id: number; landlordId: number; name: string;
    province: string; district: string; ward: string; street: string;
    price: number; area: number; electricityPrice: number; waterPrice: number;
    postType: string; totalRooms: number; availableRooms: number;
    status: string; description: string; imageUrl: string; furniture: string;
}

export default function Marketplace() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Virtual filters for demo
    const [priceFilter, setPriceFilter] = useState('');
    const [areaFilter, setAreaFilter] = useState('');
    const [utilFilter, setUtilFilter] = useState('');

    const [favorites, setFavorites] = useState<number[]>([]);
    const navigate = useNavigate();
    
    const userStr = localStorage.getItem('user');
    const userRole = userStr ? JSON.parse(userStr).role : null;
    const user = userStr ? JSON.parse(userStr) : null;

    // Social states
    const [likes, setLikes] = useState<Record<number, number>>({});
    const [comments, setComments] = useState<Record<number, string[]>>({});
    // const [showComments, setShowComments] = useState<Record<number, boolean>>({});
    // const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
    const [userLikes, setUserLikes] = useState<Record<number, boolean>>({});

    useEffect(() => { 
        fetchProperties(); 
        
        // Load social data
        setLikes(JSON.parse(localStorage.getItem('social_likes') || '{}'));
        setComments(JSON.parse(localStorage.getItem('social_comments') || '{}'));
        
        if (user) {
            setFavorites(JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '[]'));
            setUserLikes(JSON.parse(localStorage.getItem(`user_likes_${user.id}`) || '{}'));
        }
    }, []);

    const fetchProperties = () => {
        setLoading(true);
        axios.get(`http://localhost:8080/api/properties/available?search=${search}`)
            .then(res => { 
                let data = res.data;
                // Filter logic
                if (priceFilter === 'under2') data = data.filter((p: Property) => p.price < 2000000);
                if (priceFilter === '2to4') data = data.filter((p: Property) => p.price >= 2000000 && p.price <= 4000000);
                if (priceFilter === 'above4') data = data.filter((p: Property) => p.price > 4000000);
                
                if (areaFilter === 'small') data = data.filter((p: Property) => p.area < 20);
                if (areaFilter === 'med') data = data.filter((p: Property) => p.area >= 20 && p.area <= 35);
                if (areaFilter === 'large') data = data.filter((p: Property) => p.area > 35);
                
                if (utilFilter) data = data.filter((p: Property) => p.furniture === utilFilter);
                
                setProperties(data); 
                setLoading(false); 
            })
            .catch(err => console.error(err));
    };
    
    // Auto re-fetch when filters change
    useEffect(() => {
        fetchProperties();
    }, [priceFilter, areaFilter, utilFilter]);

    const toggleFavorite = (id: number) => {
        if (!user) return alert("Vui lòng đăng nhập để lưu phòng!");
        let newFavs = [...favorites];
        if (newFavs.includes(id)) newFavs = newFavs.filter(f => f !== id);
        else newFavs.push(id);
        setFavorites(newFavs);
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavs));
    };

    const handleRent = (prop: Property) => {
        if (!user) { navigate('/login'); return; }
        axios.post('http://localhost:8080/api/notifications', {
            senderId: user.id, receiverId: prop.landlordId, type: 'RENT_REQUEST',
            propertyId: prop.id, status: 'PENDING', message: `${user.fullName} muốn thuê ${prop.name}`
        }).then(() => alert(`Đã gửi yêu cầu thuê tới chủ trọ!`))
    };

    const handleLike = (propId: number) => {
        if (!user) return alert("Vui lòng đăng nhập để tương tác!");
        const isLiked = userLikes[propId];
        
        const newLikes = { ...likes, [propId]: isLiked ? Math.max(0, (likes[propId] || 1) - 1) : (likes[propId] || 0) + 1 };
        const newUserLikes = { ...userLikes, [propId]: !isLiked };
        
        setLikes(newLikes);
        setUserLikes(newUserLikes);
        localStorage.setItem('social_likes', JSON.stringify(newLikes));
        localStorage.setItem(`user_likes_${user.id}`, JSON.stringify(newUserLikes));
    }

    const handleShare = (propId: number) => {
        const link = `${window.location.origin}/?post=${propId}`;
        navigator.clipboard.writeText(link).then(() => alert('Đã sao chép link bài đăng để chia sẻ!'));
    }

    /*
    const submitComment = (propId: number) => {
        const text = commentInputs[propId];
        if (!text || text.trim() === '') return;
        
        const newCommentsForProp = [...(comments[propId] || []), `👤 Khách Ẩn Danh: ${text}`];
        const newComments = { ...comments, [propId]: newCommentsForProp };
        
        setComments(newComments);
        setCommentInputs({...commentInputs, [propId]: ''});
        localStorage.setItem('social_comments', JSON.stringify(newComments));
    }
    */

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Bảng tin Phòng Trọ</h1>
                <p className="mt-2 text-lg text-gray-600">Khám phá các khu trọ và phòng trống mới nhất.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                        type="text" placeholder="Tìm theo tên hoặc khu vực (Vd: Thạch Thất)..." 
                        value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchProperties()}
                        className="flex-1 rounded-xl border-gray-200 bg-gray-50 focus:border-indigo-500 px-4 py-3 border"
                    />
                    <button onClick={fetchProperties} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-md">
                        Tìm kiếm
                    </button>
                </div>
                
                <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
                    <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)} className="rounded-xl border-gray-200 bg-gray-50 focus:border-indigo-500 px-4 py-2.5 border text-sm text-gray-700 font-medium cursor-pointer">
                        <option value="">Tài chính (Tất cả)</option>
                        <option value="under2">Dưới 2 Triệu</option>
                        <option value="2to4">2 - 4 Triệu</option>
                        <option value="above4">Trên 4 Triệu</option>
                    </select>
                    
                    <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)} className="rounded-xl border-gray-200 bg-gray-50 focus:border-indigo-500 px-4 py-2.5 border text-sm text-gray-700 font-medium cursor-pointer">
                        <option value="">Diện tích (Tất cả)</option>
                        <option value="small">Dưới 20m²</option>
                        <option value="med">20 - 35m²</option>
                        <option value="large">Trên 35m²</option>
                    </select>
                    
                    <select value={utilFilter} onChange={e => setUtilFilter(e.target.value)} className="rounded-xl border-gray-200 bg-gray-50 focus:border-indigo-500 px-4 py-2.5 border text-sm text-gray-700 font-medium cursor-pointer">
                        <option value="">Nội thất & Tiện ích</option>
                        <option value="full">Trang bị Full đồ</option>
                        <option value="basic">Đồ cơ bản</option>
                        <option value="none">Không đồ</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((prop) => {
                    const mediaList = prop.imageUrl && prop.imageUrl.startsWith('[') ? JSON.parse(prop.imageUrl) : (prop.imageUrl ? [prop.imageUrl] : []);
                    const coverImg = mediaList.length > 0 ? mediaList[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500';
                    return (
                    <div key={prop.id} onClick={() => navigate(`/property/${prop.id}`)} className="cursor-pointer group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col relative">
                        {userRole !== 'manager' && (
                            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(prop.id); }} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center transition-colors shadow-sm">
                                <svg className={`w-6 h-6 ${favorites.includes(prop.id) ? 'text-red-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            </button>
                        )}
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                            <img src={coverImg} alt={prop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-4 left-4 flex gap-2 flex-col">
                                {prop.postType === 'group' ? (
                                    <span className="bg-blue-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                        Trống {prop.availableRooms}/{prop.totalRooms} phòng
                                    </span>
                                ) : (
                                    <span className="bg-green-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                        Đang trống 1 phòng
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{prop.name}</h3>
                                    <p className="text-gray-500 text-sm mt-1 line-clamp-1">{prop.street}, {prop.ward}, {prop.district}, {prop.province}</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-indigo-600 mb-2">
                                {(prop.price / 1000000).toFixed(1)}<span className="text-sm font-normal text-gray-500"> tr/tháng</span>
                            </p>
                            
                            <div className="flex gap-4 mb-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>{(prop.electricityPrice||0)/1000}k/số</span>
                                <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>{(prop.waterPrice||0)/1000}k/kh</span>
                                <span>{prop.area} m²</span>
                            </div>
                            
                            <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-1">{prop.description}</p>
                            
                            {userRole !== 'manager' && (
                                <div className="grid grid-cols-2 gap-3 mt-auto mb-4" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={(e) => { e.stopPropagation(); handleRent(prop); }} className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                                        Thuê ngay
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); navigate('/tenant/matching'); }} className="w-full bg-purple-100 text-purple-700 font-medium py-2.5 rounded-xl hover:bg-purple-200 transition-colors flex items-center justify-center gap-1">
                                        Ghép ở chung
                                    </button>
                                </div>
                            )}

                            <div className="pt-4 border-t flex items-center justify-between text-gray-500 text-sm font-medium mt-auto" onClick={(e) => e.stopPropagation()}>
                                <button onClick={(e) => { e.stopPropagation(); handleLike(prop.id); }} className={`flex items-center gap-1.5 hover:text-indigo-600 transition-colors ${userLikes[prop.id] ? 'text-indigo-600' : ''}`}>
                                    <svg className="w-5 h-5" fill={userLikes[prop.id] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                                    {likes[prop.id] || 0} Thích
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); navigate(`/property/${prop.id}`); }} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    {(comments[prop.id] || []).length} Bình luận
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleShare(prop.id); }} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                    Chia sẻ
                                </button>
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}
