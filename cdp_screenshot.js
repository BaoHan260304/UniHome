const fs = require('fs');
const path = require('path');

async function capture() {
  const targetUrl = process.argv[2] || 'http://localhost:5173/community';
  const outputPath = process.argv[3] || 'screenshot.png';

  // 1. Get targets list
  const listRes = await fetch('http://localhost:9222/json/list');
  const targets = await listRes.json();
  let pageTarget = targets.find(t => t.type === 'page');

  if (!pageTarget) {
    const newRes = await fetch('http://localhost:9222/json/new?' + encodeURIComponent(targetUrl));
    pageTarget = await newRes.json();
  }

  const wsUrl = pageTarget.webSocketDebuggerUrl;
  console.log('Connecting to Page target:', wsUrl);

  const ws = new WebSocket(wsUrl);

  let idCounter = 1;
  const callbacks = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const { resolve, reject } = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  // Enable Page and Runtime
  await send('Page.enable');
  await send('Runtime.enable');

  // Set viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Navigate to targetUrl
  console.log('Navigating to', targetUrl);
  await send('Page.navigate', { url: targetUrl });

  // Wait 4 seconds for react hydration & API data
  await new Promise(r => setTimeout(r, 4000));

  // Capture screenshot
  console.log('Capturing screenshot...');
  const result = await send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(result.data, 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log('Saved screenshot to:', outputPath);

  ws.close();
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
