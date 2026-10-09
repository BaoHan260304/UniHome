package com.exe201.rrms.controller;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.exception.ValidationException;
import com.exe201.rrms.repository.*;
import com.exe201.rrms.service.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/listings")
public class ListingController {
    private final AuthService auth;
    private final ListingRepository listings;
    private final PropertyRepository props;
    private final ListingInterestRepository interests;
    private final FavoriteRepository favs;
    private final NotificationService noti;
    private final VerificationRecordRepository verifs;

    @Value("${unihome.upload.dir:uploads}")
    private String uploadDir;

    public ListingController(AuthService a, ListingRepository l, PropertyRepository p,
                             ListingInterestRepository i, FavoriteRepository f, NotificationService n,
                             VerificationRecordRepository v) {
        this.auth = a;
        this.listings = l;
        this.props = p;
        this.interests = i;
        this.favs = f;
        this.noti = n;
        this.verifs = v;
    }

    @GetMapping("/mine")
    public List<Map<String, Object>> mine(HttpServletRequest r) {
        User u = auth.current(r);
        List<Listing> ls = listings.findByLandlordIdOrderByUpdatedAtDesc(u.getId());
        List<Map<String, Object>> result = new ArrayList<>();
        for (Listing l : ls) {
            Property p = props.findById(l.getPropertyId()).orElse(null);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", l.getId());
            m.put("listingId", l.getId());
            m.put("title", l.getTitle() != null ? l.getTitle() : (p != null ? p.getName() : "Tin #" + l.getId()));
            m.put("status", l.getStatus());
            m.put("packageTier", l.getPackageTier());
            m.put("packagePriority", l.getPackagePriority());
            m.put("packageUntil", l.getPackageUntil());
            m.put("boostUntil", l.getBoostUntil());
            m.put("viewCount", l.getViewCount() != null ? l.getViewCount() : 0);
            m.put("interestCount", l.getInterestCount() != null ? l.getInterestCount() : 0);
            m.put("favoriteCount", favs.countByListingId(l.getId()));
            m.put("matchingCandidateCount", interests.countByListingIdAndMatchingEnabledTrue(l.getId()));
            m.put("createdAt", l.getCreatedAt());
            m.put("updatedAt", l.getUpdatedAt());
            m.put("publishedAt", l.getPublishedAt());
            m.put("revisionNote", l.getRevisionNote());
            m.put("freshnessDueAt", l.getFreshnessDueAt());
            if (p != null) {
                m.put("propertyId", p.getId());
                m.put("propertyName", p.getName());
                m.put("propertyType", p.getPropertyType());
                m.put("price", p.getPrice());
                m.put("area", p.getArea());
                m.put("province", p.getProvince());
                m.put("district", p.getDistrict());
                m.put("ward", p.getWard());
                m.put("street", p.getStreet());
                m.put("address", String.join(", ", Arrays.asList(p.getStreet(), p.getWard(), p.getDistrict(), p.getProvince()).stream().filter(Objects::nonNull).filter(s -> !s.isBlank()).toList()));
                m.put("availability", p.getAvailability());
                m.put("lastAvailabilityConfirmedAt", p.getLastAvailabilityConfirmedAt());
                m.put("imageUrl", p.getImageUrl());
                m.put("mediaJson", p.getMediaJson());
                m.put("verificationEvidenceJson", p.getVerificationEvidenceJson());
                m.put("panoramaCount", p.getPanoramaCount());
                m.put("videoCount", p.getVideoCount());
                m.put("posterRelationship", p.getPosterRelationship() != null ? p.getPosterRelationship() : "OWNER");
                m.put("postType", p.getPostType() != null ? p.getPostType() : "ROOM_FOR_RENT");
            }
            VerificationRecord v = verifs.findByListingIdOrderByCreatedAtDesc(l.getId()).stream()
                    .filter(x -> "VERIFIED".equals(x.getStatus())).findFirst().orElse(null);
            m.put("verificationLevel", v == null ? "CONTENT_REVIEWED" : v.getLevel());
            result.add(m);
        }
        return result;
    }

