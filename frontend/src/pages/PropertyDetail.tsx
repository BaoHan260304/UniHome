import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PropertyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [prop, setProp] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const userStr = localStorage.getItem('user');
    const userRole = userStr ? JSON.parse(userStr).role : null;
    const user = userStr ? JSON.parse(userStr) : null;

    const [likes, setLikes] = useState<Record<number, number>>({});
    const [comments, setComments] = useState<string[]>([]);
    const [commentInput, setCommentInput] = useState('');
    const [userLikes, setUserLikes] = useState<Record<number, boolean>>({});

    useEffect(() => {
        axios.get(`http://localhost:8080/api/properties/available`)
            .then(res => {
                const found = res.data.find((p: any) => p.id === Number(id));
                setProp(found);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        setLikes(JSON.parse(localStorage.getItem('social_likes') || '{}'));
        const allComments = JSON.parse(localStorage.getItem('social_comments') || '{}');
        setComments(allComments[Number(id)] || []);
        
        if (user) {
            setUserLikes(JSON.parse(localStorage.getItem(`user_likes_${user.id}`) || '{}'));
        }
    }, [id]);

    const safeParseMedia = (mediaStr: string) => {
        if (!mediaStr) return [];
        try {
            if (mediaStr.startsWith('[')) return JSON.parse(mediaStr);
            return [mediaStr];
        } catch { return [mediaStr]; }
    }

    const handleLike = () => {
        if (!user) return alert("Vui lòng đăng nhập để tương tác!");
        const propId = Number(id);
        const isLiked = userLikes[propId];
        const newLikes = { ...likes, [propId]: isLiked ? Math.max(0, (likes[propId] || 1) - 1) : (likes[propId] || 0) + 1 };
        const newUserLikes = { ...userLikes, [propId]: !isLiked };
        setLikes(newLikes);
        setUserLikes(newUserLikes);
        localStorage.setItem('social_likes', JSON.stringify(newLikes));
        localStorage.setItem(`user_likes_${user.id}`, JSON.stringify(newUserLikes));
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href).then(() => alert('Đã sao chép link bài đăng!'));
    }

    const submitComment = () => {
        if (!commentInput.trim()) return;
        const propId = Number(id);
        const newCmtList = [...comments, commentInput];
        setComments(newCmtList);
        
        const allComments = JSON.parse(localStorage.getItem('social_comments') || '{}');
        allComments[propId] = newCmtList;
        localStorage.setItem('social_comments', JSON.stringify(allComments));
        setCommentInput('');
    }

    const handleRent = () => {
        if (!user) { navigate('/login'); return; }
        axios.post('http://localhost:8080/api/notifications', {
            senderId: user.id, receiverId: prop.landlordId, type: 'RENT_REQUEST',
            propertyId: prop.id, status: 'PENDING', message: `${user.fullName} muốn thuê ${prop.name}`
        }).then(() => alert(`Đã gửi yêu cầu thuê tới chủ trọ!`))
    }

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (!prop) return <div className="text-center py-20 text-xl text-gray-500">Không tìm thấy bài đăng.</div>;

    const mediaList = safeParseMedia(prop.imageUrl);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
            <button onClick={() => navigate(-1)} className="text-indigo-600 font-medium hover:underline flex items-center gap-1">← Quay lại Bảng tin</button>
            
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Media Carousel / Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-100">
                    {mediaList.length > 0 ? mediaList.map((url: string, idx: number) => (
                        <div key={idx} className={`relative ${mediaList.length === 1 ? 'md:col-span-2' : ''} h-72 md:h-96`}>
                            {url.startsWith('data:video') ? (
                                <video src={url} controls className="w-full h-full object-cover" />
                            ) : (
                                <img src={url} alt="Media" className="w-full h-full object-cover" />
                            )}
                        </div>
                    )) : (
                        <div className="md:col-span-2 h-64 flex items-center justify-center text-gray-400">Không có hình ảnh/video</div>
                    )}
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mb-3 shadow-sm border border-indigo-100">
                                {prop.postType === 'group' ? '🏢 Khu trọ' : '🏠 Phòng lẻ'}
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900">{prop.name}</h1>
                            <p className="text-gray-500 mt-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {prop.street}, {prop.ward}, {prop.district}, {prop.province}
                            </p>
                        </div>
                        <p className="text-3xl font-extrabold text-indigo-600 text-right">
                            {(prop.price / 1000000).toFixed(1)}<span className="block text-sm font-normal text-gray-500">triệu VNĐ / tháng</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                            <span className="block text-gray-500 text-sm mb-1">Diện tích</span>
                            <strong className="text-lg text-gray-900">{prop.area} m²</strong>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                            <span className="block text-gray-500 text-sm mb-1">Giá điện</span>
                            <strong className="text-lg text-gray-900">{(prop.electricityPrice||0)/1000}k / số</strong>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                            <span className="block text-gray-500 text-sm mb-1">Giá nước</span>
                            <strong className="text-lg text-gray-900">{(prop.waterPrice||0)/1000}k / khối</strong>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                            <span className="block text-gray-500 text-sm mb-1">Nội thất</span>
                            <strong className="text-lg text-gray-900">{prop.furniture === 'full' ? 'Đầy đủ' : 'Cơ bản'}</strong>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin chi tiết</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">{prop.description}</p>

                    {userRole !== 'manager' && (
                        <div className="flex gap-4">
                            <button onClick={handleRent} className="flex-1 bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-700 shadow-md transition-colors">
                                Yêu cầu thuê phòng
                            </button>
                            <button onClick={() => navigate('/tenant/matching')} className="flex-1 bg-purple-100 text-purple-700 font-bold text-lg py-4 rounded-xl hover:bg-purple-200 transition-colors border border-purple-200">
                                Tìm bạn ở ghép
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 border-t border-gray-100 p-8">
                    <div className="flex items-center gap-6 mb-8 text-gray-600 font-medium border-b border-gray-200 pb-4">
                        <button onClick={handleLike} className={`flex items-center gap-2 hover:text-indigo-600 transition-colors ${userLikes[prop.id] ? 'text-indigo-600' : ''}`}>
                            <svg className="w-6 h-6" fill={userLikes[prop.id] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                            {likes[prop.id] || 0} Thích
                        </button>
                        <button className="flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            {comments.length} Bình luận
                        </button>
                        <button onClick={handleShare} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            Chia sẻ
                        </button>
                    </div>

                    <div className="space-y-6">
                        <h4 className="font-bold text-lg text-gray-900">Bình luận</h4>
                        {comments.length === 0 && <p className="text-gray-500 italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>}
                        
                        <div className="space-y-4">
                            {comments.map((cmt, idx) => {
                                const displayCmt = cmt.replace(/^👤 Khách Ẩn Danh:\s*/, '');
                                return (
                                <div key={idx} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl shrink-0">👤</div>
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex items-center">
                                        <p className="text-gray-700">{displayCmt}</p>
                                    </div>
                                </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl shrink-0 border border-indigo-200">😉</div>
                            <input type="text" placeholder="Viết bình luận ẩn danh..." className="flex-1 border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value={commentInput} onChange={e => setCommentInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitComment()} />
                            <button onClick={submitComment} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700">Gửi</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
