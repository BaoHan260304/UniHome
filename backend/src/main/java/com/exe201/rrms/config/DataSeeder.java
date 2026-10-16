package com.exe201.rrms.config;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.repository.*;
import com.exe201.rrms.util.PasswordUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {
    private final PackagePlanRepository plans;
    private final UserRepository users;
    private final PropertyRepository properties;
    private final ListingRepository listings;
    private final VerificationRecordRepository verifications;
    private final ReviewRepository reviews;
    private final ServiceListingRepository services;
    private final SecondHandListingRepository secondHand;
    private final MarketplaceCommentRepository comments;
    private final BlogPostRepository blogs;
    private final QuestionRepository questions;
    private final AnswerRepository answers;
    private final AdvertisementRepository ads;
    private final MatchingProfileRepository matchingProfiles;
    private final ListingInterestRepository interests;

    public DataSeeder(PackagePlanRepository plans, UserRepository users, PropertyRepository properties,
                      ListingRepository listings, VerificationRecordRepository verifications,
                      ReviewRepository reviews, ServiceListingRepository services,
                      SecondHandListingRepository secondHand, MarketplaceCommentRepository comments,
                      BlogPostRepository blogs, QuestionRepository questions, AnswerRepository answers,
                      AdvertisementRepository ads, MatchingProfileRepository matchingProfiles,
                      ListingInterestRepository interests) {
        this.plans = plans; this.users = users; this.properties = properties; this.listings = listings;
        this.verifications = verifications; this.reviews = reviews; this.services = services;
        this.secondHand = secondHand; this.comments = comments; this.blogs = blogs;
        this.questions = questions; this.answers = answers; this.ads = ads;
        this.matchingProfiles = matchingProfiles; this.interests = interests;
    }

    @Override
    public void run(String... args) {
        seedPlans();
        DemoUsers demo = seedUsers();
        migrateLegacyProperties();
        List<Listing> demoListings = seedRooms(demo.landlord());
        seedVerificationAndReviews(demo, demoListings);
        seedServices(demo.provider());
        seedSecondHand(demo.student1(), demo.student2());
        seedBlogs(demo.admin());
        seedQa(demo.student1(), demo.landlord(), demo.admin());
        seedAds();
        seedMatching(demo, demoListings);
    }

    private void seedPlans() {
        if (plans.count() > 0) return;
        plans.saveAll(List.of(
                plan("FREE", "Tin thường", 0L, 15, 0, false, 0, "Đăng miễn phí; sau 15 ngày cần xác nhận lại tình trạng phòng."),
                plan("VIP3", "Tin VIP 3", 29000L, 5, 20, false, 0, "Ưu tiên hiển thị sau khi qua bộ lọc phù hợp; huy hiệu VIP 3."),
                plan("VIP2", "Tin VIP 2", 59000L, 10, 35, false, 1, "Ưu tiên cao hơn VIP 3; 1 lượt đẩy tin."),
                plan("VIP1", "Tin VIP 1", 99000L, 15, 50, true, 2, "Nổi bật hơn trong danh sách phù hợp; 2 lượt đẩy tin."),
                plan("FEATURED", "Tin VIP Nổi bật", 149000L, 30, 70, true, 4, "Vị trí nổi bật trong nhóm kết quả phù hợp; 4 lượt đẩy tin."),
                plan("BOOST", "Đẩy tin", 10000L, 1, 30, false, 0, "Tăng ưu tiên tạm thời cho tin đang hoạt động, không thay đổi độ phù hợp.")
        ));
    }

    private PackagePlan plan(String code, String name, Long price, int days, int priority, boolean featured, int boostCredits, String benefits) {
        PackagePlan p = new PackagePlan();
        p.setCode(code); p.setName(name); p.setPrice(price); p.setDurationDays(days);
        p.setPriority(priority); p.setFeatured(featured); p.setBoostCredits(boostCredits);
        p.setBenefits(benefits); p.setActive(true); p.setProductType("LISTING");
        return p;
    }

    private DemoUsers seedUsers() {
        User admin = upsertUser("admin@unihome.vn", "UniHome Admin", "SUPER_ADMIN", "0900000001", "Nam", "FPT University");
        User landlord = upsertUser("landlord@unihome.vn", "Chủ trọ Minh Anh", "LANDLORD", "0900000002", "Nam", null);
        User provider = upsertUser("service@unihome.vn", "UniMove Hòa Lạc", "SERVICE_PROVIDER", "0900000003", "Nam", null);
        User student1 = upsertUser("student@unihome.vn", "Nguyễn Minh An", "TENANT", "0900000011", "Nam", "FPT University");
        User student2 = upsertUser("student2@unihome.vn", "Trần Đức Huy", "TENANT", "0900000012", "Nam", "Đại học Quốc gia Hà Nội");
        User student3 = upsertUser("student3@unihome.vn", "Lê Hoàng Nam", "TENANT", "0900000013", "Nam", "FPT University");
        return new DemoUsers(admin, landlord, provider, student1, student2, student3);
    }

    private User upsertUser(String email, String name, String role, String phone, String gender, String school) {
        return users.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email); u.setFullName(name); u.setRole(role); u.setStatus("ACTIVE");
            u.setPhone(phone); u.setGender(gender); u.setSchoolName(school);
            u.setPassword(PasswordUtil.hash("123456"));
            u.setAvatarUrl("https://ui-avatars.com/api/?name=" + name.replace(" ", "+") + "&background=4f46e5&color=fff");
            u.setBio(role.equals("LANDLORD") ? "Chủ trọ đã tham gia UniHome và hỗ trợ sinh viên tìm phòng minh bạch." : "Tài khoản demo UniHome phục vụ kiểm thử giao diện và nghiệp vụ.");
            u.setHomeLat(21.0133); u.setHomeLng(105.5278); u.setMatchingRadiusKm(5);
            u.setIsLookingForRoommate("TENANT".equals(role));
            u.setFacebookUrl("https://facebook.com/"); u.setZaloUrl("https://zalo.me/");
            return users.save(u);
        });
    }

    private void migrateLegacyProperties() {
        for (Property p : properties.findAll()) {
            if (!listings.findByPropertyId(p.getId()).isEmpty()) continue;
            Listing l = new Listing();
            l.setPropertyId(p.getId()); l.setLandlordId(p.getLandlordId()); l.setTitle(p.getName());
            String oldStatus = p.getStatus() == null ? "" : p.getStatus();
            l.setStatus("DRAFT".equalsIgnoreCase(oldStatus) ? "DRAFT" : "ACTIVE");
            l.setPublishedAt("DRAFT".equals(l.getStatus()) ? null : LocalDateTime.now());
            l.setLastConfirmedAt(LocalDateTime.now()); l.setFreshnessDueAt(LocalDateTime.now().plusDays(15));
            l.setPackageTier("FREE"); l.setPackagePriority(0); listings.save(l);
        }
    }

    private List<Listing> seedRooms(User landlord) {
        if (properties.count() > 0 && listings.count() > 0) return listings.findAll();
        Property p1 = property(landlord, "Trọ sinh viên Minh Anh - Hòa Lạc", "Thạch Hòa", "Thạch Thất", 2800000L, 24.0, "1, 2", 2, "FPT University", 1.2, "/demo/room-1.png");
        p1.setDeposit(2800000L); p1.setElectricityPrice(3800L); p1.setWaterPrice(100000L); p1.setInternetPrice(100000L); p1.setParkingFee(80000L);
        p1.setAmenities("Điều hòa|Nóng lạnh|Máy giặt chung|Wifi|Chỗ để xe|Camera an ninh");
        p1.setRules("Không hút thuốc trong phòng|Giữ yên tĩnh sau 23h|Không sử dụng chất kích thích");
        p1 = properties.save(p1);

        Property p2 = property(landlord, "Phòng studio gần ĐHQG Hòa Lạc", "Tân Xã", "Thạch Thất", 3500000L, 30.0, "3", 2, "Đại học Quốc gia Hà Nội", 2.4, "/demo/room-2.png");
        p2.setDeposit(3500000L); p2.setElectricityPrice(4000L); p2.setWaterPrice(120000L); p2.setAmenities("Điều hòa|Bếp riêng|WC riêng|Ban công|Wifi");
        p2 = properties.save(p2);

        Property p3 = property(landlord, "Phòng ở ghép tiết kiệm cho sinh viên", "Bình Yên", "Thạch Thất", 1800000L, 28.0, "2", 3, "FPT University", 3.5, "/demo/room-1.png");
        p3.setDeposit(1800000L); p3.setElectricityPrice(3500L); p3.setWaterPrice(80000L); p3.setPropertyType("Ở ghép"); p3.setAmenities("Giường|Tủ cá nhân|Wifi|Máy giặt chung");
        p3 = properties.save(p3);

        Listing l1 = listing(p1, landlord, "Phòng đẹp 2.8 triệu gần FPT - đã xác minh", "FEATURED", 70);
        Listing l2 = listing(p2, landlord, "Studio 30m² gần ĐHQG - vào ở ngay", "VIP1", 50);
        Listing l3 = listing(p3, landlord, "Ở ghép sinh viên - chi phí tiết kiệm", "FREE", 0);
        return List.of(l1, l2, l3);
    }

    private Property property(User landlord, String name, String ward, String district, Long price, Double area, String floor, int max, String school, double schoolKm, String image) {
        Property p = new Property();
        p.setLandlordId(landlord.getId()); p.setName(name); p.setProvince("Hà Nội"); p.setDistrict(district); p.setWard(ward); p.setStreet("Khu đô thị Hòa Lạc");
        p.setLatitude(21.0133); p.setLongitude(105.5278); p.setPrice(price); p.setArea(area); p.setPropertyType("Phòng trọ"); p.setPostType("CHO_THUE");
        p.setTotalRooms(12); p.setTotalFloors(4); p.setFloorText(floor); p.setMaxOccupants(max); p.setNearestSchool(school); p.setNearestSchoolDistanceKm(schoolKm);
        p.setContactPhone(landlord.getPhone()); p.setContactZalo("https://zalo.me/" + landlord.getPhone()); p.setAvailability("AVAILABLE"); p.setLastAvailabilityConfirmedAt(LocalDateTime.now());
        p.setDescription("Phòng sạch sẽ, thông tin chi phí minh bạch, phù hợp sinh viên. Có thể xem phòng trực tiếp và trao đổi với chủ trọ qua UniHome."); p.setImageUrl(image);
        return p;
    }

    private Listing listing(Property p, User landlord, String title, String tier, int priority) {
        Listing l = new Listing(); l.setPropertyId(p.getId()); l.setLandlordId(landlord.getId()); l.setTitle(title); l.setStatus("ACTIVE");
        l.setPackageTier(tier); l.setPackagePriority(priority); l.setPublishedAt(LocalDateTime.now().minusDays(2)); l.setLastConfirmedAt(LocalDateTime.now()); l.setFreshnessDueAt(LocalDateTime.now().plusDays(15));
        if (!"FREE".equals(tier)) l.setPackageUntil(LocalDateTime.now().plusDays(15));
        return listings.save(l);
    }

    private void seedVerificationAndReviews(DemoUsers demo, List<Listing> ls) {
        if (ls.isEmpty()) return;
        Listing first = ls.get(0);
        if (verifications.findByListingIdOrderByCreatedAtDesc(first.getId()).isEmpty()) {
            VerificationRecord v = new VerificationRecord(); v.setPropertyId(first.getPropertyId()); v.setListingId(first.getId()); v.setVerifierId(demo.admin().getId());
            v.setLevel("ON_SITE_VERIFIED"); v.setStatus("VERIFIED"); v.setRoomExists(true); v.setLocationVerified(true); v.setMediaVerified(true); v.setPriceVerified(true); v.setUtilityVerified(true); v.setAmenityVerified(true); v.setAvailabilityVerified(true);
            v.setNote("Demo: UniHome đã kiểm tra vị trí, ảnh/video, giá thuê, điện nước và tình trạng còn phòng."); v.setVerifiedAt(LocalDateTime.now().minusDays(1)); v.setExpiresAt(LocalDateTime.now().plusMonths(3)); verifications.save(v);
        }
        if (reviews.findByPropertyIdAndStatusOrderByCreatedAtDesc(first.getPropertyId(), "VISIBLE").isEmpty()) {
            Review r = new Review(); r.setPropertyId(first.getPropertyId()); r.setUserId(demo.student2().getId()); r.setRating(5); r.setAccuracyRating(5); r.setPriceTransparencyRating(5); r.setUtilityTransparencyRating(4); r.setLandlordCommunicationRating(5); r.setComment("Thông tin khá sát thực tế, chủ trọ phản hồi nhanh và báo rõ tiền điện nước."); reviews.save(r);
        }
    }

    private void seedServices(User provider) {
        if (services.count() > 0) return;
        services.save(service(provider, "Moving", "Chuyển trọ sinh viên Hòa Lạc", "Nhận chuyển đồ, vali, bàn ghế nhỏ; báo giá trước khi đi.", 120000L, true));
        services.save(service(provider, "Cleaning", "Dọn phòng trước khi chuyển vào", "Vệ sinh sàn, WC, khu bếp và cửa kính cho phòng sinh viên.", 150000L, false));
        services.save(service(provider, "Repair", "Sửa điện nước tại phòng trọ", "Hỗ trợ thay vòi, bóng đèn, ổ cắm và xử lý sự cố nhỏ.", 80000L, false));
        services.save(service(provider, "Internet", "Lắp Internet sinh viên", "Tư vấn gói Internet theo khu vực và nhu cầu học online.", 180000L, true));
    }

    private ServiceListing service(User provider, String category, String title, String description, Long price, boolean featured) {
        ServiceListing s = new ServiceListing(); s.setProviderId(provider.getId()); s.setCategory(category); s.setTitle(title); s.setDescription(description); s.setPriceFrom(price); s.setProvince("Hà Nội"); s.setDistrict("Thạch Thất"); s.setPhone(provider.getPhone()); s.setZaloUrl("https://zalo.me/" + provider.getPhone()); s.setImageUrl("/demo/service-moving.png"); s.setStatus("ACTIVE"); s.setFeatured(featured); return s;
    }

    private void seedSecondHand(User seller1, User seller2) {
        if (secondHand.count() > 0) return;
        SecondHandListing a = item(seller1, "Bàn học gỗ còn tốt", "Nội thất", 250000L, "Đã qua sử dụng", "Bàn chắc chắn, phù hợp phòng trọ sinh viên. Có thể xem trực tiếp tại Hòa Lạc.");
        SecondHandListing b = item(seller2, "Quạt đứng sinh viên", "Đồ gia dụng", 180000L, "Còn tốt", "Quạt chạy êm, ba mức gió, ưu tiên người lấy gần FPT.");
        SecondHandListing c = item(seller1, "Combo sách tiếng Anh năm nhất", "Sách / học tập", 120000L, "Đã qua sử dụng", "Sách còn đủ trang, có ghi chú nhẹ bằng bút chì.");
        secondHand.saveAll(List.of(a,b,c));
        MarketplaceComment cm = new MarketplaceComment(); cm.setListingId(a.getId()); cm.setUserId(seller2.getId()); cm.setContent("Bàn còn không bạn? Mình ở gần Hòa Lạc."); comments.save(cm);
    }

    private SecondHandListing item(User seller, String title, String category, Long price, String condition, String description) {
        SecondHandListing x = new SecondHandListing(); x.setSellerId(seller.getId()); x.setTitle(title); x.setCategory(category); x.setPrice(price); x.setConditionText(condition); x.setProvince("Hà Nội"); x.setDistrict("Thạch Thất"); x.setDescription(description); x.setImageUrl("/demo/secondhand-desk.png"); x.setStatus("ACTIVE"); return x;
    }

    private void seedBlogs(User admin) {
        if (blogs.count() > 0) return;
        blogs.save(blog(admin, "PCCC", "Checklist PCCC sinh viên nên kiểm tra trước khi thuê trọ", "Một checklist ngắn giúp bạn quan sát lối thoát, thiết bị chữa cháy và các nguy cơ điện trước khi quyết định thuê.", "1. Kiểm tra lối thoát và cầu thang\n\nKhông để đồ đạc chắn lối đi. Hỏi rõ lối thoát khi có sự cố.\n\n2. Kiểm tra bình chữa cháy và cảnh báo\n\nQuan sát vị trí bình chữa cháy, nội quy PCCC và thiết bị cảnh báo nếu có.\n\n3. Kiểm tra ổ điện, dây dẫn và thiết bị công suất lớn\n\nKhông dùng ổ cắm quá tải. Báo chủ trọ nếu thấy dây điện hở, ổ cắm cháy sém.\n\n4. Thống nhất quy tắc an toàn khi ở ghép\n\nKhông đun nấu ở vị trí nguy hiểm và không tích trữ vật liệu dễ cháy."));
        blogs.save(blog(admin, "Thuê trọ an toàn", "5 thông tin phải hỏi rõ trước khi đặt cọc", "Giá thuê chưa phải toàn bộ chi phí. Hãy hỏi điện, nước, Internet, gửi xe và điều kiện hoàn cọc.", "Trước khi đặt cọc, hãy xác nhận bằng tin nhắn hoặc văn bản: giá thuê, tiền cọc, giá điện, giá nước, phí Internet, gửi xe, ngày có thể vào ở và điều kiện hoàn cọc. Nếu thông tin trên tin đăng khác thực tế, hãy dùng chức năng Báo cáo của UniHome."));
        blogs.save(blog(admin, "Nội quy & an toàn", "Quản lý đồ đạc và những hành vi nên tránh trong khu trọ", "Gợi ý cách bảo quản tài sản cá nhân và duy trì môi trường sống an toàn cho sinh viên.", "Khóa cửa khi ra ngoài, không chia sẻ chìa khóa tùy tiện, không để tài sản giá trị ở khu vực chung. Tôn trọng giờ yên tĩnh và nội quy chung. Tuyệt đối tránh sử dụng, tàng trữ chất kích thích hoặc vật dụng nguy hiểm trái quy định."));
    }

    private BlogPost blog(User admin, String category, String title, String summary, String content) {
        BlogPost b = new BlogPost(); b.setAuthorId(admin.getId()); b.setCategory(category); b.setTitle(title); b.setSummary(summary); b.setContent(content); b.setCoverImage("/demo/blog-pccc.png"); b.setTags("sinh viên, thuê trọ, an toàn"); b.setStatus("PUBLISHED"); b.setReadingMinutes(5); b.setPublishedAt(LocalDateTime.now().minusDays(2)); return b;
    }

    private void seedQa(User student, User landlord, User admin) {
        if (questions.count() > 0) return;
        Question q1 = question(student, "Giá điện 4.000đ/kWh có nên hỏi lại chủ trọ không?", "Mình đang xem một phòng và muốn biết cần kiểm tra thêm những khoản phí nào trước khi cọc.", "Chi phí");
        Question q2 = question(student, "Trước khi thuê phòng nên kiểm tra PCCC những gì?", "Mình là sinh viên năm nhất, chưa có kinh nghiệm xem trọ.", "PCCC");
        questions.saveAll(List.of(q1,q2));
        answers.save(answer(q1, landlord, "Bạn nên hỏi rõ giá điện, nước, Internet, gửi xe, phí dịch vụ khác và cách tính theo tháng. UniHome khuyến nghị lưu lại trao đổi để đối chiếu."));
        answers.save(answer(q2, admin, "Hãy kiểm tra lối thoát, bình chữa cháy, cầu thang, ổ điện/dây dẫn và hỏi chủ trọ về nội quy PCCC. Bạn cũng có thể xem bài hướng dẫn trong mục Blog."));
    }

    private Question question(User user, String title, String content, String category) { Question q = new Question(); q.setUserId(user.getId()); q.setTitle(title); q.setContent(content); q.setCategory(category); q.setStatus("VISIBLE"); return q; }
    private Answer answer(Question q, User user, String content) { Answer a = new Answer(); a.setQuestionId(q.getId()); a.setUserId(user.getId()); a.setContent(content); a.setStatus("VISIBLE"); return a; }

    private void seedAds() {
        if (ads.count() > 0) return;
        Advertisement top = new Advertisement(); top.setTitle("Dịch vụ chuyển trọ sinh viên"); top.setBannerImage("/demo/ad-campus.png"); top.setDestinationUrl("https://www.facebook.com/"); top.setPlacement("TOP_BANNER"); top.setStatus("ACTIVE"); top.setStartAt(LocalDateTime.now().minusDays(1)); top.setEndAt(LocalDateTime.now().plusMonths(1)); ads.save(top);
        Advertisement side = new Advertisement(); side.setTitle("Tiện ích quanh Hòa Lạc"); side.setBannerImage("/demo/service-moving.png"); side.setDestinationUrl("https://maps.google.com/"); side.setPlacement("RIGHT_SIDEBAR"); side.setStatus("ACTIVE"); side.setStartAt(LocalDateTime.now().minusDays(1)); side.setEndAt(LocalDateTime.now().plusMonths(1)); ads.save(side);
    }

    private void seedMatching(DemoUsers demo, List<Listing> ls) {
        if (ls.isEmpty()) return;
        Listing listing = ls.get(0);
        for (User u : List.of(demo.student1(), demo.student2(), demo.student3())) {
            if (matchingProfiles.findByUserId(u.getId()).isEmpty()) {
                MatchingProfile p = new MatchingProfile(); p.setUserId(u.getId()); p.setEnabled(true); p.setGender("Nam"); p.setSchoolName(u.getSchoolName()); p.setLatitude(21.0133); p.setLongitude(105.5278); p.setRadiusKm(5); p.setBudgetMin(1800000L); p.setBudgetMax(3200000L); p.setMoveInDate("2026-10"); p.setSleepSchedule("23h-0h"); p.setCleanlinessLevel(4); p.setSmoking("Không"); p.setPets("Không"); p.setCooking("Có"); p.setNoisePreference("Yên tĩnh"); p.setGuestFrequency("Ít"); p.setStudyWorkSchedule("Ban ngày"); p.setExpenseStyle("Chia đều"); p.setCommunicationStyle("Thẳng thắn"); p.setIntro("Sinh viên đang tìm bạn ở cùng khu Hòa Lạc."); p.setFacebookUrl("https://facebook.com/"); p.setZaloUrl("https://zalo.me/"); matchingProfiles.save(p);
            }
            if (interests.findByListingIdAndUserId(listing.getId(), u.getId()).isEmpty()) {
                ListingInterest i = new ListingInterest(); i.setListingId(listing.getId()); i.setUserId(u.getId()); i.setMatchingEnabled(true); i.setStatus("INTERESTED"); interests.save(i);
            }
        }
    }

    private record DemoUsers(User admin, User landlord, User provider, User student1, User student2, User student3) {}
}