    @PostMapping
    public Map<String, Object> create(HttpServletRequest r, @RequestBody Map<String, Object> b) {
        User u = auth.current(r);

        Property p = new Property();
        apply(p, b);
        p.setLandlordId(u.getId());
        if (p.getContactPhone() == null || p.getContactPhone().isBlank()) {
            p.setContactPhone(u.getPhone());
        }
        p = props.save(p);

        Listing l = new Listing();
        l.setPropertyId(p.getId());
        l.setLandlordId(u.getId());
        l.setTitle(Objects.toString(b.get("title"), p.getName()));
        String listingStatus = Objects.toString(b.get("listingStatus"), "DRAFT");
        if ("PENDING_REVIEW".equals(listingStatus)) {
            int imgCount = countImages(p.getImageUrl(), p.getMediaJson());
            if (imgCount < 4) {
                throw new ValidationException("images", "Vui lòng tải lên tối thiểu 4 hình ảnh phòng trọ (toàn cảnh, lối vào, WC, bếp,...) trước khi gửi duyệt.");
            }
            l.setFreshnessDueAt(LocalDateTime.now().plusDays(15));
        }
        l.setStatus(listingStatus);
        l = listings.save(l);
        return Map.of("property", p, "listing", l);
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, Object> b) {
        User u = auth.current(r);
        Listing l = listings.findById(id).orElseThrow();
        owner(u, l);
        Property p = props.findById(l.getPropertyId()).orElseThrow();
        apply(p, b);
        props.save(p);
        if (b.get("title") != null) l.setTitle(b.get("title").toString());
        if (List.of("ACTIVE", "PENDING_REVIEW", "NEED_REVISION").contains(l.getStatus())) {
            l.setStatus("PENDING_REVIEW");
            l.setRevisionNote("Thông tin đã thay đổi và cần kiểm duyệt lại");
        }
        listings.save(l);
        return Map.of("property", p, "listing", l);
    }

    @PostMapping("/{id}/submit")
    public Listing submit(@PathVariable Long id, HttpServletRequest r) {
        User u = auth.current(r);
        Listing l = listings.findById(id).orElseThrow();
        owner(u, l);
        Property p = props.findById(l.getPropertyId()).orElseThrow();
        int imgCount = countImages(p.getImageUrl(), p.getMediaJson());
        if (imgCount < 4) {
            throw new ValidationException("images", "Vui lòng tải lên tối thiểu 4 hình ảnh phòng trọ (toàn cảnh, lối vào, WC, bếp,...) trước khi gửi duyệt.");
        }
        l.setStatus("PENDING_REVIEW");
        l.setRevisionNote(null);
        l.setFreshnessDueAt(LocalDateTime.now().plusDays(15));
        return listings.save(l);
    }

    @PostMapping("/{id}/cancel-review")
    public Listing cancelReview(@PathVariable Long id, HttpServletRequest r) {
        User u = auth.current(r);
        Listing l = listings.findById(id).orElseThrow();
        owner(u, l);
        if ("PENDING_REVIEW".equals(l.getStatus())) {
            l.setStatus("DRAFT");
            return listings.save(l);
        }
        return l;
    }

    @PostMapping("/{id}/availability")
    public Map<String, Object> setAvailability(@PathVariable Long id, HttpServletRequest r, @RequestBody Map<String, String> b) {
        User u = auth.current(r);
        Listing l = listings.findById(id).orElseThrow();
        owner(u, l);
        Property p = props.findById(l.getPropertyId()).orElseThrow();
        String avail = b.getOrDefault("availability", "AVAILABLE").toUpperCase();
        p.setAvailability(avail);
        p.setLastAvailabilityConfirmedAt(LocalDateTime.now());
        props.save(p);

        l.setLastConfirmedAt(LocalDateTime.now());
        if ("FULL".equals(avail) || "RENTED".equals(avail)) {
            // Keep status ACTIVE but room availability marks FULL
        }
        listings.save(l);
        return Map.of("availability", p.getAvailability(), "listingId", l.getId());
    }

