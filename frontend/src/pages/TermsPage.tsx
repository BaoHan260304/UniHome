import { Link } from 'react-router-dom';

export const TERMS_SECTIONS = [
  { id: 1, title: '1. Giới thiệu và Phạm vi áp dụng', content: 'Điều khoản Dịch vụ này ("Điều khoản") quy định các quyền, nghĩa vụ và trách nhiệm giữa người dùng ("Bạn") và Nền tảng Công nghệ UniHome ("UniHome", "Chúng tôi") đối với việc truy cập và sử dụng toàn bộ hệ thống website, ứng dụng di động, các dịch vụ tìm kiếm phòng trọ, ghép bạn cùng phòng, tiện ích sinh viên và mua bán đồ cũ.' },
  { id: 2, title: '2. Định nghĩa các thuật ngữ', content: 'Trong khuôn khổ văn bản này: "Khách thuê/Sinh viên" là người dùng có nhu cầu tìm phòng hoặc tìm bạn ở ghép; "Chủ nhà/Chủ trọ" là cá nhân hoặc tổ chức sở hữu hoặc đại diện quản lý bất động sản cho thuê; "Nhà cung cấp dịch vụ" là đối tác cung cấp dịch vụ vận chuyển, giặt ủi, sửa chữa, dọn dẹp; "Listing/Tin đăng" là thông tin mô tả phòng trọ hoặc sản phẩm được đăng trên hệ thống.' },
  { id: 3, title: '3. Điều kiện đăng ký tài khoản', content: 'Người dùng phải từ đủ 16 tuổi trở lên hoặc có sự đồng ý của người giám hộ hợp pháp. Bạn cam kết cung cấp thông tin chính xác, đầy đủ và cập nhật về họ tên, số điện thoại, email và trường học. Mỗi số điện thoại hoặc email chỉ được liên kết với một tài khoản UniHome duy nhất.' },
  { id: 4, title: '4. Bảo mật thông tin đăng nhập', content: 'Bạn có trách nhiệm bảo mật mật khẩu và thông tin xác thực tài khoản của mình. UniHome không chịu trách nhiệm đối với bất kỳ tổn thất nào phát sinh từ việc bạn chia sẻ mật khẩu hoặc để lộ thông tin cho bên thứ ba. Hãy thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép.' },
  { id: 5, title: '5. Xác thực tài khoản và Định danh (eKYC / OTP)', content: 'UniHome áp dụng xác thực qua mã OTP Email và Số điện thoại (SMS). Để tăng độ tin cậy, người dùng có thể thực hiện liên kết thẻ sinh viên hoặc CCCD để nhận huy hiệu "Đã xác thực" (Verified Badge).' },
  { id: 6, title: '6. Quy định đối với Chủ trọ & Đăng tin phòng', content: 'Chủ trọ cam kết chỉ đăng tải thông tin có thật, hình ảnh thực tế của phòng trọ. Nghiêm cấm hành vi treo đầu dê bán thịt chó, đăng ảnh phòng mẫu cao cấp nhưng dẫn khách đến phòng kém chất lượng, hoặc tự ý nâng giá điện nước vượt khung quy định.' },
  { id: 7, title: '7. Tiêu chuẩn hình ảnh và phương tiện truyền thông (Media)', content: 'Tin đăng gửi duyệt phải có tối thiểu 04 hình ảnh rõ nét chụp các góc thực tế (toàn cảnh phòng, lối vào, nhà vệ sinh, khu vực bếp/chung). Hình ảnh không được chứa nội dung đồi trụy, bản quyền của bên thứ ba không được phép, hoặc thông tin liên hệ ẩn trên ảnh nhằm lách hệ thống.' },
  { id: 8, title: '8. Quy chuẩn an toàn Phòng cháy chữa cháy (PCCC)', content: 'Chủ trọ có nghĩa vụ khai báo trung thực tình trạng trang bị PCCC tại cơ sở cho thuê: lối thoát hiểm thứ 2, bình chữa cháy, chuông báo khói và khu vực sạc xe điện an toàn. UniHome bảo lưu quyền từ chối hoặc gỡ bỏ các tin đăng tại khu vực bị cơ quan chức năng đình chỉ hoạt động.' },
  { id: 9, title: '9. Quy định về Tính năng Tìm bạn cùng phòng (Matching)', content: 'Tính năng Matching hoạt động dựa trên thuật toán tương thích về thói quen sinh hoạt, ngân sách, giới tính và khoảng cách địa lý. Người dùng chỉ trao đổi thông tin liên lạc cá nhân khi cả hai bên cùng bật trạng thái tìm bạn và đạt mức tương thích phù hợp.' },
  { id: 10, title: '10. Tính năng Nhắn tin (Chat) và Chuẩn mực ứng xử', content: 'Người dùng cam kết giao tiếp văn minh, tôn trọng lẫn nhau. Nghiêm cấm mọi hành vi quấy rối tình dục, đe dọa, xúc phạm danh dự nhân phẩm, gửi tin nhắn rác (spam) hoặc dụ dỗ lừa đảo. Mọi tin nhắn vi phạm sẽ bị khóa tài khoản vĩnh viễn khi có báo cáo xác thực.' },
  { id: 11, title: '11. Cơ chế Chặn và Báo cáo vi phạm (Block & Report)', content: 'Bạn có toàn quyền chặn (block) người dùng khác và ẩn cuộc trò chuyện bất kỳ lúc nào. Khi bạn chặn một người, họ sẽ không thể gửi tin nhắn, xem thông tin số điện thoại hoặc kết nối ghép phòng với bạn.' },
  { id: 12, title: '12. Mua bán đồ cũ (Marketplace / Second-hand)', content: 'UniHome cung cấp không gian kết nối chuyển nhượng đồ cũ giữa các sinh viên. Người mua và người bán tự thỏa thuận về tình trạng sản phẩm, phương thức giao nhận và thanh toán. UniHome khuyến nghị kiểm tra trực tiếp sản phẩm trước khi thanh toán tiền.' },
  { id: 13, title: '13. Dịch vụ tiện ích sinh viên (Services)', content: 'Các đối tác cung cấp dịch vụ chuyển trọ, giặt ủi, sửa chữa điện nước trên UniHome là các đơn vị độc lập. Giá cước và chất lượng dịch vụ được niêm yết công khai. UniHome hỗ trợ tiếp nhận phản ánh và xử lý khiếu nại dịch vụ.' },
  { id: 14, title: '14. Điểm thưởng thành viên & Tích lũy (UniHome Rewards)', content: 'Điểm UniHome là điểm thưởng thân thiết được cấp qua hoạt động điểm danh hàng ngày, hoàn thành hồ sơ cá nhân và đóng góp đánh giá khách quan. Điểm thưởng không có giá trị quy đổi thành tiền mặt nhưng được sử dụng để đổi các voucher đối tác.' },
  { id: 15, title: '15. Quy chế Đổi Voucher và Mã ưu đãi đối tác', content: 'Voucher đổi từ Điểm UniHome có thời hạn và điều kiện sử dụng do đối tác quy định. Mỗi voucher được cấp kèm mã bí mật hoặc mã QR xác thực. Sau khi đổi, điểm thưởng sẽ không được hoàn lại trừ trường hợp lỗi kỹ thuật từ hệ thống.' },
  { id: 16, title: '16. Ví điện tử nội bộ và Nạp tiền (UniHome Wallet)', content: 'Ví UniHome dùng để thanh toán các gói đăng tin VIP, dịch vụ đẩy tin (Boost) và gói truyền thông quảng cáo. Tiền nạp vào ví được ghi nhận là khoản tiền gửi của khách hàng và chỉ được chuyển đổi thành doanh thu khi bạn chi tiêu dịch vụ.' },
  { id: 17, title: '17. Gói tin đăng VIP và Đẩy tin (VIP Packages & Boost)', content: 'Các gói VIP Diamond, Gold, Silver và Boost giúp tin đăng hiển thị tại các vị trí ưu tiên và tiếp cận nhiều sinh viên hơn. Thời hạn gói được tính theo số ngày kích hoạt và tự động hạ về tin thường khi hết hạn.' },
  { id: 18, title: '18. Dịch vụ Quảng cáo Banner (Advertisements)', content: 'Các nhãn hàng và đối tác quảng cáo trên UniHome phải tuân thủ Luật Quảng cáo Việt Nam. Nội dung banner không chứa thông tin sai sự thật, cờ bạc, hàng cấm hoặc nội dung độc hại với lứa tuổi sinh viên.' },
  { id: 19, title: '19. Phí dịch vụ và Chính sách hoàn tiền (Refund Policy)', content: 'Các khoản phí mua gói tin và dịch vụ đẩy tin khi đã kích hoạt thành công trên hệ thống sẽ không được hoàn trả, trừ trường hợp lỗi kỹ thuật từ hệ thống làm tin đăng không hiển thị quá 48 giờ liên tục.' },
  { id: 20, title: '20. Quyền sở hữu trí tuệ', content: 'Toàn bộ giao diện, thiết kế, thương hiệu, logo UniHome, mã nguồn và cơ sở dữ liệu thuộc quyền sở hữu trí tuệ độc quyền của UniHome. Nghiêm cấm sao chép, trích xuất dữ liệu tự động (scraping) mà không có sự đồng ý bằng văn bản.' },
  { id: 21, title: '21. Bảo mật dữ liệu cá nhân (Chính sách quyền riêng tư)', content: 'UniHome cam kết bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP. Thông tin liên hệ của bạn chỉ được hiển thị khi bạn cho phép hoặc khi người dùng đã đăng nhập nhấn "Hiện số điện thoại" và được hệ thống lưu vết an toàn.' },
  { id: 22, title: '22. Kiểm duyệt nội dung và Trách nhiệm miễn trừ', content: 'Đội ngũ Kiểm duyệt viên UniHome rà soát tin đăng trước khi hiển thị. Tuy nhiên, UniHome đóng vai trò là sàn thương mại kết nối và không phải là bên trực tiếp ký hợp đồng thuê trọ. Người dùng có trách nhiệm kiểm tra thực địa trước khi ký hợp đồng và thanh toán tiền cọc.' },
  { id: 23, title: '23. Xử lý vi phạm và Khóa tài khoản', content: 'UniHome có quyền cảnh cáo, tạm dừng hoặc khóa vĩnh viễn tài khoản người dùng vi phạm Điều khoản dịch vụ, có dấu hiệu lừa đảo, hoặc có nhiều phản hồi tiêu cực từ cộng đồng mà không cần báo trước.' },
  { id: 24, title: '24. Giải quyết tranh chấp và Khiếu nại', content: 'Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết qua thương lượng hòa giải. Trường hợp không đạt được thỏa thuận, vụ việc sẽ được đưa ra giải quyết tại Tòa án có thẩm quyền tại Thành phố Hà Nội theo quy định của pháp luật Việt Nam.' },
  { id: 25, title: '25. Sửa đổi và Cập nhật Điều khoản', content: 'UniHome có thể điều chỉnh Điều khoản này bất kỳ lúc nào để phù hợp với quy định pháp luật và hoạt động thực tế. Khi có sửa đổi lớn, chúng tôi sẽ thông báo trên trang chủ hoặc gửi thông báo trong ứng dụng.' },
  { id: 26, title: '26. Thông tin liên hệ và Hỗ trợ khách hàng', content: 'Mọi thắc mắc hoặc yêu cầu hỗ trợ, vui lòng liên hệ: Ban Quản Trị UniHome • Email: support@unihome.vn • Hotline: 1900 6868 (8:00 - 21:00 hàng ngày) • Địa chỉ: Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội.' }
];

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs mb-8 text-center">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block mb-3">
          Văn bản pháp lý chính thức
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Điều khoản Dịch vụ & Quy chế Hoạt động UniHome
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Phiên bản 2026.1 • Áp dụng từ ngày 01 tháng 01 năm 2026 • Tuân thủ pháp luật Nước CHXHCN Việt Nam
        </p>
      </div>

      {/* Terms Body */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xs space-y-6">
        <p className="text-sm text-gray-600 leading-relaxed italic border-l-4 border-indigo-500 pl-4 py-1">
          Bằng việc truy cập, tạo tài khoản hoặc sử dụng bất kỳ dịch vụ nào trên UniHome, bạn xác nhận đã đọc kỹ, hiểu rõ và đồng ý bị ràng buộc bởi toàn bộ các điều khoản và quy chế dưới đây.
        </p>

        <div className="divide-y divide-gray-100">
          {TERMS_SECTIONS.map((sec) => (
            <div key={sec.id} className="py-5">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-extrabold flex items-center justify-center">
                  {sec.id}
                </span>
                {sec.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed pl-8">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <span>Bản quyền © 2026 UniHome. Tất cả quyền được bảo lưu.</span>
          <Link to="/" className="text-indigo-600 font-bold hover:underline">
            Quay lại Trang chủ UniHome →
          </Link>
        </div>
      </div>
    </div>
  );
}
