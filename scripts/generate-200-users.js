/**
 * UniHome - Realistic 200 Users & Matching Profiles Generator
 * Generates 200 natural Vietnamese profiles:
 * - 160 Students (with full matching profiles, habits, budgets, bios)
 * - 40 Landlords (ready to link with real listings)
 * - Random, realistic Vietnamese phone numbers (Viettel, Vina, Mobi)
 * - Standard PBKDF2 password hashes for "123456"
 * - Outputs clean SQL ready to run on TiDB / MySQL: database/seed_200_realistic_users.sql
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const iter = 120000;
  const key = crypto.pbkdf2Sync(password, salt, iter, 32, 'sha256');
  return `pbkdf2$${iter}$${salt.toString('base64')}$${key.toString('base64')}`;
}

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đoàn'];
const DEM_NAM = ['Văn', 'Đức', 'Hoàng', 'Minh', 'Quang', 'Hải', 'Thành', 'Tuấn', 'Tiến', 'Mạnh', 'Đình', 'Xuân', 'Gia', 'Hữu', 'Bảo'];
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
  'Sinh viên K18 FPT chuyên ngành Kỹ thuật phần mềm. Thích đá bóng, gym và chơi game cuối tuần. Tính tình hòa đồng, muốn tìm bạn cùng phòng sạch sẽ, ngủ trước 12h.',
  'Sinh viên ĐHQG Hòa Lạc, sống ngăn nắp, thích tự nấu ăn. Cần tìm 1 bạn nam share phòng ở khu Tân Xã hoặc Thạch Hòa để tiết kiệm chi phí.',
  'Học ngành Trí tuệ nhân tạo FPTU. Ban ngày đi học và lên lab, tối về yên tĩnh tự học. Tìm bạn cùng phòng tôn trọng không gian riêng tư.',
  'Sinh viên năm 2 ĐH Công nghệ (VNU). Tính thẳng thắn, không hút thuốc, đồ đạc gọn gàng. Muốn tìm bạn ở ghép lâu dài.',
  'K19 FPT Hòa Lạc, mê nhiếp ảnh và chạy bộ. Muốn tìm bạn ở cùng vui vẻ, chia đều tiền phòng và điện nước sòng phẳng.',
  'Sinh viên năm 3 PTIT đang thực tập tại Khu CNC Hòa Lạc. Đi làm cả ngày, tối về chỉ cần chỗ nghỉ ngơi yên tĩnh.',
  'Dân kỹ thuật, thích nấu ăn và nghe nhạc lofi. Tìm bạn nam tính tình dễ chịu, giữ vệ sinh chung tốt.',
  'Sinh viên FPT K18, có xe máy, tính thoải mái nhưng rất tôn trọng giờ giấc nghỉ ngơi. Cần tìm phòng ở ghép gần trường.'
];

const STUDENT_BIOS_NU = [
  'Sinh viên K18 FPT ngành Thiết kế đồ họa. Thích cắm hoa, làm bánh, phòng luôn giữ sạch sẽ thơm tho. Muốn tìm bạn nữ ở cùng khu Tân Xã.',
  'Sinh viên năm 2 ĐHQG Hòa Lạc, tính tình nhẹ nhàng, cẩn thận. Cần tìm bạn nữ cùng phòng không hút thuốc và không dẫn người lạ về phòng.',
  'Học Ngôn ngữ Anh ĐHQG, thích yên tĩnh đọc sách và học online. Muốn tìm bạn nữ hòa đồng, biết chia sẻ việc nhà.',
  'K19 FPT ngành Truyền thông đa phương tiện. Tính cách vui vẻ, thích decor phòng. Tìm bạn nữ cùng gu để ở ghép lâu dài.',
  'Sinh viên năm nhất FPT, quê Nam Định. Cần tìm chị/bạn nữ ở ghép gần cổng trường FPT, có sẵn tủ lạnh máy giặt càng tốt.',
  'Sinh viên ĐH Ngoại Thương học quân sự/cơ sở Hòa Lạc. Sống kỷ luật, ngủ sớm dậy sớm, tìm bạn nữ nếp sống lành mạnh.',
  'Nữ sinh viên ĐHQG, thích nấu ăn tại phòng để tiết kiệm. Tìm bạn nữ hiền lành, chia đôi tiền phòng văn minh.',
  'K18 FPT, tính cách độc lập, tôn trọng giờ giấc học tập và nghỉ ngơi của nhau. Cần tìm bạn nữ cùng phòng.'
];

const LANDLORD_BIOS = [
  'Chủ nhà trọ Tân Xã, có dãy trọ 16 phòng mới xây đầy đủ điều hòa, nóng lạnh, thang máy. Cam kết giá điện nước công tơ riêng minh bạch.',
  'Chủ khu trọ sinh viên gần FPT Hòa Lạc. Camera an ninh 24/7, khóa cổng vân tay, giờ giấc tự do không chung chủ.',
  'Gia đình có nhà trọ tại Thôn 1 Tân Xã, ưu tiên các bạn sinh viên FPT và ĐHQG ngoan ngoãn, giữ vệ sinh chung.',
  'Chủ trọ Thạch Hòa, khu trọ khép kín sạch sẽ, gần chợ và các quán ăn sinh viên. Hỗ trợ đăng ký tạm trú đầy đủ.',
  'Cho thuê căn hộ mini Bình Yên, full nội thất xách vali vào ở ngay. Hỗ trợ sinh viên thanh toán tiền phòng linh hoạt theo tháng.',
  'Khu nhà trọ gia đình an ninh tuyệt đối, có sân để xe rộng rãi có mái che, bảo vệ giám sát ban đêm.'
];

const SLEEP_SCHEDULES = ['22h - 23h', '23h - 0h', '0h - 1h', 'Cú đêm'];
const NOISE_PREFS = ['Yên tĩnh', 'Bình thường', 'Thoải mái'];
const COOKING_HABITS = ['Tự nấu ăn hàng ngày', 'Thỉnh thoảng nấu ăn', 'Ăn ngoài quán'];
const PET_PREFS = ['Không nuôi thú cưng', 'Thích thú cưng', 'Có nuôi mèo sạch sẽ'];
const EXPENSE_STYLES = ['Chia đều tiền phòng & điện nước sòng phẳng', 'Dùng bao nhiêu tính bấy nhiêu minh bạch'];
const COMM_STYLES = ['Thẳng thắn, cởi mở', 'Nhẹ nhàng, tế nhị', 'Hòa đồng, vui vẻ'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomPhone(usedPhones) {
  let phone;
  do {
    const prefix = randomItem(TELCO_PREFIXES);
    const suffix = String(randomInt(1000000, 9999999));
    phone = prefix + suffix;
  } while (usedPhones.has(phone));
  usedPhones.add(phone);
  return phone;
}

function removeAccents(str) {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, '.');
}

function generateDataset() {
  const usedEmails = new Set();
  const usedPhones = new Set();
  const users = [];
  const matchingProfiles = [];

  const defaultPasswordHash = hashPassword('123456');

  // 1. Generate 160 Students (80 Male, 80 Female)
  for (let i = 1; i <= 160; i++) {
    const isMale = i <= 80;
    const ho = randomItem(HO);
    const dem = isMale ? randomItem(DEM_NAM) : randomItem(DEM_NU);
    const ten = isMale ? randomItem(TEN_NAM) : randomItem(TEN_NU);
    const fullName = `${ho} ${dem} ${ten}`;

    const birthYear = randomItem([2003, 2004, 2005, 2006]);
    const birthMonth = String(randomInt(1, 12)).padStart(2, '0');
    const birthDay = String(randomInt(1, 28)).padStart(2, '0');
    const dob = `${birthYear}-${birthMonth}-${birthDay}`;

    const phone = generateRandomPhone(usedPhones);

    // Realistic email
    const baseEmail = `${removeAccents(ten)}.${removeAccents(ho)}${randomInt(10, 99)}`;
    const domain = randomItem(['gmail.com', 'fpt.edu.vn', 'vnu.edu.vn', 'gmail.com']);
    let email = `${baseEmail}@${domain}`;
    if (usedEmails.has(email)) {
      email = `${removeAccents(ten)}.${removeAccents(ho)}${i}@gmail.com`;
    }
    usedEmails.add(email);

    const school = randomItem(SCHOOLS);
    const bio = isMale ? randomItem(STUDENT_BIOS_NAM) : randomItem(STUDENT_BIOS_NU);
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=${isMale ? '3b82f6' : 'ec4899'}&color=fff&size=200&bold=true`;

    const budgetMin = randomItem([1400000, 1600000, 1800000, 2000000]);
    const budgetMax = budgetMin + randomItem([800000, 1000000, 1200000, 1500000]);

    // Random created date in last 3 months
    const createdDaysAgo = randomInt(5, 90);
    const createdDate = new Date(Date.now() - createdDaysAgo * 24 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    users.push({
      id: i,
      fullName,
      email,
      phone,
      password: defaultPasswordHash,
      role: 'USER',
      status: 'ACTIVE',
      avatarUrl: avatar,
      bio,
      dob,
      gender: isMale ? 'Nam' : 'Nữ',
      schoolName: school,
      homeLat: 21.0133 + (Math.random() - 0.5) * 0.03,
      homeLng: 105.5278 + (Math.random() - 0.5) * 0.03,
      matchingRadiusKm: randomItem([3, 5, 8, 10]),
      isLookingForRoommate: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: createdDate
    });

    matchingProfiles.push({
      userId: i,
      enabled: true,
      gender: isMale ? 'Nam' : 'Nữ',
      schoolName: school,
      latitude: 21.0133 + (Math.random() - 0.5) * 0.02,
      longitude: 105.5278 + (Math.random() - 0.5) * 0.02,
      radiusKm: randomItem([3, 5, 8]),
      budgetMin,
      budgetMax,
      moveInDate: `2026-${String(randomInt(10, 12)).padStart(2, '0')}`,
      sleepSchedule: randomItem(SLEEP_SCHEDULES),
      cleanlinessLevel: randomItem([4, 5, 5, 4, 3]),
      smoking: randomItem(['Không hút thuốc', 'Không']),
      pets: randomItem(PET_PREFS),
      cooking: randomItem(COOKING_HABITS),
      noisePreference: randomItem(NOISE_PREFS),
      guestFrequency: randomItem(['Hiếm khi', 'Không dẫn bạn về', 'Thỉnh thoảng cuối tuần']),
      studyWorkSchedule: randomItem(['Học sáng', 'Học chiều', 'Linh hoạt', 'Học cả ngày']),
      expenseStyle: randomItem(EXPENSE_STYLES),
      communicationStyle: randomItem(COMM_STYLES),
      intro: bio
    });
  }

  // 2. Generate 40 Landlords (Ready for real listing data later)
  for (let j = 161; j <= 200; j++) {
    const isMale = j % 2 === 0;
    const titlePrefix = isMale ? randomItem(['Chú', 'Bác', 'Anh']) : randomItem(['Cô', 'Bác', 'Chị']);
    const ho = randomItem(HO);
    const ten = isMale ? randomItem(TEN_NAM) : randomItem(TEN_NU);
    const fullName = `${titlePrefix} ${ho} ${ten}`;

    const phone = generateRandomPhone(usedPhones);
    const email = `landlord.${removeAccents(ten)}${j}@gmail.com`;
    usedEmails.add(email);

    const bio = randomItem(LANDLORD_BIOS);
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=10b981&color=fff&size=200&bold=true`;

    const createdDaysAgo = randomInt(30, 120);
    const createdDate = new Date(Date.now() - createdDaysAgo * 24 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    users.push({
      id: j,
      fullName,
      email,
      phone,
      password: defaultPasswordHash,
      role: 'USER',
      status: 'ACTIVE',
      avatarUrl: avatar,
      bio,
      dob: `${randomInt(1968, 1985)}-${String(randomInt(1, 12)).padStart(2, '0')}-15`,
      gender: isMale ? 'Nam' : 'Nữ',
      schoolName: null,
      homeLat: 21.0133 + (Math.random() - 0.5) * 0.04,
      homeLng: 105.5278 + (Math.random() - 0.5) * 0.04,
      matchingRadiusKm: 5,
      isLookingForRoommate: false,
      emailVerified: true,
      phoneVerified: true,
      createdAt: createdDate
    });
  }

  return { users, matchingProfiles };
}

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  return `'${String(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

function buildSqlFile({ users, matchingProfiles }) {
  let sql = `-- =========================================================================\n`;
  sql += `-- UniHome - 200 Natural Vietnamese Users & Matching Profiles Seed Data\n`;
  sql += `-- Generated for TiDB Cloud / MySQL\n`;
  sql += `-- Mật khẩu mặc định cho toàn bộ 200 tài khoản: 123456\n`;
  sql += `-- 160 Sinh viên (Tenants) + 40 Chủ trọ (Landlords)\n`;
  sql += `-- =========================================================================\n\n`;

  sql += `SET NAMES utf8mb4;\n`;
  sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  sql += `-- 1. BẢNG USERS (200 TÀI KHOẢN)\n`;
  sql += `INSERT INTO \`users\` (\n`;
  sql += `  \`id\`, \`full_name\`, \`email\`, \`phone\`, \`password\`, \`role\`, \`status\`,\n`;
  sql += `  \`avatar_url\`, \`bio\`, \`dob\`, \`gender\`, \`school_name\`,\n`;
  sql += `  \`home_lat\`, \`home_lng\`, \`matching_radius_km\`, \`is_looking_for_roommate\`,\n`;
  sql += `  \`email_verified\`, \`phone_verified\`, \`auth_provider\`, \`created_at\`\n`;
  sql += `) VALUES\n`;

  const userRows = users.map(u => {
    return `  (${u.id}, ${escapeSql(u.fullName)}, ${escapeSql(u.email)}, ${escapeSql(u.phone)}, ${escapeSql(u.password)}, ${escapeSql(u.role)}, ${escapeSql(u.status)}, ${escapeSql(u.avatarUrl)}, ${escapeSql(u.bio)}, ${escapeSql(u.dob)}, ${escapeSql(u.gender)}, ${escapeSql(u.schoolName)}, ${u.homeLat.toFixed(5)}, ${u.homeLng.toFixed(5)}, ${u.matchingRadiusKm}, ${u.isLookingForRoommate ? 1 : 0}, 1, 1, 'LOCAL', ${escapeSql(u.createdAt)})`;
  });

  sql += userRows.join(',\n') + `\nON DUPLICATE KEY UPDATE \`full_name\` = VALUES(\`full_name\`);\n\n`;

  sql += `-- 2. BẢNG MATCHING_PROFILES (160 PROFILE SINH VIÊN TÌM Ở GHÉP)\n`;
  sql += `INSERT INTO \`matching_profile\` (\n`;
  sql += `  \`user_id\`, \`enabled\`, \`gender\`, \`school_name\`,\n`;
  sql += `  \`latitude\`, \`longitude\`, \`radius_km\`, \`budget_min\`, \`budget_max\`,\n`;
  sql += `  \`move_in_date\`, \`sleep_schedule\`, \`cleanliness_level\`, \`smoking\`, \`pets\`,\n`;
  sql += `  \`cooking\`, \`noise_preference\`, \`guest_frequency\`, \`study_work_schedule\`,\n`;
  sql += `  \`expense_style\`, \`communication_style\`, \`intro\`\n`;
  sql += `) VALUES\n`;

  const profileRows = matchingProfiles.map(p => {
    return `  (${p.userId}, 1, ${escapeSql(p.gender)}, ${escapeSql(p.schoolName)}, ${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}, ${p.radiusKm}, ${p.budgetMin}, ${p.budgetMax}, ${escapeSql(p.moveInDate)}, ${escapeSql(p.sleepSchedule)}, ${p.cleanlinessLevel}, ${escapeSql(p.smoking)}, ${escapeSql(p.pets)}, ${escapeSql(p.cooking)}, ${escapeSql(p.noisePreference)}, ${escapeSql(p.guestFrequency)}, ${escapeSql(p.studyWorkSchedule)}, ${escapeSql(p.expenseStyle)}, ${escapeSql(p.communicationStyle)}, ${escapeSql(p.intro)})`;
  });

  sql += profileRows.join(',\n') + `\nON DUPLICATE KEY UPDATE \`intro\` = VALUES(\`intro\`);\n\n`;

  sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;
  return sql;
}

const data = generateDataset();
const sqlContent = buildSqlFile(data);

const targetPath = path.join(__dirname, '..', 'database', 'seed_200_realistic_users.sql');
fs.writeFileSync(targetPath, sqlContent, 'utf8');

console.log(`\n=============================================================`);
console.log(`✅ ĐÃ TẠO THÀNH CÔNG 200 TÀI KHOẢN NGƯỜI DÙNG CHÂN THỰC 100%!`);
console.log(`   - 160 Sinh viên (kèm đầy đủ Profile tìm bạn ở ghép)`);
console.log(`   - 40 Chủ trọ (sẵn sàng đón ảnh/video thật từ bạn sau này)`);
console.log(`   - Số điện thoại random tự nhiên (Viettel, Vina, Mobi)`);
console.log(`   - Tất cả 200 tài khoản đều đăng nhập được bằng mật khẩu: 123456`);
console.log(`   - File SQL xuất ra: database/seed_200_realistic_users.sql`);
console.log(`=============================================================\n`);
