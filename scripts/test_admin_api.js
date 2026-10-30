const https = require('https');

async function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('Logging in as admin...');
  const loginRes = await request('https://unihome-backend-j1kb.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@unihome.vn', password: '123456' });

  console.log('Login status:', loginRes.status);
  const token = loginRes.data?.token;
  if (!token) {
    console.log('Login failed:', loginRes.data);
    return;
  }
  console.log('Got token:', token.substring(0, 15) + '...');

  const dashRes = await request('https://unihome-backend-j1kb.onrender.com/api/admin/dashboard', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('\n--- /api/admin/dashboard ---');
  console.log(dashRes.data);

  const anaRes = await request('https://unihome-backend-j1kb.onrender.com/api/admin/analytics/dashboard', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('\n--- /api/admin/analytics/dashboard ---');
  console.log('walletInflow:', anaRes.data?.walletInflow);
  console.log('recognizedRevenue:', anaRes.data?.recognizedRevenue);
  console.log('packageRevenue:', anaRes.data?.packageRevenue);
  console.log('revenueBreakdown:', anaRes.data?.revenueBreakdown);
  console.log('totalUsers:', anaRes.data?.totalUsers);
  console.log('landlordsCount:', anaRes.data?.landlordsCount);
  console.log('tenantsCount:', anaRes.data?.tenantsCount);
  console.log('activeListings:', anaRes.data?.activeListings);
  console.log('pendingListings:', anaRes.data?.pendingListings);
}

main().catch(console.error);
