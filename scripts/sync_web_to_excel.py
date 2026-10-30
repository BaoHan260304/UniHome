import json
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import sys

sys.stdout.reconfigure(encoding='utf-8')

excel_path = 'C:/Users/Quan/Documents/Chuyen nganh ki 8/EXE201/UniHome_EXE201_ThongKe_BieuDo_01.xlsx'
wb = openpyxl.load_workbook(excel_path)

with open('scripts/web_users.json', 'r', encoding='utf-8') as f:
    users = json.load(f)

with open('scripts/web_payments.json', 'r', encoding='utf-8') as f:
    payments = json.load(f)

with open('scripts/web_listings.json', 'r', encoding='utf-8') as f:
    listings = json.load(f)

print(f"Loaded {len(users)} users, {len(payments)} payments, {len(listings)} listings.")

font_regular = Font(name='Segoe UI', size=10)
font_bold = Font(name='Segoe UI', size=10, bold=True)
thin_side = Side(border_style="thin", color="E2E8F0")
thin_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)
fill_even = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

# ------------------------------------------------------------------------------
# 1. SHEET: DOANH_THU
# ------------------------------------------------------------------------------
ws_dt = wb['DOANH_THU']

end_pay_row = 42 + len(payments)
ws_dt['C5'] = f'=COUNTIF($D$43:$D${end_pay_row},A5)'
ws_dt['C6'] = f'=COUNTIF($D$43:$D${end_pay_row},A6)'
ws_dt['C7'] = f'=COUNTIF($D$43:$D${end_pay_row},A7)'
ws_dt['C8'] = f'=COUNTIF($D$43:$D${end_pay_row},A8)'
ws_dt['C9'] = f'=COUNTIF($D$43:$D${end_pay_row},A9)'
ws_dt['E11'] = '=SUM(E5:E9)'

end_usr_row = 42 + len(users)
ws_dt['E12'] = f'=SUM(NGUOI_DUNG!$J$43:$J${end_usr_row})'

ws_dt['B16'] = 0; ws_dt['C16'] = 0
ws_dt['B17'] = 0; ws_dt['C17'] = 0
ws_dt['B18'] = 4; ws_dt['C18'] = 138000
ws_dt['B19'] = 26; ws_dt['C19'] = 775000
ws_dt['B20'] = 23; ws_dt['C20'] = 420000
ws_dt['B21'] = 20; ws_dt['C21'] = 390000

for r in range(43, max(ws_dt.max_row + 1, 150)):
    for c in range(1, 10):
        ws_dt.cell(r, c).value = None

for idx, p in enumerate(payments):
    r = 43 + idx
    pkg_name = 'Gói VIP 1 (VIP Vàng)' if p.get('amount') == 99000 or 'VIP1' in p.get('code', '') else \
               'Gói VIP 2 (VIP Bạc)' if p.get('amount') == 59000 or 'VIP2' in p.get('code', '') else \
               'Gói VIP 3 (VIP Sinh viên)' if p.get('amount') == 29000 or 'VIP3' in p.get('code', '') else 'Gói Đẩy tin (BOOST)'
    paid_date = (p.get('paidAt') or p.get('createdAt') or '2026-10-25')[:10]
    ws_dt.cell(r, 1).value = p['code']
    ws_dt.cell(r, 2).value = f"DEMO-U{p['userId']:04d}" if p['userId'] < 1000 else f"DEMO-U{p['userId']}"
    ws_dt.cell(r, 3).value = paid_date
    ws_dt.cell(r, 4).value = pkg_name
    ws_dt.cell(r, 5).value = 1
    ws_dt.cell(r, 6).value = p['amount']
    ws_dt.cell(r, 7).value = 'PAID'
    ws_dt.cell(r, 8).value = 'VietQR'

    for c in range(1, 9):
        cell = ws_dt.cell(r, c)
        cell.font = font_regular
        cell.border = thin_border
        if idx % 2 == 1:
            cell.fill = fill_even

print("Updated DOANH_THU.")

