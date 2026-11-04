import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/web_payments.json', encoding='utf-8') as f:
    pays = json.load(f)
with open('scripts/web_users.json', encoding='utf-8') as f:
    users = {u['id']: u for u in json.load(f)}

print(f"Total: {len(pays)}")
for idx, p in enumerate(pays, 1):
    u = users.get(p['userId'], {})
    u_name = u.get('fullName', 'Chưa có tên')
    u_code = f"DEMO-U{p['userId']:04d}" if p['userId'] < 1000 else f"DEMO-U{p['userId']}"
    print(f"{idx:02d} | {p['code']} | {u_code} | {u_name} | {p.get('createdAt')} | {p.get('amount'):,} đ")
