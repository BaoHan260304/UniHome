import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, getUser, resolveMediaUrl } from '../lib/api';
import {
  PROVINCE_LIST,
  getDistrictsByProvince,
  getWardsByDistrict,
  formatCurrencyInput,
  formatAmountWords
} from '../lib/vietnamLocations';

type PostCategory = 'room' | 'roommate' | 'secondhand' | 'service';

export default function PostCreatePage() {
  const { category: paramCategory, id: editId } = useParams<{ category?: string; id?: string }>();
  const [searchParams] = useSearchParams();
  const queryCategory = searchParams.get('category');
  const nav = useNavigate();
  const user = getUser();

  // Active Category state
  const resolvedCategory = (paramCategory || queryCategory || '').toLowerCase();
  const initialCategory: PostCategory = 
    (resolvedCategory === 'roommate' || resolvedCategory === 'secondhand' || resolvedCategory === 'second_hand' || resolvedCategory === 'service')
      ? (resolvedCategory === 'second_hand' ? 'secondhand' : resolvedCategory as PostCategory)
      : 'room';
  const [category, setCategory] = useState<PostCategory>(initialCategory);

  useEffect(() => {
    const cat = (paramCategory || queryCategory || '').toLowerCase();
    if (cat) {
      if (cat === 'second_hand' || cat === 'secondhand') setCategory('secondhand');
      else if (['room', 'roommate', 'service'].includes(cat)) setCategory(cat as PostCategory);
    }
  }, [paramCategory, queryCategory]);

  // Image Guidelines Modal State
  const [showImageGuide, setShowImageGuide] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Room / Roommate Common Form State
  const [roomForm, setRoomForm] = useState({
    title: '',
    name: '',
    posterRelationship: searchParams.get('relationship') || 'OWNER',
    postType: initialCategory === 'roommate' ? (searchParams.get('relationship') === 'TENANT_TRANSFER' ? 'ROOM_TRANSFER' : 'O_GHEP') : 'ROOM_FOR_RENT',
    province: 'Hà Nội',
    district: 'Thạch Thất',
    ward: '',
    street: '',
    latitude: '21.0125',
    longitude: '105.5268',
    university: 'Đại học FPT',
    nearestSchool: 'Đại học FPT Hà Nội',
    nearestSchoolDistanceKm: '1.2',
    price: '',
    deposit: '',
    area: '',
    propertyType: 'Phòng trọ',
    floorText: 'Tầng 2',
    maxOccupants: '2',
    furniture: 'basic',
    electricityPrice: '3500',
    waterPrice: '30000',
    internetPrice: '100000',
    parkingFee: '0',
    otherFees: '0',
    amenities: [] as string[],
    rules: 'Giờ giấc tự do, không nuôi thú cưng',
    contactPhone: user?.phone || '',
    contactZalo: user?.phone || '',
    description: '',
    images: [] as string[],
    videoUrl: ''
  });

  // 2. Secondhand Form State
  const [secondHandForm, setSecondHandForm] = useState({
    title: '',
    category: 'Đồ gia dụng',
    price: '',
    conditionText: 'Đã qua sử dụng',
    province: 'Hà Nội',
    district: 'Thạch Thất',
    description: '',
    images: [] as string[]
  });

  // 3. Service Form State
  const [serviceForm, setServiceForm] = useState({
    title: '',
    category: 'Vận chuyển & chuyển trọ',
    priceFrom: '',
    province: 'Hà Nội',
    areaServed: 'Khu vực Hòa Lạc, Thạch Thất, Quốc Oai',
    workingHours: '08:00 - 20:00 hàng ngày',
    phone: user?.phone || '',
    zalo: user?.phone || '',
    description: '',
    images: [] as string[]
  });

  // Media upload helpers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleImageFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxAllowed = (category === 'room' || category === 'roommate') ? 20 : 10;
    const currentImgs = (category === 'room' || category === 'roommate')
      ? roomForm.images
      : category === 'secondhand'
      ? secondHandForm.images
      : serviceForm.images;

    if (currentImgs.length >= maxAllowed) {
      alert(`Bạn đã đạt số lượng ảnh tối đa (${maxAllowed} ảnh).`);
      if (e.target) e.target.value = '';
      return;
    }

    const availableSlots = maxAllowed - currentImgs.length;
    const filesToUpload = Array.from(files).slice(0, availableSlots);
    if (files.length > availableSlots) {
      alert(`Chỉ có thể thêm ${availableSlots} ảnh nữa để đạt tối đa ${maxAllowed} ảnh.`);
    }

    setUploadingMedia(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setUploadProgressText(`Đang tải ảnh ${i + 1}/${filesToUpload.length}: ${file.name}...`);

        if (file.size > 8 * 1024 * 1024) {
          alert(`File "${file.name}" vượt quá giới hạn 8MB và sẽ bị bỏ qua.`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('mediaType', 'IMAGE');

        const res = await api.post('/listings/media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data?.url) {
          uploadedUrls.push(res.data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        if (category === 'room' || category === 'roommate') {
          setRoomForm(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
        } else if (category === 'secondhand') {
          setSecondHandForm(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
        } else if (category === 'service') {
          setServiceForm(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi tải ảnh:', err);
      alert(err.response?.data?.message || err.message || 'Tải ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setUploadingMedia(false);
      setUploadProgressText('');
      if (e.target) e.target.value = '';
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert('Video không được vượt quá 100MB.');
      if (e.target) e.target.value = '';
      return;
    }

    setUploadingMedia(true);
    setUploadProgressText(`Đang tải video "${file.name}" lên máy chủ...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', 'VIDEO');

      const res = await api.post('/listings/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.url) {
        setRoomForm(prev => ({ ...prev, videoUrl: res.data.url }));
      }
    } catch (err: any) {
      console.error('Lỗi tải video:', err);
      alert(err.response?.data?.message || err.message || 'Tải video thất bại.');
    } finally {
      setUploadingMedia(false);
      setUploadProgressText('');
      if (e.target) e.target.value = '';
    }
  };

  const addImage = (targetCat: PostCategory) => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    if (targetCat === 'room' || targetCat === 'roommate') {
      if (roomForm.images.length >= 20) {
        alert('Tối đa 20 hình ảnh.');
        return;
      }
      setRoomForm(prev => ({ ...prev, images: [...prev.images, url] }));
    } else if (targetCat === 'secondhand') {
      if (secondHandForm.images.length >= 10) {
        alert('Tối đa 10 hình ảnh.');
        return;
      }
      setSecondHandForm(prev => ({ ...prev, images: [...prev.images, url] }));
    } else if (targetCat === 'service') {
      if (serviceForm.images.length >= 10) {
        alert('Tối đa 10 hình ảnh.');
        return;
      }
      setServiceForm(prev => ({ ...prev, images: [...prev.images, url] }));
    }
    setNewImageUrl('');
  };

  const removeImage = (targetCat: PostCategory, idx: number) => {
    if (targetCat === 'room' || targetCat === 'roommate') {
      setRoomForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    } else if (targetCat === 'secondhand') {
      setSecondHandForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    } else if (targetCat === 'service') {
      setServiceForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    }
  };

  const toggleAmenity = (name: string) => {
    setRoomForm(prev => {
      const exists = prev.amenities.includes(name);
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter(a => a !== name) : [...prev.amenities, name]
      };
    });
  };

  const AMENITY_LIST = [
    'Điều hòa', 'Nóng lạnh', 'Máy giặt', 'Tủ lạnh', 'Khép kín',
    'Ban công', 'Thang máy', 'Khóa vân tay', 'Giờ tự do', 'Bếp nấu ăn',
    'PCCC đạt chuẩn', 'Chỗ để xe', 'Camera an ninh', 'Wifi tốc độ cao'
  ];

  // Location selection helpers
  const roomDistricts = getDistrictsByProvince(roomForm.province);
  const roomWards = getWardsByDistrict(roomForm.province, roomForm.district);

  const handleRoomProvinceChange = (newProvince: string) => {
    const districts = getDistrictsByProvince(newProvince);
    const firstDistrict = districts[0] || '';
    const wards = getWardsByDistrict(newProvince, firstDistrict);
    const firstWard = wards[0] || '';
    setRoomForm(prev => ({
      ...prev,
      province: newProvince,
      district: firstDistrict,
      ward: firstWard
    }));
  };

  const handleRoomDistrictChange = (newDistrict: string) => {
    const wards = getWardsByDistrict(roomForm.province, newDistrict);
    const firstWard = wards[0] || '';
    setRoomForm(prev => ({
      ...prev,
      district: newDistrict,
      ward: firstWard
    }));
  };

  const secondHandDistricts = getDistrictsByProvince(secondHandForm.province);
  const handleSecondHandProvinceChange = (newProvince: string) => {
    const districts = getDistrictsByProvince(newProvince);
    const firstDistrict = districts[0] || '';
    setSecondHandForm(prev => ({
      ...prev,
      province: newProvince,
      district: firstDistrict
    }));
  };

  // Fetch existing item for editing
  useEffect(() => {
    if (!editId) return;
    setLoadingData(true);
    const fetchExisting = async () => {
      try {
        if (category === 'room' || category === 'roommate') {
          const res = await api.get(`/listings/${editId}`);
          const d = res.data;
          let imgs: string[] = [];
          let vUrl = '';
          if (d.mediaJson) {
            try {
              const parsed = JSON.parse(d.mediaJson);
              imgs = parsed.filter((item: any) => !item.type || item.type === 'IMAGE').map((item: any) => typeof item === 'string' ? item : item.url).filter(Boolean);
              const vItem = parsed.find((item: any) => item.type === 'VIDEO');
              if (vItem) vUrl = vItem.url;
            } catch (ignored) {}
          }
          if (imgs.length === 0 && d.imageUrl) {
            imgs = [d.imageUrl];
          }
          let ams: string[] = [];
          if (d.amenities) {
            ams = d.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
          setRoomForm({
            title: d.title || '',
            name: d.name || d.title || '',
            posterRelationship: d.posterRelationship || 'OWNER',
            postType: d.postType || (category === 'roommate' ? 'O_GHEP' : 'ROOM_FOR_RENT'),
            province: d.province || 'Hà Nội',
            district: d.district || 'Thạch Thất',
            ward: d.ward || '',
            street: d.street || '',
            latitude: d.latitude ? String(d.latitude) : '21.0125',
            longitude: d.longitude ? String(d.longitude) : '105.5268',
            university: d.nearestSchool || 'Đại học FPT',
            nearestSchool: d.nearestSchool || 'Đại học FPT Hà Nội',
            nearestSchoolDistanceKm: d.nearestSchoolDistanceKm ? String(d.nearestSchoolDistanceKm) : '1.2',
            price: d.price ? String(d.price) : '',
            deposit: d.deposit ? String(d.deposit) : '',
            area: d.area ? String(d.area) : '',
            propertyType: d.propertyType || 'Phòng trọ',
            floorText: d.floorText || 'Tầng 2',
            maxOccupants: d.maxOccupants ? String(d.maxOccupants) : '2',
            furniture: d.furniture || 'basic',
            electricityPrice: d.electricityPrice ? String(d.electricityPrice) : '3500',
            waterPrice: d.waterPrice ? String(d.waterPrice) : '30000',
            internetPrice: d.internetPrice ? String(d.internetPrice) : '100000',
            parkingFee: d.parkingFee ? String(d.parkingFee) : '0',
            otherFees: d.otherFees ? String(d.otherFees) : '0',
            amenities: ams,
            rules: d.rules || 'Giờ giấc tự do, không nuôi thú cưng',
            contactPhone: d.contactPhone || user?.phone || '',
            contactZalo: d.contactZalo || user?.phone || '',
            description: d.description || '',
            images: imgs,
            videoUrl: vUrl || ''
          });
        } else if (category === 'secondhand') {
          const res = await api.get(`/content/secondhand/${editId}`);
          const d = res.data?.item || res.data;
          let imgs: string[] = [];
          if (d.galleryJson) {
            try {
              imgs = JSON.parse(d.galleryJson);
            } catch (ignored) {}
          }
          if (imgs.length === 0 && d.imageUrl) {
            imgs = [d.imageUrl];
          }
          setSecondHandForm({
            title: d.title || '',
            category: d.category || 'Đồ gia dụng',
            price: d.price ? String(d.price) : '',
            conditionText: d.conditionText || 'Đã qua sử dụng',
            province: d.province || 'Hà Nội',
            district: d.district || 'Thạch Thất',
            description: d.description || '',
            images: imgs
          });
        } else if (category === 'service') {
          const res = await api.get(`/content/services/${editId}`);
          const d = res.data?.service || res.data;
          let imgs: string[] = [];
          if (d.galleryJson) {
            try {
              imgs = JSON.parse(d.galleryJson);
            } catch (ignored) {}
          }
          if (imgs.length === 0 && d.imageUrl) {
            imgs = [d.imageUrl];
          }
          setServiceForm({
            title: d.title || '',
            category: d.category || 'Vận chuyển & chuyển trọ',
            priceFrom: d.priceFrom ? String(d.priceFrom) : '',
            province: d.province || 'Hà Nội',
            areaServed: d.serviceArea || 'Khu vực Hòa Lạc, Thạch Thất, Quốc Oai',
            workingHours: d.businessHours || '08:00 - 20:00 hàng ngày',
            phone: d.phone || user?.phone || '',
            zalo: d.zaloUrl || user?.phone || '',
            description: d.description || '',
            images: imgs
          });
        }
      } catch (err: any) {
        setErrorMsg('Không thể tải dữ liệu bài đăng cần sửa.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchExisting();
  }, [editId, category]);

  // Submit Handler
  const handleSubmit = async (isDraft: boolean) => {
    if (!user) {
      nav('/login', { state: { from: window.location.pathname } });
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (category === 'room' || category === 'roommate') {
        const isRoommate = category === 'roommate';
        const minImgs = isRoommate ? 1 : 3;

        if (!isDraft) {
          if (!roomForm.title.trim()) throw new Error('Vui lòng nhập tiêu đề bài đăng');
          if (!roomForm.price) throw new Error('Vui lòng nhập giá phòng / ngân sách');
          if (roomForm.images.length < minImgs) {
            throw new Error(`Theo quy định, bạn cần tải lên tối thiểu ${minImgs} hình ảnh thật.`);
          }
        }

        const payload = {
          title: roomForm.title || (isRoommate ? 'Tìm bạn ở ghép' : 'Cho thuê phòng trọ'),
          name: roomForm.name || roomForm.title,
          posterRelationship: roomForm.posterRelationship,
          postType: isRoommate ? roomForm.postType : 'ROOM_FOR_RENT',
          province: roomForm.province,
          district: roomForm.district,
          ward: roomForm.ward,
          street: roomForm.street,
          latitude: roomForm.latitude ? parseFloat(roomForm.latitude) : 21.0125,
          longitude: roomForm.longitude ? parseFloat(roomForm.longitude) : 105.5268,
          price: roomForm.price ? parseInt(roomForm.price) : 0,
          deposit: roomForm.deposit ? parseInt(roomForm.deposit) : 0,
          area: roomForm.area ? parseFloat(roomForm.area) : 20,
          propertyType: roomForm.propertyType,
          furniture: roomForm.furniture,
          floorText: roomForm.floorText,
          maxOccupants: roomForm.maxOccupants ? parseInt(roomForm.maxOccupants) : 2,
          electricityPrice: roomForm.electricityPrice ? parseInt(roomForm.electricityPrice) : 3500,
          waterPrice: roomForm.waterPrice ? parseInt(roomForm.waterPrice) : 30000,
          internetPrice: roomForm.internetPrice ? parseInt(roomForm.internetPrice) : 100000,
          parkingFee: roomForm.parkingFee ? parseInt(roomForm.parkingFee) : 0,
          otherFees: roomForm.otherFees ? parseInt(roomForm.otherFees) : 0,
          nearestSchool: roomForm.nearestSchool,
          nearestSchoolDistanceKm: roomForm.nearestSchoolDistanceKm ? parseFloat(roomForm.nearestSchoolDistanceKm) : 1.0,
          amenities: roomForm.amenities.join(', '),
          rules: roomForm.rules,
          contactPhone: roomForm.contactPhone,
          contactZalo: roomForm.contactZalo,
          description: roomForm.description,
          imageUrl: roomForm.images[0] || roomForm.videoUrl || '',
          mediaJson: JSON.stringify([
            ...roomForm.images.map(u => ({ type: 'IMAGE', url: u })),
            ...(roomForm.videoUrl ? [{ type: 'VIDEO', url: roomForm.videoUrl }] : [])
          ]),
          listingStatus: isDraft ? 'DRAFT' : 'PENDING_REVIEW'
        };

        if (editId) {
          await api.put(`/listings/${editId}`, payload);
          alert(isDraft ? 'Đã cập nhật bản nháp thành công!' : 'Đã cập nhật và gửi duyệt tin đăng thành công!');
        } else {
          await api.post('/listings', payload);
          alert(isDraft ? 'Đã lưu bản nháp thành công!' : 'Đã gửi duyệt tin đăng thành công! Ban quản trị sẽ duyệt trong vòng 24h.');
        }
        nav('/my-posts');
      } else if (category === 'secondhand') {
        if (!isDraft) {
          if (!secondHandForm.title.trim()) throw new Error('Vui lòng nhập tên món đồ');
          if (!secondHandForm.price) throw new Error('Vui lòng nhập giá bán');
          if (secondHandForm.images.length < 1) {
            throw new Error('Vui lòng tải lên ít nhất 1 hình ảnh thật của sản phẩm.');
          }
        }
        const payload = {
          title: secondHandForm.title,
          category: secondHandForm.category,
          price: parseInt(secondHandForm.price || '0'),
          conditionText: secondHandForm.conditionText,
          province: secondHandForm.province,
          district: secondHandForm.district,
          description: secondHandForm.description,
          imageUrl: secondHandForm.images[0] || '',
          galleryJson: JSON.stringify(secondHandForm.images),
          imagesJson: JSON.stringify(secondHandForm.images),
          status: isDraft ? 'DRAFT' : 'PENDING_REVIEW'
        };
        if (editId) {
          await api.put(`/content/secondhand/${editId}`, payload);
          alert(isDraft ? 'Đã cập nhật bản nháp đồ cũ!' : 'Đã cập nhật và gửi duyệt tin đồ cũ thành công!');
        } else {
          await api.post('/content/secondhand', payload);
          alert(isDraft ? 'Đã lưu bản nháp đồ cũ!' : 'Đã đăng tin đồ cũ và gửi duyệt thành công!');
        }
        nav('/my-posts');
      } else if (category === 'service') {
        if (!isDraft) {
          if (!serviceForm.title.trim()) throw new Error('Vui lòng nhập tên dịch vụ');
          if (!serviceForm.priceFrom) throw new Error('Vui lòng nhập giá khởi điểm');
          if (serviceForm.images.length < 1) {
            throw new Error('Vui lòng tải lên ít nhất 1 hình ảnh đại diện dịch vụ.');
          }
        }
        const payload = {
          title: serviceForm.title,
          category: serviceForm.category,
          priceFrom: parseInt(serviceForm.priceFrom || '0'),
          province: serviceForm.province,
          serviceArea: serviceForm.areaServed,
          businessHours: serviceForm.workingHours,
          phone: serviceForm.phone,
          zaloUrl: serviceForm.zalo,
          description: serviceForm.description,
          imageUrl: serviceForm.images[0] || '',
          galleryJson: JSON.stringify(serviceForm.images),
          status: isDraft ? 'DRAFT' : 'PENDING_REVIEW'
        };
        if (editId) {
          await api.put(`/content/services/${editId}`, payload);
          alert(isDraft ? 'Đã cập nhật bản nháp dịch vụ!' : 'Đã cập nhật và gửi duyệt dịch vụ thành công!');
        } else {
          await api.post('/content/services', payload);
          alert(isDraft ? 'Đã lưu bản nháp dịch vụ!' : 'Đã gửi dịch vụ lên kiểm duyệt thành công!');
        }
        nav('/my-posts');
      }
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || e.message || 'Đã xảy ra lỗi khi đăng tin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-4" />
        <p className="text-sm font-semibold text-gray-600">Đang tải thông tin bài đăng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6 animate-fade-in">
      {/* Category Tabs */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setCategory('room'); nav('/post/new/room'); }}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            category === 'room'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>🏠</span> Phòng trọ / Căn hộ
        </button>
        <button
          type="button"
          onClick={() => { setCategory('roommate'); nav('/post/new/roommate'); }}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            category === 'roommate'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>🤝</span> Tìm bạn ở ghép / Pass phòng
        </button>
        <button
          type="button"
          onClick={() => { setCategory('secondhand'); nav('/post/new/secondhand'); }}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            category === 'secondhand'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>📦</span> Đồ cũ sinh viên
        </button>
        <button
          type="button"
          onClick={() => { setCategory('service'); nav('/post/new/service'); }}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            category === 'service'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>🚚</span> Dịch vụ sinh viên
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-50/50 to-white border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              {category === 'room' && '✍️ Đăng tin Cho thuê phòng trọ'}
              {category === 'roommate' && '🤝 Đăng tin Tìm bạn ở ghép / Pass phòng'}
              {category === 'secondhand' && '📦 Đăng bán Đồ cũ sinh viên'}
              {category === 'service' && '🚚 Đăng tin Cung cấp Dịch vụ'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Điền đầy đủ thông tin để bài đăng được duyệt nhanh và thu hút nhiều người xem
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowImageGuide(true)}
            className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>📷</span> Quy định hình ảnh
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {/* ==================== CATEGORY: ROOM & ROOMMATE ==================== */}
          {(category === 'room' || category === 'roommate') && (
            <>
              {/* Type / Relationship */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tư cách người đăng *</label>
                  <select
                    value={roomForm.posterRelationship}
                    onChange={e => setRoomForm({ ...roomForm, posterRelationship: e.target.value })}
                    className="w-full text-xs border rounded-xl p-2.5 bg-gray-50 font-medium"
                  >
                    <option value="OWNER">Chính chủ cho thuê</option>
                    <option value="PROPERTY_MANAGER">Quản lý tòa nhà / KTX</option>
                    <option value="BROKER">Môi giới / Đối tác</option>
                  </select>
                </div>
                {category === 'roommate' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Mục đích bài đăng *</label>
                    <select
                      value={roomForm.postType}
                      onChange={e => setRoomForm({ ...roomForm, postType: e.target.value })}
                      className="w-full text-xs border rounded-xl p-2.5 bg-gray-50 font-medium"
                    >
                      <option value="O_GHEP">Tìm người ở ghép cùng</option>
                      <option value="ROOM_TRANSFER">Nhượng lại phòng trọ (Pass phòng)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Title & Type */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tiêu đề bài đăng *</label>
                  <input
                    type="text"
                    placeholder="VD: Phòng khép kín full đồ gần ĐH FPT, giờ giấc tự do..."
                    value={roomForm.title}
                    onChange={e => setRoomForm({ ...roomForm, title: e.target.value })}
                    className="w-full text-xs border rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">📍 Địa chỉ & Vị trí</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Tỉnh / Thành</label>
                    <select
                      value={roomForm.province}
                      onChange={e => handleRoomProvinceChange(e.target.value)}
                      className="w-full text-xs border rounded-xl p-2 bg-white font-medium"
                    >
                      {PROVINCE_LIST.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                      {!PROVINCE_LIST.includes(roomForm.province) && roomForm.province && (
                        <option value={roomForm.province}>{roomForm.province}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Quận / Huyện</label>
                    <select
                      value={roomForm.district}
                      onChange={e => handleRoomDistrictChange(e.target.value)}
                      className="w-full text-xs border rounded-xl p-2 bg-white font-medium"
                    >
                      {roomDistricts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      {!roomDistricts.includes(roomForm.district) && roomForm.district && (
                        <option value={roomForm.district}>{roomForm.district}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Phường / Xã</label>
                    <select
                      value={roomForm.ward}
                      onChange={e => setRoomForm({ ...roomForm, ward: e.target.value })}
                      className="w-full text-xs border rounded-xl p-2 bg-white font-medium"
                    >
                      <option value="">-- Chọn Phường / Xã --</option>
                      {roomWards.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                      {!roomWards.includes(roomForm.ward) && roomForm.ward && (
                        <option value={roomForm.ward}>{roomForm.ward}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Đường / Số nhà</label>
                    <input
                      type="text"
                      placeholder="VD: Thôn 3, Số 12"
                      value={roomForm.street}
                      onChange={e => setRoomForm({ ...roomForm, street: e.target.value })}
                      className="w-full text-xs border rounded-xl p-2 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Trường ĐH gần nhất</label>
                    <input
                      type="text"
                      placeholder="VD: ĐH FPT, ĐHQG Hòa Lạc"
                      value={roomForm.nearestSchool}
                      onChange={e => setRoomForm({ ...roomForm, nearestSchool: e.target.value })}
                      className="w-full text-xs border rounded-xl p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Khoảng cách tới trường (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="VD: 1.2"
                      value={roomForm.nearestSchoolDistanceKm}
                      onChange={e => setRoomForm({ ...roomForm, nearestSchoolDistanceKm: e.target.value })}
                      className="w-full text-xs border rounded-xl p-2 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Price & Specs */}
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">💰 Giá thuê & Thông số phòng</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Giá thuê (đ/tháng) *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="VD: 2.500.000"
                        value={formatCurrencyInput(roomForm.price)}
                        onChange={e => setRoomForm({ ...roomForm, price: e.target.value.replace(/\D/g, '') })}
                        className="w-full text-xs border rounded-xl p-2 pr-7 bg-white font-bold text-indigo-700"
                      />
                      <span className="absolute right-2.5 top-2 text-[11px] text-gray-400 font-bold">₫</span>
                    </div>
                    {roomForm.price && (
                      <p className="text-[10px] text-indigo-600 font-medium mt-0.5 truncate">
                        {formatAmountWords(roomForm.price)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Tiền cọc (đ)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="VD: 2.500.000"
                        value={formatCurrencyInput(roomForm.deposit)}
                        onChange={e => setRoomForm({ ...roomForm, deposit: e.target.value.replace(/\D/g, '') })}
                        className="w-full text-xs border rounded-xl p-2 pr-7 bg-white font-medium"
                      />
                      <span className="absolute right-2.5 top-2 text-[11px] text-gray-400 font-bold">₫</span>
                    </div>
                    {roomForm.deposit && (
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5 truncate">
                        {formatAmountWords(roomForm.deposit)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Diện tích (m²)</label>
                    <input
                      type="number"
                      placeholder="VD: 25"
                      value={roomForm.area}
                      onChange={e => setRoomForm({ ...roomForm, area: e.target.value })}
                      className="w-full text-xs border rounded-xl p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Số người tối đa</label>
                    <input
                      type="number"
                      value={roomForm.maxOccupants}
                      onChange={e => setRoomForm({ ...roomForm, maxOccupants: e.target.value })}
                      className="w-full text-xs border rounded-xl p-2 bg-white"
                    />
                  </div>
                </div>

                {/* Utilities */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Giá điện (đ/kWh)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="3.500"
                        value={formatCurrencyInput(roomForm.electricityPrice)}
                        onChange={e => setRoomForm({ ...roomForm, electricityPrice: e.target.value.replace(/\D/g, '') })}
                        className="w-full text-xs border rounded-xl p-2 pr-7 bg-white"
                      />
                      <span className="absolute right-2.5 top-2 text-[11px] text-gray-400 font-bold">₫</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Giá nước (đ/người hoặc khối)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="30.000"
                        value={formatCurrencyInput(roomForm.waterPrice)}
                        onChange={e => setRoomForm({ ...roomForm, waterPrice: e.target.value.replace(/\D/g, '') })}
                        className="w-full text-xs border rounded-xl p-2 pr-7 bg-white"
                      />
                      <span className="absolute right-2.5 top-2 text-[11px] text-gray-400 font-bold">₫</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Mạng Internet (đ/tháng)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="100.000"
                        value={formatCurrencyInput(roomForm.internetPrice)}
                        onChange={e => setRoomForm({ ...roomForm, internetPrice: e.target.value.replace(/\D/g, '') })}
                        className="w-full text-xs border rounded-xl p-2 pr-7 bg-white"
                      />
                      <span className="absolute right-2.5 top-2 text-[11px] text-gray-400 font-bold">₫</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Gửi xe (đ/xe)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0"
                        value={formatCurrencyInput(roomForm.parkingFee)}
                        onChange={e => setRoomForm({ ...roomForm, parkingFee: e.target.value.replace(/\D/g, '') })}
                        className="w-full text-xs border rounded-xl p-2 pr-7 bg-white"
                      />
                      <span className="absolute right-2.5 top-2 text-[11px] text-gray-400 font-bold">₫</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">Tiện nghi sẵn có</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AMENITY_LIST.map(amenity => (
                    <label
                      key={amenity}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        roomForm.amenities.includes(amenity)
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={roomForm.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded text-indigo-600"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mô tả chi tiết phòng</label>
                <textarea
                  rows={4}
                  placeholder="Mô tả cụ thể về tiện ích, môi trường xung quanh, an ninh, quy định phòng..."
                  value={roomForm.description}
                  onChange={e => setRoomForm({ ...roomForm, description: e.target.value })}
                  className="w-full text-xs border rounded-xl p-2.5"
                />
              </div>
            </>
          )}

          {/* ==================== CATEGORY: SECONDHAND ==================== */}
          {category === 'secondhand' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Danh mục đồ cũ *</label>
                  <select
                    value={secondHandForm.category}
                    onChange={e => setSecondHandForm({ ...secondHandForm, category: e.target.value })}
                    className="w-full text-xs border rounded-xl p-2.5 bg-gray-50 font-medium"
                  >
                    <option value="Đồ gia dụng">Đồ gia dụng</option>
                    <option value="Nội thất">Nội thất</option>
                    <option value="Điện tử">Điện tử</option>
                    <option value="Sách / học tập">Sách / học tập</option>
                    <option value="Xe / phụ kiện">Xe / phụ kiện</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tình trạng món đồ *</label>
                  <select
                    value={secondHandForm.conditionText}
                    onChange={e => setSecondHandForm({ ...secondHandForm, conditionText: e.target.value })}
                    className="w-full text-xs border rounded-xl p-2.5 bg-gray-50 font-medium"
                  >
                    <option value="Mới 100%">Mới 100% (Chưa sử dụng)</option>
                    <option value="Như mới 99%">Như mới 99%</option>
                    <option value="Đã qua sử dụng">Đã qua sử dụng (Còn tốt)</option>
                    <option value="Cũ">Cũ giá rẻ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tên món đồ / Tiêu đề *</label>
                <input
                  type="text"
                  placeholder="VD: Nồi chiên không dầu Lock&Lock 3.5L, Bàn học sinh viên..."
                  value={secondHandForm.title}
                  onChange={e => setSecondHandForm({ ...secondHandForm, title: e.target.value })}
                  className="w-full text-xs border rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Giá thanh lý (đ) *</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="VD: 350.000"
                      value={formatCurrencyInput(secondHandForm.price)}
                      onChange={e => setSecondHandForm({ ...secondHandForm, price: e.target.value.replace(/\D/g, '') })}
                      className="w-full text-xs border rounded-xl p-2.5 pr-7 font-bold text-indigo-700"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">₫</span>
                  </div>
                  {secondHandForm.price && (
                    <p className="text-[10px] text-gray-500 font-medium mt-1 truncate">
                      {formatAmountWords(secondHandForm.price)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tỉnh / Thành phố *</label>
                  <select
                    value={secondHandForm.province}
                    onChange={e => handleSecondHandProvinceChange(e.target.value)}
                    className="w-full text-xs border rounded-xl p-2.5 bg-gray-50 font-medium"
                  >
                    <option value="">-- Chọn Tỉnh / Thành --</option>
                    {PROVINCE_LIST.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quận / Huyện *</label>
                  <select
                    value={secondHandForm.district}
                    onChange={e => setSecondHandForm({ ...secondHandForm, district: e.target.value })}
                    className="w-full text-xs border rounded-xl p-2.5 bg-gray-50 font-medium"
                  >
                    <option value="">-- Chọn Quận / Huyện --</option>
                    {secondHandDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                    {secondHandForm.district && !secondHandDistricts.includes(secondHandForm.district) && (
                      <option value={secondHandForm.district}>{secondHandForm.district}</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mô tả chi tiết món đồ</label>
                <textarea
                  rows={4}
                  placeholder="Nêu rõ thời gian sử dụng, phụ kiện kèm theo, lý do pass đồ, địa chỉ xem đồ..."
                  value={secondHandForm.description}
                  onChange={e => setSecondHandForm({ ...secondHandForm, description: e.target.value })}
                  className="w-full text-xs border rounded-xl p-2.5"
                />
              </div>
            </div>
          )}

          {/* ==================== CATEGORY: SERVICE ==================== */}
          {category === 'service' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Loại dịch vụ *</label>
                  <select
                    value={serviceForm.category}
                    onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full text-xs border rounded-xl p-2.5 bg-gray-50 font-medium"
                  >
                    <option value="Vận chuyển & chuyển trọ">Vận chuyển & chuyển trọ</option>
                    <option value="Sửa chữa & điện nước">Sửa chữa & điện nước</option>
                    <option value="Vệ sinh & dọn phòng">Vệ sinh & dọn phòng</option>
                    <option value="Giặt ủi sinh viên">Giặt ủi sinh viên</option>
                    <option value="Gia sư & học tập">Gia sư & học tập</option>
                    <option value="Nấu ăn & cơm tháng">Nấu ăn & cơm tháng</option>
                    <option value="Khác">Dịch vụ khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Giá khởi điểm từ (đ) *</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="VD: 150.000"
                      value={formatCurrencyInput(serviceForm.priceFrom)}
                      onChange={e => setServiceForm({ ...serviceForm, priceFrom: e.target.value.replace(/\D/g, '') })}
                      className="w-full text-xs border rounded-xl p-2.5 pr-7 font-bold text-indigo-700"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">₫</span>
                  </div>
                  {serviceForm.priceFrom && (
                    <p className="text-[10px] text-gray-500 font-medium mt-1 truncate">
                      {formatAmountWords(serviceForm.priceFrom)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tên gói dịch vụ / Tiêu đề *</label>
                <input
                  type="text"
                  placeholder="VD: Dịch vụ xe ba gác chuyển trọ trọn gói khu Hòa Lạc..."
                  value={serviceForm.title}
                  onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="w-full text-xs border rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tỉnh / Thành phố *</label>
                  <select
                    value={serviceForm.province}
                    onChange={e => setServiceForm({ ...serviceForm, province: e.target.value })}
                    className="w-full text-xs border rounded-xl p-2.5 bg-gray-50 font-medium"
                  >
                    <option value="">-- Chọn Tỉnh / Thành --</option>
                    {PROVINCE_LIST.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    {serviceForm.province && !PROVINCE_LIST.includes(serviceForm.province) && (
                      <option value={serviceForm.province}>{serviceForm.province}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phạm vi phục vụ</label>
                  <input
                    type="text"
                    placeholder="VD: Khu vực Hòa Lạc, Thạch Thất..."
                    value={serviceForm.areaServed}
                    onChange={e => setServiceForm({ ...serviceForm, areaServed: e.target.value })}
                    className="w-full text-xs border rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Thời gian làm việc</label>
                  <input
                    type="text"
                    value={serviceForm.workingHours}
                    onChange={e => setServiceForm({ ...serviceForm, workingHours: e.target.value })}
                    className="w-full text-xs border rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    value={serviceForm.phone}
                    onChange={e => setServiceForm({ ...serviceForm, phone: e.target.value })}
                    className="w-full text-xs border rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mô tả dịch vụ</label>
                <textarea
                  rows={4}
                  placeholder="Chi tiết về các dịch vụ cung cấp, cam kết chất lượng, bảng giá tham khảo..."
                  value={serviceForm.description}
                  onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full text-xs border rounded-xl p-2.5"
                />
              </div>
            </div>
          )}

          {/* ==================== MEDIA UPLOAD SECTION ==================== */}
          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <span>📸</span> Hình ảnh & Video bài đăng
                  <span className="text-xs font-normal text-gray-500">
                    {category === 'room' && '(Tối thiểu 3 ảnh, tối đa 20)'}
                    {category === 'roommate' && '(Tối thiểu 1 ảnh, tối đa 20)'}
                    {category === 'secondhand' && '(Tối thiểu 1 ảnh, tối đa 10)'}
                    {category === 'service' && '(Tối thiểu 1 ảnh, tối đa 10)'}
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImageGuide(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline"
              >
                Xem quy định ảnh
              </button>
            </div>

            {/* Hidden file inputs */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageFilesUpload}
              disabled={uploadingMedia}
            />
            <input
              type="file"
              ref={videoInputRef}
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={handleVideoFileUpload}
              disabled={uploadingMedia}
            />

            {/* Uploading progress notification */}
            {uploadingMedia && (
              <div className="flex items-center gap-3 p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800 text-xs font-semibold animate-pulse">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>{uploadProgressText || 'Đang tải tệp lên hệ thống...'}</span>
              </div>
            )}

            {/* Upload Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingMedia}
                className="flex items-center gap-2 bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
              >
                <span>📁</span>
                <span>Tải ảnh từ máy tính (chọn nhiều ảnh)</span>
              </button>

              {(category === 'room' || category === 'roommate') && (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingMedia}
                  className="flex items-center gap-2 bg-gray-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-black transition-all shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  <span>🎥</span>
                  <span>{roomForm.videoUrl ? 'Đổi video phòng' : 'Tải video phòng (tối đa 100MB)'}</span>
                </button>
              )}
            </div>

            {/* Video preview if uploaded */}
            {(category === 'room' || category === 'roommate') && roomForm.videoUrl && (
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>🎬 Video phòng trọ đã sẵn sàng:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setRoomForm(prev => ({ ...prev, videoUrl: '' }))}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline"
                  >
                    ✕ Gỡ bỏ video
                  </button>
                </div>
                <div className="max-w-md rounded-xl overflow-hidden bg-black aspect-video">
                  <video
                    src={resolveMediaUrl(roomForm.videoUrl)}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Input URL fallback */}
            <div className="flex gap-2 items-center pt-1">
              <input
                type="text"
                placeholder="Hoặc dán URL hình ảnh trực tiếp (https://...)..."
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(category); } }}
                className="flex-1 text-xs border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => addImage(category)}
                className="bg-gray-100 text-gray-700 font-bold text-xs px-3.5 py-2.5 rounded-xl hover:bg-gray-200 border border-gray-200 transition-colors"
              >
                + Thêm link
              </button>
            </div>

            {/* Thumbnails preview */}
            {(() => {
              const currentImages = category === 'room' || category === 'roommate'
                ? roomForm.images
                : category === 'secondhand'
                ? secondHandForm.images
                : serviceForm.images;

              return (
                <div>
                  {currentImages.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-xs text-gray-400">
                      Chưa có hình ảnh nào. Nhấn <b>"Tải ảnh từ máy tính"</b> hoặc dán đường dẫn ảnh.
                      <p className="mt-1 text-[11px] text-gray-400">
                        Vui lòng thêm ít nhất {category === 'room' ? 3 : 1} ảnh thật để bài đăng được kiểm duyệt.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {currentImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50 shadow-2xs">
                          <img src={resolveMediaUrl(img)} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(category, idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-[10px] opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-xs"
                          >
                            ✕
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                              Ảnh bìa
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => nav('/my-posts')}
            className="text-xs font-bold text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-xl"
          >
            ← Hủy & Quay lại
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 px-4 py-2.5 rounded-xl shadow-2xs transition-all disabled:opacity-50"
            >
              💾 Lưu bản nháp
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'Đang gửi...' : '🚀 Gửi duyệt bài đăng'}
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MODAL: QUY ĐỊNH HÌNH ẢNH ==================== */}
      {showImageGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <span>📸</span> Quy định hình ảnh UniHome
              </h3>
              <button
                type="button"
                onClick={() => setShowImageGuide(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5">
                <h4 className="font-bold text-emerald-800 flex items-center gap-1.5 text-xs">
                  <span>✅</span> NÊN LÀM:
                </h4>
                <ul className="list-disc list-inside text-emerald-700 space-y-1">
                  <li>Tải lên hình ảnh thật chụp trực tiếp tại căn phòng/món đồ.</li>
                  <li>Hình ảnh đủ sáng, độ phân giải cao, rõ nét từng chi tiết.</li>
                  <li>Chụp nhiều góc khác nhau: phòng ngủ, WC, bếp, ban công, chỗ để xe.</li>
                  <li>Kích thước khuyến nghị: tỷ lệ 4:3 hoặc 16:9, dung lượng dưới 10MB/ảnh.</li>
                </ul>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-1.5">
                <h4 className="font-bold text-red-800 flex items-center gap-1.5 text-xs">
                  <span>❌</span> TUYỆT ĐỐI KHÔNG:
                </h4>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  <li>Hình ảnh copy từ internet, ảnh 3D mô phỏng không thực tế.</li>
                  <li>Chèn số điện thoại, link website hoặc chữ quảng cáo che khuất hình ảnh.</li>
                  <li>Hình ảnh chứa watermark, logo của các nền tảng bất động sản khác.</li>
                  <li>Tải lên nhiều hình ảnh trùng lặp hoặc hình ảnh bị mờ nhoè, biến dạng.</li>
                </ul>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-800 font-medium">
                <strong>Số lượng yêu cầu tối thiểu:</strong>
                <p className="mt-1">
                  • Phòng trọ: <strong>tối thiểu 3 ảnh</strong>, tối đa 20 ảnh.<br />
                  • Ở ghép / Pass phòng: <strong>tối thiểu 1 ảnh</strong>, tối đa 20 ảnh.<br />
                  • Đồ cũ / Dịch vụ: <strong>tối thiểu 1 ảnh</strong>, tối đa 10 ảnh.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowImageGuide(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
            >
              Đã hiểu & Tiếp tục
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