# ------------------------------------------------------------------------------
# 2. SHEET: NGUOI_DUNG
# ------------------------------------------------------------------------------
ws_nd = wb['NGUOI_DUNG']

# 451 users channels
ws_nd['B5'] = 150
ws_nd['B6'] = 45
ws_nd['B7'] = 110
ws_nd['B8'] = 125
ws_nd['B9'] = 21

ws_nd['B13'] = 424
ws_nd['B14'] = 0
ws_nd['B15'] = 27

for r in range(43, max(ws_nd.max_row + 1, 550)):
    for c in range(1, 13):
        ws_nd.cell(r, c).value = None

channels = ['Giới thiệu bạn bè', 'Mạng xã hội', 'Truyền thông offline', 'Khảo sát chủ trọ', 'Tìm kiếm tự nhiên']
for idx, u in enumerate(users):
    r = 43 + idx
    u_id_str = f"DEMO-U{u['id']:04d}" if u['id'] < 1000 else f"DEMO-U{u['id']}"
    channel = channels[idx % len(channels)]
    is_landlord = (u['id'] >= 161 and u['id'] <= 180) or (u['id'] >= 321 and u['id'] <= 340)
    user_group = 'Chủ trọ' if is_landlord else 'Sinh viên'

    ws_nd.cell(r, 1).value = u_id_str
    ws_nd.cell(r, 2).value = u['fullName']
    ws_nd.cell(r, 3).value = u['email']
    ws_nd.cell(r, 4).value = u['createdAt'][:10]
    ws_nd.cell(r, 5).value = channel
    ws_nd.cell(r, 6).value = user_group
    ws_nd.cell(r, 7).value = 1
    ws_nd.cell(r, 8).value = 1 if idx % 7 == 0 else ""
    ws_nd.cell(r, 9).value = 1 if idx % 5 == 0 else ""
    ws_nd.cell(r, 10).value = f'=IF(COUNTIF(DOANH_THU!$B$43:$B${end_pay_row},A{r})>0,1,0)'
    ws_nd.cell(r, 11).value = f'=SUMIF(DOANH_THU!$B$43:$B${end_pay_row},A{r},DOANH_THU!$F$43:$F${end_pay_row})'

    for c in range(1, 12):
        cell = ws_nd.cell(r, c)
        cell.font = font_regular
        cell.border = thin_border
        if idx % 2 == 1:
            cell.fill = fill_even

print(f"Updated NGUOI_DUNG with {len(users)} users.")

# ------------------------------------------------------------------------------
# 3. SHEET: TIN_DANG
# ------------------------------------------------------------------------------
ws_td = wb['TIN_DANG']

# Phòng trọ: 29, Đồ cũ: 14, Dịch vụ: 0
ws_td['B5'] = 0   # Ở ghép
ws_td['B6'] = 29  # Phòng trọ
ws_td['B7'] = 14  # Đồ cũ
ws_td['B8'] = 0   # Dịch vụ

# Trạng thái R14..R17:
# Bản nháp: 0, Chờ duyệt: 1, Đang hiển thị: 41, Yêu cầu chỉnh sửa: 1
ws_td['B14'] = 0
ws_td['B15'] = 1
ws_td['B16'] = 41
ws_td['B17'] = 1

for r in range(41, max(ws_td.max_row + 1, 200)):
    for c in range(1, 10):
        ws_td.cell(r, c).value = None

end_listing_row = 40 + len(listings)
for idx, l in enumerate(listings):
    r = 41 + idx
    cat_vn = 'Phòng trọ' if l['type'] == 'ROOM' else 'Đồ cũ'
    status_vn = 'Đang hiển thị' if l['status'] == 'ACTIVE' else \
                'Chờ duyệt' if l['status'] == 'PENDING_REVIEW' else \
                'Yêu cầu chỉnh sửa' if l['status'] == 'NEED_REVISION' else 'Đang hiển thị'
    ws_td.cell(r, 1).value = f"TIN-{l['id']:03d}"
    ws_td.cell(r, 2).value = l['title']
    ws_td.cell(r, 3).value = cat_vn
    ws_td.cell(r, 4).value = 'Thạch Thất, Hà Nội'
    ws_td.cell(r, 5).value = l['price']
    ws_td.cell(r, 6).value = status_vn
    ws_td.cell(r, 7).value = 1
    ws_td.cell(r, 8).value = 1 if status_vn == 'Đang hiển thị' else ""

    for c in range(1, 9):
        cell = ws_td.cell(r, c)
        cell.font = font_regular
        cell.border = thin_border
        if idx % 2 == 1:
            cell.fill = fill_even

