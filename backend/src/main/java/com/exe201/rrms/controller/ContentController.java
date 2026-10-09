package com.exe201.rrms.controller;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.exception.ValidationException;
import com.exe201.rrms.repository.*;
import com.exe201.rrms.service.AnalyticsService;
import com.exe201.rrms.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/content")
public class ContentController {
    private final AuthService auth;
    private final ServiceListingRepository services;
    private final SecondHandListingRepository second;
    private final MarketplaceCommentRepository comments;
    private final BlogPostRepository blogs;
    private final QuestionRepository questions;
    private final AnswerRepository answers;
    private final AdvertisementRepository ads;
    private final UserRepository users;
    private final AnalyticsService analyticsService;

    public ContentController(AuthService a, ServiceListingRepository s, SecondHandListingRepository sh,
                             MarketplaceCommentRepository c, BlogPostRepository b, QuestionRepository q,
                             AnswerRepository an, AdvertisementRepository ad,
                             UserRepository users, AnalyticsService analyticsService) {
        this.auth = a;
        this.services = s;
        this.second = sh;
        this.comments = c;
        this.blogs = b;
        this.questions = q;
        this.answers = an;
        this.ads = ad;
        this.users = users;
        this.analyticsService = analyticsService;
    }

    @GetMapping("/services")
    public List<ServiceListing> services() {
        return services.findByStatusOrderByFeaturedDescCreatedAtDesc("ACTIVE");
    }

    @GetMapping("/services/{id}")
    public Map<String, Object> serviceOne(@PathVariable Long id, HttpServletRequest r) {
        ServiceListing s = services.findById(id).orElseThrow();
        User provider = users.findById(s.getProviderId()).orElse(null);
        User me = auth.optional(r);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("service", s);
        m.put("id", s.getId());
        m.put("title", s.getTitle());
        m.put("category", s.getCategory());
        m.put("priceFrom", s.getPriceFrom());
        m.put("province", s.getProvince());
        m.put("district", s.getDistrict());
        m.put("serviceArea", s.getServiceArea());
        m.put("description", s.getDescription());
        m.put("imageUrl", s.getImageUrl());
        m.put("galleryJson", s.getGalleryJson());
        m.put("pricingTiersJson", s.getPricingTiersJson());
        m.put("addOnFeesJson", s.getAddOnFeesJson());
        m.put("businessHours", s.getBusinessHours());
        m.put("responseTime", s.getResponseTime());
        m.put("faqJson", s.getFaqJson());
        m.put("terms", s.getTerms());
        m.put("providerId", s.getProviderId());
        m.put("status", s.getStatus());
        m.put("providerName", provider != null ? provider.getFullName() : "Nhà cung cấp #" + s.getProviderId());
        m.put("providerAvatar", provider != null ? provider.getAvatarUrl() : null);
        m.put("providerRole", provider != null ? provider.getRole() : "SERVICE_PROVIDER");
        m.put("providerSchool", provider != null ? provider.getSchoolName() : null);

        if (me != null) {
            m.put("providerPhone", provider != null ? provider.getPhone() : null);
            m.put("providerEmail", provider != null ? provider.getEmail() : null);
            m.put("isContactRevealed", true);
        } else {
            m.put("providerPhone", maskPhone(provider != null ? provider.getPhone() : null));
            m.put("providerEmail", null);
            m.put("isContactRevealed", false);
        }
        return m;
    }

    @PostMapping("/services")
    public ServiceListing createService(HttpServletRequest r, @RequestBody ServiceListing s) {
        User u = auth.current(r);
        if (s.getTitle() == null || s.getTitle().trim().isBlank()) {
            throw new ValidationException("title", "Tiêu đề dịch vụ không được để trống");
        }
        if (s.getPhone() == null || s.getPhone().isBlank()) {
            s.setPhone(u.getPhone());
        }
        if (s.getServiceArea() == null || s.getServiceArea().isBlank()) {
            s.setServiceArea(s.getProvince() != null ? s.getProvince() : "Toàn quốc");
        }
        s.setId(null);
        s.setProviderId(u.getId());
        s.setStatus("PENDING_REVIEW");
        return services.save(s);
    }

