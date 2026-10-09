package com.exe201.rrms.controller;

import com.exe201.rrms.entity.Follow;
import com.exe201.rrms.entity.MatchingProfile;
import com.exe201.rrms.entity.User;
import com.exe201.rrms.repository.FollowRepository;
import com.exe201.rrms.repository.ListingInterestRepository;
import com.exe201.rrms.repository.ListingRepository;
import com.exe201.rrms.repository.MatchingProfileRepository;
import com.exe201.rrms.repository.UserRepository;
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

    public UserController(UserRepository u, FollowRepository f, AuthService a, ListingRepository l,
                          MatchingProfileRepository mp, ListingInterestRepository i, MatchingService ms) {
        this.users = u;
        this.follows = f;
        this.auth = a;
        this.listings = l;
        this.matchingProfiles = mp;
        this.interests = i;
        this.matchingService = ms;
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
}
