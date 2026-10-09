package com.exe201.rrms.controller;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.exception.ValidationException;
import com.exe201.rrms.repository.*;
import com.exe201.rrms.service.*;
import com.exe201.rrms.util.ValidationUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AuthService auth;
    private final UserRepository users;
    private final ListingRepository listings;
    private final PropertyRepository props;
    private final ModerationActionRepository mods;
    private final VerificationRecordRepository verifs;
    private final ReportRepository reports;
    private final PaymentRepository payments;
    private final PaymentService paymentService;
    private final WalletTransactionRepository txs;
    private final PackagePlanRepository plans;
    private final ServiceListingRepository services;
    private final SecondHandListingRepository secondHand;
    private final BlogPostRepository blogs;
    private final QuestionRepository questions;
    private final AnswerRepository answers;
    private final ReviewRepository reviews;
    private final AdvertisementRepository ads;
    private final ExpenseRepository expenses;
    private final NotificationService noti;
    private final AuditLogRepository audit;

    @Value("${unihome.upload.dir:uploads}")
    private String uploadDir;

    public AdminController(AuthService a, UserRepository u, ListingRepository l, PropertyRepository p,
                           ModerationActionRepository m, VerificationRecordRepository v, ReportRepository r,
                           PaymentRepository py, PaymentService ps, WalletTransactionRepository t,
                           PackagePlanRepository pl, ServiceListingRepository s, SecondHandListingRepository sh,
                           BlogPostRepository b, QuestionRepository q, AnswerRepository an, ReviewRepository rv,
                           AdvertisementRepository ad, ExpenseRepository e, NotificationService n, AuditLogRepository au) {
        this.auth = a;
        this.users = u;
        this.listings = l;
        this.props = p;
        this.mods = m;
        this.verifs = v;
        this.reports = r;
        this.payments = py;
        this.paymentService = ps;
        this.txs = t;
        this.plans = pl;
        this.services = s;
        this.secondHand = sh;
        this.blogs = b;
        this.questions = q;
        this.answers = an;
        this.reviews = rv;
        this.ads = ad;
        this.expenses = e;
        this.noti = n;
        this.audit = au;
    }

    private User admin(HttpServletRequest r, String... roles) {
        User u = auth.current(r);
        String[] base = roles.length == 0 ? new String[]{"ADMIN", "SUPER_ADMIN", "MODERATOR", "VERIFIER", "CONTENT_ADMIN", "FINANCE_ADMIN"} : roles;
        auth.requireRole(u, base);
        return u;
    }

    private void log(Long actor, String action, String type, Long id, String d) {
        AuditLog a = new AuditLog();
        a.setActorId(actor);
        a.setAction(action);
        a.setTargetType(type);
        a.setTargetId(id);
        a.setDetails(d);
        audit.save(a);
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(HttpServletRequest r) {
        admin(r);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalUsers", users.count());
        m.put("tenants", users.findByRole("TENANT").size());
        m.put("landlords", users.findByRole("LANDLORD").size());
        m.put("serviceProviders", users.findByRole("SERVICE_PROVIDER").size());
        m.put("totalListings", listings.count());
        m.put("pendingListings", listings.findByStatus("PENDING_REVIEW").size());
        m.put("needRevisionListings", listings.findByStatus("NEED_REVISION").size());
        m.put("activeListings", listings.findByStatus("ACTIVE").size());
        m.put("staleListings", listings.findByStatus("HIDDEN_STALE").size());
        m.put("verifiedRooms", verifs.findAll().stream().filter(v -> "VERIFIED".equals(v.getStatus())).count());
        m.put("openReports", reports.findByStatusOrderByCreatedAtDesc("OPEN").size());
        m.put("pendingPayments", payments.findByStatusOrderByCreatedAtDesc("PENDING").size());
        m.put("verificationQueue", verifs.findByStatus("PENDING").size());
        m.put("activeAds", ads.findAll().stream().filter(a -> "ACTIVE".equalsIgnoreCase(a.getStatus())).count());
        long cashIn = payments.findAll().stream().filter(x -> "PAID".equals(x.getStatus())).mapToLong(Payment::getAmount).sum();
        long expense = expenses.findAll().stream().mapToLong(Expense::getAmount).sum();
        m.put("cashIn", cashIn);
        m.put("expenses", expense);
        m.put("netCashFlow", cashIn - expense);
        return m;
    }

    @GetMapping("/users")
    public List<Map<String, Object>> userList(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        return users.findAll().stream().map(auth::safeUser).toList();
    }

    @PutMapping("/users/{id}")
    public Map<String, Object> updateUser(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN");
        User u = users.findById(id).orElseThrow();
        if (b.get("role") != null) u.setRole(b.get("role").toUpperCase());
        if (b.get("status") != null) u.setStatus(b.get("status").toUpperCase());
        users.save(u);
        log(a.getId(), "UPDATE_USER", "USER", id, b.toString());
        return auth.safeUser(u);
    }

    @GetMapping("/moderation")
    public List<Map<String, Object>> moderation(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        List<Listing> raw = listings.findByStatusIn(List.of("PENDING_REVIEW", "NEED_REVISION", "SUSPENDED", "DRAFT"));
        List<Map<String, Object>> out = new ArrayList<>();
        for (Listing l : raw) {
            Property p = props.findById(l.getPropertyId()).orElse(null);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", l.getId());
            item.put("listingId", l.getId());
            item.put("title", l.getTitle() != null ? l.getTitle() : (p != null ? p.getName() : "Tin #" + l.getId()));
            item.put("status", l.getStatus());
            item.put("landlordId", l.getLandlordId());
            item.put("revisionNote", l.getRevisionNote());
            item.put("createdAt", l.getCreatedAt());
            item.put("updatedAt", l.getUpdatedAt());
            if (p != null) {
                item.put("propertyId", p.getId());
                item.put("price", p.getPrice());
                item.put("area", p.getArea());
                item.put("address", String.join(", ", Arrays.asList(p.getStreet(), p.getWard(), p.getDistrict(), p.getProvince()).stream().filter(Objects::nonNull).filter(s -> !s.isBlank()).toList()));
                item.put("imageUrl", p.getImageUrl());
                item.put("contactPhone", p.getContactPhone());
                item.put("electricityPrice", p.getElectricityPrice());
                item.put("waterPrice", p.getWaterPrice());
                item.put("deposit", p.getDeposit());
                item.put("amenities", p.getAmenities());
                item.put("rules", p.getRules());
                item.put("description", p.getDescription());
            }
            out.add(item);
        }
        return out;
    }

    @PostMapping("/listings/{id}/moderate")
    public Listing moderate(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        Listing l = listings.findById(id).orElseThrow();
        String action = b.getOrDefault("action", "APPROVE").toUpperCase();
        String reason = b.get("reason");

        if ("APPROVE".equals(action)) {
            l.setStatus("ACTIVE");
            l.setPublishedAt(l.getPublishedAt() == null ? LocalDateTime.now() : l.getPublishedAt());
            l.setLastConfirmedAt(LocalDateTime.now());
            l.setFreshnessDueAt(LocalDateTime.now().plusDays(15));
            l.setRevisionNote(null);
            noti.send(l.getLandlordId(), "LISTING_APPROVED", "Tin #" + id + " (" + l.getTitle() + ") đã được phê duyệt và hiển thị công khai.", "LISTING", id);
        } else if ("NEED_REVISION".equals(action) || "REQUEST_REVISION".equals(action)) {
            l.setStatus("NEED_REVISION");
            l.setRevisionNote(reason != null && !reason.isBlank() ? reason : "Vui lòng kiểm tra lại thông tin tin đăng.");
            noti.send(l.getLandlordId(), "LISTING_NEED_REVISION", "Tin #" + id + " cần chỉnh sửa: " + l.getRevisionNote(), "LISTING", id);
        } else if ("REJECT".equals(action)) {
            l.setStatus("REJECTED");
            l.setRevisionNote(reason);
            noti.send(l.getLandlordId(), "LISTING_REJECTED", "Tin #" + id + " bị từ chối: " + reason, "LISTING", id);
        } else if ("SUSPEND".equals(action)) {
            l.setStatus("SUSPENDED");
            l.setRevisionNote(reason);
            noti.send(l.getLandlordId(), "LISTING_SUSPENDED", "Tin #" + id + " bị tạm khóa: " + reason, "LISTING", id);
        }
        listings.save(l);

        ModerationAction ma = new ModerationAction();
        ma.setListingId(id);
        ma.setModeratorId(a.getId());
        ma.setAction(action);
        ma.setReason(reason);
        mods.save(ma);
        log(a.getId(), action, "LISTING", id, reason);
        return l;
    }

    @GetMapping("/verifications")
    public List<VerificationRecord> verifications(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "VERIFIER", "MODERATOR");
        return verifs.findAll();
    }

    @PostMapping("/verifications")
    public VerificationRecord verify(HttpServletRequest r, @RequestBody VerificationRecord v) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "VERIFIER", "MODERATOR");
        v.setId(null);
        v.setVerifierId(a.getId());
        v.setStatus("VERIFIED");
        v.setVerifiedAt(LocalDateTime.now());
        if (v.getExpiresAt() == null) v.setExpiresAt(LocalDateTime.now().plusDays(30));
        VerificationRecord x = verifs.save(v);
        log(a.getId(), "VERIFY_" + v.getLevel(), "LISTING", v.getListingId(), v.getNote());
        return x;
    }

    @GetMapping("/reports")
    public List<Report> reportList(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        return reports.findAll();
    }

    @PostMapping("/reports/{id}/resolve")
    public Report resolve(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        Report x = reports.findById(id).orElseThrow();
        x.setStatus("RESOLVED");
        x.setHandledBy(a.getId());
        x.setResolution(b.get("resolution"));
        x.setResolvedAt(LocalDateTime.now());
        reports.save(x);
        log(a.getId(), "RESOLVE_REPORT", "REPORT", id, x.getResolution());
        return x;
    }

    @GetMapping("/payments")
    public List<Payment> paymentList(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN");
        return payments.findAll();
    }

    @PostMapping("/payments/{id}/confirm")
    public Map<String, Object> confirm(@PathVariable Long id, HttpServletRequest r) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN");
        Payment p = payments.findById(id).orElseThrow();
        paymentService.markPaid(p);
        log(a.getId(), "CONFIRM_PAYMENT", "PAYMENT", id, p.getCode());
        return Map.of("message", "Đã xác nhận thanh toán");
    }

    @GetMapping("/finance")
    public Map<String, Object> finance(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN");
        List<Payment> ps = payments.findAll();
        long cashIn = ps.stream().filter(x -> "PAID".equals(x.getStatus())).mapToLong(Payment::getAmount).sum();
        long topup = ps.stream().filter(x -> "PAID".equals(x.getStatus()) && "WALLET_TOPUP".equals(x.getType())).mapToLong(Payment::getAmount).sum();
        long direct = ps.stream().filter(x -> "PAID".equals(x.getStatus()) && "PACKAGE_DIRECT".equals(x.getType())).mapToLong(Payment::getAmount).sum();
        long packageSpend = txs.findAll().stream().filter(x -> "DEBIT".equals(x.getType())).mapToLong(x -> Math.abs(x.getAmount())).sum();
        long ex = expenses.findAll().stream().mapToLong(Expense::getAmount).sum();
        return Map.of("cashIn", cashIn, "walletTopup", topup, "directPurchase", direct, "walletPackageSpend", packageSpend, "expenses", ex, "netCashFlow", cashIn - ex, "payments", ps, "expenseItems", expenses.findAll());
    }

    @PostMapping("/expenses")
    public Expense expense(HttpServletRequest r, @RequestBody Expense e) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN");
        e.setId(null);
        e.setCreatedBy(a.getId());
        return expenses.save(e);
    }

    @GetMapping("/plans")
    public List<PackagePlan> plans(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN");
        return plans.findAll();
    }

    @PostMapping("/plans")
    public PackagePlan plan(HttpServletRequest r, @RequestBody PackagePlan p) {
        admin(r, "ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN");
        return plans.save(p);
    }

    @GetMapping("/services")
    public List<ServiceListing> services(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        return services.findAll();
    }

    @PostMapping("/services/{id}/moderate")
    public ServiceListing serviceModerate(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        ServiceListing s = services.findById(id).orElseThrow();
        s.setStatus(b.getOrDefault("status", "ACTIVE"));
        return services.save(s);
    }

    @GetMapping("/secondhand")
    public List<SecondHandListing> secondHand(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        return secondHand.findAll();
    }

    @PostMapping("/secondhand/{id}/status")
    public SecondHandListing secondStatus(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        SecondHandListing x = secondHand.findById(id).orElseThrow();
        x.setStatus(b.getOrDefault("status", "ACTIVE"));
        secondHand.save(x);
        log(a.getId(), "SECONDHAND_STATUS", "SECOND_HAND", id, x.getStatus());
        return x;
    }

    @GetMapping("/questions")
    public List<Question> questions(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN");
        return questions.findAll();
    }

    @PostMapping("/questions/{id}/status")
    public Question questionStatus(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN");
        Question x = questions.findById(id).orElseThrow();
        x.setStatus(b.getOrDefault("status", "VISIBLE"));
        questions.save(x);
        log(a.getId(), "QUESTION_STATUS", "QUESTION", id, x.getStatus());
        return x;
    }

    @GetMapping("/answers")
    public List<Answer> answers(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN");
        return answers.findAll();
    }

    @PostMapping("/answers/{id}/status")
    public Answer answerStatus(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN");
        Answer x = answers.findById(id).orElseThrow();
        x.setStatus(b.getOrDefault("status", "VISIBLE"));
        answers.save(x);
        log(a.getId(), "ANSWER_STATUS", "ANSWER", id, x.getStatus());
        return x;
    }

    @GetMapping("/reviews")
    public List<Review> reviewList(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        return reviews.findAll();
    }

    @PostMapping("/reviews/{id}/status")
    public Review reviewStatus(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        Review x = reviews.findById(id).orElseThrow();
        x.setStatus(b.getOrDefault("status", "VISIBLE"));
        reviews.save(x);
        log(a.getId(), "REVIEW_STATUS", "REVIEW", id, x.getStatus());
        return x;
    }

    @GetMapping("/blogs")
    public List<BlogPost> blogList(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        return blogs.findAll();
    }

    @PostMapping("/blogs")
    public BlogPost blogCreate(HttpServletRequest r, @RequestBody BlogPost b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        b.setAuthorId(a.getId());
        if ("PUBLISHED".equals(b.getStatus()) && b.getPublishedAt() == null) b.setPublishedAt(LocalDateTime.now());
        return blogs.save(b);
    }

    @PutMapping("/blogs/{id}")
    public BlogPost blogUpdate(@PathVariable Long id, HttpServletRequest r, @RequestBody BlogPost d) {
        admin(r, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        d.setId(id);
        if ("PUBLISHED".equals(d.getStatus()) && d.getPublishedAt() == null) d.setPublishedAt(LocalDateTime.now());
        return blogs.save(d);
    }

    @GetMapping("/ads")
    public List<Advertisement> ads(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN", "MODERATOR");
        return ads.findAll();
    }

    @PostMapping("/ads/banner")
    public Map<String, Object> uploadAdBanner(@RequestParam("file") MultipartFile file, HttpServletRequest r) throws Exception {
        admin(r, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN", "MODERATOR");
        if (file == null || file.isEmpty()) throw new ValidationException("file", "Vui lòng chọn file banner");

        String contentType = file.getContentType();
        if (contentType == null || !Set.of("image/jpeg", "image/png", "image/webp", "image/gif").contains(contentType.toLowerCase())) {
            throw new ValidationException("file", "Định dạng file không hợp lệ (JPEG, PNG, WEBP, GIF)");
        }

        Path uploadPath = Paths.get(uploadDir, "ads");
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String ext = "jpg";
        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
        }

        String uniqueFilename = "ad_" + UUID.randomUUID().toString().substring(0, 8) + "." + ext;
        Path targetPath = uploadPath.resolve(uniqueFilename);

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
        }

        String bannerUrl = "/uploads/ads/" + uniqueFilename;
        return Map.of("bannerImage", bannerUrl);
    }

    @PostMapping("/ads")
    public Advertisement ad(HttpServletRequest r, @RequestBody Advertisement a) {
        User u = admin(r, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN", "MODERATOR");
        validateAd(a);
        a.setCreatedBy(u.getId());
        a.setCreatedAt(LocalDateTime.now());
        a.setUpdatedAt(LocalDateTime.now());
        if (a.getStatus() == null || a.getStatus().isBlank()) {
            a.setStatus("ACTIVE");
        }
        return ads.save(a);
    }

    @PutMapping("/ads/{id}")
    public Advertisement adUpdate(@PathVariable Long id, HttpServletRequest r, @RequestBody Advertisement a) {
        admin(r, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN", "MODERATOR");
        validateAd(a);
        Advertisement exist = ads.findById(id).orElseThrow();
        exist.setCampaignName(a.getCampaignName());
        exist.setAdvertiserName(a.getAdvertiserName());
        exist.setTitle(a.getTitle());
        exist.setDescription(a.getDescription());
        exist.setBannerImage(a.getBannerImage());
        exist.setDestinationUrl(a.getDestinationUrl());
        exist.setTargetType(a.getTargetType() != null ? a.getTargetType() : "EXTERNAL");
        exist.setPlacement(a.getPlacement());
        exist.setPriority(a.getPriority() != null ? a.getPriority() : 0);
        exist.setStatus(a.getStatus());
        exist.setStartAt(a.getStartAt());
        exist.setEndAt(a.getEndAt());
        exist.setNote(a.getNote());
        exist.setUpdatedAt(LocalDateTime.now());
        return ads.save(exist);
    }

    @PostMapping("/ads/{id}/status")
    public Advertisement adStatus(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        admin(r, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN", "MODERATOR");
        Advertisement exist = ads.findById(id).orElseThrow();
        String st = b.getOrDefault("status", "ACTIVE").toUpperCase();
        exist.setStatus(st);
        exist.setUpdatedAt(LocalDateTime.now());
        return ads.save(exist);
    }

    private void validateAd(Advertisement a) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (a.getAdvertiserName() == null || a.getAdvertiserName().isBlank()) errors.put("advertiserName", "Tên nhà quảng cáo/đối tác không được trống");
        if (a.getCampaignName() == null || a.getCampaignName().isBlank()) errors.put("campaignName", "Tên chiến dịch không được trống");
        if (a.getTitle() == null || a.getTitle().isBlank()) a.setTitle(a.getCampaignName());
        if (a.getBannerImage() == null || a.getBannerImage().isBlank()) errors.put("bannerImage", "Chưa cung cấp hình ảnh banner");
        if (a.getDestinationUrl() == null || a.getDestinationUrl().isBlank()) errors.put("destinationUrl", "Target URL không được trống");
        else if (!ValidationUtil.isValidSafeUrl(a.getDestinationUrl())) errors.put("destinationUrl", "Target URL phải là URL hợp lệ (http:// hoặc https://)");
        if (a.getPlacement() == null || a.getPlacement().isBlank()) errors.put("placement", "Vị trí hiển thị không được trống");
        if (!errors.isEmpty()) throw new ValidationException("Dữ liệu quảng cáo chưa hợp lệ", errors);
    }

    @GetMapping("/audit")
    public List<AuditLog> audit(HttpServletRequest r) {
        admin(r, "SUPER_ADMIN", "ADMIN");
        return audit.findTop200ByOrderByCreatedAtDesc();
    }
}
