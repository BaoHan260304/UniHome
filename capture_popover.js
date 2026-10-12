const { spawn } = require('child_process');
const fs = require('fs');

async function captureCommunityPopover() {
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
    const newRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5173/community');
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
  await send('Page.navigate', { url: 'http://localhost:5173/community' });
  await new Promise(r => setTimeout(r, 4000));

  console.log('Clicking first avatar to open popover...');
  const clicked = await send('Runtime.evaluate', {
    expression: '(() => { const btns = Array.from(document.querySelectorAll("button")); const target = btns.find(b => b.title === "Xem hồ sơ nổi bật"); if(target) { target.click(); return true; } return false; })()'
  });
  console.log('Clicked avatar button result:', clicked);
  await new Promise(r => setTimeout(r, 2000));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('evidence_profile_popover_live.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved evidence_profile_popover_live.png! Size:', fs.statSync('evidence_profile_popover_live.png').size);

  ws.close();
  child.kill();
  process.exit(0);
}

captureCommunityPopover().catch(e => { console.error('Error:', e); process.exit(1); });