    @PutMapping("/services/{id}")
    public ServiceListing updateService(@PathVariable Long id, HttpServletRequest r, @RequestBody ServiceListing b) {
        User u = auth.current(r);
        ServiceListing s = services.findById(id).orElseThrow();
        if (!Objects.equals(s.getProviderId(), u.getId()) && !List.of("ADMIN", "SUPER_ADMIN", "MODERATOR").contains(u.getRole())) {
            throw new SecurityException("Không phải dịch vụ của bạn");
        }
        if (b.getTitle() != null) s.setTitle(b.getTitle());
        if (b.getCategory() != null) s.setCategory(b.getCategory());
        if (b.getDescription() != null) s.setDescription(b.getDescription());
        if (b.getPriceFrom() != null) s.setPriceFrom(b.getPriceFrom());
        if (b.getProvince() != null) s.setProvince(b.getProvince());
        if (b.getDistrict() != null) s.setDistrict(b.getDistrict());
        if (b.getPhone() != null) s.setPhone(b.getPhone());
        if (b.getZaloUrl() != null) s.setZaloUrl(b.getZaloUrl());
        if (b.getImageUrl() != null) s.setImageUrl(b.getImageUrl());
        if (b.getGalleryJson() != null) s.setGalleryJson(b.getGalleryJson());
        if (b.getServiceArea() != null) s.setServiceArea(b.getServiceArea());
        if (b.getPricingTiersJson() != null) s.setPricingTiersJson(b.getPricingTiersJson());
        if (b.getAddOnFeesJson() != null) s.setAddOnFeesJson(b.getAddOnFeesJson());
        if (b.getBusinessHours() != null) s.setBusinessHours(b.getBusinessHours());
        if (b.getResponseTime() != null) s.setResponseTime(b.getResponseTime());
        if (b.getFaqJson() != null) s.setFaqJson(b.getFaqJson());
        if (b.getTerms() != null) s.setTerms(b.getTerms());
        return services.save(s);
    }

    @DeleteMapping("/services/{id}")
    public Map<String, Object> deleteService(@PathVariable Long id, HttpServletRequest r) {
        User u = auth.current(r);
        ServiceListing s = services.findById(id).orElseThrow();
        if (!Objects.equals(s.getProviderId(), u.getId()) && !List.of("ADMIN", "SUPER_ADMIN", "MODERATOR").contains(u.getRole())) {
            throw new SecurityException("Không phải dịch vụ của bạn");
        }
        services.delete(s);
        return Map.of("message", "Đã xóa bài đăng dịch vụ");
    }

    @PostMapping("/services/{id}/reveal-contact")
    public Map<String, Object> revealServiceContact(@PathVariable Long id, HttpServletRequest r) {
        User me = auth.current(r);
        ServiceListing s = services.findById(id).orElseThrow();
        User provider = users.findById(s.getProviderId()).orElse(null);

        AnalyticsEvent ev = new AnalyticsEvent();
        ev.setUserId(me.getId());
        ev.setEventType("CONTACT_REVEAL");
        ev.setEntityType("SERVICE");
        ev.setEntityId(id);
        analyticsService.recordEvent(ev);

        return Map.of(
                "revealed", true,
                "phone", provider != null && provider.getPhone() != null ? provider.getPhone() : "Chưa cập nhật",
                "email", provider != null && provider.getEmail() != null ? provider.getEmail() : ""
        );
    }

    @GetMapping("/secondhand")
    public List<SecondHandListing> second() {
        return second.findByStatusOrderByCreatedAtDesc("ACTIVE");
    }

    @GetMapping("/secondhand/{id}")
    public Map<String, Object> secondOne(@PathVariable Long id, HttpServletRequest r) {
        SecondHandListing s = second.findById(id).orElseThrow();
        User seller = users.findById(s.getSellerId()).orElse(null);
        User me = auth.optional(r);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("item", s);
        m.put("id", s.getId());
        m.put("title", s.getTitle());
        m.put("category", s.getCategory());
        m.put("price", s.getPrice());
        m.put("conditionText", s.getConditionText());
        m.put("province", s.getProvince());
        m.put("district", s.getDistrict());
        m.put("description", s.getDescription());
        m.put("imageUrl", s.getImageUrl());
        m.put("galleryJson", s.getGalleryJson());
        m.put("status", s.getStatus());
        m.put("sellerId", s.getSellerId());
        m.put("sellerName", seller != null ? seller.getFullName() : "Người bán #" + s.getSellerId());
        m.put("sellerAvatar", seller != null ? seller.getAvatarUrl() : null);
        m.put("sellerRole", seller != null ? seller.getRole() : "TENANT");
        m.put("sellerSchool", seller != null ? seller.getSchoolName() : null);

        if (me != null) {
            m.put("sellerPhone", seller != null ? seller.getPhone() : null);
            m.put("sellerEmail", seller != null ? seller.getEmail() : null);
            m.put("isContactRevealed", true);
        } else {
            m.put("sellerPhone", maskPhone(seller != null ? seller.getPhone() : null));
            m.put("sellerEmail", null);
            m.put("isContactRevealed", false);
        }
        return m;
    }

    @PostMapping("/secondhand")
    public SecondHandListing createSecond(HttpServletRequest r, @RequestBody SecondHandListing s) {
        s.setId(null);
        s.setSellerId(auth.current(r).getId());
        return second.save(s);
    }

