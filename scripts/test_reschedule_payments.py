import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
pays = json.load(open('C:/Users/Quan/Documents/CODE/UniHome/scripts/web_payments.json', encoding='utf-8'))
users = {u['id']: u['fullName'] for u in json.load(open('C:/Users/Quan/Documents/CODE/UniHome/scripts/web_users.json', encoding='utf-8'))}
users[1] = 'Lê Hồng Quân'

prefixes = ['Cô ', 'Bác ', 'Chú ', 'Chị ', 'Anh ']

def clean_name(uid):
    name = users.get(uid, 'Nguyễn Văn An')
    for pref in prefixes:
        if name.startswith(pref):
            name = name[len(pref):]
            break
    return name.upper()

first_53 = pays[:53]
repeat_20 = pays[53:]

repeat_times = [
    '2026-10-25 14:15:20', '2026-10-25 19:40:00', '2026-10-26 10:05:10', '2026-10-26 14:30:00',
    '2026-10-26 16:50:45', '2026-10-27 08:45:00', '2026-10-27 14:10:30', '2026-10-27 19:20:15',
    '2026-10-28 08:15:00', '2026-10-28 11:40:20', '2026-10-28 15:05:00', '2026-10-28 17:30:10',
    '2026-10-29 09:20:00', '2026-10-29 13:45:15', '2026-10-29 16:10:00', '2026-10-29 18:50:30',
    '2026-10-30 08:30:00', '2026-10-30 10:15:40', '2026-10-30 14:00:25', '2026-10-30 16:25:00'
]

new_pays = []
for p in first_53:
    new_pays.append(dict(p))

for idx, p in enumerate(repeat_20):
    item = dict(p)
    new_time = repeat_times[idx]
    item['createdAt'] = new_time
    item_num = 54 + idx
    pkg = 'VIP3' if item['amount'] == 29000 else 'BOOST'
    t_clean = new_time.replace('-', '').replace(':', '').replace(' ', '')[2:]
    item['code'] = f'PAY-{pkg}-{t_clean}-{item_num:03d}'
    new_pays.append(item)

sorted_all = sorted(new_pays, key=lambda x: x['createdAt'])

print(f"Total: {len(sorted_all)}")
for idx, p in enumerate(sorted_all, 1):
    name = clean_name(p['userId'])
    t = p['createdAt']
    parts = t.split(' ')
    d_parts = parts[0].split('-')
    d_formatted = f'{d_parts[2]}/{d_parts[1]}/{d_parts[0]} {parts[1]}'
    print(f"{idx:02d} | {p['code']} | {name} | {d_formatted} | {p['amount']:,} đ")
