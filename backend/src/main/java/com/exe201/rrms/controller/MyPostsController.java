package com.exe201.rrms.controller;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.repository.*;
import com.exe201.rrms.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/my-posts")
public class MyPostsController {

    private final AuthService auth;
    private final ListingRepository listings;
    private final PropertyRepository props;
    private final SecondHandListingRepository secondHandRepo;
    private final ServiceListingRepository serviceRepo;
    private final FavoriteRepository favs;
    private final ListingInterestRepository interests;
    private final ConversationRepository convs;
    private final PostPromotionRepository promotions;

    public MyPostsController(AuthService auth,
                             ListingRepository listings,
                             PropertyRepository props,
                             SecondHandListingRepository secondHandRepo,
                             ServiceListingRepository serviceRepo,
                             FavoriteRepository favs,
                             ListingInterestRepository interests,
                             ConversationRepository convs,
                             PostPromotionRepository promotions) {
        this.auth = auth;
        this.listings = listings;
        this.props = props;
        this.secondHandRepo = secondHandRepo;
        this.serviceRepo = serviceRepo;
        this.favs = favs;
        this.interests = interests;
        this.convs = convs;
        this.promotions = promotions;
    }

    @GetMapping
    public List<Map<String, Object>> getMyPosts(HttpServletRequest req) {
        User u = auth.current(req);
        Long uid = u.getId();
        List<Map<String, Object>> allPosts = new ArrayList<>();

        // 1. Room / House / Transfer / Roommate listings
        List<Listing> userListings = listings.findByLandlordIdOrderByUpdatedAtDesc(uid);
        for (Listing l : userListings) {
            Property p = props.findById(l.getPropertyId()).orElse(null);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", "room_" + l.getId());
            item.put("targetId", l.getId());
            item.put("propertyId", p != null ? p.getId() : null);

            String postType = p != null && p.getPostType() != null ? p.getPostType() : "ROOM_FOR_RENT";
            boolean isTransferOrRoommate = Set.of("ROOM_TRANSFER", "ROOMMATE_WANTED", "SHARED_ROOM").contains(postType);
            item.put("category", isTransferOrRoommate ? "ROOM_TRANSFER" : "ROOM");
            item.put("categoryLabel", isTransferOrRoommate ? "Nhượng phòng / Ở ghép" : "Phòng / Nhà");
            item.put("postType", postType);
            item.put("posterRelationship", p != null && p.getPosterRelationship() != null ? p.getPosterRelationship() : "OWNER");

            item.put("title", l.getTitle() != null ? l.getTitle() : (p != null ? p.getName() : "Tin phòng #" + l.getId()));
            item.put("status", l.getStatus());
            item.put("price", p != null ? p.getPrice() : 0L);
            item.put("createdAt", l.getCreatedAt());
            item.put("updatedAt", l.getUpdatedAt());
            item.put("expiresAt", l.getPackageUntil() != null ? l.getPackageUntil() : l.getFreshnessDueAt());

            // First image
            String img = null;
            if (p != null && p.getImageUrl() != null && !p.getImageUrl().isBlank()) {
                img = extractFirstImage(p.getImageUrl(), p.getMediaJson());
            }
            item.put("imageUrl", img);
            item.put("address", p != null ? formatAddress(p) : "");
            item.put("availability", p != null ? p.getAvailability() : "AVAILABLE");

            item.put("views", l.getViewCount() != null ? l.getViewCount() : 0L);
            item.put("favorites", favs.countByListingId(l.getId()));
            item.put("contacts", l.getInterestCount() != null ? l.getInterestCount() : 0L);
            item.put("chatCount", convs.countByContextTypeAndContextId("ROOM", l.getId()));

            item.put("packageTier", l.getPackageTier());
            item.put("packagePriority", l.getPackagePriority() != null ? l.getPackagePriority() : 0);
            item.put("isVip", !"FREE".equalsIgnoreCase(l.getPackageTier()));
            item.put("boostUntil", l.getBoostUntil());
            item.put("revisionNote", l.getRevisionNote());

            allPosts.add(item);
        }

        // 2. Second-Hand listings
        List<SecondHandListing> userSecondHands = secondHandRepo.findBySellerIdOrderByCreatedAtDesc(uid);
        for (SecondHandListing s : userSecondHands) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", "secondhand_" + s.getId());
            item.put("targetId", s.getId());
            item.put("category", "SECOND_HAND");
            item.put("categoryLabel", "Đồ cũ");
            item.put("postType", s.getCategory() != null ? s.getCategory() : "OTHER");
            item.put("posterRelationship", "SELLER");

            item.put("title", s.getTitle());
            item.put("status", s.getStatus());
            item.put("price", s.getPrice() != null ? s.getPrice() : 0L);
            item.put("createdAt", s.getCreatedAt());
            item.put("updatedAt", s.getCreatedAt());
            item.put("expiresAt", s.getExpiresAt());

            String img = s.getImageUrl();
            if ((img == null || img.isBlank()) && s.getGalleryJson() != null) {
                img = extractFirstImage(s.getGalleryJson(), null);
            }
            item.put("imageUrl", img);
            item.put("address", (s.getDistrict() != null ? s.getDistrict() + ", " : "") + (s.getProvince() != null ? s.getProvince() : ""));
            item.put("availability", "ACTIVE".equals(s.getStatus()) ? "AVAILABLE" : s.getStatus());

            item.put("views", 0L);
            item.put("favorites", 0L);
            item.put("contacts", 0L);
            item.put("chatCount", convs.countByContextTypeAndContextId("SECOND_HAND", s.getId()));

            item.put("packageTier", "FREE");
            item.put("packagePriority", 0);
            item.put("isVip", false);
            item.put("boostUntil", null);
            item.put("conditionText", s.getConditionText());

            allPosts.add(item);
        }

        // 3. Service listings
        List<ServiceListing> userServices = serviceRepo.findByProviderIdOrderByCreatedAtDesc(uid);
        for (ServiceListing sv : userServices) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", "service_" + sv.getId());
            item.put("targetId", sv.getId());
            item.put("category", "SERVICE");
            item.put("categoryLabel", "Dịch vụ");
            item.put("postType", sv.getCategory() != null ? sv.getCategory() : "OTHER");
            item.put("posterRelationship", "SERVICE_PROVIDER");

            item.put("title", sv.getTitle());
            item.put("status", sv.getStatus());
            item.put("price", sv.getPriceFrom() != null ? sv.getPriceFrom() : 0L);
            item.put("createdAt", sv.getCreatedAt());
            item.put("updatedAt", sv.getCreatedAt());
            item.put("expiresAt", null);

            String img = sv.getImageUrl();
            if ((img == null || img.isBlank()) && sv.getGalleryJson() != null) {
                img = extractFirstImage(sv.getGalleryJson(), null);
            }
            item.put("imageUrl", img);
            item.put("address", sv.getServiceArea() != null ? sv.getServiceArea() : "");
            item.put("availability", "ACTIVE".equals(sv.getStatus()) ? "AVAILABLE" : sv.getStatus());

            item.put("views", 0L);
            item.put("favorites", 0L);
            item.put("contacts", 0L);
            item.put("chatCount", convs.countByContextTypeAndContextId("SERVICE", sv.getId()));

            item.put("packageTier", "FREE");
            item.put("packagePriority", 0);
            item.put("isVip", false);
            item.put("boostUntil", null);

            allPosts.add(item);
        }

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
                } catch (Exception e) {}
            } else if (imgUrl.contains(",")) {
                return imgUrl.split(",")[0].trim();
            } else {
                return imgUrl.trim();
            }
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
