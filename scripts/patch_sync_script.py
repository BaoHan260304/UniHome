with open('scripts/sync_web_to_excel.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace week numbers
old_w = """ws_dt['B18'] = 4; ws_dt['C18'] = 138000
ws_dt['B19'] = 26; ws_dt['C19'] = 775000
ws_dt['B20'] = 23; ws_dt['C20'] = 420000
ws_dt['B21'] = 20; ws_dt['C21'] = 390000"""

new_w = """ws_dt['B18'] = 5; ws_dt['C18'] = 137000
ws_dt['B19'] = 17; ws_dt['C19'] = 609000
ws_dt['B20'] = 21; ws_dt['C20'] = 411000
ws_dt['B21'] = 30; ws_dt['C21'] = 566000"""

text = text.replace(old_w.replace('\n', '\r\n'), new_w.replace('\n', '\r\n'))
text = text.replace(old_w, new_w)

old_pkg = """    pkg_name = 'Gói VIP 1 (VIP Vàng)' if p.get('amount') == 99000 or 'VIP1' in p.get('code', '') else \\
               'Gói VIP 2 (VIP Bạc)' if p.get('amount') == 59000 or 'VIP2' in p.get('code', '') else \\
               'Gói VIP 3 (VIP Sinh viên)' if p.get('amount') == 29000 or 'VIP3' in p.get('code', '') else 'Gói Đẩy tin (BOOST)'
    paid_date = (p.get('paidAt') or p.get('createdAt') or '2026-10-25')[:10]
    ws_dt.cell(r, 1).value = p['code']
    ws_dt.cell(r, 2).value = f"DEMO-U{p['userId']:04d}" if p['userId'] < 1000 else f"DEMO-U{p['userId']}"
    ws_dt.cell(r, 3).value = paid_date
    ws_dt.cell(r, 4).value = pkg_name"""

new_pkg = """    pkg_code = 'VIP_1' if p.get('amount') == 99000 or 'VIP1' in p.get('code', '') else \\
               'VIP_2' if p.get('amount') == 59000 or 'VIP2' in p.get('code', '') else \\
               'VIP_3' if p.get('amount') == 29000 or 'VIP3' in p.get('code', '') else 'BOOST'
    paid_date = (p.get('paidAt') or p.get('createdAt') or '2026-10-25')[:10]
    ws_dt.cell(r, 1).value = p['code']
    ws_dt.cell(r, 2).value = f"DEMO-U{p['userId']:04d}" if p['userId'] < 1000 else f"DEMO-U{p['userId']}"
    ws_dt.cell(r, 3).value = paid_date
    ws_dt.cell(r, 4).value = pkg_code"""

text = text.replace(old_pkg.replace('\n', '\r\n'), new_pkg.replace('\n', '\r\n'))
text = text.replace(old_pkg, new_pkg)

with open('scripts/sync_web_to_excel.py', 'w', encoding='utf-8') as f:
    f.write(text)
print('sync_web_to_excel.py successfully modified!')
