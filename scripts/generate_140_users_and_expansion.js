/**
 * UniHome - Generator for 140 Users Expansion, 20 Packages, Comments & Chat
 * Target: database/seed_140_users_and_expansion.sql
 */

const fs = require('fs');
const path = require('path');

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đoàn'];
const DEM_NAM = ['Văn', 'Đức', 'Hoàng', 'Minh', 'Quang', 'Hải', 'Thành', 'Tuấn', 'Tiến', 'Mạnh', 'Đình', 'Xuân', 'Gia', 'Hữu', 'Bảo', 'Khánh'];
const TEN_NAM = ['Nam', 'Huy', 'Minh', 'Đức', 'Dũng', 'Tuấn', 'Hoàng', 'Long', 'Khánh', 'Khoa', 'Kiên', 'Hùng', 'Lâm', 'Bách', 'Hiếu', 'Thịnh', 'Thành', 'Trung', 'Việt', 'An', 'Bình', 'Phúc', 'Duy', 'Đạt'];

const DEM_NU = ['Thị', 'Mai', 'Thu', 'Phương', 'Ngọc', 'Hồng', 'Thanh', 'Kim', 'Bảo', 'Ánh', 'Diệu', 'Khánh', 'Thùy'];
const TEN_NU = ['Linh', 'Trang', 'Hà', 'Mai', 'Hương', 'Phương', 'Thảo', 'Quỳnh', 'Nga', 'Anh', 'Ngân', 'Vy', 'Châu', 'Yến', 'Trâm', 'My', 'Chi', 'Tú', 'Lan', 'Dung', 'Huyền', 'Tâm', 'Nhi', 'Hân'];

const TELCO_PREFIXES = ['098', '097', '096', '086', '038', '037', '036', '035', '034', '033', '039', '091', '094', '088', '083', '084', '085', '090', '093', '079', '077', '076', '078'];

const SCHOOLS = [
  'FPT University',
  'Đại học Quốc gia Hà Nội',
  'ĐH Công nghệ - ĐHQGHN',
  'ĐH Khoa học Tự nhiên - ĐHQGHN',
  'ĐH Ngoại ngữ - ĐHQGHN',
  'Học viện Bưu chính Viễn thông',
  'ĐH Bách Khoa Hà Nội',
  'ĐH Ngoại Thương',
  'ĐH Kinh tế Quốc dân',
  'ĐH Thương Mại'
];

const STUDENT_BIOS_NAM = [
  'Sinh viên K19 FPT chuyên ngành Kỹ thuật phần mềm. Thích đá bóng, gym. Muốn tìm bạn cùng phòng sạch sẽ, ngủ trước 12h.',
  'Sinh viên ĐHQG Hòa Lạc, sống ngăn nắp, thích tự nấu ăn. Cần tìm 1 bạn nam share phòng ở khu Tân Xã hoặc Thạch Hòa.',
  'Học ngành Trí tuệ nhân tạo FPTU. Ban ngày đi học và lên lab, tối về yên tĩnh tự học.',
  'Sinh viên năm 2 ĐH Công nghệ (VNU). Tính thẳng thắn, không hút thuốc, đồ đạc gọn gàng. Muốn tìm bạn ở ghép lâu dài.',
  'K19 FPT Hòa Lạc, mê nhiếp ảnh và chạy bộ. Muốn tìm bạn ở cùng vui vẻ, chia đều tiền phòng và điện nước.',
  'Sinh viên năm 3 PTIT đang thực tập tại Khu CNC Hòa Lạc. Đi làm cả ngày, tối về chỉ cần chỗ nghỉ ngơi yên tĩnh.',
  'Dân kỹ thuật, thích nấu ăn và nghe nhạc lofi. Tìm bạn nam tính tình dễ chịu, giữ vệ sinh chung tốt.',
  'Sinh viên FPT K18, có xe máy, tính thoải mái nhưng rất tôn trọng giờ giấc nghỉ ngơi.'
];

const STUDENT_BIOS_NU = [
  'Sinh viên K19 FPT ngành Thiết kế đồ họa. Phòng luôn giữ sạch sẽ thơm tho. Muốn tìm bạn nữ ở cùng khu Tân Xã.',
  'Sinh viên năm 2 ĐHQG Hòa Lạc, tính tình nhẹ nhàng, cẩn thận. Cần tìm bạn nữ cùng phòng không hút thuốc.',
  'Học Ngôn ngữ Anh ĐHQG, thích yên tĩnh đọc sách và học online. Muốn tìm bạn nữ hòa đồng, biết chia sẻ việc nhà.',
  'K19 FPT ngành Truyền thông đa phương tiện. Tính cách vui vẻ, thích decor phòng. Tìm bạn nữ cùng gu để ở ghép.',
  'Sinh viên năm nhất FPT, quê Nam Định. Cần tìm bạn nữ ở ghép gần cổng trường FPT, có sẵn tủ lạnh máy giặt.',
  'Sinh viên ĐH Ngoại Thương học cơ sở Hòa Lạc. Sống kỷ luật, ngủ sớm dậy sớm, tìm bạn nữ nếp sống lành mạnh.',
  'Nữ sinh viên ĐHQG, thích nấu ăn tại phòng để tiết kiệm. Tìm bạn nữ hiền lành, chia đôi tiền phòng văn minh.',
  'K18 FPT, tính cách độc lập, tôn trọng giờ giấc học tập và nghỉ ngơi của nhau.'
];

const LANDLORD_NAMES = [
  { name: 'Cô Phạm Thị Thu', gender: 'Nữ', age: 52 },
  { name: 'Bác Nguyễn Văn Hùng', gender: 'Nam', age: 58 },
  { name: 'Chú Đỗ Mạnh Thắng', gender: 'Nam', age: 49 },
  { name: 'Cô Trần Kim Liên', gender: 'Nữ', age: 54 },
  { name: 'Bác Vũ Đình Quảng', gender: 'Nam', age: 60 },
  { name: 'Chú Hoàng Văn Tuấn', gender: 'Nam', age: 47 },
  { name: 'Cô Bùi Thị Mai', gender: 'Nữ', age: 51 },
  { name: 'Anh Lê Quang Dũng', gender: 'Nam', age: 42 },
  { name: 'Chị Đinh Hồng Hạnh', gender: 'Nữ', age: 39 },
  { name: 'Bác Phan Thanh Hải', gender: 'Nam', age: 56 },
  { name: 'Cô Ngô Thị Loan', gender: 'Nữ', age: 53 },
  { name: 'Chú Dương Văn Thành', gender: 'Nam', age: 48 },
  { name: 'Cô Lý Thị Bích', gender: 'Nữ', age: 50 },
  { name: 'Bác Đặng Hữu Đức', gender: 'Nam', age: 62 },
  { name: 'Chú Trịnh Quốc Bảo', gender: 'Nam', age: 46 },
  { name: 'Cô Mai Thanh Hà', gender: 'Nữ', age: 52 },
  { name: 'Anh Nguyễn Minh Trí', gender: 'Nam', age: 41 },
  { name: 'Chị Vũ Thùy Linh', gender: 'Nữ', age: 38 },
  { name: 'Bác Hoàng Đình Trọng', gender: 'Nam', age: 59 },
  { name: 'Cô Trần Thị Yến', gender: 'Nữ', age: 55 }
];

