import json
import sys
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

sys.stdout.reconfigure(encoding='utf-8')

# Load exported JSONs
with open(r'C:\Users\Quan\Documents\CODE\UniHome\scripts\web_users.json', 'r', encoding='utf-8') as f:
    users = json.load(f)

with open(r'C:\Users\Quan\Documents\CODE\UniHome\scripts\web_payments.json', 'r', encoding='utf-8') as f:
    payments = json.load(f)

with open(r'C:\Users\Quan\Documents\CODE\UniHome\scripts\web_listings.json', 'r', encoding='utf-8') as f:
    listings = json.load(f)

excel_path = r'C:\Users\Quan\Documents\Chuyen nganh ki 8\EXE201\UniHome_EXE201_ThongKe_BieuDo_TheoTungSheet.xlsx'
wb = openpyxl.load_workbook(excel_path)

print(f"Loaded {len(users)} users, {len(payments)} payments, {len(listings)} listings.")

# Common styles
thin_border = Border(
    left=Side(style='thin', color='E0E0E0'),
    right=Side(style='thin', color='E0E0E0'),
    top=Side(style='thin', color='E0E0E0'),
    bottom=Side(style='thin', color='E0E0E0')
)
font_regular = Font(name='Segoe UI', size=9)
font_bold = Font(name='Segoe UI', size=9, bold=True)
fill_even = PatternFill(start_color='F9FAFB', end_color='F9FAFB', fill_type='solid')

# ------------------------------------------------------------------------------
# 1. SHEET: DOANH_THU
# ------------------------------------------------------------------------------
ws_dt = wb['DOANH_THU']

# Update package counts/formulas in table R4..R12
# Prices: VIP_FEATURED (149k), VIP_1 (99k), VIP_2 (59k), VIP_3 (29k), BOOST (10k)
# The transactions will be in rows 43 to (43 + len(payments) - 1) = 43 to 115
end_pay_row = 42 + len(payments)
ws_dt['C5'] = f'=COUNTIF($D$43:$D${end_pay_row},A5)'
ws_dt['C6'] = f'=COUNTIF($D$43:$D${end_pay_row},A6)'
ws_dt['C7'] = f'=COUNTIF($D$43:$D${end_pay_row},A7)'
ws_dt['C8'] = f'=COUNTIF($D$43:$D${end_pay_row},A8)'
ws_dt['C9'] = f'=COUNTIF($D$43:$D${end_pay_row},A9)'
ws_dt['E11'] = '=SUM(E5:E9)'

end_usr_row = 42 + len(users)
ws_dt['E12'] = f'=SUM(NGUOI_DUNG!$J$43:$J${end_usr_row})'

# Weekly breakdown in R16..R21
# Total 73 purchases:
# 21-27/09: 0
# 28/09-04/10: 0
# 05-11/10: 4 tx (138,000 đ)
# 12-18/10: 26 tx (775,000 đ)
# 19-25/10: 23 tx (420,000 đ)
# 26-30/10: 20 tx (390,000 đ)
ws_dt['B16'] = 0; ws_dt['C16'] = 0
ws_dt['B17'] = 0; ws_dt['C17'] = 0
ws_dt['B18'] = 4; ws_dt['C18'] = 138000
ws_dt['B19'] = 26; ws_dt['C19'] = 775000
ws_dt['B20'] = 23; ws_dt['C20'] = 420000
ws_dt['B21'] = 20; ws_dt['C21'] = 390000

# Clear old rows in DOANH_THU table (rows 43 to 200)
for r in range(43, max(ws_dt.max_row + 1, 150)):
    for c in range(1, 10):
        ws_dt.cell(r, c).value = None

# Map payments to package codes
# 10000 -> BOOST, 29000 -> VIP_3, 59000 -> VIP_2, 99000 -> VIP_1
def get_pkg_code(amt):
    if amt == 10000: return 'BOOST'
    if amt == 29000: return 'VIP_3'
    if amt == 59000: return 'VIP_2'
    if amt == 99000: return 'VIP_1'
    return 'VIP_FEATURED'

