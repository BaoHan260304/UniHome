const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'AdminDashboard.tsx');
const text = fs.readFileSync(file, 'utf8');
const m = text.match(/const tabs\s*=\s*\[([^\]]+)\]/);
if (m) {
  console.log('TABS:', m[1].split(',').map(s => s.trim().replace(/['"]/g, '')));
}