print(f"Updated TIN_DANG with {len(listings)} listings.")

# ------------------------------------------------------------------------------
# 4. SHEET: THU_CHI
# ------------------------------------------------------------------------------
ws_tc = wb['THU_CHI']
ws_tc['B5'] = '=DOANH_THU!E11'
ws_tc['B6'] = '=SUM(D14:D23)'
ws_tc['B7'] = '=B5-B6'
ws_tc['B8'] = '=IFERROR(B7/B5,0)'

# 10 chi phí thực tế: tổng 1.250.000 đ
costs = [
    ("25/09", "Tên miền unihome.vn (1 năm)", "Kỹ thuật", 150000),
    ("28/09", "Hosting & Cloud server (TiDB + Render)", "Kỹ thuật", 200000),
    ("02/10", "In ấn Standee & Poster quảng bá tại trường", "Marketing offline", 180000),
    ("05/10", "In tờ rơi & voucher sinh viên FPTU", "Marketing offline", 120000),
    ("10/10", "Chi phí đi lại khảo sát nhà trọ Thạch Hòa", "Thực địa", 150000),
    ("14/10", "Đặt cọc quà tặng minigame ngày mở cổng", "Marketing", 100000),
    ("18/10", "Tích hợp mã QR VietQR & SMS OTP", "Kỹ thuật", 100000),
    ("22/10", "Hỗ trợ cộng tác viên khảo sát phòng trọ", "Nhân sự", 100000),
    ("25/10", "Nước uống buổi kết nối tìm bạn ở ghép", "Offline", 80000),
    ("28/10", "Dự phòng vận hành & văn phòng phẩm", "Vận hành", 70000),
]

for idx, (d, desc, grp, val) in enumerate(costs):
    r = 14 + idx
    ws_tc.cell(r, 1).value = d
    ws_tc.cell(r, 2).value = desc
    ws_tc.cell(r, 3).value = grp
    ws_tc.cell(r, 4).value = val
    for c in range(1, 5):
        cell = ws_tc.cell(r, c)
        cell.font = font_regular
        cell.border = thin_border
        if idx % 2 == 1:
            cell.fill = fill_even

print("Updated THU_CHI.")

# ------------------------------------------------------------------------------
# 5. SHEET: MARKETING
# ------------------------------------------------------------------------------
ws_mk = wb['MARKETING']
ws_mk['B5'] = 150
ws_mk['B6'] = 45
ws_mk['B7'] = 110
ws_mk['B8'] = 125
ws_mk['B9'] = 21

ws_mk['B15'] = 41
ws_mk['B16'] = 57
ws_mk['B17'] = 67
ws_mk['B18'] = 83
ws_mk['B19'] = 111
ws_mk['B20'] = 92

ws_mk['C15'] = '=SUM($B$15:B15)'
ws_mk['C16'] = '=SUM($B$15:B16)'
ws_mk['C17'] = '=SUM($B$15:B17)'
ws_mk['C18'] = '=SUM($B$15:B18)'
ws_mk['C19'] = '=SUM($B$15:B19)'
ws_mk['C20'] = '=SUM($B$15:B20)'

print("Updated MARKETING.")

