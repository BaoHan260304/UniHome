package com.exe201.rrms.service;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.exception.ValidationException;
import com.exe201.rrms.repository.*;
import com.exe201.rrms.util.GeoUtil;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MatchingService {
    private final MatchingProfileRepository profiles;
    private final ListingInterestRepository interests;
    private final UserRepository users;
    private final AiCompatibilityService ai;
    private final UserBlockRepository blocks;

    public MatchingService(MatchingProfileRepository p, ListingInterestRepository i, UserRepository u, AiCompatibilityService ai, UserBlockRepository blocks) {
        this.profiles = p;
        this.interests = i;
        this.users = u;
        this.ai = ai;
        this.blocks = blocks;
    }

    public List<Map<String, Object>> sameRoom(Long userId, Long listingId) {
        MatchingProfile me = profiles.findByUserId(userId)
                .orElseThrow(() -> new ValidationException("profile", "Bạn cần hoàn thành hồ sơ Matching trước khi tìm bạn cùng phòng"));
        if (!Boolean.TRUE.equals(me.getEnabled())) {
            throw new ValidationException("enabled", "Bạn chưa bật tính năng Matching trong hồ sơ");
        }
        if (me.getGender() == null || me.getGender().isBlank()) {
            throw new ValidationException("gender", "Vui lòng cập nhật giới tính trong hồ sơ Matching");
        }

        List<Map<String, Object>> out = new ArrayList<>();
        List<ListingInterest> inPool = interests.findByListingIdAndMatchingEnabledTrue(listingId);

        for (ListingInterest in : inPool) {
            if (in.getUserId().equals(userId)) continue;
            if (blocks.existsByBlockerIdAndBlockedId(userId, in.getUserId()) || blocks.existsByBlockerIdAndBlockedId(in.getUserId(), userId)) {
                continue;
            }
            profiles.findByUserId(in.getUserId())
                    .filter(x -> Boolean.TRUE.equals(x.getEnabled()))
                    .ifPresent(p -> {
                        Map<String, Object> r = score(me, p);
                        if (r.get("score") instanceof Number n && n.intValue() >= 50) {
                            r.put("mode", "SAME_ROOM");
                            r.put("listingId", listingId);
                            out.add(r);
                        }
                    });
        }

        out.sort(Comparator.comparingInt((Map<String, Object> x) -> ((Number) x.get("score")).intValue()).reversed());
        return out;
    }

    public List<Map<String, Object>> nearby(Long userId, int radius) {
        MatchingProfile me = profiles.findByUserId(userId)
                .orElseThrow(() -> new ValidationException("profile", "Bạn cần hoàn thành hồ sơ Matching trước khi tìm bạn cùng phòng"));

        if (!Boolean.TRUE.equals(me.getEnabled())) {
            throw new ValidationException("enabled", "Bạn cần bật tính năng Matching trong hồ sơ để tìm kiếm");
        }

        if (me.getLatitude() == null || me.getLongitude() == null) {
            throw new ValidationException("location", "Vui lòng cập nhật tọa độ vị trí (vĩ độ, kinh độ) để tìm kiếm bạn cùng phòng xung quanh.");
        }

        if (me.getGender() == null || me.getGender().isBlank()) {
            throw new ValidationException("gender", "Vui lòng cập nhật giới tính trong hồ sơ Matching");
        }

        List<Map<String, Object>> out = new ArrayList<>();
        List<MatchingProfile> candidates = profiles.findByEnabledTrue();

        for (MatchingProfile p : candidates) {
            if (p.getUserId().equals(userId)) continue;
            if (blocks.existsByBlockerIdAndBlockedId(userId, p.getUserId()) || blocks.existsByBlockerIdAndBlockedId(p.getUserId(), userId)) {
                continue;
            }
            if (p.getLatitude() == null || p.getLongitude() == null) continue;

            double d = GeoUtil.km(me.getLatitude(), me.getLongitude(), p.getLatitude(), p.getLongitude());
            if (d <= radius) {
                Map<String, Object> r = score(me, p);
                if (r.get("score") instanceof Number n && n.intValue() >= 50) {
                    r.put("distanceKm", Math.round(d * 10) / 10.0);
                    r.put("mode", "NEARBY");
                    out.add(r);
                }
            }
        }

        out.sort(Comparator.comparingInt((Map<String, Object> x) -> ((Number) x.get("score")).intValue()).reversed());
        return out;
    }

    public Map<String, Object> score(MatchingProfile a, MatchingProfile b) {
        // Hard constraint: MUST be same gender
        if (a.getGender() == null || b.getGender() == null || !a.getGender().trim().equalsIgnoreCase(b.getGender().trim())) {
            return Map.of("score", 0, "eligible", false, "reason", "Khác giới tính theo chính sách UniHome Matching");
        }

        int score = 0;
        int max = 0;
        List<String> strengths = new ArrayList<>();
        List<String> conflicts = new ArrayList<>();

        // Sleep schedule (15%)
        score += eq(a.getSleepSchedule(), b.getSleepSchedule(), 15, strengths, conflicts, "giờ ngủ");
        max += 15;

        // Cleanliness level (15%)
        score += nearInt(a.getCleanlinessLevel(), b.getCleanlinessLevel(), 15, strengths, conflicts, "mức sạch sẽ");
        max += 15;

        // Smoking (15%)
        score += eq(a.getSmoking(), b.getSmoking(), 15, strengths, conflicts, "hút thuốc");
        max += 15;

        // Budget overlap (15%)
        score += budget(a, b, 15, strengths, conflicts);
        max += 15;

        // Noise preference (10%)
        score += eq(a.getNoisePreference(), b.getNoisePreference(), 10, strengths, conflicts, "mức ồn");
        max += 10;

        // Pets (8%)
        score += eq(a.getPets(), b.getPets(), 8, strengths, conflicts, "thú cưng");
        max += 8;

        // Guest frequency (7%)
        score += eq(a.getGuestFrequency(), b.getGuestFrequency(), 7, strengths, conflicts, "khách tới chơi");
        max += 7;

        // Cooking (5%)
        score += eq(a.getCooking(), b.getCooking(), 5, strengths, conflicts, "nấu ăn");
        max += 5;

        // Expense style (5%)
        score += eq(a.getExpenseStyle(), b.getExpenseStyle(), 5, strengths, conflicts, "chia chi phí");
        max += 5;

        // Communication style (5%)
        score += eq(a.getCommunicationStyle(), b.getCommunicationStyle(), 5, strengths, conflicts, "giao tiếp");
        max += 5;

        int pct = (int) Math.round(score * 100.0 / Math.max(1, max));
        User u = users.findById(b.getUserId()).orElse(null);

        String aiExplanation;
        try {
            aiExplanation = ai.explain(pct, strengths, conflicts);
        } catch (Exception e) {
            aiExplanation = defaultExplanation(pct, strengths, conflicts);
        }

        String fb = (b.getFacebookUrl() != null && !b.getFacebookUrl().isBlank()) ? b.getFacebookUrl().trim() : (u != null ? u.getFacebookUrl() : null);
        String zl = (b.getZaloUrl() != null && !b.getZaloUrl().isBlank()) ? b.getZaloUrl().trim() : (u != null ? u.getZaloUrl() : null);
        String oth = (b.getOtherSocialUrl() != null && !b.getOtherSocialUrl().isBlank()) ? b.getOtherSocialUrl().trim() : (u != null ? u.getOtherSocialUrl() : null);

        // Normalize Zalo if it's pure digits/phone
        if (zl != null && !zl.isBlank()) {
            String cleanZl = zl.trim();
            if (!cleanZl.startsWith("http://") && !cleanZl.startsWith("https://")) {
                if (cleanZl.matches("^(\\+?84|0)[0-9]{8,11}$")) {
                    cleanZl = "https://zalo.me/" + (cleanZl.startsWith("+") ? cleanZl.substring(1) : cleanZl);
                } else if (cleanZl.contains("zalo.me")) {
                    cleanZl = "https://" + cleanZl;
                }
            }
            zl = cleanZl;
        }

        // Normalize Facebook
        if (fb != null && !fb.isBlank()) {
            String cleanFb = fb.trim();
            if (!cleanFb.startsWith("http://") && !cleanFb.startsWith("https://")) {
                cleanFb = "https://" + cleanFb;
            }
            fb = cleanFb;
        }

        // Normalize Other Social
        if (oth != null && !oth.isBlank()) {
            String cleanOth = oth.trim();
            if (!cleanOth.startsWith("http://") && !cleanOth.startsWith("https://") && !cleanOth.startsWith("mailto:") && !cleanOth.startsWith("tel:")) {
                cleanOth = "https://" + cleanOth;
            }
            oth = cleanOth;
        }

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("userId", b.getUserId());
        r.put("fullName", u == null ? "Người dùng" : (u.getFullName() != null && !u.getFullName().isBlank() ? u.getFullName() : "Người dùng #" + b.getUserId()));
        r.put("avatarUrl", u == null ? null : u.getAvatarUrl());
        r.put("gender", b.getGender());
        r.put("schoolName", b.getSchoolName() != null && !b.getSchoolName().isBlank() ? b.getSchoolName() : (u != null && u.getSchoolName() != null ? u.getSchoolName() : ""));
        r.put("score", pct);
        r.put("compatibilityScore", pct);
        r.put("strengths", strengths);
        r.put("conflicts", conflicts);
        r.put("reason", aiExplanation);
        r.put("compatibilityExplanation", aiExplanation);
        r.put("facebookUrl", fb);
        r.put("zaloUrl", zl);
        r.put("otherSocialUrl", oth);
        r.put("matchingEnabled", Boolean.TRUE.equals(b.getEnabled()));
        return r;
    }

    private int eq(String a, String b, int w, List<String> s, List<String> c, String label) {
        if (a == null || b == null) return w / 2;
        if (a.trim().equalsIgnoreCase(b.trim())) {
            s.add("Tương đồng về " + label);
            return w;
        }
        c.add("Khác nhau về " + label);
        return w / 3;
    }

    private int nearInt(Integer a, Integer b, int w, List<String> s, List<String> c, String label) {
        if (a == null || b == null) return w / 2;
        if (Math.abs(a - b) <= 1) {
            s.add("Khá tương đồng về " + label);
            return w;
        }
        c.add("Chênh lệch về " + label);
        return w / 3;
    }

    private int budget(MatchingProfile a, MatchingProfile b, int w, List<String> s, List<String> c) {
        if (a.getBudgetMax() == null || b.getBudgetMax() == null) return w / 2;
        long amin = a.getBudgetMin() == null ? 0 : a.getBudgetMin();
        long bmin = b.getBudgetMin() == null ? 0 : b.getBudgetMin();
        boolean overlap = Math.max(amin, bmin) <= Math.min(a.getBudgetMax(), b.getBudgetMax());
        if (overlap) {
            s.add("Ngân sách có vùng giao nhau");
            return w;
        }
        c.add("Ngân sách chênh lệch");
        return w / 4;
    }

    private String defaultExplanation(int p, List<String> s, List<String> c) {
        StringBuilder x = new StringBuilder("Mức tương hợp " + p + "%. ");
        if (!s.isEmpty()) x.append("Điểm tương đồng: ").append(String.join(", ", s)).append(". ");
        if (!c.isEmpty()) x.append("Nên trao đổi trước: ").append(String.join(", ", c)).append(".");
        return x.toString();
    }
}
