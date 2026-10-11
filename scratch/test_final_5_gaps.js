// scratch/test_final_5_gaps.js
const http = require('http');
const cp = require('child_process');
const fs = require('fs');

const BASE_URL = 'http://localhost:8080';
const MYSQL_BIN = 'C:\\Program Files\\MySQL\\MySQL Server 9.7\\bin\\mysql.exe';

function dbQuery(sql) {
  const res = cp.spawnSync(MYSQL_BIN, [
    '-u', 'root',
    '-p123456@123',
    'rrmsdb',
    '-e', sql,
    '--batch',
    '--raw'
  ], { encoding: 'utf8' });

  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(`MySQL error: ${res.stderr}`);

  const lines = res.stdout.replace(/\r/g, '').trim().split('\n').filter(Boolean);
  if (lines.length <= 1) return [];
  const headers = lines[0].split('\t').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split('\t');
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (cols[i] || '').trim(); });
    return obj;
  });
}

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Accept': 'application/json' };
    let payload = null;

    if (body) {
      payload = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch { json = data; }
        resolve({ status: res.statusCode, data: json, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function login(email, password = '123456') {
  const res = await request('POST', '/api/auth/login', { identifier: email, email, password });
  if (res.status === 200 && res.data?.token) {
    return { token: res.data.token, user: res.data.user };
  }
  const res2 = await request('POST', '/api/auth/login', { identifier: email, email, password: 'password123' });
  if (res2.status === 200 && res2.data?.token) {
    return { token: res2.data.token, user: res2.data.user };
  }
  throw new Error(`Login failed for ${email}`);
}

async function run() {
  console.log('=== TESTING 5 FINAL GAPS ===\n');

  const adminAuth = await login('admin@unihome.vn');
  const studentAuth = await login('student@unihome.vn'); // User ID 4
  const landlordAuth = await login('landlord@unihome.vn'); // User ID 2

  const results = {};

  // ==========================================
  // GAP 1: Q&A Avatar Verification
  // ==========================================
  console.log('--- GAP 1: Q&A ---');
  // 1. Create a question from User 4 (who has a real avatar)
  const qCreate = await request('POST', '/api/content/questions', {
    title: 'Hỏi về thủ tục đăng ký tạm trú sinh viên KTX',
    content: 'Em là sinh viên năm nhất mới lên, cho em hỏi thủ tục đăng ký tạm trú cần những giấy tờ gì ạ?',
    category: 'Pháp lý & Cọc'
  }, studentAuth.token);
  const createdQId = qCreate.data?.id;

  // 2. Fetch questions list
  const qsList = await request('GET', '/api/content/questions');
  const foundQ = qsList.data?.find(q => q.id === createdQId);
  const qDetail = await request('GET', `/api/content/questions/${createdQId}`);

  console.log('Question author detail:', {
    id: createdQId,
    authorId: foundQ?.authorId,
    authorName: foundQ?.authorName,
    authorAvatar: foundQ?.authorAvatar,
    authorProfileUrl: foundQ?.authorProfileUrl
  });

  results.qa = {
    createdQId,
    status: qCreate.status,
    hasAuthorAvatar: !!foundQ?.authorAvatar,
    authorAvatar: foundQ?.authorAvatar,
    authorName: foundQ?.authorName,
    authorProfileUrl: foundQ?.authorProfileUrl
  };

  // Clean up created question
  if (createdQId) {
    await request('DELETE', `/api/admin/questions/${createdQId}`, null, adminAuth.token);
  }

  // ==========================================
  // GAP 2: MY POSTS - SERVICE
  // ==========================================
  console.log('\n--- GAP 2: MY POSTS - SERVICE ---');
  // 1. Create
  const sCreate = await request('POST', '/api/content/services', {
    title: 'Dịch vụ chuyển nhà trọ sinh viên test E2E',
    category: 'Moving',
    priceFrom: 180000,
    province: 'Hà Nội',
    phone: '0900000011',
    description: 'Hỗ trợ đóng gói và chuyển đồ trọ giá rẻ cho sinh viên'
  }, studentAuth.token);
  const serviceId = sCreate.data?.id;

  // 2. View
  const sView = await request('GET', `/api/content/services/${serviceId}`, null, studentAuth.token);
  const myPostsAfterCreate = await request('GET', '/api/my-posts', null, studentAuth.token);
  const inMyPosts = myPostsAfterCreate.data?.some(p => p.id === serviceId && p.category === 'SERVICE');

  // 3. Edit
  const sEdit = await request('PUT', `/api/content/services/${serviceId}`, {
    title: 'Dịch vụ chuyển nhà trọ sinh viên test E2E (Đã chỉnh sửa)',
    priceFrom: 220000
  }, studentAuth.token);

  // 4. Hide
  const sHide = await request('PUT', `/api/content/services/${serviceId}/status`, { status: 'HIDDEN' }, studentAuth.token);

  // 5. Unhide
  const sUnhide = await request('PUT', `/api/content/services/${serviceId}/status`, { status: 'ACTIVE' }, studentAuth.token);

  // 6. Delete
  const sDelete = await request('DELETE', `/api/content/services/${serviceId}`, null, studentAuth.token);

  results.service = {
    serviceId,
    createStatus: sCreate.status,
    viewStatus: sView.status,
    inMyPosts,
    editStatus: sEdit.status,
    hideStatus: sHide.status,
    hideNewStatus: sHide.data?.status,
    unhideStatus: sUnhide.status,
    unhideNewStatus: sUnhide.data?.status,
    deleteStatus: sDelete.status
  };
  console.log('Service E2E Results:', results.service);

  // ==========================================
  // GAP 3: MY POSTS - ROOMMATE
  // ==========================================
  console.log('\n--- GAP 3: MY POSTS - ROOMMATE ---');
  // Find or create a real roommate listing for student (User ID 4)
  // Let's create a dedicated O_GHEP property & listing for User 4
  const createRoommateRes = await request('POST', '/api/listings', {
    name: 'Tìm bạn nam ở ghép phòng trọ ngõ 165 Cầu Giấy',
    propertyType: 'Phòng trọ',
    postType: 'O_GHEP',
    posterRelationship: 'ROOMMATE_SEARCH',
    price: 1500000,
    area: 25,
    province: 'Hà Nội',
    district: 'Cầu Giấy',
    address: 'Ngõ 165 Cầu Giấy, Dịch Vọng, Cầu Giấy, Hà Nội',
    listingStatus: 'ACTIVE'
  }, studentAuth.token);
  const roommateListingId = createRoommateRes.data?.listing?.id || createRoommateRes.data?.id;
  const roommatePropertyId = createRoommateRes.data?.property?.id;

  // 1. GET my-posts
  const myPostsRm = await request('GET', '/api/my-posts', null, studentAuth.token);
  const rmPost = myPostsRm.data?.find(p => p.id === roommateListingId || p.listingId === roommateListingId);

  // 2. View
  const rmView = await request('GET', `/api/marketplace/listings/${roommateListingId}`);

  // 3. Hide
  const rmHide = await request('PUT', `/api/listings/${roommateListingId}/status`, { status: 'HIDDEN' }, studentAuth.token);

  // 4. Unhide
  const rmUnhide = await request('PUT', `/api/listings/${roommateListingId}/status`, { status: 'ACTIVE' }, studentAuth.token);

  // 5. Renew
  const rmRenew = await request('POST', `/api/listings/${roommateListingId}/renew`, null, studentAuth.token);

  // 6. Delete
  const rmDelete = await request('DELETE', `/api/listings/${roommateListingId}`, null, studentAuth.token);

  results.roommate = {
    roommateListingId,
    categoryInMyPosts: rmPost?.category,
    relationship: rmPost?.relationship,
    postType: rmPost?.postType,
    viewStatus: rmView.status,
    hideStatus: rmHide.status,
    unhideStatus: rmUnhide.status,
    renewStatus: rmRenew.status,
    deleteStatus: rmDelete.status
  };
  console.log('Roommate E2E Results:', results.roommate);

  // ==========================================
  // GAP 4: ADMIN MODERATION
  // ==========================================
  console.log('\n--- GAP 4: ADMIN MODERATION ---');
  // 1. Q&A hide & delete
  const modQ = await request('POST', '/api/content/questions', { title: 'Q to moderate', content: 'content' }, studentAuth.token);
  const modQId = modQ.data?.id;
  const qHide = await request('POST', `/api/admin/questions/${modQId}/status`, { status: 'HIDDEN' }, adminAuth.token);
  const qDel = await request('DELETE', `/api/admin/questions/${modQId}`, null, adminAuth.token);

  // 2. Answer delete & hide
  const baseQ = await request('POST', '/api/content/questions', { title: 'Base Q for answer', content: 'content' }, studentAuth.token);
  const baseQId = baseQ.data?.id;
  const modAns = await request('POST', `/api/content/questions/${baseQId}/answers`, { content: 'Answer to moderate' }, studentAuth.token);
  const modAnsId = modAns.data?.id;
  const ansHide = await request('POST', `/api/admin/answers/${modAnsId}/status`, { status: 'HIDDEN' }, adminAuth.token);
  const ansDel = await request('DELETE', `/api/admin/answers/${modAnsId}`, null, adminAuth.token);
  await request('DELETE', `/api/admin/questions/${baseQId}`, null, adminAuth.token);

  // 3. Review moderation
  const revCreate = await request('POST', '/api/community/reviews', { propertyId: 1, rating: 5, comment: 'Review test admin moderation' }, studentAuth.token);
  const revId = revCreate.data?.id;
  const revHide = await request('POST', `/api/admin/reviews/${revId}/status`, { status: 'HIDDEN' }, adminAuth.token);
  const revDel = await request('DELETE', `/api/admin/reviews/${revId}`, null, adminAuth.token);

  // 4. Service approve / hide / delete
  const svMod = await request('POST', '/api/content/services', { title: 'Service for admin mod', category: 'Moving', phone: '0900000003' }, studentAuth.token);
  const svModId = svMod.data?.id;
  const svApprove = await request('POST', `/api/admin/services/${svModId}/moderate`, { status: 'ACTIVE' }, adminAuth.token);
  const svHide = await request('POST', `/api/admin/services/${svModId}/moderate`, { status: 'HIDDEN' }, adminAuth.token);
  const svDel = await request('DELETE', `/api/admin/services/${svModId}`, null, adminAuth.token);

  // 5. Secondhand hide & delete
  const shMod = await request('POST', '/api/content/secondhand', { title: 'SH for admin mod', category: 'Khác', price: 50000 }, studentAuth.token);
  const shModId = shMod.data?.id;
  const shHide = await request('POST', `/api/admin/secondhand/${shModId}/status`, { status: 'HIDDEN' }, adminAuth.token);
  const shDel = await request('DELETE', `/api/admin/secondhand/${shModId}`, null, adminAuth.token);

  // 6. Report drilldown
  const repCreate = await request('POST', '/api/community/reports', {
    targetType: 'LISTING',
    targetId: 1,
    reasonCode: 'SPAM',
    details: 'Tin đăng có dấu hiệu thông tin sai lệch'
  }, studentAuth.token);
  const repId = repCreate.data?.id;
  const repList = await request('GET', '/api/admin/reports', null, adminAuth.token);
  const repItem = repList.data?.find(r => r.id === repId);
  const repResolve = await request('POST', `/api/admin/reports/${repId}/resolve`, { resolution: 'Đã nhắc nhở chủ trọ kiểm tra lại tin đăng' }, adminAuth.token);

  // 7. User ban & unban
  // Test on User 119
  const userBan = await request('POST', `/api/admin/users/119/ban`, { reason: 'Tài khoản vi phạm kiểm duyệt thử nghiệm' }, adminAuth.token);
  const userUnban = await request('POST', `/api/admin/users/119/activate`, null, adminAuth.token);

  // 8. Audit log confirmation for actions
  const auditRes = await request('GET', '/api/admin/audit', null, adminAuth.token);
  const auditItems = auditRes.data?.items || auditRes.data || [];
  const recentAudit = auditItems.slice(0, 8);

  results.moderation = {
    qHideStatus: qHide.status,
    qDelStatus: qDel.status,
    ansHideStatus: ansHide.status,
    ansDelStatus: ansDel.status,
    revHideStatus: revHide.status,
    revDelStatus: revDel.status,
    svApproveStatus: svApprove.status,
    svHideStatus: svHide.status,
    svDelStatus: svDel.status,
    shHideStatus: shHide.status,
    shDelStatus: shDel.status,
    repDrilldownStatus: repList.status,
    repTargetTitle: repItem?.targetTitle,
    repTargetOwner: repItem?.targetOwnerName,
    repResolveStatus: repResolve.status,
    userBanStatus: userBan.status,
    userUnbanStatus: userUnban.status,
    auditLogCount: auditItems.length,
    recentAuditAction: recentAudit[0]?.action,
    recentAuditActor: recentAudit[0]?.actorId
  };
  console.log('Admin Moderation Results:', results.moderation);

  // ==========================================
  // GAP 5: ADS BROWSER & RUNTIME ROTATION
  // ==========================================
  console.log('\n--- GAP 5: ADS RUNTIME E2E ---');
  // 1. Fetch ads for HOME_TOP
  const homeTopAds = await request('GET', '/api/content/ads?placement=HOME_TOP');
  const adsList = homeTopAds.data || [];
  const adA = adsList[0];
  const adB = adsList[1];

  // 2. Initial DB stats
  const beforeAdA = dbQuery(`SELECT impressions, click_count FROM advertisement WHERE id = ${adA.id};`)[0];
  const beforeAdB = dbQuery(`SELECT impressions, click_count FROM advertisement WHERE id = ${adB.id};`)[0];

  // 3. Impression ad A (t=0)
  const impA = await request('POST', `/api/content/ads/${adA.id}/impression`);
  const clickA = await request('POST', `/api/content/ads/${adA.id}/click`);

  // 4. Rotation simulation (t=8s -> ad B)
  const impB = await request('POST', `/api/content/ads/${adB.id}/impression`);
  const clickB = await request('POST', `/api/content/ads/${adB.id}/click`);

  const afterAdA = dbQuery(`SELECT impressions, click_count FROM advertisement WHERE id = ${adA.id};`)[0];
  const afterAdB = dbQuery(`SELECT impressions, click_count FROM advertisement WHERE id = ${adB.id};`)[0];

  results.ads = {
    placement: 'HOME_TOP',
    adACount: adsList.length,
    adAId: adA.id,
    adBId: adB.id,
    adAImpBefore: Number(beforeAdA.impressions),
    adAImpAfter: Number(afterAdA.impressions),
    adAClickBefore: Number(beforeAdA.click_count),
    adAClickAfter: Number(afterAdA.click_count),
    adBImpBefore: Number(beforeAdB.impressions),
    adBImpAfter: Number(afterAdB.impressions),
    adBClickBefore: Number(beforeAdB.click_count),
    adBClickAfter: Number(afterAdB.click_count),
    impAStatus: impA.status,
    clickAStatus: clickA.status,
    impBStatus: impB.status,
    clickBStatus: clickB.status
  };
  console.log('Ads E2E Results:', results.ads);

  fs.writeFileSync('scratch/final_5_gaps_report.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('\n=== DONE: Results saved to scratch/final_5_gaps_report.json ===');
}

run().catch(err => {
  console.error('Test script error:', err);
  process.exit(1);
});