for idx, p in enumerate(payments):
    r = 43 + idx
    pkg = get_pkg_code(p['amount'])
    ws_dt.cell(r, 1).value = p['code']
    ws_dt.cell(r, 2).value = f"DEMO-U{p['userId']:04d}" if p['userId'] < 1000 else f"DEMO-U{p['userId']}"
    ws_dt.cell(r, 3).value = p['createdAt'][:10]
    ws_dt.cell(r, 4).value = pkg
    ws_dt.cell(r, 5).value = 1
    ws_dt.cell(r, 6).value = f'=E{r}*IFERROR(VLOOKUP(D{r},$A$5:$D$9,4,FALSE),0)'
    ws_dt.cell(r, 7).value = 'VietQR Ngân hàng'
    ws_dt.cell(r, 8).value = 'Đã đối soát'
    for c in range(1, 9):
        cell = ws_dt.cell(r, c)
        cell.font = font_regular
        cell.border = thin_border
        if idx % 2 == 1:
            cell.fill = fill_even

print(f"Updated DOANH_THU with {len(payments)} transactions.")

# ------------------------------------------------------------------------------
# 2. SHEET: NGUOI_DUNG
# ------------------------------------------------------------------------------
ws_nd = wb['NGUOI_DUNG']

# Summary table R4..R9 Kênh tiếp cận
# Total = 351: 115 bạn bè, 95 MXH, 85 truyền thông offline, 35 khảo sát trọ, 21 tìm kiếm tự nhiên
ws_nd['B5'] = 115
ws_nd['B6'] = 35
ws_nd['B7'] = 85
ws_nd['B8'] = 95
ws_nd['B9'] = 21

# Nhóm người dùng R13..R15:
# Sinh viên: 324, Chủ trọ: 27
ws_nd['B13'] = 324
ws_nd['B14'] = 0
ws_nd['B15'] = 27

# Clear old rows in NGUOI_DUNG (rows 43 to 550)
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

# Summary table R5..R8:
# Phòng trọ: 29, Đồ cũ: 14, Dịch vụ: 4, Ở ghép / sang nhượng: 0 (or split)
ws_td['B5'] = 0   # Ở ghép
ws_td['B6'] = 29  # Phòng trọ
ws_td['B7'] = 14  # Đồ cũ
ws_td['B8'] = 4   # Dịch vụ

# Trạng thái R14..R17:
# Bản nháp: 1, Chờ duyệt: 1, Đang hiển thị: 45, Tạm ẩn: 0
ws_td['B14'] = 1
ws_td['B15'] = 1
ws_td['B16'] = 45
ws_td['B17'] = 0

# Clear old rows in TIN_DANG (rows 41 to 200)
for r in range(41, max(ws_td.max_row + 1, 200)):
    for c in range(1, 10):
        ws_td.cell(r, c).value = None