const PASSWORD_HASH = 'pbkdf2$120000$quHoK2sEkDn1BmL0apvMHQ==$aH6qA/S8eynCy3CGu1OYKalKMjwd868AFCEgdLNDGdI='; // 123456

function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let sql = `-- ==============================================================================
-- UniHome: Seed 140 Additional Users (IDs 201-340), 20 Small Packages (390k),
-- Matching Profiles, Comments on Rooms & Secondhand, Chat & Analytics Extension
-- Total platform users: 340 | Total platform revenue: 1,333,000 VND
-- ==============================================================================

USE unihome;

`;

// 1. GENERATE 140 USERS (IDs 201 to 340)
// 120 Students (201-320) + 20 Landlords (321-340)
sql += `-- ------------------------------------------------------------------------------
-- 1. INSERT 140 USERS (IDs 201 to 340)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO users (
  id, full_name, email, phone, password, role, status,
  avatar_url, bio, dob, gender, school_name,
  home_lat, home_lng, matching_radius_km, is_looking_for_roommate,
  email_verified, phone_verified, auth_provider, created_at,
  vip_tier, vip_until, cosmetic_style, profile_badge
) VALUES
`;

const userRows = [];
const usedEmails = new Set();
const usedPhones = new Set();

for (let id = 201; id <= 340; id++) {
  const isLandlord = id >= 321;
  let fullName, gender, dob, school, bio;

  if (isLandlord) {
    const lInfo = LANDLORD_NAMES[id - 321];
    fullName = lInfo.name;
    gender = lInfo.gender;
    const yob = 2026 - lInfo.age;
    dob = `${yob}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`;
    school = null;
    bio = `Chủ nhà trọ uy tín khu vực Hòa Lạc (Tân Xã / Thạch Hòa). Hỗ trợ sinh viên đăng ký tạm trú, điện nước công tơ riêng minh bạch.`;
  } else {
    gender = id % 2 === 0 ? 'Nam' : 'Nữ';
    if (gender === 'Nam') {
      fullName = `${rand(HO)} ${rand(DEM_NAM)} ${rand(TEN_NAM)}`;
      bio = rand(STUDENT_BIOS_NAM);
    } else {
      fullName = `${rand(HO)} ${rand(DEM_NU)} ${rand(TEN_NU)}`;
      bio = rand(STUDENT_BIOS_NU);
    }
    const yob = randInt(2003, 2007);
    dob = `${yob}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`;
    school = rand(SCHOOLS);
  }

  // Unique email
  const nameParts = removeDiacritics(fullName.toLowerCase()).split(' ');
  const baseEmail = `${nameParts[nameParts.length - 1]}.${nameParts[0]}${id}`;
  const domain = isLandlord ? 'gmail.com' : (id % 3 === 0 ? 'fpt.edu.vn' : (id % 3 === 1 ? 'vnu.edu.vn' : 'gmail.com'));
  const email = `${baseEmail}@${domain}`;

  // Unique phone
  const phone = `${rand(TELCO_PREFIXES)}${String(randInt(1000000, 9999999))}`;

  // Lat/Lng around Hoa Lac
  const lat = (21.0100 + (id % 50) * 0.0003).toFixed(5);
  const lng = (105.5150 + (id % 40) * 0.0004).toFixed(5);

  const day = String(randInt(10, 28)).padStart(2, '0');
  const createdAt = `2026-10-${day} ${String(randInt(8, 20)).padStart(2, '0')}:${String(randInt(10, 59)).padStart(2, '0')}:00`;

  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff&size=200&bold=true`;

  // VIP Package assignments for 20 users:
  // VIP3 (29k) for 5 landlords (321-325) + 5 students (205, 210, 215, 220, 225)
  // BOOST (10k) for 5 landlords (326-330) + 5 students (230, 235, 240, 245, 250)
  let vipTier = 'NONE';
  let vipUntil = 'NULL';
  let cosmeticStyle = 'DEFAULT';
  let badge = 'NULL';

  if ([321, 322, 323, 324, 325, 205, 210, 215, 220, 225].includes(id)) {
    vipTier = 'VIP3';
    vipUntil = `'2026-12-31 23:59:59'`;
    cosmeticStyle = 'NEON_VIOLET';
    badge = `'⭐ VIP 3'`;
  } else if ([326, 327, 328, 329, 330, 230, 235, 240, 245, 250].includes(id)) {
    vipTier = 'BOOST';
    vipUntil = `'2026-12-31 23:59:59'`;
    cosmeticStyle = 'AURORA';
    badge = `'⚡ BOOST'`;
  }

  const schoolVal = school ? `'${school}'` : 'NULL';
  const looking = isLandlord ? 0 : 1;

  userRows.push(`  (${id}, '${fullName}', '${email}', '${phone}', '${PASSWORD_HASH}', 'USER', 'ACTIVE', '${avatar}', '${bio}', '${dob}', '${gender}', ${schoolVal}, ${lat}, ${lng}, 5, ${looking}, 1, 1, 'LOCAL', '${createdAt}', '${vipTier}', ${vipUntil}, '${cosmeticStyle}', ${badge})`);
}

sql += userRows.join(',\n') + ';\n\n';

// 2. GENERATE MATCHING PROFILES FOR 100 STUDENTS (IDs 201 to 300)
sql += `-- ------------------------------------------------------------------------------
-- 2. INSERT MATCHING PROFILES (100 Students)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO matching_profile (
  user_id, enabled, gender, school_name,
  latitude, longitude, radius_km, budget_min, budget_max,
  move_in_date, sleep_schedule, cleanliness_level, smoking, pets,
  cooking, noise_preference, guest_frequency, study_work_schedule,
  expense_style, communication_style, intro
) VALUES
`;

const sleepOpts = ['22h - 23h', '0h - 1h', 'Cú đêm'];
const smokingOpts = ['Không hút thuốc', 'Không', 'Chỉ ngoài ban công'];
const petOpts = ['Không nuôi thú cưng', 'Thích thú cưng', 'Không dị ứng'];
const cookOpts = ['Tự nấu ăn hàng ngày', 'Thỉnh thoảng nấu ăn', 'Ăn ngoài quán'];
const noiseOpts = ['Yên tĩnh', 'Bình thường', 'Thoải mái'];
const guestOpts = ['Không dẫn bạn về', 'Hiếm khi', 'Thỉnh thoảng cuối tuần'];
const studyOpts = ['Học cả ngày', 'Học sáng', 'Học chiều', 'Linh hoạt'];
const expenseOpts = ['Dùng bao nhiêu tính bấy nhiêu minh bạch', 'Chia đều tiền phòng & điện nước sòng phẳng'];
const commOpts = ['Hòa đồng, vui vẻ', 'Thẳng thắn, cởi mở', 'Nhẹ nhàng, tế nhị'];

const matchingRows = [];
for (let id = 201; id <= 300; id++) {
  const gender = id % 2 === 0 ? 'Nam' : 'Nữ';
  const school = rand(SCHOOLS);
  const lat = (21.0120 + (id % 30) * 0.0004).toFixed(5);
  const lng = (105.5180 + (id % 25) * 0.0005).toFixed(5);
  const bMin = rand([1200000, 1400000, 1500000, 1800000, 2000000]);
  const bMax = bMin + rand([800000, 1000000, 1200000]);
  const clean = randInt(3, 5);
  const bio = gender === 'Nam' ? rand(STUDENT_BIOS_NAM) : rand(STUDENT_BIOS_NU);

  matchingRows.push(`  (${id}, 1, '${gender}', '${school}', ${lat}, ${lng}, 5, ${bMin}, ${bMax}, '2026-11', '${rand(sleepOpts)}', ${clean}, '${rand(smokingOpts)}', '${rand(petOpts)}', '${rand(cookOpts)}', '${rand(noiseOpts)}', '${rand(guestOpts)}', '${rand(studyOpts)}', '${rand(expenseOpts)}', '${rand(commOpts)}', '${bio}')`);
}
sql += matchingRows.join(',\n') + ';\n\n';

// 3. GENERATE 20 PAYMENTS (10 x VIP3 @ 29k + 10 x BOOST @ 10k = 390k)
// Dates: 2026-10-24 to 2026-10-29
sql += `-- ------------------------------------------------------------------------------
-- 3. INSERT 20 PAYMENTS (10 x VIP3 [29k] + 10 x BOOST [10k] = 390.000 VND)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO payment (
  user_id, code, amount, type, status, reference_type, reference_id, plan_id, qr_url, created_at, paid_at
) VALUES
  (321, 'PAY-VIP3-261024091500-034', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 10, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261024091500-034&accountName=UNIHOME', '2026-10-24 09:15:00', '2026-10-24 09:15:00'),
  (322, 'PAY-VIP3-261024143020-035', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 11, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261024143020-035&accountName=UNIHOME', '2026-10-24 14:30:20', '2026-10-24 14:30:20'),
  (323, 'PAY-VIP3-261025102000-036', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 12, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261025102000-036&accountName=UNIHOME', '2026-10-25 10:20:00', '2026-10-25 10:20:00'),
  (324, 'PAY-VIP3-261025164510-037', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 13, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261025164510-037&accountName=UNIHOME', '2026-10-25 16:45:10', '2026-10-25 16:45:10'),
  (325, 'PAY-VIP3-261026084000-038', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 14, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261026084000-038&accountName=UNIHOME', '2026-10-26 08:40:00', '2026-10-26 08:40:00'),
  (205, 'PAY-VIP3-261026151030-039', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261026151030-039&accountName=UNIHOME', '2026-10-26 15:10:30', '2026-10-26 15:10:30'),
  (210, 'PAY-VIP3-261027110500-040', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 2, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261027110500-040&accountName=UNIHOME', '2026-10-27 11:05:00', '2026-10-27 11:05:00'),
  (215, 'PAY-VIP3-261027173000-041', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 3, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261027173000-041&accountName=UNIHOME', '2026-10-27 17:30:00', '2026-10-27 17:30:00'),
  (220, 'PAY-VIP3-261028092540-042', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 4, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261028092540-042&accountName=UNIHOME', '2026-10-28 09:25:40', '2026-10-28 09:25:40'),
  (225, 'PAY-VIP3-261029141015-043', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 5, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261029141015-043&accountName=UNIHOME', '2026-10-29 14:10:15', '2026-10-29 14:10:15'),

  (326, 'PAY-BOOST-261024110000-044', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 15, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261024110000-044&accountName=UNIHOME', '2026-10-24 11:00:00', '2026-10-24 11:00:00'),
  (327, 'PAY-BOOST-261024162015-045', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 16, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261024162015-045&accountName=UNIHOME', '2026-10-24 16:20:15', '2026-10-24 16:20:15'),
  (328, 'PAY-BOOST-261025091000-046', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 17, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261025091000-046&accountName=UNIHOME', '2026-10-25 09:10:00', '2026-10-25 09:10:00'),
  (329, 'PAY-BOOST-261025150530-047', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 18, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261025150530-047&accountName=UNIHOME', '2026-10-25 15:05:30', '2026-10-25 15:05:30'),
  (330, 'PAY-BOOST-261026114500-048', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 19, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261026114500-048&accountName=UNIHOME', '2026-10-26 11:45:00', '2026-10-26 11:45:00'),
  (230, 'PAY-BOOST-261026180000-049', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261026180000-049&accountName=UNIHOME', '2026-10-26 18:00:00', '2026-10-26 18:00:00'),
  (235, 'PAY-BOOST-261027101520-050', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 2, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261027101520-050&accountName=UNIHOME', '2026-10-27 10:15:20', '2026-10-27 10:15:20'),
  (240, 'PAY-BOOST-261027164010-051', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 3, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261027164010-051&accountName=UNIHOME', '2026-10-27 16:40:10', '2026-10-27 16:40:10'),
  (245, 'PAY-BOOST-261028103000-052', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 4, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261028103000-052&accountName=UNIHOME', '2026-10-28 10:30:00', '2026-10-28 10:30:00'),
  (250, 'PAY-BOOST-261029111500-053', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 5, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261029111500-053&accountName=UNIHOME', '2026-10-29 11:15:00', '2026-10-29 11:15:00');\n\n`;

// 4. GENERATE 20 WALLET TRANSACTIONS
sql += `-- ------------------------------------------------------------------------------
-- 4. INSERT 20 WALLET TRANSACTIONS (DEBIT - Gói dịch vụ)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO wallet_transaction (
  user_id, type, amount, balance_after, reference_type, reference_id, description, created_at
) VALUES
  (321, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-24 09:15:00'),
  (322, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-24 14:30:20'),
  (323, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-25 10:20:00'),
  (324, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-25 16:45:10'),
  (325, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-26 08:40:00'),
  (205, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-26 15:10:30'),
  (210, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-27 11:05:00'),
  (215, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-27 17:30:00'),
  (220, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-28 09:25:40'),
  (225, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-29 14:10:15'),

  (326, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-24 11:00:00'),
  (327, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-24 16:20:15'),
  (328, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-25 09:10:00'),
  (329, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-25 15:05:30'),
  (330, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-26 11:45:00'),
  (230, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-26 18:00:00'),
  (235, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-27 10:15:20'),
  (240, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-27 16:40:10'),
  (245, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-28 10:30:00'),
  (250, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-29 11:15:00');\n\n`;

// 5. GENERATE 20 AUDIT LOGS FOR THE 20 PURCHASES
sql += `-- ------------------------------------------------------------------------------
-- 5. INSERT 20 AUDIT LOGS (Nhật ký giao dịch gói dịch vụ)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO audit_log (actor_id, action, target_type, target_id, details, created_at) VALUES
  (321, 'PURCHASE_PACKAGE', 'PACKAGE', 2, 'Kích hoạt thành công gói VIP 3 (29.000đ) cho tin đăng phòng trọ', '2026-10-24 09:15:05'),
  (322, 'PURCHASE_PACKAGE', 'PACKAGE', 2, 'Kích hoạt thành công gói VIP 3 (29.000đ) cho tin đăng phòng trọ', '2026-10-24 14:30:25'),
  (323, 'PURCHASE_PACKAGE', 'PACKAGE', 2, 'Kích hoạt thành công gói VIP 3 (29.000đ) cho tin đăng phòng trọ', '2026-10-25 10:20:05'),
  (324, 'PURCHASE_PACKAGE', 'PACKAGE', 2, 'Kích hoạt thành công gói VIP 3 (29.000đ) cho tin đăng phòng trọ', '2026-10-25 16:45:15'),
  (325, 'PURCHASE_PACKAGE', 'PACKAGE', 2, 'Kích hoạt thành công gói VIP 3 (29.000đ) cho tin đăng phòng trọ', '2026-10-26 08:40:05'),
  (205, 'PURCHASE_PACKAGE', 'PACKAGE', 2, 'Kích hoạt thành công gói VIP 3 (29.000đ) cho tin tìm ở ghép', '2026-10-26 15:10:35'),
  (210, 'PURCHASE_PACKAGE', 'PACKAGE', 2, 'Kích hoạt thành công gói VIP 3 (29.000đ) cho tin tìm ở ghép', '2026-10-27 11:05:05'),
  (215, 'PURCHASE_PACKAGE', 'PACKAGE', 2, 'Kích hoạt thành công gói VIP 3 (29.000đ) cho tin tìm ở ghép', '2026-10-27 17:30:05'),
  (220, 'PURCHASE_PACKAGE', 'PACKAGE', 2, 'Kích hoạt thành công gói VIP 3 (29.000đ) cho tin tìm ở ghép', '2026-10-28 09:25:45'),
  (225, 'PURCHASE_PACKAGE', 'PACKAGE', 2, 'Kích hoạt thành công gói VIP 3 (29.000đ) cho tin tìm ở ghép', '2026-10-29 14:10:20'),

  (326, 'PURCHASE_PACKAGE', 'PACKAGE', 6, 'Kích hoạt gói Đẩy tin BOOST (10.000đ) lên đầu trang', '2026-10-24 11:00:05'),
  (327, 'PURCHASE_PACKAGE', 'PACKAGE', 6, 'Kích hoạt gói Đẩy tin BOOST (10.000đ) lên đầu trang', '2026-10-24 16:20:20'),
  (328, 'PURCHASE_PACKAGE', 'PACKAGE', 6, 'Kích hoạt gói Đẩy tin BOOST (10.000đ) lên đầu trang', '2026-10-25 09:10:05'),
  (329, 'PURCHASE_PACKAGE', 'PACKAGE', 6, 'Kích hoạt gói Đẩy tin BOOST (10.000đ) lên đầu trang', '2026-10-25 15:05:35'),
  (330, 'PURCHASE_PACKAGE', 'PACKAGE', 6, 'Kích hoạt gói Đẩy tin BOOST (10.000đ) lên đầu trang', '2026-10-26 11:45:05'),
  (230, 'PURCHASE_PACKAGE', 'PACKAGE', 6, 'Kích hoạt gói Đẩy tin BOOST (10.000đ) cho tin thanh lý đồ cũ', '2026-10-26 18:00:05'),
  (235, 'PURCHASE_PACKAGE', 'PACKAGE', 6, 'Kích hoạt gói Đẩy tin BOOST (10.000đ) cho tin thanh lý đồ cũ', '2026-10-27 10:15:25'),
  (240, 'PURCHASE_PACKAGE', 'PACKAGE', 6, 'Kích hoạt gói Đẩy tin BOOST (10.000đ) cho tin thanh lý đồ cũ', '2026-10-27 16:40:15'),
  (245, 'PURCHASE_PACKAGE', 'PACKAGE', 6, 'Kích hoạt gói Đẩy tin BOOST (10.000đ) cho tin tìm ở ghép', '2026-10-28 10:30:05'),
  (250, 'PURCHASE_PACKAGE', 'PACKAGE', 6, 'Kích hoạt gói Đẩy tin BOOST (10.000đ) cho tin tìm ở ghép', '2026-10-29 11:15:05');\n\n`;

// 6. COMMENTS ON SECONDHAND LISTINGS (20 comments in marketplace_comment)
sql += `-- ------------------------------------------------------------------------------
-- 6. INSERT COMMENTS ON SECONDHAND LISTINGS (Bình luận chợ đồ cũ sinh viên)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO marketplace_comment (listing_id, user_id, parent_id, content, status, created_at) VALUES
  (1, 202, NULL, 'Tủ lạnh Casper này sinh viên dùng 2 người để đồ ăn cả tuần có đủ rộng ko bạn ơi?', 'VISIBLE', '2026-10-18 10:15:00'),
  (1, 18, NULL, 'Thoải mái nha bạn, ngăn đông làm đá nhanh, ngăn mát để đc 2 hộp thức ăn to với bình nước nha.', 'VISIBLE', '2026-10-18 10:28:00'),
  (2, 204, NULL, 'Máy Asus này dùng pin xem video youtube liên tục đc mấy tiếng vậy bạn? Có fix nhẹ xăng xe ko?', 'VISIBLE', '2026-10-19 14:10:00'),
  (2, 7, NULL, 'Pin lướt web xem video tầm hơn 3 tiếng nha b. Qua nhà mình ở Thôn 1 bớt ngay 200k xăng xe nhé.', 'VISIBLE', '2026-10-19 14:35:00'),
  (3, 208, NULL, 'Loa Bluetooth này có cắm đc thẻ nhớ MicroSD ko bạn hay chỉ bắt bluetooth thôi ạ?', 'VISIBLE', '2026-10-20 09:20:00'),
  (3, 2, NULL, 'Có cả khe cắm thẻ nhớ với jack cắm 3.5mm luôn nha b, nghe rất tiện.', 'VISIBLE', '2026-10-20 09:45:00'),
  (4, 211, NULL, 'Dàn loa Microlab bass đánh có bị rè ko bạn? Chiều nay mình qua nghe thử đc ko?', 'VISIBLE', '2026-10-21 11:05:00'),
  (4, 3, NULL, 'Âm thanh chắc nịch ko rè tí nào nha. Tầm 5h chiều b cứ qua trọ nghe thử thoải mái.', 'VISIBLE', '2026-10-21 11:20:00'),
  (5, 215, NULL, 'Bàn gấp học bài chân có chắc ko b, để laptop với sách vở có bị lung lay ko?', 'VISIBLE', '2026-10-22 15:30:00'),
  (5, 4, NULL, 'Chân thép hộp cứng cáp lắm b, mình học code cả kỳ vừa rồi vững chãi ko rung lắc gì.', 'VISIBLE', '2026-10-22 15:50:00'),
  (6, 219, NULL, 'Bộ bàn ghế làm việc này chở bằng xe máy đc ko b ơi?', 'VISIBLE', '2026-10-23 10:40:00'),
  (6, 9, NULL, 'Tháo rời mặt bàn với chân được nha b, chằng đằng sau xe máy chở 1 chuyến là xong.', 'VISIBLE', '2026-10-23 11:00:00'),
  (7, 224, NULL, 'Quạt lửng Senko cánh quạt còn mới ko b, quay tút năng êm ko?', 'VISIBLE', '2026-10-24 14:15:00'),
  (7, 28, NULL, 'Quạt mình mới dùng 3 tháng, chạy êm ru ko một tiếng động, gió mát sâu.', 'VISIBLE', '2026-10-24 14:35:00'),
  (8, 227, NULL, 'Quạt mini tích điện dùng liên tục mức 2 đc mấy tiếng vậy b?', 'VISIBLE', '2026-10-25 09:50:00'),
  (8, 29, NULL, 'Mức 2 quạt đc tầm 4.5 tiếng nha bạn, cắm sạc type-C sạc chung với điện thoại rất tiện.', 'VISIBLE', '2026-10-25 10:15:00'),
  (9, 232, NULL, 'Lò vi sóng Sharp đĩa quay và nút vặn còn tốt ko bạn?', 'VISIBLE', '2026-10-26 16:20:00'),
  (9, 14, NULL, 'Mọi chức năng bình thường nha b, đĩa thủy tinh nguyên vẹn, rã đông với hâm nóng cực nhanh.', 'VISIBLE', '2026-10-26 16:45:00'),
  (10, 238, NULL, 'Nồi cơm điện Sunhouse lòng nồi chống dính có trầy xước gì ko b?', 'VISIBLE', '2026-10-27 11:10:00'),
  (10, 16, NULL, 'Lòng nồi đẹp 95% nha b, nấu cơm 2 người dẻo thơm ko bị dính đáy nồi bao giờ.', 'VISIBLE', '2026-10-27 11:30:00');\n\n`;

// 7. REVIEWS ON ROOM PROPERTIES (15 reviews in review table)
sql += `-- ------------------------------------------------------------------------------
-- 7. INSERT REVIEWS ON ROOM LISTINGS (Đánh giá phòng trọ sinh viên)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO review (
  property_id, user_id, rating, accuracy_rating, price_transparency_rating,
  utility_transparency_rating, landlord_communication_rating, comment, status, created_at
) VALUES
  (10, 201, 5, 5, 5, 5, 5, 'Phòng mới kính coong ngõ 1 Tân Xã, ban công đón gió ngắm hoàng hôn cực đẹp. Bác Nga chủ nhà rất dễ mến!', 'VISIBLE', '2026-10-24 10:30:00'),
  (11, 203, 5, 5, 5, 5, 5, 'Phòng khép kín sạch sẽ, gần trường FPT đi bộ tầm 10 phút. Điện nước công tơ riêng minh bạch rõ ràng.', 'VISIBLE', '2026-10-24 15:45:00'),
  (12, 206, 5, 5, 5, 5, 5, 'Căn hộ mini 1N1K ở rất sướng, có bếp hút mùi riêng nên nấu nướng ko lo ám mùi vào phòng ngủ.', 'VISIBLE', '2026-10-25 11:20:00'),
  (13, 209, 5, 5, 5, 5, 5, 'Phòng gác xép view hồ Tân Xã chill dã man, tầng dưới học bài tầng trên ngủ riêng biệt rất rộng.', 'VISIBLE', '2026-10-25 17:00:00'),
  (14, 212, 4, 4, 5, 4, 5, 'Phòng sạch sẽ, an ninh khóa vân tay an toàn. Giờ cao điểm mạng hơi lag xíu nhưng bác chủ đã nâng gói cước rồi.', 'VISIBLE', '2026-10-26 09:15:00'),
  (15, 217, 5, 5, 5, 5, 5, 'Chung cư mini có thang máy tốc độ cao, máy giặt riêng từng phòng đỡ phải tranh nhau giặt đồ.', 'VISIBLE', '2026-10-26 14:50:00'),
  (16, 221, 5, 5, 5, 5, 5, 'Giá 2.2tr quá hời cho sinh viên năm nhất, phòng có sẵn điều hòa với nóng lạnh mới tinh.', 'VISIBLE', '2026-10-27 10:40:00'),
  (17, 226, 5, 5, 5, 5, 5, 'Trọ Thôn 2 Tân Xã yên tĩnh, tối học bài rất tập trung. Bác chủ nhiệt tình cho mượn cả thang để lắp rèm.', 'VISIBLE', '2026-10-27 16:15:00'),
  (18, 229, 5, 5, 5, 5, 5, 'Đi bộ sang cơ sở ĐHQG Hòa Lạc cực gần. Khu trọ toàn sinh viên nên rất văn minh lịch sự.', 'VISIBLE', '2026-10-28 08:50:00'),
  (19, 233, 5, 5, 5, 5, 5, 'Phòng nội thất gỗ sồi xịn xò, tủ quần áo 3 cánh tha hồ đựng đồ mùa đông. 10/10 chất lượng.', 'VISIBLE', '2026-10-28 15:25:00'),
  (20, 237, 5, 5, 5, 5, 5, 'Trọ mới xây mùi sơn đã bay hết, sàn gạch men sạch bóng. Bác chủ còn tặng kèm thảm chùi chân mới.', 'VISIBLE', '2026-10-29 09:30:00'),
  (21, 241, 5, 5, 5, 5, 5, 'Chỗ để xe tầng 1 rộng rãi, có camera giám sát 24/7 nên để xe máy rất yên tâm.', 'VISIBLE', '2026-10-29 11:45:00'),
  (22, 244, 5, 5, 5, 5, 5, 'Studio đầy đủ tiện nghi, view nhìn thẳng ra cánh đồng thoáng mát không khí trong lành.', 'VISIBLE', '2026-10-29 14:10:00'),
  (23, 248, 5, 5, 5, 5, 5, 'Bác chủ trọ dễ tính nhất Hòa Lạc, đóng tiền phòng muộn 2 ngày bác vẫn vui vẻ bảo thi xong đóng cũng đc.', 'VISIBLE', '2026-10-29 16:00:00'),
  (24, 252, 5, 5, 5, 5, 5, 'Phòng cách âm tốt, hàng xóm xung quanh ngoan ngoãn ko mở nhạc to sau 11h đêm.', 'VISIBLE', '2026-10-29 17:30:00');\n\n`;

// 8. COMMUNITY LOUNGE CHAT MESSAGES (24/10 to 29/10) - 35 natural messages
sql += `-- ------------------------------------------------------------------------------
-- 8. INSERT COMMUNITY LOUNGE CHAT (35 tin nhắn tán gẫu thực tế 24/10 - 29/10)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO community_message (channel_id, user_id, sender_id, message_type, content, reply_to_id, reply_to_message_id, status, moderation_status, is_system_message, created_at) VALUES
  (1, 201, 201, 'TEXT', 'Tuần sau trường FPT bắt đầu thi giữa kỳ rồi mn nhỉ, ai có đề cương môn MAD101 ko cho mình xin với?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-24 08:20:10'),
  (1, 203, 203, 'TEXT', 'Lên group FPTU Learning Hub có full đề thi các kỳ trước kèm lời giải chi tiết nha b ơi.', 153, 153, 'ACTIVE', 'APPROVED', 0, '2026-10-24 08:35:00'),
  (1, 205, 205, 'TEXT', 'Cảm ơn b nhé, vừa tải đc cả bộ slide ôn tập rồi.', 154, 154, 'ACTIVE', 'APPROVED', 0, '2026-10-24 09:10:20'),
  (1, 207, 207, 'TEXT', 'Trưa nay quanh khu Tân Xã quán cơm nào đông vui vậy mn, e mới lên học quân sự thèm cơm sườn quá.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-24 11:15:00'),
  (1, 210, 210, 'TEXT', 'Ra quán cơm Chị Nga ở đầu thôn 1 nha e, suất 35k sườn nướng đẫm sốt ăn no căng bụng.', 156, 156, 'ACTIVE', 'APPROVED', 0, '2026-10-24 11:28:40'),
  (1, 213, 213, 'TEXT', 'Trên web UniHome mục Ưu đãi có mã giảm 10k cơm Chị Nga đó b, đổi điểm lấy mã đc giảm còn 25k nè!', 157, 157, 'ACTIVE', 'APPROVED', 0, '2026-10-24 11:35:15'),
  (1, 207, 207, 'TEXT', 'Ủa xịn vậy, e vừa đổi mã thành công rồi, ra ăn luôn đây.', 158, 158, 'ACTIVE', 'APPROVED', 0, '2026-10-24 11:42:00'),
  (1, 321, 321, 'TEXT', 'Bác Thu có dãy trọ 8 phòng mới lắp thêm camera an ninh với lưới chống muỗi ở Thôn 2 Tân Xã. Cháu nào tìm phòng qua xem nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-24 15:10:00'),

  (1, 215, 215, 'TEXT', 'Mn cho e hỏi xe bus 74 từ Hòa Lạc về Mỹ Đình chuyến muộn nhất mấy giờ vậy ạ?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-25 17:30:10'),
  (1, 218, 218, 'TEXT', 'Chuyến cuối xuất bến ở Xuân Khanh tầm 20h30, qua cổng FPT khoảng 21h nha b.', 161, 161, 'ACTIVE', 'APPROVED', 0, '2026-10-25 17:42:00'),
  (1, 220, 220, 'TEXT', 'Nếu trễ 74 thì bắt xe 88 hoặc 107 về bến xe Yên Nghĩa hoặc Kim Mã cũng đc nha.', 162, 162, 'ACTIVE', 'APPROVED', 0, '2026-10-25 17:55:00'),
  (1, 222, 222, 'TEXT', 'Hôm nay trời lạnh rồi, có ai rủ đi ăn lẩu ếch măng cay ở chợ Tân Xã ko các bác?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-25 19:20:00'),
  (1, 225, 225, 'TEXT', 'Quán Lẩu Ếch Đồng Quê ở ngã ba Tân Xã ngon lắm, set 4 người ăn tẹt ga mỗi người có 80k.', 164, 164, 'ACTIVE', 'APPROVED', 0, '2026-10-25 19:35:00'),

  (1, 228, 228, 'TEXT', 'Có bạn nào thừa giá sách gỗ để bàn hoặc móc treo đồ ko pass lại cho e với ạ.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-26 09:15:30'),
  (1, 230, 230, 'TEXT', 'Mình có giá sách gỗ 3 tầng còn mới tinh nè b, pass 60k ở Thôn 1 Tân Xã nhé.', 166, 166, 'ACTIVE', 'APPROVED', 0, '2026-10-26 09:30:10'),
  (1, 228, 228, 'TEXT', 'Dạ chiều nay tầm 4h e qua lấy nha a ơi.', 167, 167, 'ACTIVE', 'APPROVED', 0, '2026-10-26 09:40:00'),
  (1, 233, 233, 'TEXT', 'Tính năng Roommate Matching trên web này chuẩn ghê mn, e vừa ghép đc 1 bạn cùng trường FPT nếp sống y hệt luôn.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-26 14:20:00'),
  (1, 236, 236, 'TEXT', 'Công nhận, nó tính điểm % tương thích dựa trên thói quen ngủ nghỉ với chia tiền phòng, đỡ mất công lên hội nhóm đăng bài tìm người.', 169, 169, 'ACTIVE', 'APPROVED', 0, '2026-10-26 14:45:00'),
  (1, 326, 326, 'TEXT', 'Chú Tuấn vừa đẩy bài phòng trọ ban công ngắm hồ Tân Xã lên trang chủ, phòng có sẵn máy giặt riêng, cháu nào cần xem ới chú nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-26 17:00:00'),

  (1, 239, 239, 'TEXT', 'Hôm nay mạng FPT ở trọ mn có bị chậm ko, sao e vào GitHub kéo code hơi lag nhỉ?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-27 10:15:00'),
  (1, 242, 242, 'TEXT', 'Tắt bật lại cục modem ở hành lang là mượt lại b nha, sáng nay phòng mình cũng bị thế.', 172, 172, 'ACTIVE', 'APPROVED', 0, '2026-10-27 10:28:00'),
  (1, 245, 245, 'TEXT', 'Oke đc rồi b ơi, cảm ơn nhiều nha!', 173, 173, 'ACTIVE', 'APPROVED', 0, '2026-10-27 10:40:00'),
  (1, 247, 247, 'TEXT', 'Chiều nay có kèo đá bóng sân cỏ nhân tạo Tân Xã 17h, đội e thiếu 2 chân tiền vệ, bác nào rảnh tham gia cho vui.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-27 15:30:00'),
  (1, 250, 250, 'TEXT', 'Cho e đăng ký 1 slot b ơi, đá giao lưu vui vẻ rèn luyện sức khỏe.', 175, 175, 'ACTIVE', 'APPROVED', 0, '2026-10-27 15:45:00'),

  (1, 253, 253, 'TEXT', 'Quanh cổng trường ĐHQG có tiệm giặt sấy nào nhanh lấy trong ngày ko mn?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-28 08:50:00'),
  (1, 256, 256, 'TEXT', 'Tiệm Giặt Sấy 24/7 Tân Xã nha bạn, giặt sấy thơm cong trong 1 tiếng là lấy đc liền, có voucher free sấy trên UniHome đó.', 177, 177, 'ACTIVE', 'APPROVED', 0, '2026-10-28 09:12:00'),
  (1, 258, 258, 'TEXT', 'Quán DingTea Hòa Lạc đang giảm 20% size L trên web kìa mn, chiều nay ra học bài làm cốc trà sữa bao phê.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-28 14:30:00'),
  (1, 260, 260, 'TEXT', 'Vừa đổi mã DingTea xong, chiều nay kéo cả nhóm đồ án ra làm việc.', 179, 179, 'ACTIVE', 'APPROVED', 0, '2026-10-28 14:50:00'),

  (1, 263, 263, 'TEXT', 'Sắp sang tháng 11 rồi, trọ các bác tiền điện tháng rồi hết tầm bao nhiêu thế?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-29 09:10:00'),
  (1, 266, 266, 'TEXT', 'Phòng mình 2 đứa bật điều hòa buổi tối với tắm nóng lạnh hết tầm 320k tiền điện, tính ra mỗi đứa 160k cũng êm.', 181, 181, 'ACTIVE', 'APPROVED', 0, '2026-10-29 09:25:00'),
  (1, 269, 269, 'TEXT', 'Phòng nào có tủ lạnh Inverter thì tiết kiệm hơn nhiều, tháng hết chưa tới 250k điện.', 182, 182, 'ACTIVE', 'APPROVED', 0, '2026-10-29 09:40:00'),
  (1, 272, 272, 'TEXT', 'Mọi người cho e hỏi chuyển trọ từ Thôn 3 sang Thôn 1 có dịch vụ xe ba gác nào chở rẻ ko ạ?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-29 14:15:00'),
  (1, 275, 275, 'TEXT', 'Dịch vụ chuyển trọ Thành Hưng Hòa Lạc trong mục Dịch Vụ nha b, chở nhiệt tình hỗ trợ khuân vác lên tận phòng luôn.', 184, 184, 'ACTIVE', 'APPROVED', 0, '2026-10-29 14:30:00'),
  (1, 272, 272, 'TEXT', 'Tuyệt vời, e vừa liên hệ đặt lịch chiều mai chuyển đồ rồi, cảm ơn cả nhà!', 185, 185, 'ACTIVE', 'APPROVED', 0, '2026-10-29 14:45:00');\n\n`;

// 9. DIRECT CONVERSATIONS & MESSAGES (10 conversations)
sql += `-- ------------------------------------------------------------------------------
-- 9. INSERT DIRECT CONVERSATIONS & MESSAGES (10 cuộc hội thoại hỏi phòng & đồ cũ)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO conversation (
  id, user1_id, user2_id, context_type, context_id, context_title, context_price, created_at, updated_at
) VALUES
  (19, 201, 161, 'LISTING', 10, 'Chung cư mini Ban Công Kính Tân Xã', '3.500.000 ₫/tháng', '2026-10-24 10:15:00', '2026-10-24 10:45:00'),
  (20, 204, 7, 'SECONDHAND', 2, 'Laptop Asus Vivobook 15 i5', '5.500.000 ₫', '2026-10-25 14:10:00', '2026-10-25 14:40:00'),
  (21, 208, 162, 'LISTING', 11, 'Phòng khép kín đầy đủ tiện nghi Thôn 1', '2.800.000 ₫/tháng', '2026-10-25 16:30:00', '2026-10-25 17:00:00'),
  (22, 212, 4, 'SECONDHAND', 5, 'Bàn học gấp chân thép gọn nhẹ', '80.000 ₫', '2026-10-26 09:20:00', '2026-10-26 09:50:00'),
  (23, 215, 163, 'LISTING', 12, 'Căn hộ mini 1N1K gần FPT', '3.500.000 ₫/tháng', '2026-10-26 15:40:00', '2026-10-26 16:15:00'),
  (24, 219, 9, 'SECONDHAND', 6, 'Bộ bàn ghế làm việc kèm giá sách', '450.000 ₫', '2026-10-27 10:30:00', '2026-10-27 11:00:00'),
  (25, 223, 164, 'LISTING', 13, 'Phòng gác xép cao cấp view hồ', '3.000.000 ₫/tháng', '2026-10-27 16:00:00', '2026-10-27 16:30:00'),
  (26, 227, 29, 'SECONDHAND', 8, 'Quạt mini tích điện để bàn học', '120.000 ₫', '2026-10-28 11:15:00', '2026-10-28 11:45:00'),
  (27, 231, 165, 'LISTING', 14, 'Studio có máy giặt riêng Tân Xã', '3.400.000 ₫/tháng', '2026-10-28 15:00:00', '2026-10-28 15:35:00'),
  (28, 235, 166, 'LISTING', 15, 'Chung cư mini Tân Xã thang máy', '3.800.000 ₫/tháng', '2026-10-29 10:20:00', '2026-10-29 10:55:00');

INSERT IGNORE INTO message (conversation_id, sender_id, content, type, sent_at) VALUES
  (19, 201, 'Dạ chào cô Nga, phòng chung cư mini ban công kính ngõ 1 cuối tuần này cháu qua xem phòng đc ko ạ?', 'TEXT', '2026-10-24 10:15:00'),
  (19, 161, 'Được cháu nhé, chiều thứ 7 tầm 4h cháu đến đầu ngõ 1 gọi cô ra đón vào xem phòng nhé.', 'TEXT', '2026-10-24 10:22:00'),
  (19, 201, 'Dạ vâng cháu cảm ơn cô, 4h thứ 7 cháu qua ạ!', 'TEXT', '2026-10-24 10:25:00'),

  (20, 204, 'Anh ơi laptop Asus Vivobook còn sạc zin theo máy ko ạ, em học IT K19 cần máy làm bài tập.', 'TEXT', '2026-10-25 14:10:00'),
  (20, 7, 'Còn nguyên sạc zin với túi chống sốc em nhé, máy dùng giữ gìn cẩn thận em qua test thoải mái.', 'TEXT', '2026-10-25 14:18:00'),

  (21, 208, 'Chào bác, phòng khép kín Thôn 1 tiền nước tính theo đầu người hay theo khối ạ?', 'TEXT', '2026-10-25 16:30:00'),
  (21, 162, 'Nước máy sinh hoạt 100k/người/tháng dùng thoải mái giặt giũ cháu nhé, điện công tơ riêng 3.8k/số.', 'TEXT', '2026-10-25 16:42:00'),

  (22, 212, 'Bạn ơi bàn gấp còn ko b, chiều nay 5h mình qua lấy đc ko?', 'TEXT', '2026-10-26 09:20:00'),
  (22, 4, 'Bàn vẫn còn nha bạn, 5h chiều b qua ngõ 2 Tân Xã alo mình số trên trang cá nhân nha.', 'TEXT', '2026-10-26 09:32:00'),

  (23, 215, 'Chào chủ trọ, căn 1N1K này có cho nuôi mèo nhỏ ko ạ, em có 1 bé mèo ngoan ko cào cấu gì.', 'TEXT', '2026-10-26 15:40:00'),
  (23, 163, 'Nuôi mèo thì cháu giữ vệ sinh sạch sẽ trong phòng và ko để ảnh hưởng phòng bên cạnh là đc nha.', 'TEXT', '2026-10-26 15:55:00'),

  (24, 219, 'Anh ơi bộ bàn ghế gỗ làm việc mặt bàn có chống nước ko ạ?', 'TEXT', '2026-10-27 10:30:00'),
  (24, 9, 'Mặt bàn phủ melamine chống nước chống xước tốt nha bạn, để cốc nước đá thoải mái ko lo rộp.', 'TEXT', '2026-10-27 10:45:00'),

  (25, 223, 'Bác ơi phòng gác xép view hồ Tân Xã còn phòng tầng mấy vậy ạ?', 'TEXT', '2026-10-27 16:00:00'),
  (25, 164, 'Còn 1 phòng tầng 3 thoáng mát nhất dãy cháu nhé, gác xép cao đứng thẳng người ko đụng đầu.', 'TEXT', '2026-10-27 16:15:00'),

  (26, 227, 'Quạt mini để bàn còn dây sạc ko b ơi?', 'TEXT', '2026-10-28 11:15:00'),
  (26, 29, 'Có dây sạc Type-C đi kèm nha bạn, pin dùng bền lắm.', 'TEXT', '2026-10-28 11:30:00'),

  (27, 231, 'Phòng studio có máy giặt riêng này xe máy để tầng 1 có mất phí ko bác?', 'TEXT', '2026-10-28 15:00:00'),
  (27, 165, 'Để xe tầng 1 miễn phí hoàn toàn cháu nhé, cổng vân tay camera giám sát 24/7 an toàn tuyệt đối.', 'TEXT', '2026-10-28 15:20:00'),

  (28, 235, 'Chung cư mini Tân Xã tiền cọc thế nào vậy ạ?', 'TEXT', '2026-10-29 10:20:00'),
  (28, 166, 'Cọc 1 tháng tiền phòng cháu nhé, hợp đồng 6 tháng hoặc 1 năm linh hoạt cho sinh viên.', 'TEXT', '2026-10-29 10:40:00');\n\n`;

// 10. EXTEND ANALYTICS EVENTS (24/10 to 29/10) - ~360 events
sql += `-- ------------------------------------------------------------------------------
-- 10. INSERT ANALYTICS EVENTS (24/10 đến 29/10/2026 - Nối tiếp liền mạch biểu đồ)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO analytics_event (
  user_id, session_id, event_type, entity_type, entity_id, metadata_json, created_at
) VALUES
`;

const extEvents = [];
const extPages = ['/', '/rooms', '/secondhand', '/community', '/roommate', '/services'];
const extQueries = [
  'phòng tân xã có ban công', 'studio hòa lạc giá rẻ', 'phòng trọ gần đại học fpt',
  'ghép phòng đhqg', 'thanh lý đồ trọ', 'bình yên thạch thất', 'phòng trọ khép kín full đồ',
  'pass tủ lạnh mini', 'căn hộ mini hòa lạc'
];

const extDailyPlan = [
  { day: '2026-10-24', pv: 32, lv: 22, s: 9 }, // Saturday
  { day: '2026-10-25', pv: 35, lv: 24, s: 10 }, // Sunday
  { day: '2026-10-26', pv: 28, lv: 19, s: 8 },
  { day: '2026-10-27', pv: 29, lv: 20, s: 8 },
  { day: '2026-10-28', pv: 31, lv: 21, s: 9 },
  { day: '2026-10-29', pv: 30, lv: 20, s: 9 }, // Today
];

let extSessionCounter = 500;

extDailyPlan.forEach((plan, dayIndex) => {
  const dayStr = plan.day;
  const sessionsThisDay = [];
  const numSessions = 16 + (dayIndex % 4);
  for (let s = 0; s < numSessions; s++) {
    extSessionCounter++;
    const sessId = `sess_202610_ext_${extSessionCounter}`;
    const userId = s < 12 ? (201 + ((dayIndex * 11 + s) % 130)) : null; // new student users or guest
    sessionsThisDay.push({ sessId, userId });
  }

  // 1. PAGE_VIEW
  for (let p = 0; p < plan.pv; p++) {
    const sess = sessionsThisDay[p % sessionsThisDay.length];
    const hour = 7 + Math.floor((p * 15) / plan.pv);
    const minute = (p * 9) % 60;
    const timeStr = `${dayStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String((p * 13) % 60).padStart(2, '0')}`;
    const page = extPages[p % extPages.length];
    extEvents.push({
      userId: sess.userId,
      sessionId: sess.sessId,
      eventType: 'PAGE_VIEW',
      entityType: 'PAGE',
      entityId: null,
      meta: JSON.stringify({ path: page, title: 'UniHome' }),
      createdAt: timeStr
    });
  }

  // 2. VIEW_LISTING
  for (let v = 0; v < plan.lv; v++) {
    const sess = sessionsThisDay[(v + 2) % sessionsThisDay.length];
    const hour = 8 + Math.floor((v * 14) / plan.lv);
    const minute = (v * 13) % 60;
    const timeStr = `${dayStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String((v * 17) % 60).padStart(2, '0')}`;
    const listingId = 1 + ((dayIndex * 4 + v) % 27);
    extEvents.push({
      userId: sess.userId,
      sessionId: sess.sessId,
      eventType: 'VIEW_LISTING',
      entityType: 'LISTING',
      entityId: listingId,
      meta: JSON.stringify({ listingId, source: 'search_results' }),
      createdAt: timeStr
    });
  }

  // 3. SEARCH
  for (let s = 0; s < plan.s; s++) {
    const sess = sessionsThisDay[(s + 4) % sessionsThisDay.length];
    const hour = 9 + Math.floor((s * 12) / plan.s);
    const minute = (s * 17) % 60;
    const timeStr = `${dayStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String((s * 23) % 60).padStart(2, '0')}`;
    const query = extQueries[(dayIndex + s) % extQueries.length];
    extEvents.push({
      userId: sess.userId,
      sessionId: sess.sessId,
      eventType: 'SEARCH',
      entityType: 'SEARCH',
      entityId: null,
      meta: JSON.stringify({ query, resultsCount: 8 }),
      createdAt: timeStr
    });
  }
});

const extEventValues = extEvents.map(e => {
  const uVal = e.userId ? e.userId : 'NULL';
  const eIdVal = e.entityId ? e.entityId : 'NULL';
  const metaEscaped = e.meta.replace(/'/g, "\\'");
  return `  (${uVal}, '${e.sessionId}', '${e.eventType}', '${e.entityType}', ${eIdVal}, '${metaEscaped}', '${e.createdAt}')`;
});

sql += extEventValues.join(',\n') + ';\n\n';

// 11. FAVORITES & LISTING INTEREST EXTENSION (24/10 to 29/10)
sql += `-- ------------------------------------------------------------------------------
-- 11. INSERT FAVORITES & INTERESTS (Nối tiếp phễu chuyển đổi)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO favorite (listing_id, user_id, created_at) VALUES
  (10, 201, '2026-10-24 10:10:00'),
  (11, 205, '2026-10-24 14:20:00'),
  (12, 210, '2026-10-25 09:30:00'),
  (13, 215, '2026-10-25 15:40:00'),
  (14, 220, '2026-10-26 11:15:00'),
  (15, 225, '2026-10-26 16:50:00'),
  (16, 230, '2026-10-27 10:05:00'),
  (17, 235, '2026-10-27 14:35:00'),
  (18, 240, '2026-10-28 09:15:00'),
  (19, 245, '2026-10-28 16:10:00'),
  (20, 250, '2026-10-29 10:20:00'),
  (21, 255, '2026-10-29 14:45:00');

INSERT IGNORE INTO listing_interest (listing_id, user_id, matching_enabled, status, created_at) VALUES
  (10, 201, 1, 'COMPLETED', '2026-10-25 11:00:00'),
  (12, 210, 1, 'COMPLETED', '2026-10-26 14:30:00'),
  (14, 220, 1, 'COMPLETED', '2026-10-27 16:00:00'),
  (16, 230, 1, 'COMPLETED', '2026-10-28 15:30:00'),
  (18, 240, 1, 'COMPLETED', '2026-10-29 11:00:00'),
  (20, 250, 1, 'COMPLETED', '2026-10-29 16:30:00');
`;

const outPath = path.resolve(__dirname, '..', 'database', 'seed_140_users_and_expansion.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log(`Successfully generated SQL script at: ${outPath}`);
console.log(`Generated: 140 users (201-340), 100 matching profiles, 20 payments, 20 wallet txs, 20 audit logs, 20 secondhand comments, 15 room reviews, 35 community messages, 10 direct chats, ${extEvents.length} analytics events.`);
