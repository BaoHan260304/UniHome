path = 'frontend/src/pages/AdminDashboard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace card in overview tab
old1 = """            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700">Dịch vụ tiện ích sinh viên</span>
                <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-sm font-bold">🛠️</span>
              </div>
              <div className="text-2xl font-black text-teal-700 mt-2">4</div>
              <div className="text-[11px] text-gray-400 mt-1">Chuyển trọ, giặt ủi, sửa điện nước</div>
            </div>"""

new1 = """            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700">Lượt kết nối chủ trọ</span>
                <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-sm font-bold">📞</span>
              </div>
              <div className="text-2xl font-black text-teal-700 mt-2">355+</div>
              <div className="text-[11px] text-gray-400 mt-1">Liên hệ trực tiếp qua Zalo / SĐT</div>
            </div>"""

# Replace card in analytics tab
old2 = """            <div className="bg-white p-4 rounded-2xl border shadow-xs">
              <span className="text-xs text-gray-500 font-medium">Dịch vụ tiện ích sinh viên</span>
              <div className="text-xl font-extrabold text-teal-700 mt-1">
                4 dịch vụ
              </div>
              <div className="text-[11px] text-teal-600 mt-0.5">
                Chuyển trọ, giặt ủi, sửa điện nước
              </div>
            </div>"""

new2 = """            <div className="bg-white p-4 rounded-2xl border shadow-xs">
              <span className="text-xs text-gray-500 font-medium">Lượt kết nối chủ trọ</span>
              <div className="text-xl font-extrabold text-teal-700 mt-1">
                355 lượt
              </div>
              <div className="text-[11px] text-teal-600 mt-0.5">
                Liên hệ trực tiếp qua Zalo / SĐT
              </div>
            </div>"""

text_norm = text.replace('\r\n', '\n')
old1_norm = old1.replace('\r\n', '\n')
new1_norm = new1.replace('\r\n', '\n')
old2_norm = old2.replace('\r\n', '\n')
new2_norm = new2.replace('\r\n', '\n')

print('Found old1:', old1_norm in text_norm)
print('Found old2:', old2_norm in text_norm)

if old1_norm in text_norm:
    text_norm = text_norm.replace(old1_norm, new1_norm)
if old2_norm in text_norm:
    text_norm = text_norm.replace(old2_norm, new2_norm)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(text_norm)
print('Updated AdminDashboard.tsx!')
