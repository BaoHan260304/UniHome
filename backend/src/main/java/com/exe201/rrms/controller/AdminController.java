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
@RequestMapping({"/api/admin", "/admin"})
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

    @GetMapping("/users/{id}/detail")
    public Map<String, Object> userDetail(@PathVariable Long id, HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        User u = users.findById(id).orElseThrow();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("user", auth.safeUser(u));
        out.put("listings", listings.findByLandlordIdOrderByUpdatedAtDesc(id));
        out.put("secondhand", secondHand.findBySellerIdOrderByCreatedAtDesc(id));
        out.put("services", services.findByProviderIdOrderByCreatedAtDesc(id));
        out.put("blogs", blogs.findAll().stream().filter(b -> id.equals(b.getAuthorId())).toList());
        out.put("questions", questions.findAll().stream().filter(q -> id.equals(q.getUserId())).toList());
        out.put("answers", answers.findAll().stream().filter(an -> id.equals(an.getUserId())).toList());
        out.put("reviews", reviews.findAll().stream().filter(rv -> id.equals(rv.getUserId())).toList());
        out.put("reportsAgainst", reports.findAll().stream().filter(rp ->
            ("USER".equals(rp.getTargetType()) && id.equals(rp.getTargetId()))
        ).toList());
        out.put("payments", payments.findByUserIdOrderByCreatedAtDesc(id));
        return out;
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

    @PostMapping("/users/{id}/ban")
    public Map<String, Object> banUser(@PathVariable Long id, HttpServletRequest r, @RequestBody(required = false) Map<String, String> b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN");
        User u = users.findById(id).orElseThrow();
        u.setStatus("BANNED");
        users.save(u);

        String reason = b != null && b.get("reason") != null ? b.get("reason") : "Tài khoản bị khóa bởi quản trị viên";
        // Bulk hide user's active listings, secondhand, services
        for (Listing l : listings.findByLandlordIdOrderByUpdatedAtDesc(id)) {
            if ("ACTIVE".equals(l.getStatus()) || "PENDING_REVIEW".equals(l.getStatus())) {
                l.setStatus("SUSPENDED");
                l.setRevisionNote("Chủ trọ bị khóa tài khoản");
                listings.save(l);
            }
        }
        for (SecondHandListing sh : secondHand.findBySellerIdOrderByCreatedAtDesc(id)) {
            if ("ACTIVE".equals(sh.getStatus())) {
                sh.setStatus("HIDDEN");
                secondHand.save(sh);
            }
        }
        for (ServiceListing sv : services.findByProviderIdOrderByCreatedAtDesc(id)) {
            if ("ACTIVE".equals(sv.getStatus())) {
                sv.setStatus("SUSPENDED");
                services.save(sv);
            }
        }

        noti.send(id, "ACCOUNT_BANNED", "Tài khoản của bạn đã bị khóa: " + reason, "USER", id);
        log(a.getId(), "BAN_USER", "USER", id, reason);
        return auth.safeUser(u);
    }

    @PostMapping("/users/{id}/suspend")
    public Map<String, Object> suspendUser(@PathVariable Long id, HttpServletRequest r, @RequestBody(required = false) Map<String, String> b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        User u = users.findById(id).orElseThrow();
        u.setStatus("SUSPENDED");
        users.save(u);
        String reason = b != null && b.get("reason") != null ? b.get("reason") : "Tài khoản bị tạm ngưng hoạt động";
        noti.send(id, "ACCOUNT_SUSPENDED", "Tài khoản của bạn đã bị tạm ngưng: " + reason, "USER", id);
        log(a.getId(), "SUSPEND_USER", "USER", id, reason);
        return auth.safeUser(u);
    }

    @PostMapping("/users/{id}/activate")
    public Map<String, Object> activateUser(@PathVariable Long id, HttpServletRequest r) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN");
        User u = users.findById(id).orElseThrow();
        u.setStatus("ACTIVE");
        users.save(u);
        noti.send(id, "ACCOUNT_ACTIVATED", "Tài khoản của bạn đã được kích hoạt lại.", "USER", id);
        log(a.getId(), "ACTIVATE_USER", "USER", id, "Kích hoạt lại tài khoản");
        return auth.safeUser(u);
    }

    @PostMapping("/users/{id}/bulk-action")
    public Map<String, Object> userBulkAction(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN");
        String action = b.getOrDefault("action", "HIDE_CONTENT").toUpperCase();
        int count = 0;
        if ("HIDE_CONTENT".equals(action)) {
            for (Listing l : listings.findByLandlordIdOrderByUpdatedAtDesc(id)) {
                if ("ACTIVE".equals(l.getStatus())) { l.setStatus("SUSPENDED"); listings.save(l); count++; }
            }
            for (SecondHandListing sh : secondHand.findBySellerIdOrderByCreatedAtDesc(id)) {
                if ("ACTIVE".equals(sh.getStatus())) { sh.setStatus("HIDDEN"); secondHand.save(sh); count++; }
            }
            for (ServiceListing sv : services.findByProviderIdOrderByCreatedAtDesc(id)) {
                if ("ACTIVE".equals(sv.getStatus())) { sv.setStatus("SUSPENDED"); services.save(sv); count++; }
            }
        } else if ("RESTORE_CONTENT".equals(action)) {
            for (Listing l : listings.findByLandlordIdOrderByUpdatedAtDesc(id)) {
                if ("SUSPENDED".equals(l.getStatus())) { l.setStatus("ACTIVE"); listings.save(l); count++; }
            }
            for (SecondHandListing sh : secondHand.findBySellerIdOrderByCreatedAtDesc(id)) {
                if ("HIDDEN".equals(sh.getStatus())) { sh.setStatus("ACTIVE"); secondHand.save(sh); count++; }
            }
            for (ServiceListing sv : services.findByProviderIdOrderByCreatedAtDesc(id)) {
                if ("SUSPENDED".equals(sv.getStatus())) { sv.setStatus("ACTIVE"); services.save(sv); count++; }
            }
        }
        log(a.getId(), "BULK_ACTION_" + action, "USER", id, "Processed items: " + count);
        return Map.of("message", "Đã thực hiện thao tác trên " + count + " mục", "count", count);
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
    public List<Map<String, Object>> reportList(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        List<Report> rps = reports.findAll();
        rps.sort(Comparator.comparing(Report::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        List<Map<String, Object>> out = new ArrayList<>();
        for (Report rp : rps) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", rp.getId());
            m.put("reporterId", rp.getReporterId());
            m.put("targetType", rp.getTargetType());
            m.put("targetId", rp.getTargetId());
            m.put("reasonCode", rp.getReasonCode());
            m.put("details", rp.getDetails());
            m.put("status", rp.getStatus());
            m.put("handledBy", rp.getHandledBy());
            m.put("resolution", rp.getResolution());
            m.put("createdAt", rp.getCreatedAt());
            m.put("resolvedAt", rp.getResolvedAt());

            User rep = rp.getReporterId() != null ? users.findById(rp.getReporterId()).orElse(null) : null;
            m.put("reporterName", rep != null ? rep.getFullName() : "Người dùng #" + rp.getReporterId());
            m.put("reporterEmail", rep != null ? rep.getEmail() : null);

            String targetTitle = null;
            Long targetOwnerId = null;
            String targetOwnerName = null;

            String type = rp.getTargetType() != null ? rp.getTargetType().toUpperCase() : "";
            if ("LISTING".equals(type) && rp.getTargetId() != null) {
                Listing l = listings.findById(rp.getTargetId()).orElse(null);
                if (l != null) {
                    targetTitle = l.getTitle();
                    targetOwnerId = l.getLandlordId();
                }
            } else if ("USER".equals(type) && rp.getTargetId() != null) {
                targetOwnerId = rp.getTargetId();
            } else if ("SECOND_HAND".equals(type) && rp.getTargetId() != null) {
                SecondHandListing sh = secondHand.findById(rp.getTargetId()).orElse(null);
                if (sh != null) {
                    targetTitle = sh.getTitle();
                    targetOwnerId = sh.getSellerId();
                }
            } else if ("SERVICE".equals(type) && rp.getTargetId() != null) {
                ServiceListing sv = services.findById(rp.getTargetId()).orElse(null);
                if (sv != null) {
                    targetTitle = sv.getTitle();
                    targetOwnerId = sv.getProviderId();
                }
            } else if ("REVIEW".equals(type) && rp.getTargetId() != null) {
                Review rv = reviews.findById(rp.getTargetId()).orElse(null);
                if (rv != null) {
                    targetTitle = rv.getComment();
                    targetOwnerId = rv.getUserId();
                }
            } else if ("QUESTION".equals(type) && rp.getTargetId() != null) {
                Question q = questions.findById(rp.getTargetId()).orElse(null);
                if (q != null) {
                    targetTitle = q.getTitle();
                    targetOwnerId = q.getUserId();
                }
            }

            if (targetOwnerId != null) {
                User owner = users.findById(targetOwnerId).orElse(null);
                targetOwnerName = owner != null ? owner.getFullName() : "Người dùng #" + targetOwnerId;
            }

            m.put("targetTitle", targetTitle);
            m.put("targetOwnerId", targetOwnerId);
            m.put("targetOwnerName", targetOwnerName);
            out.add(m);
        }
        return out;
    }

    @PostMapping("/reports/{id}/status")
    public Report reportStatus(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        Report x = reports.findById(id).orElseThrow();
        String st = b.getOrDefault("status", "UNDER_REVIEW").toUpperCase();
        x.setStatus(st);
        x.setHandledBy(a.getId());
        if ("RESOLVED".equals(st) || "DISMISSED".equals(st)) {
            x.setResolvedAt(LocalDateTime.now());
            if (b.get("resolution") != null) x.setResolution(b.get("resolution"));
        }
        reports.save(x);
        log(a.getId(), "REPORT_STATUS_" + st, "REPORT", id, x.getResolution());
        return x;
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
    public List<Map<String, Object>> services(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        List<ServiceListing> list = services.findAll();
        list.sort(Comparator.comparing(ServiceListing::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        List<Map<String, Object>> out = new ArrayList<>();
        for (ServiceListing s : list) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("providerId", s.getProviderId());
            m.put("title", s.getTitle());
            m.put("category", s.getCategory());
            m.put("description", s.getDescription());
            m.put("price", s.getPriceFrom());
            m.put("priceFrom", s.getPriceFrom());
            m.put("status", s.getStatus());
            m.put("featured", s.getFeatured());
            m.put("phone", s.getPhone());
            m.put("province", s.getProvince());
            m.put("imageUrl", s.getImageUrl());
            m.put("createdAt", s.getCreatedAt());
            User u = s.getProviderId() != null ? users.findById(s.getProviderId()).orElse(null) : null;
            m.put("providerName", u != null ? u.getFullName() : "Đối tác #" + s.getProviderId());
            m.put("providerEmail", u != null ? u.getEmail() : null);
            out.add(m);
        }
        return out;
    }

    @PostMapping("/services/{id}/moderate")
    public ServiceListing serviceModerate(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        ServiceListing s = services.findById(id).orElseThrow();
        s.setStatus(b.getOrDefault("status", "ACTIVE"));
        ServiceListing saved = services.save(s);
        log(a.getId(), "SERVICE_MODERATE", "SERVICE", id, s.getStatus());
        return saved;
    }

    @GetMapping("/secondhand")
    public List<Map<String, Object>> secondHand(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        List<SecondHandListing> list = secondHand.findAll();
        list.sort(Comparator.comparing(SecondHandListing::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        List<Map<String, Object>> out = new ArrayList<>();
        for (SecondHandListing sh : list) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", sh.getId());
            m.put("sellerId", sh.getSellerId());
            m.put("title", sh.getTitle());
            m.put("category", sh.getCategory());
            m.put("description", sh.getDescription());
            m.put("price", sh.getPrice());
            m.put("status", sh.getStatus());
            m.put("conditionText", sh.getConditionText());
            m.put("province", sh.getProvince());
            m.put("imageUrl", sh.getImageUrl());
            m.put("createdAt", sh.getCreatedAt());
            User u = sh.getSellerId() != null ? users.findById(sh.getSellerId()).orElse(null) : null;
            m.put("phone", u != null ? u.getPhone() : null);
            m.put("sellerName", u != null ? u.getFullName() : "Người bán #" + sh.getSellerId());
            m.put("sellerEmail", u != null ? u.getEmail() : null);
            out.add(m);
        }
        return out;
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
    public List<Map<String, Object>> questions(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN");
        List<Question> qs = questions.findAll();
        qs.sort(Comparator.comparing(Question::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        List<Map<String, Object>> out = new ArrayList<>();
        for (Question q : qs) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", q.getId());
            m.put("userId", q.getUserId());
            m.put("title", q.getTitle());
            m.put("content", q.getContent());
            m.put("category", q.getCategory());
            m.put("acceptedAnswerId", q.getAcceptedAnswerId());
            m.put("status", q.getStatus());
            m.put("createdAt", q.getCreatedAt());
            User u = q.getUserId() != null ? users.findById(q.getUserId()).orElse(null) : null;
            m.put("authorName", u != null ? u.getFullName() : "Người dùng #" + q.getUserId());
            m.put("authorEmail", u != null ? u.getEmail() : null);
            m.put("authorAvatar", u != null ? u.getAvatarUrl() : null);
            long ansCount = answers.findAll().stream().filter(a -> q.getId().equals(a.getQuestionId())).count();
            m.put("answerCount", ansCount);
            out.add(m);
        }
        return out;
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

    @DeleteMapping("/questions/{id}")
    public Map<String, Object> deleteQuestion(@PathVariable Long id, HttpServletRequest r) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN");
        Question x = questions.findById(id).orElseThrow();
        x.setStatus("DELETED");
        questions.save(x);
        log(a.getId(), "DELETE_QUESTION", "QUESTION", id, "Soft deleted");
        return Map.of("message", "Đã xóa câu hỏi");
    }

    @GetMapping("/answers")
    public List<Map<String, Object>> answers(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN");
        List<Answer> ans = answers.findAll();
        ans.sort(Comparator.comparing(Answer::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        List<Map<String, Object>> out = new ArrayList<>();
        for (Answer an : ans) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", an.getId());
            m.put("questionId", an.getQuestionId());
            m.put("userId", an.getUserId());
            m.put("content", an.getContent());
            m.put("status", an.getStatus());
            m.put("createdAt", an.getCreatedAt());
            User u = an.getUserId() != null ? users.findById(an.getUserId()).orElse(null) : null;
            m.put("authorName", u != null ? u.getFullName() : "Người dùng #" + an.getUserId());
            m.put("authorEmail", u != null ? u.getEmail() : null);
            m.put("authorAvatar", u != null ? u.getAvatarUrl() : null);
            Question q = an.getQuestionId() != null ? questions.findById(an.getQuestionId()).orElse(null) : null;
            m.put("questionTitle", q != null ? q.getTitle() : "Câu hỏi #" + an.getQuestionId());
            out.add(m);
        }
        return out;
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

    @DeleteMapping("/answers/{id}")
    public Map<String, Object> deleteAnswer(@PathVariable Long id, HttpServletRequest r) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN");
        Answer x = answers.findById(id).orElseThrow();
        x.setStatus("DELETED");
        answers.save(x);
        log(a.getId(), "DELETE_ANSWER", "ANSWER", id, "Soft deleted");
        return Map.of("message", "Đã xóa câu trả lời");
    }

    @GetMapping("/reviews")
    public List<Map<String, Object>> reviewList(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        List<Review> rs = reviews.findAll();
        rs.sort(Comparator.comparing(Review::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        List<Map<String, Object>> out = new ArrayList<>();
        for (Review rv : rs) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", rv.getId());
            m.put("propertyId", rv.getPropertyId());
            m.put("userId", rv.getUserId());
            m.put("rating", rv.getRating());
            m.put("accuracyRating", rv.getAccuracyRating());
            m.put("priceTransparencyRating", rv.getPriceTransparencyRating());
            m.put("utilityTransparencyRating", rv.getUtilityTransparencyRating());
            m.put("landlordCommunicationRating", rv.getLandlordCommunicationRating());
            m.put("comment", rv.getComment());
            m.put("status", rv.getStatus());
            m.put("createdAt", rv.getCreatedAt());
            User u = rv.getUserId() != null ? users.findById(rv.getUserId()).orElse(null) : null;
            m.put("reviewerName", u != null ? u.getFullName() : "Người dùng #" + rv.getUserId());
            m.put("reviewerEmail", u != null ? u.getEmail() : null);
            m.put("reviewerAvatar", u != null ? u.getAvatarUrl() : null);
            Property p = rv.getPropertyId() != null ? props.findById(rv.getPropertyId()).orElse(null) : null;
            m.put("propertyName", p != null ? p.getName() : "Bất động sản #" + rv.getPropertyId());
            m.put("propertyAddress", p != null ? (p.getStreet() != null ? p.getStreet() + ", " : "") + (p.getDistrict() != null ? p.getDistrict() : "") : null);
            out.add(m);
        }
        return out;
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

    @DeleteMapping("/reviews/{id}")
    public Map<String, Object> deleteReview(@PathVariable Long id, HttpServletRequest r) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "MODERATOR");
        Review rv = reviews.findById(id).orElseThrow();
        rv.setStatus("DELETED");
        reviews.save(rv);
        log(a.getId(), "DELETE_REVIEW", "REVIEW", id, "Soft deleted");
        return Map.of("message", "Đã xóa nhận xét");
    }

    @GetMapping("/blogs")
    public List<BlogPost> blogList(HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        List<BlogPost> list = blogs.findAll();
        list.sort(Comparator.comparing(BlogPost::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return list;
    }

    @GetMapping("/blogs/{id}")
    public BlogPost blogDetail(@PathVariable Long id, HttpServletRequest r) {
        admin(r, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        return blogs.findById(id).orElseThrow();
    }

    @PostMapping("/blogs")
    public BlogPost blogCreate(HttpServletRequest r, @RequestBody BlogPost b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        b.setAuthorId(a.getId());
        if ("PUBLISHED".equals(b.getStatus()) && b.getPublishedAt() == null) b.setPublishedAt(LocalDateTime.now());
        BlogPost saved = blogs.save(b);
        log(a.getId(), "CREATE_BLOG", "BLOG", saved.getId(), saved.getTitle());
        return saved;
    }

    @PutMapping("/blogs/{id}")
    public BlogPost blogUpdate(@PathVariable Long id, HttpServletRequest r, @RequestBody BlogPost d) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        BlogPost exist = blogs.findById(id).orElseThrow();
        exist.setTitle(d.getTitle());
        exist.setCategory(d.getCategory());
        exist.setSummary(d.getSummary());
        exist.setContent(d.getContent());
        exist.setCoverImage(d.getCoverImage());
        exist.setTags(d.getTags());
        exist.setReadingMinutes(d.getReadingMinutes());
        exist.setStatus(d.getStatus());
        if ("PUBLISHED".equals(exist.getStatus()) && exist.getPublishedAt() == null) exist.setPublishedAt(LocalDateTime.now());
        exist.setUpdatedAt(LocalDateTime.now());
        BlogPost saved = blogs.save(exist);
        log(a.getId(), "UPDATE_BLOG", "BLOG", id, saved.getTitle());
        return saved;
    }

    @PostMapping("/blogs/{id}/status")
    public BlogPost blogStatus(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        BlogPost bp = blogs.findById(id).orElseThrow();
        String st = b.getOrDefault("status", "PUBLISHED").toUpperCase();
        bp.setStatus(st);
        if ("PUBLISHED".equals(st) && bp.getPublishedAt() == null) bp.setPublishedAt(LocalDateTime.now());
        BlogPost saved = blogs.save(bp);
        log(a.getId(), "BLOG_STATUS", "BLOG", id, st);
        return saved;
    }

    @DeleteMapping("/blogs/{id}")
    public Map<String, Object> deleteBlog(@PathVariable Long id, HttpServletRequest r) {
        User a = admin(r, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        BlogPost bp = blogs.findById(id).orElseThrow();
        bp.setStatus("DELETED");
        blogs.save(bp);
        log(a.getId(), "DELETE_BLOG", "BLOG", id, "Soft deleted");
        return Map.of("message", "Đã xóa bài viết");
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
        return Map.of("bannerImage", bannerUrl, "bannerUrl", bannerUrl);
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
    public List<Map<String, Object>> audit(HttpServletRequest r) {
        admin(r, "SUPER_ADMIN", "ADMIN");
        List<AuditLog> list = audit.findTop200ByOrderByCreatedAtDesc();
        List<Map<String, Object>> out = new ArrayList<>();
        for (AuditLog al : list) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", al.getId());
            m.put("actorId", al.getActorId());
            m.put("action", al.getAction());
            m.put("targetType", al.getTargetType());
            m.put("targetId", al.getTargetId());
            m.put("details", al.getDetails());
            m.put("createdAt", al.getCreatedAt());
            User actor = al.getActorId() != null ? users.findById(al.getActorId()).orElse(null) : null;
            m.put("actorName", actor != null ? actor.getFullName() : "Admin #" + al.getActorId());
            m.put("actorEmail", actor != null ? actor.getEmail() : null);
            out.add(m);
        }
        return out;
    }
}