    @PostMapping("/{id}/confirm-availability")
    public Listing confirm(@PathVariable Long id, HttpServletRequest r, @RequestBody(required = false) Map<String, String> b) {
        User u = auth.current(r);
        Listing l = listings.findById(id).orElseThrow();
        owner(u, l);
        Property p = props.findById(l.getPropertyId()).orElseThrow();
        p.setLastAvailabilityConfirmedAt(LocalDateTime.now());
        if (b != null && b.get("availability") != null) {
            p.setAvailability(b.get("availability"));
        }
        props.save(p);
        l.setLastConfirmedAt(LocalDateTime.now());
        l.setFreshnessDueAt(l.getPackageUntil() != null && l.getPackageUntil().isAfter(LocalDateTime.now()) ? l.getPackageUntil().plusDays(15) : LocalDateTime.now().plusDays(15));
        if ("HIDDEN_STALE".equals(l.getStatus())) {
            l.setStatus("ACTIVE");
        }
        return listings.save(l);
    }

    @PostMapping("/{id}/archive")
    public Listing archive(@PathVariable Long id, HttpServletRequest r) {
        User u = auth.current(r);
        Listing l = listings.findById(id).orElseThrow();
        owner(u, l);
        l.setStatus("ARCHIVED");
        l.setArchivedAt(LocalDateTime.now());
        return listings.save(l);
    }

    @PostMapping("/{id}/restore")
    public Listing restore(@PathVariable Long id, HttpServletRequest r) {
        User u = auth.current(r);
        Listing l = listings.findById(id).orElseThrow();
        owner(u, l);
        l.setStatus("DRAFT");
        l.setArchivedAt(null);
        return listings.save(l);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id, HttpServletRequest r) {
        User u = auth.current(r);
        Listing l = listings.findById(id).orElseThrow();
        owner(u, l);
        if ("DRAFT".equals(l.getStatus())) {
            listings.delete(l);
            return Map.of("message", "Đã xóa bản nháp tin đăng");
        }
        l.setStatus("ARCHIVED");
        l.setArchivedAt(LocalDateTime.now());
        listings.save(l);
        return Map.of("message", "Đã lưu trữ tin đăng");
    }

    @GetMapping("/{id}/interest-status")
    public Map<String, Object> interestStatus(@PathVariable Long id, HttpServletRequest r) {
        User u = auth.optional(r);
        if (u == null) {
            return Map.of("interested", false, "matchingEnabled", false, "favorite", false);
        }
        boolean fav = favs.findByListingIdAndUserId(id, u.getId()).isPresent();
        var in = interests.findByListingIdAndUserId(id, u.getId());
        return Map.of(
                "interested", in.isPresent(),
                "matchingEnabled", in.map(ListingInterest::getMatchingEnabled).orElse(false),
                "favorite", fav
        );
    }

    @PostMapping("/{id}/interest")
    public ListingInterest interest(@PathVariable Long id, HttpServletRequest r, @RequestBody(required = false) Map<String, Object> b) {
        User u = auth.current(r);
        ListingInterest x = interests.findByListingIdAndUserId(id, u.getId()).orElseGet(ListingInterest::new);
        x.setListingId(id);
        x.setUserId(u.getId());
        if (b != null && b.containsKey("matchingEnabled")) {
            x.setMatchingEnabled(Boolean.parseBoolean(b.get("matchingEnabled").toString()));
        }
        x.setStatus("INTERESTED");
        x = interests.save(x);
        Listing l = listings.findById(id).orElseThrow();
        l.setInterestCount(interests.countByListingId(id));
        listings.save(l);
        return x;
    }

    @DeleteMapping("/{id}/interest")
    public Map<String, Object> uninterest(@PathVariable Long id, HttpServletRequest r) {
        User u = auth.current(r);
        interests.findByListingIdAndUserId(id, u.getId()).ifPresent(in -> {
            interests.delete(in);
            listings.findById(id).ifPresent(l -> {
                l.setInterestCount(interests.countByListingId(id));
                listings.save(l);
            });
        });
        return Map.of("message", "Đã bỏ quan tâm phòng");
    }

