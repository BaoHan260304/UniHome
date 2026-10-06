import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RoommateMatching() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { navigate('/login'); return; }
    const loggedInUser = JSON.parse(userStr);
    setUser(loggedInUser);

    if (loggedInUser.role === 'manager') {
        alert('Tính năng ghép phòng chỉ dành cho người đi thuê!');
        navigate('/');
        return;
    }

    if (!loggedInUser.isLookingForRoommate) {
        alert('Bạn cần bật tính năng Tìm Bạn Cùng Phòng trong Trang Cá Nhân trước!');
        navigate('/tenant/profile');
        return;
    }

    const fetchData = async () => {
        try {
            const [roommatesRes, sentRes, recRes] = await Promise.all([
                axios.get('http://localhost:8080/api/auth/roommates'),
                axios.get(`http://localhost:8080/api/notifications/sender/${loggedInUser.id}`),
                axios.get(`http://localhost:8080/api/notifications/receiver/${loggedInUser.id}`)
            ]);

            const interactedIds = new Set<number>();
            sentRes.data.filter((n:any)=>n.type==='MATCH_REQUEST').forEach((n:any)=>interactedIds.add(n.receiverId));
            recRes.data.filter((n:any)=>n.type==='MATCH_REQUEST').forEach((n:any)=>interactedIds.add(n.senderId));

            let others = roommatesRes.data.filter((u: any) => u.id !== loggedInUser.id && !interactedIds.has(u.id));
            
            // 2-way strict gender filtering
            others = others.filter((u: any) => {
                const aWants = loggedInUser.preferredGender;
                const bIs = u.gender;
                const bWants = u.preferredGender;
                const aIs = loggedInUser.gender;
                
                const aAcceptsB = (!aWants || aWants === 'Bất kỳ' || aWants === bIs);
                const bAcceptsA = (!bWants || bWants === 'Bất kỳ' || bWants === aIs);
                
                return aAcceptsB && bAcceptsA;
            });
            
            // Limit to 10 for AI scoring to avoid huge prompt
            others = others.slice(0, 10);
            
            if (others.length > 0) {
                const CACHE_PREFIX = `ai_match_${loggedInUser.id}_`;
                let cachedOthers: any[] = [];
                let uncachedOthers: any[] = [];
                
                others.forEach((u: any) => {
                    const cachedStr = localStorage.getItem(CACHE_PREFIX + u.id);
                    if (cachedStr) {
                        try {
                            const parsed = JSON.parse(cachedStr);
                            cachedOthers.push({ ...u, score: parsed.score, reason: parsed.reason });
                        } catch { uncachedOthers.push(u); }
                    } else {
                        uncachedOthers.push(u);
                    }
                });

                if (uncachedOthers.length > 0) {
                    try {
                        const GEMINI_API_KEY = "AQ.Ab8RN6L1hlfQrZSeHprgQ8VmqG6TYQ3x87DsArYvzXB465yubQ"; // Real key from user
                        
                        const prompt = `
                        Bạn là AI phân tích mức độ phù hợp ở ghép (Roommate Matching).
                        Đây là hồ sơ của người dùng chính (A):
                        - Giới tính: ${loggedInUser.gender || 'Bí mật'}, Tuổi/SN: ${loggedInUser.dob || 'Bí mật'}
                        - Đặc điểm: ${loggedInUser.characteristics || 'Không có'}
                        - Giới thiệu: ${(loggedInUser.matchingBio || '').split('|||')[0] || 'Không có'}
                        - Sinh hoạt: ${(loggedInUser.matchingBio || '').split('|||')[1] || 'Không có'}
                        - Tài chính: ${(loggedInUser.matchingBio || '').split('|||')[2] || 'Không có'}

                        Dưới đây là danh sách ứng viên (B):
                        ${uncachedOthers.map((u: any) => `
                        Ứng viên ID: ${u.id}:
                        - Giới tính: ${u.gender || 'Bí mật'}, Tuổi/SN: ${u.dob || 'Bí mật'}
                        - Đặc điểm: ${u.characteristics || 'Không có'}
                        - Giới thiệu: ${(u.matchingBio || '').split('|||')[0] || 'Không có'}
                        - Sinh hoạt: ${(u.matchingBio || '').split('|||')[1] || 'Không có'}
                        - Tài chính: ${(u.matchingBio || '').split('|||')[2] || 'Không có'}
                        `).join('\n')}
                        
                        Dựa trên giới tính, thói quen sinh hoạt, đặc điểm tính cách, và đặc biệt là tài chính. BẠN PHẢI phân tích thêm về mặt chiêm tinh (Cung hoàng đạo, phong thủy, hoặc tuổi 12 con giáp) dựa trên Ngày/Tháng/Năm sinh của 2 người để xem họ có hợp nhau không.
                        Hãy đánh giá độ tương thích (từ 0 đến 100) của A với từng ứng viên B.
                        Trả về CHỈ một mảng JSON (không bọc trong markdown tick) định dạng chính xác như sau:
                        [ { "id": <ID_ứng_viên>, "score": <điểm_số_nguyên>, "reason": "<Nhận xét dài 3-4 câu tiếng Việt, có nhắc đến cung hoàng đạo/con giáp, tài chính và thói quen sinh hoạt>" } ]
                        `;

                        const aiRes = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`, {
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { responseMimeType: "application/json" }
                        });
                        
                        let aiDataText = aiRes.data.candidates[0].content.parts[0].text;
                        aiDataText = aiDataText.replace(/```json/g, '').replace(/```/g, '').trim();
                        const aiData = JSON.parse(aiDataText);
                        
                        uncachedOthers = uncachedOthers.map((u: any) => {
                            const aiMatch = aiData.find((d:any) => d.id === u.id || d.id === String(u.id));
                            if (aiMatch) {
                                localStorage.setItem(CACHE_PREFIX + u.id, JSON.stringify({ score: aiMatch.score, reason: aiMatch.reason }));
                            }
                            return { 
                                ...u, 
                                score: aiMatch ? aiMatch.score : 80, 
                                reason: aiMatch ? aiMatch.reason : 'AI không thể phân tích chi tiết.' 
                            };
                        });
                    } catch (aiError: any) {
                        console.error("Lỗi gọi Google Gemini API:", aiError);
                        // Minimal fallback – no heuristic scoring
                        uncachedOthers = uncachedOthers.map((u: any) => ({
                            ...u,
                            score: 0,
                            reason: "AI không phản hồi, không có đánh giá."
                        }));
                    }
                }
                
                others = [...cachedOthers, ...uncachedOthers];
            }

            others.sort((a:any, b:any) => b.score - a.score);
            setCandidates(others.slice(0, 5)); // top 5
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };
    
    fetchData();
  }, [navigate]);

  const handleInterest = (targetUser: any) => {
      const payload = JSON.stringify({
          text: `${user.fullName} quan tâm và muốn ghép phòng với bạn!`,
          score: targetUser.score,
          reason: targetUser.reason,
          characteristics: user.characteristics,
          budget: (user.matchingBio || '').split('|||')[2],
          dob: user.dob,
          gender: user.gender
      });

      axios.post('http://localhost:8080/api/notifications', {
          senderId: user.id, receiverId: targetUser.id, type: 'MATCH_REQUEST',
          status: 'PENDING', message: payload
      }).then(() => {
          alert(`Đã gửi thông báo quan tâm tới ${targetUser.fullName}. Hãy chờ họ đồng ý nhé!`);
          setCandidates(candidates.filter(c => c.id !== targetUser.id));
      });
  }

  if (!user || user.role === 'manager') return null;
  if (loading) return <div className="text-center mt-20">Đang tìm kiếm...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">Roommate Matching</h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">Dưới đây là 5 hồ sơ phù hợp nhất với bạn hiện tại. Nếu ưng ý, hãy nhấn "Quan tâm" để gửi yêu cầu kết nối.</p>
        <button onClick={() => { Object.keys(localStorage).filter(k => k.startsWith('ai_match_')).forEach(k => localStorage.removeItem(k)); window.location.reload(); }} className="mt-4 text-sm text-indigo-500 hover:text-indigo-700 underline cursor-pointer">🔄 Yêu cầu AI đánh giá lại</button>
      </div>

      <div className="space-y-6">
        {candidates.length === 0 && <div className="text-center mt-20 text-gray-500 bg-white p-8 rounded-2xl shadow-sm text-lg font-medium">Hiện tại không ai có nhu cầu ở ghép phù hợp với tiêu chí của bạn. Hãy quay lại sau!</div>}
        
        {candidates.map(candidate => {
            const intro = (candidate.matchingBio || '').split('|||')[0] || '';
            const schedule = (candidate.matchingBio || '').split('|||')[1] || '';
            const budget = (candidate.matchingBio || '').split('|||')[2] || '';
            
            return (
                <div key={candidate.id} className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-50 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center justify-center shrink-0 w-40 border-r border-gray-100 pr-6">
                        <div className="relative mb-3">
                            <img src={candidate.avatarUrl || `https://ui-avatars.com/api/?name=${candidate.fullName}&background=random`} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-sm object-cover" />
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                                Match: {candidate.score}%
                            </div>
                        </div>
                        <h3 className="font-bold text-gray-900 text-center">{candidate.fullName}</h3>
                        <p className="text-sm text-gray-500">{candidate.gender || 'Chưa rõ giới tính'}</p>
                        <p className="text-sm text-gray-500">{candidate.dob ? `SN: ${candidate.dob}` : 'Chưa rõ tuổi'}</p>
                        {budget && <p className="text-xs font-bold text-indigo-600 mt-2 text-center">Tài chính:<br/>{budget}</p>}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {(candidate.characteristics || '').split('|').filter(Boolean).map((c: string, idx: number) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">{c}</span>
                            ))}
                        </div>
                        {intro && (
                            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-50">
                                <strong className="text-indigo-900 text-sm block mb-1">✍️ Giới thiệu & Yêu cầu:</strong>
                                <p className="text-sm text-gray-700">"{intro}"</p>
                            </div>
                        )}
                        {schedule && (
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-50">
                                <strong className="text-blue-900 text-sm block mb-1">🕒 Khung giờ sinh hoạt:</strong>
                                <p className="text-sm text-gray-700">"{schedule}"</p>
                            </div>
                        )}
                        {candidate.reason && (
                            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 flex gap-2 items-start mt-2">
                                <span className="text-lg">🤖</span>
                                <div>
                                    <strong className="text-green-900 text-sm block mb-1">AI Nhận xét độ tương thích:</strong>
                                    <p className="text-sm text-green-800 font-medium">{candidate.reason}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="shrink-0 flex items-center justify-center md:border-l border-gray-100 md:pl-6">
                        <button onClick={() => handleInterest(candidate)} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 hover:scale-105 transition-all w-full md:w-auto">
                            ♥ Quan tâm
                        </button>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
}