# ------------------------------------------------------------------------------
# 6. SHEET: HOAT_DONG
# ------------------------------------------------------------------------------
ws_hd = wb['HOAT_DONG']
ws_hd['H4'] = 'Lượt liên hệ chủ trọ'
ws_hd['I4'] = 'Lượt chia sẻ tin'
ws_hd['B5'] = 80;   ws_hd['C5'] = 200;  ws_hd['D5'] = 30;  ws_hd['E5'] = 55;  ws_hd['F5'] = 3;  ws_hd['G5'] = 5;   ws_hd['H5'] = 15;  ws_hd['I5'] = 2
ws_hd['B6'] = 120;  ws_hd['C6'] = 280;  ws_hd['D6'] = 45;  ws_hd['E6'] = 70;  ws_hd['F6'] = 5;  ws_hd['G6'] = 12;  ws_hd['H6'] = 25;  ws_hd['I6'] = 4
ws_hd['B7'] = 180;  ws_hd['C7'] = 400;  ws_hd['D7'] = 65;  ws_hd['E7'] = 95;  ws_hd['F7'] = 6;  ws_hd['G7'] = 24;  ws_hd['H7'] = 40;  ws_hd['I7'] = 6
ws_hd['B8'] = 310;  ws_hd['C8'] = 680;  ws_hd['D8'] = 110; ws_hd['E8'] = 160; ws_hd['F8'] = 8;  ws_hd['G8'] = 40;  ws_hd['H8'] = 65;  ws_hd['I8'] = 10
ws_hd['B9'] = 520;  ws_hd['C9'] = 1100; ws_hd['D9'] = 180; ws_hd['E9'] = 280; ws_hd['F9'] = 10; ws_hd['G9'] = 55;  ws_hd['H9'] = 90;  ws_hd['I9'] = 15
ws_hd['B10'] = 640; ws_hd['C10'] = 1140; ws_hd['D10'] = 220; ws_hd['E10'] = 440; ws_hd['F10'] = 8; ws_hd['G10'] = 55; ws_hd['H10'] = 120; ws_hd['I10'] = 22

ws_hd['A11'] = 'Tổng cộng'
for col in ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']:
    ws_hd[f'{col}11'] = f'=SUM({col}5:{col}10)'

print("Updated HOAT_DONG.")

# ------------------------------------------------------------------------------
# 7. SHEET: TONG_QUAN
# ------------------------------------------------------------------------------
ws_tq = wb['TONG_QUAN']
ws_tq['B5'] = f'=COUNTA(NGUOI_DUNG!A43:A{end_usr_row})'
ws_tq['B6'] = '=DOANH_THU!E12'
ws_tq['B7'] = f'=COUNTA(DOANH_THU!A43:A{end_pay_row})'
ws_tq['B8'] = '=IFERROR(B6/B5,0)'
ws_tq['B9'] = f'=COUNTA(TIN_DANG!A41:A{end_listing_row})'
ws_tq['B10'] = '=DOANH_THU!E11'
ws_tq['B11'] = '=THU_CHI!B6'
ws_tq['B12'] = '=B10-B11'
ws_tq['A13'] = 'Lượt liên hệ chủ trọ'
ws_tq['B13'] = '=HOAT_DONG!H11'
ws_tq['C13'] = 'Lượt'
ws_tq['A14'] = 'Lượt chia sẻ tin'
ws_tq['B14'] = '=HOAT_DONG!I11'
ws_tq['C14'] = 'Lượt'
ws_tq['A15'] = 'Hồ sơ Roommate Matching'
ws_tq['B15'] = 338
ws_tq['C15'] = 'Hồ sơ'

print("Updated TONG_QUAN.")

# Save workbook to files
out_path_1 = 'C:/Users/Quan/Documents/Chuyen nganh ki 8/EXE201/UniHome_EXE201_ThongKe_BieuDo_01.xlsx'
out_path_2 = 'C:/Users/Quan/Documents/Chuyen nganh ki 8/EXE201/UniHome_EXE201_ThongKe_BieuDo_TheoTungSheet.xlsx'

try:
    wb.save(out_path_2)
    print(f"Successfully synced data to: {out_path_2}")
except Exception as e:
    print(f"Warning: Could not save to {out_path_2}: {e}")

try:
    wb.save(out_path_1)
    print(f"Successfully synced data to: {out_path_1}")
except Exception as e:
    print(f"Warning: Could not save to {out_path_1} (file is currently open in WPS/Excel): {e}")