    @PostMapping("/{id}/favorite")
    public Map<String, Object> favorite(@PathVariable Long id, HttpServletRequest r) {
        User u = auth.current(r);
        var ex = favs.findByListingIdAndUserId(id, u.getId());
        if (ex.isPresent()) {
            favs.delete(ex.get());
            return Map.of("favorite", false);
        }
        Favorite f = new Favorite();
        f.setListingId(id);
        f.setUserId(u.getId());
        favs.save(f);
        return Map.of("favorite", true);
    }

    @GetMapping("/favorites")
    public List<Map<String, Object>> favorites(HttpServletRequest r) {
        User u = auth.current(r);
        List<Favorite> myFavs = favs.findByUserId(u.getId());
        List<Map<String, Object>> list = new ArrayList<>();
        for (Favorite f : myFavs) {
            Listing l = listings.findById(f.getListingId()).orElse(null);
            if (l == null) continue;
            Property p = props.findById(l.getPropertyId()).orElse(null);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", f.getId());
            item.put("favoriteId", f.getId());
            item.put("listingId", l.getId());
            item.put("propertyId", l.getPropertyId());
            item.put("title", l.getTitle() != null ? l.getTitle() : (p != null ? p.getName() : "Tin #" + l.getId()));
            item.put("listingStatus", l.getStatus());
            item.put("packageTier", l.getPackageTier());
            item.put("savedAt", f.getCreatedAt());
            if (p != null) {
                item.put("price", p.getPrice());
                item.put("area", p.getArea());
                item.put("province", p.getProvince());
                item.put("district", p.getDistrict());
                item.put("ward", p.getWard());
                item.put("street", p.getStreet());
                item.put("imageUrl", p.getImageUrl());
                item.put("coverImage", extractCoverImage(p.getImageUrl()));
                item.put("nearestSchool", p.getNearestSchool());
                item.put("availability", p.getAvailability());
            }
            VerificationRecord v = verifs.findByListingIdOrderByCreatedAtDesc(l.getId()).stream()
                    .filter(x -> "VERIFIED".equals(x.getStatus())).findFirst().orElse(null);
            item.put("verificationLevel", v == null ? "CONTENT_REVIEWED" : v.getLevel());
            list.add(item);
        }
        return list;
    }

    @GetMapping("/interests")
    public List<Map<String, Object>> myInterests(HttpServletRequest r) {
        User u = auth.current(r);
        List<ListingInterest> myIn = interests.findByUserId(u.getId());
        List<Map<String, Object>> list = new ArrayList<>();
        for (ListingInterest in : myIn) {
            Listing l = listings.findById(in.getListingId()).orElse(null);
            if (l == null) continue;
            Property p = props.findById(l.getPropertyId()).orElse(null);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", in.getId());
            item.put("interestId", in.getId());
            item.put("listingId", l.getId());
            item.put("propertyId", l.getPropertyId());
            item.put("title", l.getTitle() != null ? l.getTitle() : (p != null ? p.getName() : "Tin #" + l.getId()));
            item.put("listingStatus", l.getStatus());
            item.put("packageTier", l.getPackageTier());
            item.put("matchingEnabled", Boolean.TRUE.equals(in.getMatchingEnabled()));
            item.put("interestedAt", in.getCreatedAt());
            item.put("matchingCandidateCount", interests.countByListingIdAndMatchingEnabledTrue(l.getId()));
            if (p != null) {
                item.put("price", p.getPrice());
                item.put("area", p.getArea());
                item.put("province", p.getProvince());
                item.put("district", p.getDistrict());
                item.put("ward", p.getWard());
                item.put("street", p.getStreet());
                item.put("imageUrl", p.getImageUrl());
                item.put("coverImage", extractCoverImage(p.getImageUrl()));
                item.put("nearestSchool", p.getNearestSchool());
                item.put("availability", p.getAvailability());
            }
            VerificationRecord v = verifs.findByListingIdOrderByCreatedAtDesc(l.getId()).stream()
                    .filter(x -> "VERIFIED".equals(x.getStatus())).findFirst().orElse(null);
            item.put("verificationLevel", v == null ? "CONTENT_REVIEWED" : v.getLevel());
            list.add(item);
        }
        return list;
    }

