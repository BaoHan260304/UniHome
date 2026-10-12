package com.exe201.rrms.controller;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.exception.ValidationException;
import com.exe201.rrms.repository.*;
import com.exe201.rrms.service.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {
    private final AuthService auth;
    private final MatchingProfileRepository profiles;
    private final MatchingService match;
    private final ListingInterestRepository interests;
    private final UserRepository users;

    public MatchingController(AuthService a, MatchingProfileRepository p, MatchingService m,
                              ListingInterestRepository i, UserRepository u) {
        this.auth = a;
        this.profiles = p;
        this.match = m;
        this.interests = i;
        this.users = u;
    }

    @GetMapping("/profile")
    public MatchingProfile profile(HttpServletRequest r) {
        User u = auth.current(r);
        return profiles.findByUserId(u.getId()).orElseGet(() -> {
            MatchingProfile p = new MatchingProfile();
            p.setUserId(u.getId());
            p.setGender(u.getGender());
            p.setSchoolName(u.getSchoolName());
            p.setLatitude(u.getHomeLat());
            p.setLongitude(u.getHomeLng());
            p.setRadiusKm(u.getMatchingRadiusKm() != null ? u.getMatchingRadiusKm() : 5);
            p.setFacebookUrl(u.getFacebookUrl());
            p.setZaloUrl(u.getZaloUrl());
            p.setOtherSocialUrl(u.getOtherSocialUrl());
            return p;
        });
    }

    @PutMapping("/profile")
    public MatchingProfile save(HttpServletRequest r, @RequestBody MatchingProfile d) {
        User u = auth.current(r);
        if (List.of("ADMIN", "SUPER_ADMIN", "MODERATOR").contains(u.getRole())) {
            throw new ValidationException("role", "Tài khoản quản trị viên không tham gia tính năng tìm người ở ghép.");
        }

        Map<String, String> errors = new LinkedHashMap<>();
        if (Boolean.TRUE.equals(d.getEnabled())) {
            if (d.getGender() == null || d.getGender().trim().isBlank()) {
                errors.put("gender", "Giới tính là bắt buộc khi tham gia Matching");
            }
            if (d.getSchoolName() == null || d.getSchoolName().trim().isBlank()) {
                errors.put("schoolName", "Trường học hoặc khu vực là bắt buộc");
            }
            if (d.getBudgetMin() != null && d.getBudgetMax() != null && d.getBudgetMin() > d.getBudgetMax()) {
                errors.put("budgetMax", "Ngân sách tối đa phải lớn hơn hoặc bằng ngân sách tối thiểu");
            }
            if (d.getRadiusKm() != null && (d.getRadiusKm() < 1 || d.getRadiusKm() > 10)) {
                errors.put("radiusKm", "Bán kính tìm kiếm từ 1 đến 10 km");
            }
        }

        if (!errors.isEmpty()) {
            throw new ValidationException("Hồ sơ Matching chưa hợp lệ", errors);
        }

        MatchingProfile p = profiles.findByUserId(u.getId()).orElseGet(MatchingProfile::new);
        Long id = p.getId();
        BeanUtils.copyProperties(d, p, "id", "userId");
        p.setId(id);
        p.setUserId(u.getId());
        MatchingProfile saved = profiles.save(p);

        // Keep User entity fields in sync
        boolean userChanged = false;
        if (p.getGender() != null && !p.getGender().equals(u.getGender())) {
            u.setGender(p.getGender());
            userChanged = true;
        }
        if (p.getLatitude() != null && !Objects.equals(p.getLatitude(), u.getHomeLat())) {
            u.setHomeLat(p.getLatitude());
            userChanged = true;
        }
        if (p.getLongitude() != null && !Objects.equals(p.getLongitude(), u.getHomeLng())) {
            u.setHomeLng(p.getLongitude());
            userChanged = true;
        }
        if (p.getRadiusKm() != null && !Objects.equals(p.getRadiusKm(), u.getMatchingRadiusKm())) {
            u.setMatchingRadiusKm(p.getRadiusKm());
            userChanged = true;
        }
        if (userChanged) {
            users.save(u);
        }

        return saved;
    }

    @GetMapping("/listing/{listingId}")
    public List<Map<String, Object>> same(@PathVariable Long listingId, HttpServletRequest r) {
        User u = auth.current(r);
        ListingInterest i = interests.findByListingIdAndUserId(listingId, u.getId())
                .orElseThrow(() -> new ValidationException("interest", "Bạn cần bấm 'Quan tâm phòng' trước khi xem danh sách cùng thuê"));
        if (!Boolean.TRUE.equals(i.getMatchingEnabled())) {
            throw new ValidationException("matchingEnabled", "Hãy bật tính năng 'Tìm bạn cùng thuê phòng này'");
        }
        return match.sameRoom(u.getId(), listingId);
    }

    @GetMapping({"/listings/{listingId}/candidates", "/listing/{listingId}/candidates"})
    public Map<String, Object> getListingCandidates(
            @PathVariable Long listingId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest r
    ) {
        User u = auth.optional(r);
        List<Map<String, Object>> candidates = new ArrayList<>();
        if (u != null) {
            try {
                candidates = match.sameRoom(u.getId(), listingId);
            } catch (Exception ignored) {
                // User may not have profile or matching enabled
            }
        }

        int total = candidates.size();
        int start = Math.min(page * size, total);
        int end = Math.min(start + size, total);
        List<Map<String, Object>> paged = candidates.subList(start, end);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("listingId", listingId);
        resp.put("threshold", 50);
        resp.put("totalElements", total);
        resp.put("items", paged);
        return resp;
    }

    @GetMapping("/nearby")
    public List<Map<String, Object>> nearby(@RequestParam(defaultValue = "5") int radiusKm, HttpServletRequest r) {
        User u = auth.current(r);
        int safeRadius = Math.min(5, Math.max(1, radiusKm));
        return match.nearby(u.getId(), safeRadius);
    }
}
