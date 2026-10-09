package com.exe201.rrms.controller;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.repository.*;
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

    public ContentController(AuthService a, ServiceListingRepository s, SecondHandListingRepository sh,
                             MarketplaceCommentRepository c, BlogPostRepository b, QuestionRepository q,
                             AnswerRepository an, AdvertisementRepository ad) {
        this.auth = a;
        this.services = s;
        this.second = sh;
        this.comments = c;
        this.blogs = b;
        this.questions = q;
        this.answers = an;
        this.ads = ad;
    }

    @GetMapping("/services")
    public List<ServiceListing> services() {
        return services.findByStatusOrderByFeaturedDescCreatedAtDesc("ACTIVE");
    }

    @PostMapping("/services")
    public ServiceListing createService(HttpServletRequest r, @RequestBody ServiceListing s) {
        User u = auth.current(r);
        auth.requireRole(u, "SERVICE_PROVIDER", "ADMIN", "SUPER_ADMIN");
        s.setId(null);
        s.setProviderId(u.getId());
        s.setStatus("PENDING_REVIEW");
        return services.save(s);
    }

    @GetMapping("/secondhand")
    public List<SecondHandListing> second() {
        return second.findByStatusOrderByCreatedAtDesc("ACTIVE");
    }

    @GetMapping("/secondhand/{id}")
    public SecondHandListing secondOne(@PathVariable Long id) {
        return second.findById(id).orElseThrow();
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

    @GetMapping("/secondhand/{id}/comments")
    public List<MarketplaceComment> comments(@PathVariable Long id) {
        return comments.findByListingIdAndStatusOrderByCreatedAtAsc(id, "VISIBLE");
    }

    @PostMapping("/secondhand/{id}/comments")
    public MarketplaceComment comment(@PathVariable Long id, HttpServletRequest r, @RequestBody MarketplaceComment c) {
        c.setId(null);
        c.setListingId(id);
        c.setUserId(auth.current(r).getId());
        return comments.save(c);
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
    public List<Question> qs() {
        return questions.findByStatusOrderByCreatedAtDesc("VISIBLE");
    }

    @PostMapping("/questions")
    public Question q(HttpServletRequest r, @RequestBody Question q) {
        q.setId(null);
        q.setUserId(auth.current(r).getId());
        return questions.save(q);
    }

    @GetMapping("/questions/{id}/answers")
    public List<Answer> ans(@PathVariable Long id) {
        return answers.findByQuestionIdAndStatusOrderByCreatedAtAsc(id, "VISIBLE");
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
        List<Advertisement> active = raw.stream()
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

        return active;
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
}