    @PutMapping("/secondhand/{id}/status")
    public SecondHandListing statusSecond(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        User u = auth.current(r);
        SecondHandListing s = second.findById(id).orElseThrow();
        if (!s.getSellerId().equals(u.getId())) throw new SecurityException("Không phải tin của bạn");
        s.setStatus(b.get("status"));
        return second.save(s);
    }

    @PutMapping("/secondhand/{id}")
    public SecondHandListing updateSecond(@PathVariable Long id, HttpServletRequest r, @RequestBody SecondHandListing b) {
        User u = auth.current(r);
        SecondHandListing s = second.findById(id).orElseThrow();
        if (!Objects.equals(s.getSellerId(), u.getId()) && !List.of("ADMIN", "SUPER_ADMIN", "MODERATOR").contains(u.getRole())) {
            throw new SecurityException("Không phải tin của bạn");
        }
        if (b.getTitle() != null) s.setTitle(b.getTitle());
        if (b.getCategory() != null) s.setCategory(b.getCategory());
        if (b.getPrice() != null) s.setPrice(b.getPrice());
        if (b.getConditionText() != null) s.setConditionText(b.getConditionText());
        if (b.getProvince() != null) s.setProvince(b.getProvince());
        if (b.getDistrict() != null) s.setDistrict(b.getDistrict());
        if (b.getDescription() != null) s.setDescription(b.getDescription());
        if (b.getImageUrl() != null) s.setImageUrl(b.getImageUrl());
        if (b.getGalleryJson() != null) s.setGalleryJson(b.getGalleryJson());
        return second.save(s);
    }

    @DeleteMapping("/secondhand/{id}")
    public Map<String, Object> deleteSecond(@PathVariable Long id, HttpServletRequest r) {
        User u = auth.current(r);
        SecondHandListing s = second.findById(id).orElseThrow();
        if (!Objects.equals(s.getSellerId(), u.getId()) && !List.of("ADMIN", "SUPER_ADMIN", "MODERATOR").contains(u.getRole())) {
            throw new SecurityException("Không phải tin của bạn");
        }
        second.delete(s);
        return Map.of("message", "Đã xóa bài đăng đồ cũ");
    }

    @PostMapping("/secondhand/{id}/reveal-contact")
    public Map<String, Object> revealSecondContact(@PathVariable Long id, HttpServletRequest r) {
        User me = auth.current(r);
        SecondHandListing s = second.findById(id).orElseThrow();
        User seller = users.findById(s.getSellerId()).orElse(null);

        AnalyticsEvent ev = new AnalyticsEvent();
        ev.setUserId(me.getId());
        ev.setEventType("CONTACT_REVEAL");
        ev.setEntityType("SECOND_HAND");
        ev.setEntityId(id);
        analyticsService.recordEvent(ev);

        return Map.of(
                "revealed", true,
                "phone", seller != null && seller.getPhone() != null ? seller.getPhone() : "Chưa cập nhật",
                "email", seller != null && seller.getEmail() != null ? seller.getEmail() : ""
        );
    }

    @GetMapping("/secondhand/{id}/comments")
    public List<Map<String, Object>> comments(@PathVariable Long id) {
        List<MarketplaceComment> raw = comments.findByListingIdAndStatusOrderByCreatedAtAsc(id, "VISIBLE");
        List<Map<String, Object>> res = new ArrayList<>();
        for (MarketplaceComment c : raw) {
            User u = users.findById(c.getUserId()).orElse(null);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", c.getId());
            m.put("listingId", c.getListingId());
            m.put("userId", c.getUserId());
            m.put("authorName", u != null ? u.getFullName() : "Người dùng #" + c.getUserId());
            m.put("authorAvatar", u != null ? u.getAvatarUrl() : null);
            m.put("authorRole", u != null ? u.getRole() : "TENANT");
            m.put("content", c.getContent());
            m.put("createdAt", c.getCreatedAt());
            res.add(m);
        }
        return res;
    }

    @PostMapping("/secondhand/{id}/comments")
    public MarketplaceComment comment(@PathVariable Long id, HttpServletRequest r, @RequestBody MarketplaceComment c) {
        c.setId(null);
        c.setListingId(id);
        c.setUserId(auth.current(r).getId());
        return comments.save(c);
    }

    @DeleteMapping("/secondhand/comments/{commentId}")
    public Map<String, Object> deleteComment(@PathVariable Long commentId, HttpServletRequest r) {
        User me = auth.current(r);
        MarketplaceComment c = comments.findById(commentId).orElseThrow();
        if (!c.getUserId().equals(me.getId()) && !List.of("ADMIN", "SUPER_ADMIN", "MODERATOR").contains(me.getRole())) {
            throw new SecurityException("Không có quyền xóa bình luận này");
        }
        c.setStatus("DELETED");
        comments.save(c);
        return Map.of("success", true);
    }

