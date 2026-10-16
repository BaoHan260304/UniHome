package com.exe201.rrms.controller;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.repository.*;
import com.exe201.rrms.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/my-posts", "/my-posts"})
public class MyPostsController {

    private static final Logger log = LoggerFactory.getLogger(MyPostsController.class);

    private final AuthService auth;
    private final ListingRepository listings;
    private final PropertyRepository props;
    private final SecondHandListingRepository secondHandRepo;
    private final ServiceListingRepository serviceRepo;
    private final FavoriteRepository favs;
    private final ListingInterestRepository interests;
    private final ConversationRepository convs;

    public MyPostsController(AuthService auth,
                              ListingRepository listings,
                              PropertyRepository props,
                              SecondHandListingRepository secondHandRepo,
                              ServiceListingRepository serviceRepo,
                              FavoriteRepository favs,
                              ListingInterestRepository interests,
                              ConversationRepository convs) {
        this.auth = auth;
        this.listings = listings;
        this.props = props;
        this.secondHandRepo = secondHandRepo;
        this.serviceRepo = serviceRepo;
        this.favs = favs;
        this.interests = interests;
        this.convs = convs;
    }

    @GetMapping({"", "/"})
    public List<Map<String, Object>> getMyPosts(HttpServletRequest req) {
        User u = auth.optional(req);
        if (u == null) {
            return Collections.emptyList();
        }
        Long uid = u.getId();
        List<Map<String, Object>> allPosts = new ArrayList<>();

        // 1. Room & Roommate listings
        try {
            List<Listing> userListings = listings.findByLandlordIdOrderByUpdatedAtDesc(uid);
            if (userListings != null) {
                for (Listing l : userListings) {
                    if (l == null || l.getId() == null) continue;
                    // Exclude archived/deleted listings from active management
                    if ("ARCHIVED".equalsIgnoreCase(l.getStatus()) || "DELETED".equalsIgnoreCase(l.getStatus())) {
                        continue;
                    }

                    Property p = null;
                    if (l.getPropertyId() != null) {
                        try {
                            p = props.findById(l.getPropertyId()).orElse(null);
                        } catch (Exception ex) {
                            log.warn("Failed to find property for listing #{}: {}", l.getId(), ex.getMessage());
                        }
                    }

                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", l.getId());
                    item.put("targetId", l.getId());
                    item.put("listingId", l.getId());
                    item.put("propertyId", p != null ? p.getId() : null);

                    String postType = p != null && p.getPostType() != null ? p.getPostType().trim() : "ROOM_FOR_RENT";
                    String rel = p != null && p.getPosterRelationship() != null ? p.getPosterRelationship().trim() : "OWNER";

                    boolean isRoommate = Set.of("ROOMMATE_SEARCH", "TENANT_TRANSFER").contains(rel)
                            || Set.of("ROOM_TRANSFER", "ROOMMATE_WANTED", "SHARED_ROOM", "OGHEP", "O_GHEP", "TIM_NGUOI_O_GHEP", "TIM_BAN_O_GHEP", "ROOMMATE").contains(postType);

                    String category = isRoommate ? "ROOMMATE" : "ROOM";
                    String categoryLabel = isRoommate ? "Ở ghép / Sang nhượng" : "Phòng & Căn hộ";

                    item.put("category", category);
                    item.put("categoryLabel", categoryLabel);
                    item.put("type", category);
                    item.put("postType", postType);
                    item.put("relationship", rel);
                    item.put("posterRelationship", rel);

                    item.put("title", l.getTitle() != null ? l.getTitle() : (p != null && p.getName() != null ? p.getName() : "Tin phòng #" + l.getId()));
                    item.put("status", l.getStatus() != null ? l.getStatus() : "ACTIVE");
                    item.put("price", p != null && p.getPrice() != null ? p.getPrice() : 0L);
                    item.put("createdAt", l.getCreatedAt());
                    item.put("updatedAt", l.getUpdatedAt());
                    item.put("expiresAt", l.getPackageUntil() != null ? l.getPackageUntil() : l.getFreshnessDueAt());

                    // First image
                    String img = null;
                    if (p != null) {
                        img = extractFirstImage(p.getImageUrl(), p.getMediaJson());
                    }
                    item.put("imageUrl", img);
                    item.put("coverImage", img);
                    item.put("address", p != null ? formatAddress(p) : "");
                    item.put("availability", p != null && p.getAvailability() != null ? p.getAvailability() : "AVAILABLE");

                    // Counters
                    long viewCount = l.getViewCount() != null ? l.getViewCount() : 0L;
                    long favoriteCount = 0L;
                    try {
                        favoriteCount = favs.countByListingId(l.getId());
                    } catch (Exception ex) {
                        log.warn("Failed to count favorites for listing #{}: {}", l.getId(), ex.getMessage());
                    }

                    long interestCount = l.getInterestCount() != null ? l.getInterestCount() : 0L;
                    long chatCount = 0L;
                    try {
                        chatCount = convs.countByContextTypeAndContextId("ROOM", l.getId())
                                + convs.countByContextTypeAndContextId("ROOM_MATCH", l.getId())
                                + convs.countByContextTypeAndContextId("ROOMMATE", l.getId());
                    } catch (Exception ex) {
                        log.warn("Failed to count chat for listing #{}: {}", l.getId(), ex.getMessage());
                    }

                    item.put("viewCount", viewCount);
                    item.put("views", viewCount);
                    item.put("favoriteCount", favoriteCount);
                    item.put("favorites", favoriteCount);
                    item.put("chatCount", chatCount);
                    item.put("interestCount", interestCount);
                    item.put("interests", interestCount);
                    item.put("contacts", interestCount);

                    // VIP & Packages
                    item.put("packageTier", l.getPackageTier() != null ? l.getPackageTier() : "FREE");
                    item.put("packagePriority", l.getPackagePriority() != null ? l.getPackagePriority() : 0);
                    item.put("vipTier", l.getPackageTier() != null ? l.getPackageTier() : "FREE");
                    item.put("vipBadge", l.getPackageTier());
                    item.put("isVip", l.getPackageTier() != null && !"FREE".equalsIgnoreCase(l.getPackageTier()));
                    item.put("boostUntil", l.getBoostUntil());
                    item.put("revisionNote", l.getRevisionNote());

                    allPosts.add(item);
                }
            }
        } catch (Exception e) {
            log.error("Error retrieving room/roommate listings for user {}: {}", uid, e.getMessage(), e);
        }

        // 2. Second-Hand listings
        try {
            List<SecondHandListing> userSecondHands = secondHandRepo.findBySellerIdOrderByCreatedAtDesc(uid);
            if (userSecondHands != null) {
                for (SecondHandListing s : userSecondHands) {
                    if (s == null || s.getId() == null) continue;
                    if ("DELETED".equalsIgnoreCase(s.getStatus()) || "ARCHIVED".equalsIgnoreCase(s.getStatus())) {
                        continue;
                    }

                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", s.getId());
                    item.put("targetId", s.getId());
                    item.put("category", "SECOND_HAND");
                    item.put("categoryLabel", "Đồ cũ sinh viên");
                    item.put("type", "SECOND_HAND");
                    item.put("postType", s.getCategory() != null ? s.getCategory() : "OTHER");
                    item.put("relationship", "SELLER");
                    item.put("posterRelationship", "SELLER");

                    item.put("title", s.getTitle());
                    item.put("status", s.getStatus() != null ? s.getStatus() : "ACTIVE");
                    item.put("price", s.getPrice() != null ? s.getPrice() : 0L);
                    item.put("createdAt", s.getCreatedAt());
                    item.put("updatedAt", s.getCreatedAt());
                    item.put("expiresAt", s.getExpiresAt());

                    String img = s.getImageUrl();
                    if ((img == null || img.isBlank()) && s.getGalleryJson() != null) {
                        img = extractFirstImage(s.getGalleryJson(), null);
                    }
                    item.put("imageUrl", img);
                    item.put("coverImage", img);

                    String addr = (s.getDistrict() != null && !s.getDistrict().isBlank() ? s.getDistrict() + ", " : "")
                            + (s.getProvince() != null ? s.getProvince() : "");
                    item.put("address", addr);
                    item.put("availability", "ACTIVE".equalsIgnoreCase(s.getStatus()) ? "AVAILABLE" : s.getStatus());

                    item.put("viewCount", 0L);
                    item.put("views", 0L);
                    item.put("favoriteCount", 0L);
                    item.put("favorites", 0L);

                    long chatCount = 0L;
                    try {
                        chatCount = convs.countByContextTypeAndContextId("SECOND_HAND", s.getId());
                    } catch (Exception ex) {
                        log.warn("Failed to count chat for second-hand #{}: {}", s.getId(), ex.getMessage());
                    }
                    item.put("chatCount", chatCount);
                    item.put("interestCount", 0L);
                    item.put("interests", 0L);
                    item.put("contacts", 0L);

                    item.put("packageTier", "FREE");
                    item.put("packagePriority", 0);
                    item.put("vipTier", "NONE");
                    item.put("vipBadge", null);
                    item.put("isVip", false);
                    item.put("boostUntil", null);
                    item.put("conditionText", s.getConditionText());

                    allPosts.add(item);
                }
            }
        } catch (Exception e) {
            log.error("Error retrieving second-hand listings for user {}: {}", uid, e.getMessage(), e);
        }

        // 3. Service listings
        try {
            List<ServiceListing> userServices = serviceRepo.findByProviderIdOrderByCreatedAtDesc(uid);
            if (userServices != null) {
                for (ServiceListing sv : userServices) {
                    if (sv == null || sv.getId() == null) continue;
                    if ("DELETED".equalsIgnoreCase(sv.getStatus()) || "ARCHIVED".equalsIgnoreCase(sv.getStatus())) {
                        continue;
                    }

                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", sv.getId());
                    item.put("targetId", sv.getId());
                    item.put("category", "SERVICE");
                    item.put("categoryLabel", "Dịch vụ sinh viên");
                    item.put("type", "SERVICE");
                    item.put("postType", sv.getCategory() != null ? sv.getCategory() : "OTHER");
                    item.put("relationship", "SERVICE_PROVIDER");
                    item.put("posterRelationship", "SERVICE_PROVIDER");

                    item.put("title", sv.getTitle());
                    item.put("status", sv.getStatus() != null ? sv.getStatus() : "ACTIVE");
                    item.put("price", sv.getPriceFrom() != null ? sv.getPriceFrom() : 0L);
                    item.put("createdAt", sv.getCreatedAt());
                    item.put("updatedAt", sv.getCreatedAt());
                    item.put("expiresAt", null);

                    String img = sv.getImageUrl();
                    if ((img == null || img.isBlank()) && sv.getGalleryJson() != null) {
                        img = extractFirstImage(sv.getGalleryJson(), null);
                    }
                    item.put("imageUrl", img);
                    item.put("coverImage", img);

                    String addr = sv.getServiceArea() != null && !sv.getServiceArea().isBlank()
                            ? sv.getServiceArea()
                            : (sv.getDistrict() != null ? sv.getDistrict() + ", " : "") + (sv.getProvince() != null ? sv.getProvince() : "");
                    item.put("address", addr);
                    item.put("availability", "ACTIVE".equalsIgnoreCase(sv.getStatus()) ? "AVAILABLE" : sv.getStatus());

                    item.put("viewCount", 0L);
                    item.put("views", 0L);
                    item.put("favoriteCount", 0L);
                    item.put("favorites", 0L);

                    long chatCount = 0L;
                    try {
                        chatCount = convs.countByContextTypeAndContextId("SERVICE", sv.getId());
                    } catch (Exception ex) {
                        log.warn("Failed to count chat for service #{}: {}", sv.getId(), ex.getMessage());
                    }
                    item.put("chatCount", chatCount);
                    item.put("interestCount", 0L);
                    item.put("interests", 0L);
                    item.put("contacts", 0L);

                    item.put("packageTier", "FREE");
                    item.put("packagePriority", 0);
                    item.put("vipTier", "NONE");
                    item.put("vipBadge", null);
                    item.put("isVip", false);
                    item.put("boostUntil", null);

                    allPosts.add(item);
                }
            }
        } catch (Exception e) {
            log.error("Error retrieving service listings for user {}: {}", uid, e.getMessage(), e);
        }

        // Sort combined list newest first
        allPosts.sort((a, b) -> {
            LocalDateTime t1 = (LocalDateTime) (a.get("updatedAt") != null ? a.get("updatedAt") : a.get("createdAt"));
            LocalDateTime t2 = (LocalDateTime) (b.get("updatedAt") != null ? b.get("updatedAt") : b.get("createdAt"));
            if (t1 == null && t2 == null) return 0;
            if (t1 == null) return 1;
            if (t2 == null) return -1;
            return t2.compareTo(t1);
        });

        return allPosts;
    }