    private String extractCoverImage(String raw) {
        if (raw == null || raw.isBlank()) return null;
        if (raw.startsWith("[")) {
            try {
                int firstQuote = raw.indexOf('"');
                int secondQuote = raw.indexOf('"', firstQuote + 1);
                if (firstQuote >= 0 && secondQuote > firstQuote) {
                    return raw.substring(firstQuote + 1, secondQuote);
                }
            } catch (Exception e) {}
        }
        return raw;
    }

    private void owner(User u, Listing l) {
        if (!Objects.equals(l.getLandlordId(), u.getId()) && !List.of("ADMIN", "SUPER_ADMIN", "MODERATOR").contains(u.getRole())) {
            throw new SecurityException("Không phải tin của bạn");
        }
    }

    @PostMapping("/media")
    public Map<String, Object> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "mediaType", defaultValue = "IMAGE") String mediaType,
            HttpServletRequest req
    ) throws Exception {
        auth.current(req);
        if (file == null || file.isEmpty()) throw new ValidationException("file", "Vui lòng chọn file phương tiện");

        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";
        long size = file.getSize();

        if ("PANORAMA_360".equalsIgnoreCase(mediaType)) {
            if (size > 15 * 1024 * 1024) throw new ValidationException("file", "Ảnh 360 panorama không được vượt quá 15MB");
            if (!Set.of("image/jpeg", "image/png", "image/webp").contains(contentType)) {
                throw new ValidationException("file", "Ảnh 360 phải có định dạng JPG, PNG hoặc WEBP");
            }
        } else if ("VIDEO".equalsIgnoreCase(mediaType)) {
            if (size > 100 * 1024 * 1024) throw new ValidationException("file", "Video không được vượt quá 100MB");
            if (!Set.of("video/mp4", "video/webm").contains(contentType)) {
                throw new ValidationException("file", "Video phải có định dạng MP4 hoặc WEBM");
            }
        } else if ("VERIFICATION_EVIDENCE".equalsIgnoreCase(mediaType)) {
            if (size > 50 * 1024 * 1024) throw new ValidationException("file", "File minh chứng không được vượt quá 50MB");
        } else { // default IMAGE
            if (size > 8 * 1024 * 1024) throw new ValidationException("file", "Ảnh phòng không được vượt quá 8MB");
            if (!Set.of("image/jpeg", "image/png", "image/webp").contains(contentType)) {
                throw new ValidationException("file", "Ảnh phòng phải có định dạng JPG, PNG hoặc WEBP");
            }
        }

        Path uploadPath = Paths.get(uploadDir, "media");
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String ext = "jpg";
        String orig = file.getOriginalFilename();
        if (orig != null && orig.contains(".")) {
            ext = orig.substring(orig.lastIndexOf('.') + 1).toLowerCase();
        }

        String uniqueName = "med_" + UUID.randomUUID().toString().replace("-", "") + "." + ext;
        Path target = uploadPath.resolve(uniqueName);
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }

        String url = "/uploads/media/" + uniqueName;
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("url", url);
        res.put("mediaType", mediaType.toUpperCase());
        res.put("originalName", orig != null ? orig : uniqueName);
        res.put("size", size);
        return res;
    }

    private int countImages(String imageUrl, String mediaJson) {
        int count = 0;
        if (mediaJson != null && !mediaJson.isBlank()) {
            int idx = 0;
            while ((idx = mediaJson.indexOf("\"url\"", idx)) != -1) {
                count++;
                idx += 5;
            }
        }
        if (count == 0 && imageUrl != null && !imageUrl.isBlank()) {
            if (imageUrl.startsWith("[")) {
                int idx = 0;
                while ((idx = imageUrl.indexOf("http", idx)) != -1 || (idx = imageUrl.indexOf("/uploads", idx)) != -1) {
                    count++;
                    idx += 8;
                }
            } else {
                String[] parts = imageUrl.split(",");
                count = (int) Arrays.stream(parts).filter(s -> !s.isBlank()).count();
            }
        }
        return count;
    }

    private void apply(Property p, Map<String, Object> b) {
        p.setName(str(b, "name", p.getName()));
        p.setProvince(str(b, "province", p.getProvince()));
        p.setDistrict(str(b, "district", p.getDistrict()));
        p.setWard(str(b, "ward", p.getWard()));
        p.setStreet(str(b, "street", p.getStreet()));
        p.setLatitude(dbl(b, "latitude", p.getLatitude()));
        p.setLongitude(dbl(b, "longitude", p.getLongitude()));
        p.setPrice(lng(b, "price", p.getPrice()));
        p.setArea(dbl(b, "area", p.getArea()));
        p.setDeposit(lng(b, "deposit", p.getDeposit()));
        p.setElectricityPrice(lng(b, "electricityPrice", p.getElectricityPrice()));
        p.setWaterPrice(lng(b, "waterPrice", p.getWaterPrice()));
        p.setInternetPrice(lng(b, "internetPrice", p.getInternetPrice()));
        p.setParkingFee(lng(b, "parkingFee", p.getParkingFee()));
        p.setOtherFees(lng(b, "otherFees", p.getOtherFees()));
        p.setFurniture(str(b, "furniture", p.getFurniture()));
        p.setPropertyType(str(b, "propertyType", p.getPropertyType()));
        p.setPostType(str(b, "postType", p.getPostType()));
        p.setPosterRelationship(str(b, "posterRelationship", p.getPosterRelationship() != null ? p.getPosterRelationship() : "OWNER"));
        p.setTotalRooms(integer(b, "totalRooms", p.getTotalRooms()));
        p.setAvailableRooms(integer(b, "availableRooms", p.getAvailableRooms()));
        p.setTotalFloors(integer(b, "totalFloors", p.getTotalFloors()));
        p.setFloorText(str(b, "floorText", p.getFloorText()));
        p.setMaxOccupants(integer(b, "maxOccupants", p.getMaxOccupants()));
        p.setNearestSchool(str(b, "nearestSchool", p.getNearestSchool()));
        p.setNearestSchoolDistanceKm(dbl(b, "nearestSchoolDistanceKm", p.getNearestSchoolDistanceKm()));
        p.setAmenities(str(b, "amenities", p.getAmenities()));
        p.setRules(str(b, "rules", p.getRules()));
        p.setContactPhone(str(b, "contactPhone", p.getContactPhone()));
        p.setContactZalo(str(b, "contactZalo", p.getContactZalo()));
        p.setDescription(str(b, "description", p.getDescription()));
        p.setImageUrl(str(b, "imageUrl", p.getImageUrl()));
        p.setAvailability(str(b, "availability", p.getAvailability()));
        p.setMediaJson(str(b, "mediaJson", p.getMediaJson()));
        p.setVerificationEvidenceJson(str(b, "verificationEvidenceJson", p.getVerificationEvidenceJson()));
        p.setPanoramaCount(integer(b, "panoramaCount", p.getPanoramaCount() != null ? p.getPanoramaCount() : 0));
        p.setVideoCount(integer(b, "videoCount", p.getVideoCount() != null ? p.getVideoCount() : 0));
    }

    private String str(Map<String, Object> b, String k, String d) { return b.get(k) == null ? d : b.get(k).toString(); }
    private Long lng(Map<String, Object> b, String k, Long d) { try { return b.get(k) == null ? d : Long.valueOf(b.get(k).toString()); } catch (Exception e) { return d; } }
    private Integer integer(Map<String, Object> b, String k, Integer d) { try { return b.get(k) == null ? d : Integer.valueOf(b.get(k).toString()); } catch (Exception e) { return d; } }
    private Double dbl(Map<String, Object> b, String k, Double d) { try { return b.get(k) == null ? d : Double.valueOf(b.get(k).toString()); } catch (Exception e) { return d; } }
}
