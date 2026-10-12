const { spawn } = require('child_process');

async function testAdsSessionIsolation() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'C:\\Users\\Phan Huu Kien\\Desktop\\UniHome\\.chrome_dev';
  
  const child = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=' + userDataDir,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const targets = await listRes.json();
  let pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) {
    const newRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5173/');
    pageTarget = await newRes.json();
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((res, rej) => {
    const curId = id++;
    const handler = (e) => {
      const data = JSON.parse(e.data);
      if (data.id === curId) {
        ws.removeEventListener('message', handler);
        if (data.error) rej(data.error);
        else res(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 3500));

  console.log('1. Checking initial visible ads...');
  const initialAdCount = await send('Runtime.evaluate', {
    expression: 'Array.from(document.querySelectorAll("button")).filter(b => b.title === "Ẩn quảng cáo này").length'
  });
  console.log('Initial ads count:', initialAdCount.result.value);

  console.log('2. Hiding the top banner ad (clicking first hide button)...');
  await send('Runtime.evaluate', {
    expression: '(() => { const btn = Array.from(document.querySelectorAll("button")).find(b => b.title === "Ẩn quảng cáo này"); if(btn) btn.click(); return !!btn; })()'
  });
  await new Promise(r => setTimeout(r, 1000));

  const afterHideCount = await send('Runtime.evaluate', {
    expression: 'Array.from(document.querySelectorAll("button")).filter(b => b.title === "Ẩn quảng cáo này").length'
  });
  console.log('Ad count after hiding one ad:', afterHideCount.result.value);

  const sessionKeys = await send('Runtime.evaluate', {
    expression: 'JSON.stringify(Object.keys(sessionStorage).filter(k => k.startsWith("unihome_hidden_ads")))'
  });
  console.log('SessionStorage keys created:', sessionKeys.result.value);

  console.log('3. Reloading page in same session (hidden ad should remain hidden)...');
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 3500));

  const reloadAdCount = await send('Runtime.evaluate', {
    expression: 'Array.from(document.querySelectorAll("button")).filter(b => b.title === "Ẩn quảng cáo này").length'
  });
  console.log('Ad count after page reload in same session:', reloadAdCount.result.value);

  ws.close();
  child.kill();
  process.exit(0);
}

testAdsSessionIsolation().catch(e => { console.error('Error:', e); process.exit(1); });
