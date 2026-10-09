package com.exe201.rrms.controller;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.repository.*;
import com.exe201.rrms.service.AuthService;
import com.exe201.rrms.service.MatchingService;
import com.exe201.rrms.util.GeoUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository users;
    private final FollowRepository follows;
    private final AuthService auth;
    private final ListingRepository listings;
    private final MatchingProfileRepository matchingProfiles;
    private final ListingInterestRepository interests;
    private final MatchingService matchingService;
    private final UserBlockRepository blocks;

    public UserController(UserRepository u, FollowRepository f, AuthService a, ListingRepository l,
                          MatchingProfileRepository mp, ListingInterestRepository i, MatchingService ms,
                          UserBlockRepository blocks) {
        this.users = u;
        this.follows = f;
        this.auth = a;
        this.listings = l;
        this.matchingProfiles = mp;
        this.interests = i;
        this.matchingService = ms;
        this.blocks = blocks;
    }

    @GetMapping("/{id}/public")
    public Map<String, Object> pub(@PathVariable Long id, HttpServletRequest req) {
        User u = users.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
        User me = auth.optional(req);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("fullName", u.getFullName());
        m.put("avatarUrl", u.getAvatarUrl());
        m.put("bio", u.getBio());
        m.put("role", u.getRole());
        m.put("schoolName", u.getSchoolName());
        m.put("followers", follows.countByFollowingId(id));
        m.put("following", follows.countByFollowerId(id));
        m.put("isFollowing", me != null && follows.findByFollowerIdAndFollowingId(me.getId(), id).isPresent());

        if ("LANDLORD".equalsIgnoreCase(u.getRole())) {
            m.put("listings", listings.findByLandlordIdOrderByUpdatedAtDesc(id).stream()
                    .filter(x -> "ACTIVE".equals(x.getStatus()))
                    .toList());
            m.put("facebookUrl", u.getFacebookUrl());
            m.put("zaloUrl", u.getZaloUrl());
            m.put("otherSocialUrl", u.getOtherSocialUrl());
        } else if ("SERVICE_PROVIDER".equalsIgnoreCase(u.getRole())) {
            m.put("facebookUrl", u.getFacebookUrl());
            m.put("zaloUrl", u.getZaloUrl());
            m.put("otherSocialUrl", u.getOtherSocialUrl());
        } else {
            // TENANT privacy rules:
            boolean allowSocial = false;
            if (me != null) {
                if (me.getId().equals(id)) {
                    allowSocial = true;
                } else {
                    allowSocial = checkMatchingSocialPermission(me, u);
                }
            }
            if (allowSocial) {
                m.put("facebookUrl", u.getFacebookUrl());
                m.put("zaloUrl", u.getZaloUrl());
                m.put("otherSocialUrl", u.getOtherSocialUrl());
            } else {
                m.put("facebookUrl", null);
                m.put("zaloUrl", null);
                m.put("otherSocialUrl", null);
            }
        }

        // Never return sensitive fields to public view
        return m;
    }

    private boolean checkMatchingSocialPermission(User me, User target) {
        if (me.getGender() == null || target.getGender() == null || !me.getGender().equalsIgnoreCase(target.getGender())) {
            return false;
        }

        Optional<MatchingProfile> myProfile = matchingProfiles.findByUserId(me.getId());
        Optional<MatchingProfile> targetProfile = matchingProfiles.findByUserId(target.getId());

        if (myProfile.isEmpty() || targetProfile.isEmpty()) return false;
        MatchingProfile mp = myProfile.get();
        MatchingProfile tp = targetProfile.get();

        if (!Boolean.TRUE.equals(mp.getEnabled()) || !Boolean.TRUE.equals(tp.getEnabled())) return false;

        // Check if same-room interest exists
        var myInterests = interests.findByUserId(me.getId());
        var targetInterests = interests.findByUserId(target.getId());
        boolean sameRoom = false;
        for (var mi : myInterests) {
            if (Boolean.TRUE.equals(mi.getMatchingEnabled())) {
                for (var ti : targetInterests) {
                    if (Boolean.TRUE.equals(ti.getMatchingEnabled()) && mi.getListingId().equals(ti.getListingId())) {
                        sameRoom = true;
                        break;
                    }
                }
            }
            if (sameRoom) break;
        }

        // Or nearby
        boolean nearby = false;
        if (!sameRoom && mp.getLatitude() != null && mp.getLongitude() != null && tp.getLatitude() != null && tp.getLongitude() != null) {
            double dist = GeoUtil.km(mp.getLatitude(), mp.getLongitude(), tp.getLatitude(), tp.getLongitude());
            int maxRadius = Math.max(mp.getRadiusKm(), tp.getRadiusKm());
            if (dist <= maxRadius) {
                nearby = true;
            }
        }

        if (!sameRoom && !nearby) return false;

        // Check compatibility score >= 50
        Map<String, Object> scoreRes = matchingService.score(mp, tp);
        Object scoreVal = scoreRes.get("score");
        if (scoreVal instanceof Number n && n.intValue() >= 50) {
            return true;
        }

        return false;
    }

    @PostMapping("/{id}/follow")
    public Map<String, Object> follow(@PathVariable Long id, HttpServletRequest r) {
        User me = auth.current(r);
        if (me.getId().equals(id)) throw new IllegalArgumentException("Không thể tự theo dõi chính mình");
        var ex = follows.findByFollowerIdAndFollowingId(me.getId(), id);
        if (ex.isPresent()) {
            follows.delete(ex.get());
            return Map.of("following", false, "followers", follows.countByFollowingId(id));
        }
        Follow f = new Follow();
        f.setFollowerId(me.getId());
        f.setFollowingId(id);
        follows.save(f);
        return Map.of("following", true, "followers", follows.countByFollowingId(id));
    }

    @PostMapping("/{id}/block")
    public Map<String, Object> blockUser(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body, HttpServletRequest r) {
        User me = auth.current(r);
        if (me.getId().equals(id)) throw new IllegalArgumentException("Không thể tự chặn chính mình");
        if (!blocks.existsByBlockerIdAndBlockedId(me.getId(), id)) {
            com.exe201.rrms.entity.UserBlock b = new com.exe201.rrms.entity.UserBlock();
            b.setBlockerId(me.getId());
            b.setBlockedId(id);
            b.setReason(body != null ? body.get("reason") : "Người dùng tự chặn");
            blocks.save(b);
        }
        return Map.of("blocked", true, "blockedUserId", id);
    }

    @PostMapping("/{id}/unblock")
    public Map<String, Object> unblockUser(@PathVariable Long id, HttpServletRequest r) {
        User me = auth.current(r);
        blocks.deleteByBlockerIdAndBlockedId(me.getId(), id);
        return Map.of("blocked", false, "blockedUserId", id);
    }

    @GetMapping("/blocked")
    public List<Map<String, Object>> getBlockedUsers(HttpServletRequest r) {
        User me = auth.current(r);
        List<com.exe201.rrms.entity.UserBlock> list = blocks.findByBlockerId(me.getId());
        List<Map<String, Object>> res = new ArrayList<>();
        for (var b : list) {
            User target = users.findById(b.getBlockedId()).orElse(null);
            if (target != null) {
                res.add(Map.of(
                        "id", b.getId(),
                        "blockedUserId", target.getId(),
                        "fullName", target.getFullName() != null ? target.getFullName() : "Người dùng #" + target.getId(),
                        "avatarUrl", target.getAvatarUrl() != null ? target.getAvatarUrl() : "",
                        "reason", b.getReason() != null ? b.getReason() : "",
                        "createdAt", b.getCreatedAt()
                ));
            }
        }
        return res;
    }

    @PostMapping("/accept-terms")
    public Map<String, Object> acceptTerms(@RequestBody Map<String, String> body, HttpServletRequest r) {
        User me = auth.current(r);
        String version = body.getOrDefault("version", "2026.1");
        me.setTermsVersion(version);
        me.setTermsAcceptedAt(java.time.LocalDateTime.now());
        users.save(me);
        return Map.of("success", true, "termsVersion", version, "termsAcceptedAt", me.getTermsAcceptedAt());
    }

    @PutMapping("/preferred-location")
    public Map<String, Object> updatePreferredLocation(@RequestBody Map<String, Object> body, HttpServletRequest r) {
        User me = auth.current(r);
        if (body.get("preferredLocationName") != null) {
            me.setPreferredLocationName(body.get("preferredLocationName").toString());
        }
        if (body.get("preferredLat") != null) {
            me.setPreferredLat(Double.valueOf(body.get("preferredLat").toString()));
        }
        if (body.get("preferredLng") != null) {
            me.setPreferredLng(Double.valueOf(body.get("preferredLng").toString()));
        }
        users.save(me);
        return Map.of("success", true, "preferredLocationName", me.getPreferredLocationName() != null ? me.getPreferredLocationName() : "");
    }

    @PutMapping("/contact-visibility")
    public Map<String, Object> updateContactVisibility(@RequestBody Map<String, String> body, HttpServletRequest r) {
        User me = auth.current(r);
        String vis = body.getOrDefault("contactVisibility", "LOGIN_REQUIRED");
        me.setContactVisibility(vis);
        users.save(me);
        return Map.of("success", true, "contactVisibility", vis);
    }
}
