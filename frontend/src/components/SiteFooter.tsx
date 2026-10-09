import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16 text-gray-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <img src="/logo.png" alt="UniHome Logo" className="h-14 object-contain" />
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              UniHome — Nền tảng công nghệ tìm kiếm phòng trọ, tìm bạn ở ghép, thanh lý đồ dùng sinh viên và dịch vụ đời sống hàng đầu dành cho sinh viên Việt Nam. Chúng tôi cam kết thông tin minh bạch, xác thực và an toàn.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                <span>🛡️</span> Phòng trọ an toàn PCCC
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                <span>⚡</span> AI Roommate Matching
              </span>
            </div>
          </div>

          {/* Col 2: Dịch vụ & Tiện ích */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              Dịch vụ sinh viên
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-indigo-600 transition-colors">
                  Phòng trọ & Căn hộ mini
                </Link>
              </li>
              <li>
                <Link to="/tenant/matching" className="hover:text-indigo-600 transition-colors">
                  Tìm bạn ở ghép (Matching)
                </Link>
              </li>
              <li>
                <Link to="/secondhand" className="hover:text-indigo-600 transition-colors">
                  Chợ đồ cũ sinh viên (Pass đồ)
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-indigo-600 transition-colors">
                  Chuyển trọ & Sửa chữa
                </Link>
              </li>
              <li>
                <Link to="/promotions" className="hover:text-indigo-600 transition-colors">
                  Gói VIP & Đẩy tin nổi bật
                </Link>
              </li>
              <li>
                <Link to="/rewards" className="hover:text-indigo-600 transition-colors">
                  Tích điểm thưởng & Đổi voucher
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hỗ trợ & Chính sách */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              Hỗ trợ & Chính sách
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/terms" className="hover:text-indigo-600 transition-colors font-semibold text-indigo-600">
                  Điều khoản Dịch vụ UniHome
                </Link>
              </li>
              <li>
                <Link to="/terms#privacy" className="hover:text-indigo-600 transition-colors">
                  Chính sách bảo mật thông tin
                </Link>
              </li>
              <li>
                <Link to="/qa" className="hover:text-indigo-600 transition-colors">
                  Hỏi đáp cộng đồng (Q&A)
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-indigo-600 transition-colors">
                  Cẩm nang thuê phòng sinh viên
                </Link>
              </li>
              <li>
                <span className="text-gray-400">Quy trình giải quyết tranh chấp</span>
              </li>
              <li>
                <span className="text-gray-400">Quy chế hoạt động sàn TMĐT</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Liên hệ & Trụ sở */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              Tổng đài & Địa chỉ
            </h3>
            <div className="space-y-2.5 text-xs text-gray-500">
              <div>
                <span className="font-semibold text-gray-700 block">Hotline sinh viên:</span>
                <span className="font-mono text-indigo-600 font-bold text-sm">1900 888 666</span>
                <span className="text-[11px] text-gray-400 block">(8:00 - 21:00 hàng ngày)</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 block">Email hỗ trợ:</span>
                <a href="mailto:hotro@unihome.vn" className="hover:text-indigo-600 font-mono">
                  hotro@unihome.vn
                </a>
              </div>
              <div>
                <span className="font-semibold text-gray-700 block">Trụ sở miền Nam:</span>
                <span>Khu Công nghệ cao, TP. Thủ Đức, TP. Hồ Chí Minh</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 block">Trụ sở miền Bắc:</span>
                <span>Khu CNC Hòa Lạc, Thạch Thất, TP. Hà Nội</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            © 2026 <span className="font-bold text-gray-700">UniHome</span>. Dự án nền tảng kết nối nhà trọ sinh viên Việt Nam. Bảo lưu mọi quyền.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-gray-600">Điều khoản</Link>
            <Link to="/terms" className="hover:text-gray-600">Bảo mật</Link>
            <Link to="/qa" className="hover:text-gray-600">Trợ giúp</Link>
            <span>Phiên bản 2.4.0-complete</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