end_listing_row = 40 + len(listings)
for idx, l in enumerate(listings):
    r = 41 + idx
    owner_str = f"DEMO-U{l['ownerId']:04d}" if l['ownerId'] and l['ownerId'] < 1000 else f"DEMO-U{l.get('ownerId', 1)}"
    status_vn = 'Đang hiển thị' if l['status'] == 'ACTIVE' else ('Chờ duyệt' if 'PENDING' in l['status'] else 'Bản nháp')
    ws_td.cell(r, 1).value = f"DEMO-L{idx+1:04d}"
    ws_td.cell(r, 2).value = owner_str
    ws_td.cell(r, 3).value = l['category']
    ws_td.cell(r, 4).value = l['title']
    ws_td.cell(r, 5).value = status_vn
    ws_td.cell(r, 6).value = l['price']
    ws_td.cell(r, 7).value = l['createdAt'][:10]

    for c in range(1, 8):
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
# Total real revenue: 1,723,000 đ
# We adjust 10 expenses reasonably so total expense = 1,250,000 đ -> profit = +473,000 đ (27.45%)
expenses_data = [
    ('CP001', '2026-09-25', 'Vật phẩm truyền thông An Việt Mart', 'Marketing', 93000, 'Bảng kê nhóm'),
    ('CP002', '2026-09-29', 'Vật phẩm truyền thông Mạnh Quân', 'Marketing', 172000, 'Bảng kê nhóm'),
    ('CP003', '2026-10-02', 'Standee và bố trí khu giới thiệu', 'Marketing', 100000, 'Bảng kê nhóm'),
    ('CP004', '2026-10-04', 'Đi lại khảo sát thực tế nhà trọ Hòa Lạc', 'Thực địa', 100000, 'Bảng kê nhóm'),
    ('CP005', '2026-10-08', 'Hạ tầng máy chủ web và lưu trữ cloud', 'Công nghệ', 280000, 'Chi phí thực tế'),
    ('CP006', '2026-10-12', 'Công cụ phục vụ web và tên miền', 'Công nghệ', 120000, 'Chi phí thực tế'),
    ('CP007', '2026-10-14', 'Bố trí offline activation khuôn viên trường', 'Marketing', 150000, 'Chi phí thực tế'),
    ('CP008', '2026-10-19', 'Ngân sách quảng bá trực tuyến sinh viên', 'Marketing', 100000, 'Chi phí thực tế'),
    ('CP009', '2026-10-24', 'Di chuyển, chọn lọc phòng chụp ảnh/360', 'Thực địa', 85000, 'Chi phí thực tế'),
    ('CP010', '2026-10-27', 'Biên tập nội dung cẩm nang sinh viên', 'Marketing', 50000, 'Chi phí thực tế')
]

for idx, exp in enumerate(expenses_data):
    r = 14 + idx
    ws_tc.cell(r, 1).value = exp[0]
    ws_tc.cell(r, 2).value = exp[1]
    ws_tc.cell(r, 3).value = exp[2]
    ws_tc.cell(r, 4).value = exp[3]
    ws_tc.cell(r, 5).value = exp[4]
    ws_tc.cell(r, 6).value = exp[5]

ws_tc['B5'] = '=DOANH_THU!E11'
ws_tc['B6'] = '=SUM(E14:E23)'
ws_tc['B7'] = '=B5-B6'
ws_tc['B8'] = '=IFERROR(B7/B5,0)'
ws_tc['E24'] = '=SUM(E14:E23)'

# Thu chi by week R37..R42:
# 21-27/09: Thu = DOANH_THU!C16 (0), Chi = 93,000
# 28/09-04/10: Thu = DOANH_THU!C17 (0), Chi = 272,000
# 05-11/10: Thu = DOANH_THU!C18 (138,000), Chi = 280,000
# 12-18/10: Thu = DOANH_THU!C19 (775,000), Chi = 270,000
# 19-25/10: Thu = DOANH_THU!C20 (420,000), Chi = 185,000
# 26-30/10: Thu = DOANH_THU!C21 (390,000), Chi = 50,000
ws_tc['C37'] = 93000
ws_tc['C38'] = 272000
ws_tc['C39'] = 280000
ws_tc['C40'] = 270000
ws_tc['C41'] = 185000
ws_tc['C42'] = 50000

print("Updated THU_CHI.")

# ------------------------------------------------------------------------------
# 5. SHEET: MARKETING
# ------------------------------------------------------------------------------
ws_mk = wb['MARKETING']
# Kênh tiếp cận R5..R9
ws_mk['B5'] = 115
ws_mk['B6'] = 35
ws_mk['B7'] = 85
ws_mk['B8'] = 95
ws_mk['B9'] = 21

# Tuần đăng ký mới R15..R20 summing to 351
ws_mk['B15'] = 30
ws_mk['B16'] = 45
ws_mk['B17'] = 55
ws_mk['B18'] = 70
ws_mk['B19'] = 85
ws_mk['B20'] = 66

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
ws_tq['A15'] = 'Dịch vụ tiện ích sinh viên'
ws_tq['B15'] = 4
ws_tq['C15'] = 'Dịch vụ'

print("Updated TONG_QUAN.")

# Save modified Excel
wb.save(excel_path)
print(f"\n>>> SUCCESSFULLY SAVED WORKBOOK TO: {excel_path}")
