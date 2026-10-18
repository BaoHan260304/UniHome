/**
 * UniHome - Automated Fast Seeding Tool
 * ----------------------------------------------------
 * Công cụ tự động tiêm dữ liệu kích cầu:
 * - 6 Tài khoản ảo (3 Chủ trọ, 3 Sinh viên)
 * - 6 Phòng trọ thực tế khu vực Hòa Lạc (Tân Xã, Thạch Hòa, Bình Yên)
 * - 5 Món đồ cũ thanh lý sinh viên
 * - 3 Dịch vụ hỗ trợ sinh viên
 *
 * Cách chạy:
 *   node scripts/seed-platform.js [BASE_URL]
 *
 * Ví dụ:
 *   node scripts/seed-platform.js                           # Mặc định chạy localhost:8080
 *   node scripts/seed-platform.js https://unihome.onrender.com # Chạy trên web thật
 */

const BASE_URL = process.argv[2] || process.env.API_URL || 'http://localhost:8080';

const USERS = [
  { fullName: 'Cô Lan Tân Xã', email: 'lan.tanxa@unihome.vn', phone: '0900000101', role: 'LANDLORD', gender: 'Nữ', school: null },
  { fullName: 'Chú Tuấn Ký Túc Xá', email: 'tuan.hoalac@unihome.vn', phone: '0900000102', role: 'LANDLORD', gender: 'Nam', school: null },
  { fullName: 'Bác Hùng Bình Yên', email: 'hung.binhyen@unihome.vn', phone: '0900000103', role: 'LANDLORD', gender: 'Nam', school: null },
  { fullName: 'Hoàng Đức Huy', email: 'huy.fpt@unihome.vn', phone: '0900000104', role: 'TENANT', gender: 'Nam', school: 'FPT University' },
  { fullName: 'Nguyễn Mai Linh', email: 'linh.dhqg@unihome.vn', phone: '0900000105', role: 'TENANT', gender: 'Nữ', school: 'Đại học Quốc gia Hà Nội' },
  { fullName: 'Phạm Quang Minh', email: 'minh.fpt@unihome.vn', phone: '0900000106', role: 'TENANT', gender: 'Nam', school: 'FPT University' },
];