    @GetMapping("/blogs")
    public List<BlogPost> blogs() {
        return blogs.findByStatusOrderByPublishedAtDesc("PUBLISHED");
    }

    @GetMapping("/blogs/{id}")
    public BlogPost blog(@PathVariable Long id) {
        return blogs.findById(id).orElseThrow();
    }

    @GetMapping("/questions")
    public List<Map<String, Object>> qs() {
        List<Question> raw = questions.findByStatusOrderByCreatedAtDesc("VISIBLE");
        List<Map<String, Object>> res = new ArrayList<>();
        for (Question q : raw) {
            User u = users.findById(q.getUserId()).orElse(null);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", q.getId());
            m.put("userId", q.getUserId());
            m.put("category", q.getCategory());
            m.put("title", q.getTitle());
            m.put("content", q.getContent());
            m.put("status", q.getStatus());
            m.put("createdAt", q.getCreatedAt());
            m.put("authorName", u != null ? u.getFullName() : "Người dùng #" + q.getUserId());
            m.put("authorAvatar", u != null ? u.getAvatarUrl() : null);
            m.put("authorRole", u != null ? u.getRole() : "TENANT");
            res.add(m);
        }
        return res;
    }

    @PostMapping("/questions")
    public Question q(HttpServletRequest r, @RequestBody Question q) {
        q.setId(null);
        q.setUserId(auth.current(r).getId());
        return questions.save(q);
    }

    @GetMapping("/questions/{id}/answers")
    public List<Map<String, Object>> ans(@PathVariable Long id) {
        List<Answer> raw = answers.findByQuestionIdAndStatusOrderByCreatedAtAsc(id, "VISIBLE");
        List<Map<String, Object>> res = new ArrayList<>();
        for (Answer a : raw) {
            User u = users.findById(a.getUserId()).orElse(null);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", a.getId());
            m.put("questionId", a.getQuestionId());
            m.put("userId", a.getUserId());
            m.put("authorName", u != null ? u.getFullName() : "Người dùng #" + a.getUserId());
            m.put("authorAvatar", u != null ? u.getAvatarUrl() : null);
            m.put("authorRole", u != null ? u.getRole() : "TENANT");
            m.put("isOfficial", u != null && List.of("ADMIN", "SUPER_ADMIN", "MODERATOR").contains(u.getRole()));
            m.put("content", a.getContent());
            m.put("status", a.getStatus());
            m.put("createdAt", a.getCreatedAt());
            res.add(m);
        }
        return res;
    }

    @PostMapping("/questions/{id}/answers")
    public Answer ans(@PathVariable Long id, HttpServletRequest r, @RequestBody Answer a) {
        a.setId(null);
        a.setQuestionId(id);
        a.setUserId(auth.current(r).getId());
        return answers.save(a);
    }

    @GetMapping("/ads")
    public List<Advertisement> ads(@RequestParam String placement) {
        LocalDateTime now = LocalDateTime.now();
        List<Advertisement> raw = ads.findByPlacement(placement);
        return raw.stream()
                .filter(a -> {
                    if ("ARCHIVED".equalsIgnoreCase(a.getStatus()) || "PAUSED".equalsIgnoreCase(a.getStatus()) || "DRAFT".equalsIgnoreCase(a.getStatus())) {
                        return false;
                    }
                    if (a.getEndAt() != null && a.getEndAt().isBefore(now)) {
                        return false;
                    }
                    if (a.getStartAt() != null && a.getStartAt().isAfter(now)) {
                        return false;
                    }
                    return "ACTIVE".equalsIgnoreCase(a.getStatus()) || a.getStartAt() != null;
                })
                .sorted(Comparator.comparingInt((Advertisement a) -> a.getPriority() != null ? a.getPriority() : 0).reversed())
                .toList();
    }

    @PostMapping("/ads/{id}/impression")
    public Map<String, Object> impression(@PathVariable Long id) {
        ads.findById(id).ifPresent(a -> {
            a.setImpressions((a.getImpressions() == null ? 0L : a.getImpressions()) + 1);
            ads.save(a);
        });
        return Map.of("ok", true);
    }

    @PostMapping("/ads/{id}/click")
    public Map<String, Object> click(@PathVariable Long id) {
        Advertisement a = ads.findById(id).orElseThrow();
        a.setClickCount((a.getClickCount() == null ? 0L : a.getClickCount()) + 1);
        ads.save(a);
        return Map.of("destinationUrl", a.getDestinationUrl(), "clickCount", a.getClickCount());
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.isBlank()) return "Chưa cập nhật";
        if (phone.length() >= 7) {
            return phone.substring(0, 4) + " xxx xxx";
        }
        return "09xx xxx xxx";
    }
}