    private String extractFirstImage(String imgUrl, String mediaJson) {
        if (imgUrl != null && !imgUrl.isBlank()) {
            if (imgUrl.startsWith("[")) {
                try {
                    int start = imgUrl.indexOf("\"");
                    if (start != -1) {
                        int end = imgUrl.indexOf("\"", start + 1);
                        if (end != -1) return imgUrl.substring(start + 1, end);
                    }
                } catch (Exception ignored) {}
            } else if (imgUrl.contains(",")) {
                return imgUrl.split(",")[0].trim();
            } else {
                return imgUrl.trim();
            }
        }
        if (mediaJson != null && !mediaJson.isBlank()) {
            try {
                int urlIdx = mediaJson.indexOf("\"url\"");
                if (urlIdx != -1) {
                    int start = mediaJson.indexOf("\"", urlIdx + 5);
                    if (start != -1) {
                        int quote1 = mediaJson.indexOf("\"", start + 1);
                        int quote2 = mediaJson.indexOf("\"", quote1 + 1);
                        if (quote1 != -1 && quote2 != -1) {
                            return mediaJson.substring(quote1 + 1, quote2);
                        }
                    }
                }
            } catch (Exception ignored) {}
        }
        return null;
    }

    private String formatAddress(Property p) {
        List<String> parts = new ArrayList<>();
        if (p.getStreet() != null && !p.getStreet().isBlank()) parts.add(p.getStreet());
        if (p.getWard() != null && !p.getWard().isBlank()) parts.add(p.getWard());
        if (p.getDistrict() != null && !p.getDistrict().isBlank()) parts.add(p.getDistrict());
        if (p.getProvince() != null && !p.getProvince().isBlank()) parts.add(p.getProvince());
        return String.join(", ", parts);
    }
}