const ROOMS = [
  {
    name: 'Phòng Studio Full Nội Thất Tân Xã - Ban Công Thoáng',
    postType: 'CHO_THUE',
    propertyType: 'Phòng trọ',
    province: 'Hà Nội',
    district: 'Huyện Thạch Thất',
    ward: 'Xã Tân Xã',
    street: 'Thôn 1 Tân Xã',
    latitude: 21.0185,
    longitude: 105.5234,
    price: 3200000,
    area: 28,
    deposit: 3200000,
    electricityPrice: 3800,
    waterPrice: 100000,
    internetPrice: 100000,
    parkingFee: 0,
    nearestSchool: 'FPT University',
    nearestSchoolDistanceKm: 1.5,
    amenities: 'Điều hòa|Nóng lạnh|Máy giặt|Tủ lạnh|Bếp riêng|Khóa vân tay|Camera an ninh|Ban công|Chỗ để xe',
    rules: 'Không hút thuốc trong phòng|Giữ yên tĩnh sau 23h|Không nuôi thú cưng',
    description: 'Phòng studio mới xây 100%, cách cổng trường FPT chỉ 1.5km. Có cửa sổ đón gió tự nhiên, thang máy, khóa vân tay ra vào 24/7 không chung chủ. Điện nước giá nhà nước minh bạch có công tơ riêng.',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
    mediaJson: JSON.stringify([
      { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80', caption: 'Không gian phòng ngủ' },
      { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80', caption: 'Góc học tập & làm việc' },
      { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80', caption: 'Nhà vệ sinh khép kín' }
    ])
  },
  {
    name: 'Phòng Trọ Khép Kín Giá Rẻ Ngay Cổng Trường ĐHQG',
    postType: 'CHO_THUE',
    propertyType: 'Phòng trọ',
    province: 'Hà Nội',
    district: 'Huyện Thạch Thất',
    ward: 'Xã Thạch Hòa',
    street: 'Khu công nghệ cao Hòa Lạc',
    latitude: 21.0125,
    longitude: 105.5340,
    price: 2400000,
    area: 22,
    deposit: 2400000,
    electricityPrice: 3500,
    waterPrice: 80000,
    internetPrice: 80000,
    parkingFee: 0,
    nearestSchool: 'Đại học Quốc gia Hà Nội',
    nearestSchoolDistanceKm: 0.8,
    amenities: 'Điều hòa|Nóng lạnh|Wifi|Chỗ để xe|Camera an ninh',
    rules: 'Giữ vệ sinh chung|Giờ giấc tự do',
    description: 'Vị trí siêu tiện lợi cho sinh viên ĐHQG đi bộ tới giảng đường. Khu dân trí cao, an ninh tốt, xe máy để tầng 1 miễn phí có camera giám sát.',
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80',
    mediaJson: JSON.stringify([
      { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80', caption: 'Toàn cảnh phòng' },
      { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80', caption: 'Lối vào' }
    ])
  },
  {
    name: 'Tìm Bạn Nam Ở Ghép Chung Cư Mini Bình Yên - Tiết Kiệm',
    postType: 'O_GHEP',
    propertyType: 'Ở ghép',
    province: 'Hà Nội',
    district: 'Huyện Thạch Thất',
    ward: 'Xã Bình Yên',
    street: 'Tỉnh lộ 420',
    latitude: 21.0080,
    longitude: 105.5110,
    price: 1500000,
    area: 35,
    deposit: 1500000,
    electricityPrice: 3500,
    waterPrice: 90000,
    internetPrice: 70000,
    parkingFee: 0,
    nearestSchool: 'FPT University',
    nearestSchoolDistanceKm: 2.2,
    amenities: 'Điều hòa|Nóng lạnh|Máy giặt|Tủ lạnh|Bếp riêng|Wifi',
    rules: 'Không hút thuốc|Tính tình hòa đồng, sạch sẽ',
    description: 'Mình là sinh viên K18 FPT, đang thuê phòng 3 triệu/tháng muốn tìm 1 bạn nam ở cùng để share tiền phòng và điện nước. Phòng có sẵn tủ lạnh, máy giặt, bếp từ đầy đủ chỉ cần vác vali vào ở.',
    imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop&q=80',
    mediaJson: JSON.stringify([
      { url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop&q=80', caption: 'Phòng khách & bếp' }
    ])
  }
];

const ITEMS = [
  {
    title: 'Bàn học gấp chân sắt kèm giá sách mini',
    category: 'Nội thất',
    price: 160000,
    conditionText: 'Còn mới 90%',
    province: 'Hà Nội',
    district: 'Huyện Thạch Thất',
    description: 'Bàn mua đầu kỳ học nhưng chuyển trọ dư ra nên thanh lý rẻ cho bạn nào cần. Khung sắt chắc chắn, mặt gỗ ép không trầy xước.',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80'
  },
  {
    title: 'Nồi cơm điện mini Lock&Lock 0.8L cho sinh viên',
    category: 'Đồ gia dụng',
    price: 250000,
    conditionText: 'Đang dùng tốt',
    province: 'Hà Nội',
    district: 'Huyện Thạch Thất',
    description: 'Nấu cơm dẻo, lòng nồi chống dính còn nguyên, phù hợp cho 1-2 người ăn. Tặng kèm muôi xới cơm.',
    imageUrl: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=800&auto=format&fit=crop&q=80'
  },
  {
    title: 'Quạt đứng lửng Senko 3 tốc độ gió',
    category: 'Đồ gia dụng',
    price: 180000,
    conditionText: 'Còn tốt',
    province: 'Hà Nội',
    district: 'Huyện Thạch Thất',
    description: 'Quạt chạy cực êm không rung lắc, cánh quạt sạch sẽ. Ưu tiên bạn nào qua lấy trực tiếp ở Tân Xã.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80'
  }
];

const SERVICES = [
  {
    title: 'Xe ba gác chuyển trọ trọn gói Hòa Lạc',
    category: 'Moving',
    priceFrom: 120000,
    description: 'Nhận chuyển đồ phòng trọ, vali, đệm, tủ bàn ghế khu vực Thạch Thất - Hòa Lạc. Hỗ trợ bê vác nhiệt tình, giá sinh viên.',
    phone: '0988776655',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
  },
  {
    title: 'Vệ sinh & dọn dẹp phòng trọ trước khi vào ở',
    category: 'Cleaning',
    priceFrom: 150000,
    description: 'Dọn sạch bụi bẩn, cọ rửa sàn nhà, tẩy ố nhà vệ sinh và khử mùi ẩm mốc để bạn dọn vào ở an tâm nhất.',
    phone: '0977665544',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80'
  }
];

async function run() {
  console.log(`\n======================================================`);
  console.log(`🚀 UniHome Fast Seeding Tool -> ${BASE_URL}`);
  console.log(`======================================================\n`);

  const tokens = {};

  // 1. Register or Login demo users
  console.log(`[1/4] Khởi tạo tài khoản người dùng...`);
  for (const u of USERS) {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: u.email, password: 'password123' })
      });
      if (res.ok) {
        const data = await res.json();
        tokens[u.email] = data.token;
        console.log(`  ✓ Đăng nhập thành công: ${u.fullName} (${u.email})`);
      } else {
        // Register if not exist
        const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: u.fullName,
            email: u.email,
            phone: u.phone,
            password: 'password123',
            confirmPassword: 'password123',
            role: u.role,
            gender: u.gender,
            schoolName: u.school,
            agreeTerms: true
          })
        });
        if (regRes.ok) {
          console.log(`  ✓ Tạo mới tài khoản: ${u.fullName} (${u.email})`);
          // Login to get token
          const logRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: u.email, password: 'password123' })
          });
          const logData = await logRes.json();
          tokens[u.email] = logData.token;
        } else {
          console.log(`  ! Không thể tạo user ${u.email}: ${regRes.statusText}`);
        }
      }
    } catch (err) {
      console.log(`  ! Lỗi kết nối tài khoản ${u.email}:`, err.message);
    }
  }

  // 2. Post Rooms
  console.log(`\n[2/4] Đăng tin phòng trọ & tìm người ở ghép...`);
  const landlordToken = tokens['lan.tanxa@unihome.vn'] || Object.values(tokens)[0];
  if (landlordToken) {
    for (const r of ROOMS) {
      try {
        const res = await fetch(`${BASE_URL}/api/listings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': landlordToken
          },
          body: JSON.stringify({
            title: r.name,
            ...r
          })
        });
        if (res.ok) {
          console.log(`  ✓ Đã đăng phòng: "${r.name.slice(0, 40)}..."`);
        } else {
          console.log(`  ! Không đăng được phòng: ${res.statusText}`);
        }
      } catch (err) {
        console.log(`  ! Lỗi đăng phòng:`, err.message);
      }
    }
  }

  // 3. Post Secondhand Items
  console.log(`\n[3/4] Đăng sản phẩm đồ cũ thanh lý sinh viên...`);
  const studentToken = tokens['huy.fpt@unihome.vn'] || Object.values(tokens)[1];
  if (studentToken) {
    for (const it of ITEMS) {
      try {
        const res = await fetch(`${BASE_URL}/api/content/second-hand`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': studentToken
          },
          body: JSON.stringify(it)
        });
        if (res.ok) {
          console.log(`  ✓ Đã đăng đồ cũ: "${it.title}" (${it.price.toLocaleString('vi-VN')} ₫)`);
        }
      } catch (err) {
        console.log(`  ! Lỗi đăng đồ cũ:`, err.message);
      }
    }
  }

  // 4. Post Services
  console.log(`\n[4/4] Đăng dịch vụ tiện ích sinh viên...`);
  if (landlordToken) {
    for (const sv of SERVICES) {
      try {
        const res = await fetch(`${BASE_URL}/api/content/services`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': landlordToken
          },
          body: JSON.stringify(sv)
        });
        if (res.ok) {
          console.log(`  ✓ Đã đăng dịch vụ: "${sv.title}"`);
        }
      } catch (err) {
        console.log(`  ! Lỗi đăng dịch vụ:`, err.message);
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 HOÀN TẤT BƠM DATA KÍCH CẦU THÀNH CÔNG!`);
  console.log(`Tất cả mật khẩu tài khoản demo: password123`);
  console.log(`======================================================\n`);
}

run();
