package com.exe201.rrms.controller;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.repository.*;
import com.exe201.rrms.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    private final CommunityMessageRepository messageRepo;
    private final UserRepository userRepo;
    private final ReportRepository reportRepo;
    private final AuthService authService;
    private final CommunityMessageReactionRepository reactionRepo;
    private final CommunityReadStateRepository readStateRepo;
    private final CommunityNotificationSettingRepository notiSettingRepo;
    private final CommunityTimeoutRepository timeoutRepo;
    private final StickerPackRepository packRepo;
    private final StickerRepository stickerRepo;

    public CommunityController(
            CommunityMessageRepository messageRepo,
            UserRepository userRepo,
            ReportRepository reportRepo,
            AuthService authService,
            CommunityMessageReactionRepository reactionRepo,
            CommunityReadStateRepository readStateRepo,
            CommunityNotificationSettingRepository notiSettingRepo,
            CommunityTimeoutRepository timeoutRepo,
            StickerPackRepository packRepo,
            StickerRepository stickerRepo
    ) {
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.reportRepo = reportRepo;
        this.authService = authService;
        this.reactionRepo = reactionRepo;
        this.readStateRepo = readStateRepo;
        this.notiSettingRepo = notiSettingRepo;
        this.timeoutRepo = timeoutRepo;
        this.packRepo = packRepo;
        this.stickerRepo = stickerRepo;
    }

    private static final java.util.concurrent.ConcurrentHashMap<Long, java.time.Instant> ACTIVE_USERS = new java.util.concurrent.ConcurrentHashMap<>();

    // --- Channels list & info ---
    @GetMapping("/channels")
    public List<Map<String, Object>> getChannels() {
        return List.of(
                Map.of(
                        "id", 1L,
                        "code", "UNIHOME_LOUNGE",
                        "name", "Sảnh chung sinh viên (UniHome Lounge)",
                        "description", "Không gian thảo luận, tìm bạn, kinh nghiệm thuê trọ toàn quốc",
                        "status", "ACTIVE",
                        "sortOrder", 1
                )
        );
    }

    // --- Live Preview for Homepage / Community Header ---
    @GetMapping("/preview")
    public Map<String, Object> getPreview(HttpServletRequest req) {
        User current = null;
        try { current = authService.current(req); } catch (Exception ignored) {}

        java.time.Instant now = java.time.Instant.now();
        if (current != null) {
            ACTIVE_USERS.put(current.getId(), now);
        }
        // Cleanup users inactive for > 10 minutes
        ACTIVE_USERS.entrySet().removeIf(e -> java.time.Duration.between(e.getValue(), now).toMinutes() > 10);
        long activeSessionCount = ACTIVE_USERS.size();
        long onlineCount = Math.max(1, activeSessionCount);

        List<CommunityMessage> latest = messageRepo.findByStatusAndChannelIdOrderByIdDesc("ACTIVE", 1L, PageRequest.of(0, 6));
        List<CommunityMessage> chronological = new ArrayList<>(latest);
        Collections.reverse(chronological);

        long unreadCount = 0;
        if (current != null) {
            Optional<CommunityReadState> rs = readStateRepo.findByUserIdAndChannelId(current.getId(), 1L);
            Long lastReadId = rs.map(CommunityReadState::getLastReadMessageId).orElse(0L);
            unreadCount = messageRepo.countByStatusAndChannelIdAndIdGreaterThan("ACTIVE", 1L, lastReadId);
        }

        List<Map<String, Object>> previewMsgs = formatMessages(chronological, current != null ? current.getId() : null);

        return Map.of(
                "channelId", 1L,
                "onlineCount", onlineCount,
                "unreadCount", unreadCount,
                "latestMessages", previewMsgs
        );
    }

    // --- Message List (Channels & Legacy endpoint) ---
    @GetMapping({"/messages", "/channels/{channelId}/messages"})
    public Map<String, Object> getMessages(
            @PathVariable(required = false) Long channelId,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) Long beforeId,
            HttpServletRequest req
    ) {
        Long cid = channelId != null ? channelId : 1L;
        int safeLimit = Math.min(Math.max(limit, 10), 300);

        List<CommunityMessage> messages;
        if (beforeId != null && beforeId > 0) {
            messages = messageRepo.findByStatusAndChannelIdAndIdLessThanOrderByIdDesc("ACTIVE", cid, beforeId, PageRequest.of(0, safeLimit));
        } else {
            messages = messageRepo.findByStatusAndChannelIdOrderByIdDesc("ACTIVE", cid, PageRequest.of(0, safeLimit));
        }

        List<CommunityMessage> chronological = new ArrayList<>(messages);
        Collections.reverse(chronological);

        User current = null;
        try { current = authService.current(req); } catch (Exception ignored) {}
        Long myUserId = current != null ? current.getId() : null;

        List<Map<String, Object>> items = formatMessages(chronological, myUserId);

        return Map.of(
                "channelId", cid,
                "messages", items,
                "hasMore", messages.size() == safeLimit,
                "oldestId", chronological.isEmpty() ? null : chronological.getFirst().getId(),
                "newestId", chronological.isEmpty() ? null : chronological.getLast().getId()
        );
    }

    // --- Post Message ---
    @PostMapping({"/messages", "/channels/{channelId}/messages"})
    public Map<String, Object> postMessage(
            @PathVariable(required = false) Long channelId,
            HttpServletRequest req,
            @RequestBody Map<String, Object> body
    ) {
        User current = authService.current(req);
        if (current == null) {
            throw new SecurityException("Vui lòng đăng nhập để tham gia trò chuyện");
        }
        if ("BANNED".equalsIgnoreCase(current.getStatus()) || "BLOCKED".equalsIgnoreCase(current.getStatus())) {
            throw new SecurityException("Tài khoản của bạn đã bị khóa tính năng cộng đồng");
        }

        // Check timeout
        Optional<CommunityTimeout> activeTimeout = timeoutRepo.findFirstByUserIdAndExpiresAtAfterOrderByExpiresAtDesc(current.getId(), LocalDateTime.now());
        if (activeTimeout.isPresent()) {
            throw new IllegalStateException("Bạn đang bị tạm dừng chat đến " + activeTimeout.get().getExpiresAt() + ". Lý do: " + activeTimeout.get().getReason());
        }

        // Rate limit: max 5 messages in 10 seconds
        LocalDateTime tenSecAgo = LocalDateTime.now().minusSeconds(10);
        long recentCount = messageRepo.countByUserIdAndCreatedAtAfter(current.getId(), tenSecAgo);
        if (recentCount >= 5) {
            throw new IllegalStateException("Bạn đang gửi tin nhắn quá nhanh. Vui lòng thử lại sau vài giây.");
        }

        String messageType = Objects.toString(body.get("messageType"), "TEXT").toUpperCase();
        String content = body.get("content") != null ? body.get("content").toString().trim() : "";

        if ("TEXT".equals(messageType) && content.isEmpty()) {
            throw new IllegalArgumentException("Nội dung tin nhắn không được để trống");
        }
        if (content.length() > 2000) {
            throw new IllegalArgumentException("Nội dung tin nhắn tối đa 2000 ký tự");
        }

        CommunityMessage msg = new CommunityMessage();
        msg.setChannelId(channelId != null ? channelId : 1L);
        msg.setUserId(current.getId());
        msg.setSenderId(current.getId());
        msg.setMessageType(messageType);
        msg.setContent(content);

        if (body.get("mediaUrl") != null) msg.setMediaUrl(body.get("mediaUrl").toString());
        if (body.get("gifUrl") != null) msg.setGifUrl(body.get("gifUrl").toString());
        if (body.get("stickerPackId") != null) msg.setStickerPackId(Long.valueOf(body.get("stickerPackId").toString()));
        if (body.get("stickerId") != null) msg.setStickerId(Long.valueOf(body.get("stickerId").toString()));

        if (body.get("replyToId") != null || body.get("replyToMessageId") != null) {
            try {
                Long repId = Long.valueOf(Objects.toString(body.get("replyToId") != null ? body.get("replyToId") : body.get("replyToMessageId")));
                msg.setReplyToId(repId);
                msg.setReplyToMessageId(repId);
            } catch (Exception ignored) {}
        }

        msg.setStatus("ACTIVE");
        msg.setModerationStatus("APPROVED");
        CommunityMessage saved = messageRepo.save(msg);

        // Auto mark read for sender
        updateReadStateInternal(current.getId(), msg.getChannelId(), saved.getId());

        List<Map<String, Object>> resList = formatMessages(List.of(saved), current.getId());
        return resList.getFirst();
    }

    // --- Edit Message (Within 15 mins by owner) ---
    @PutMapping("/messages/{id}")
    public Map<String, Object> editMessage(@PathVariable Long id, HttpServletRequest req, @RequestBody Map<String, String> body) {
        User current = authService.current(req);
        CommunityMessage msg = messageRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tin nhắn"));

        if (!Objects.equals(msg.getUserId(), current.getId())) {
            throw new SecurityException("Bạn không thể sửa tin nhắn của người khác");
        }
        if (msg.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(15))) {
            throw new IllegalStateException("Đã quá 15 phút, không thể chỉnh sửa tin nhắn này");
        }

        String newContent = body.get("content");
        if (newContent == null || newContent.trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung chỉnh sửa không được để trống");
        }

        msg.setContent(newContent.trim());
        msg.setUpdatedAt(LocalDateTime.now());
        messageRepo.save(msg);

        return formatMessages(List.of(msg), current.getId()).getFirst();
    }

    // --- Delete Message ---
    @DeleteMapping("/messages/{id}")
    public Map<String, Object> deleteMessage(@PathVariable Long id, HttpServletRequest req) {
        User current = authService.current(req);
        CommunityMessage msg = messageRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tin nhắn"));

        boolean isAdmin = List.of("ADMIN", "SUPER_ADMIN", "MODERATOR").contains(current.getRole());
        boolean isOwner = Objects.equals(msg.getUserId(), current.getId());

        if (!isAdmin && !isOwner) {
            throw new SecurityException("Bạn không có quyền xóa tin nhắn này");
        }

        msg.setStatus("DELETED");
        msg.setDeletedBy(current.getId());
        msg.setDeletedAt(LocalDateTime.now());
        messageRepo.save(msg);
        return Map.of("success", true, "id", id);
    }

    // --- Reactions Toggle ---
    @PostMapping("/messages/{id}/reaction")
    public Map<String, Object> toggleReaction(
            @PathVariable Long id,
            HttpServletRequest req,
            @RequestBody Map<String, String> body
    ) {
        User current = authService.current(req);
        String reactionType = body.getOrDefault("reactionType", "HEART").toUpperCase();

        Optional<CommunityMessageReaction> existing = reactionRepo.findByMessageIdAndUserId(id, current.getId());
        if (existing.isPresent()) {
            CommunityMessageReaction r = existing.get();
            if (r.getReactionType().equalsIgnoreCase(reactionType)) {
                reactionRepo.delete(r);
                return Map.of("messageId", id, "action", "REMOVED", "reactionType", reactionType, "reactions", getReactionSummary(id, current.getId()));
            } else {
                r.setReactionType(reactionType);
                reactionRepo.save(r);
                return Map.of("messageId", id, "action", "UPDATED", "reactionType", reactionType, "reactions", getReactionSummary(id, current.getId()));
            }
        } else {
            CommunityMessageReaction r = new CommunityMessageReaction();
            r.setMessageId(id);
            r.setUserId(current.getId());
            r.setReactionType(reactionType);
            reactionRepo.save(r);
            return Map.of("messageId", id, "action", "ADDED", "reactionType", reactionType, "reactions", getReactionSummary(id, current.getId()));
        }
    }

    // --- Read State ---
    @PostMapping("/read-state")
    public Map<String, Object> updateReadState(HttpServletRequest req, @RequestBody Map<String, Object> body) {
        User current = authService.current(req);
        Long channelId = Long.valueOf(Objects.toString(body.getOrDefault("channelId", 1L)));
        Long lastReadId = Long.valueOf(Objects.toString(body.get("lastReadMessageId")));
        updateReadStateInternal(current.getId(), channelId, lastReadId);
        return Map.of("success", true, "channelId", channelId, "lastReadMessageId", lastReadId);
    }

    private void updateReadStateInternal(Long userId, Long channelId, Long messageId) {
        CommunityReadState rs = readStateRepo.findByUserIdAndChannelId(userId, channelId)
                .orElseGet(() -> {
                    CommunityReadState n = new CommunityReadState();
                    n.setUserId(userId);
                    n.setChannelId(channelId);
                    return n;
                });
        if (messageId > (rs.getLastReadMessageId() != null ? rs.getLastReadMessageId() : 0L)) {
            rs.setLastReadMessageId(messageId);
            rs.setLastReadAt(LocalDateTime.now());
            readStateRepo.save(rs);
        }
    }

    // --- Notification Settings ---
    @GetMapping("/notifications/settings")
    public Map<String, Object> getNotificationSettings(
            @RequestParam(defaultValue = "1") Long channelId,
            HttpServletRequest req
    ) {
        User current = authService.current(req);
        CommunityNotificationSetting s = notiSettingRepo.findByUserIdAndChannelId(current.getId(), channelId)
                .orElseGet(() -> {
                    CommunityNotificationSetting def = new CommunityNotificationSetting();
                    def.setUserId(current.getId());
                    def.setChannelId(channelId);
                    def.setMode("MENTION_REPLY_ONLY");
                    return def;
                });
        return Map.of(
                "channelId", channelId,
                "mode", s.getMode(),
                "mutedUntil", s.getMutedUntil() != null ? s.getMutedUntil().toString() : ""
        );
    }

    @PutMapping("/notifications/settings")
    public Map<String, Object> saveNotificationSettings(
            HttpServletRequest req,
            @RequestBody Map<String, Object> body
    ) {
        User current = authService.current(req);
        Long channelId = Long.valueOf(Objects.toString(body.getOrDefault("channelId", 1L)));
        String mode = body.getOrDefault("mode", "MENTION_REPLY_ONLY").toString();

        CommunityNotificationSetting s = notiSettingRepo.findByUserIdAndChannelId(current.getId(), channelId)
                .orElseGet(() -> {
                    CommunityNotificationSetting n = new CommunityNotificationSetting();
                    n.setUserId(current.getId());
                    n.setChannelId(channelId);
                    return n;
                });

        s.setMode(mode);
        if (body.get("muteHours") != null) {
            int hrs = Integer.parseInt(body.get("muteHours").toString());
            s.setMutedUntil(hrs > 0 ? LocalDateTime.now().plusHours(hrs) : null);
        }
        notiSettingRepo.save(s);

        return Map.of("success", true, "mode", s.getMode(), "mutedUntil", s.getMutedUntil() != null ? s.getMutedUntil().toString() : "");
    }

    // --- Sticker Packs ---
    @GetMapping("/stickers/packs")
    public List<Map<String, Object>> getStickerPacks() {
        List<StickerPack> packs = packRepo.findByStatusOrderBySortOrderAsc("ACTIVE");
        List<Map<String, Object>> res = new ArrayList<>();
        for (StickerPack p : packs) {
            List<Sticker> stickers = stickerRepo.findByPackIdAndStatusOrderBySortOrderAsc(p.getId(), "ACTIVE");
            res.add(Map.of(
                    "id", p.getId(),
                    "name", p.getName(),
                    "thumbnailUrl", p.getThumbnailUrl() != null ? p.getThumbnailUrl() : "",
                    "stickers", stickers
            ));
        }
        return res;
    }

    // --- Search Messages ---
    @GetMapping("/search")
    public List<Map<String, Object>> searchMessages(
            @RequestParam(defaultValue = "1") Long channelId,
            @RequestParam String q,
            HttpServletRequest req
    ) {
        if (q.trim().isEmpty()) return Collections.emptyList();
        User current = null;
        try { current = authService.current(req); } catch (Exception ignored) {}
        List<CommunityMessage> list = messageRepo.searchMessages(channelId, q.trim(), PageRequest.of(0, 30));
        return formatMessages(list, current != null ? current.getId() : null);
    }

    // --- User Public Community Messages ---
    @GetMapping("/users/{userId}/messages")
    public List<Map<String, Object>> getUserMessages(@PathVariable Long userId, HttpServletRequest req) {
        User current = null;
        try { current = authService.current(req); } catch (Exception ignored) {}
        List<CommunityMessage> list = messageRepo.findByStatusAndUserIdOrderByIdDesc("ACTIVE", userId, PageRequest.of(0, 30));
        return formatMessages(list, current != null ? current.getId() : null);
    }

    // --- Admin Moderation: Timeout User ---
    @PostMapping("/admin/timeout")
    public Map<String, Object> timeoutUser(HttpServletRequest req, @RequestBody Map<String, Object> body) {
        User admin = authService.current(req);
        authService.requireRole(admin, "ADMIN", "SUPER_ADMIN", "MODERATOR");

        Long targetUserId = Long.valueOf(body.get("userId").toString());
        int minutes = Integer.parseInt(body.getOrDefault("minutes", "60").toString());
        String reason = body.getOrDefault("reason", "Vi phạm quy tắc cộng đồng").toString();

        CommunityTimeout ct = new CommunityTimeout();
        ct.setUserId(targetUserId);
        ct.setChannelId(1L);
        ct.setTimedOutBy(admin.getId());
        ct.setReason(reason);
        ct.setExpiresAt(LocalDateTime.now().plusMinutes(minutes));
        timeoutRepo.save(ct);

        return Map.of("success", true, "userId", targetUserId, "expiresAt", ct.getExpiresAt(), "reason", reason);
    }

    // --- Report Message ---
    @PostMapping("/messages/{id}/report")
    public Map<String, Object> reportMessage(@PathVariable Long id, HttpServletRequest req, @RequestBody Map<String, String> body) {
        User current = authService.current(req);
        CommunityMessage msg = messageRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tin nhắn"));

        String reason = body.getOrDefault("reason", "Nội dung không phù hợp");
        String details = body.getOrDefault("details", msg.getContent());

        Report report = new Report();
        report.setReporterId(current.getId());
        report.setTargetType("COMMUNITY_MESSAGE");
        report.setTargetId(id);
        report.setReasonCode(reason);
        report.setDetails("Báo cáo tin nhắn: " + details);
        report.setStatus("PENDING");
        report.setCreatedAt(LocalDateTime.now());
        reportRepo.save(report);

        return Map.of("success", true, "message", "Đã gửi báo cáo vi phạm tới quản trị viên");
    }

    // --- Helper Format Messages ---
    private List<Map<String, Object>> formatMessages(List<CommunityMessage> messages, Long currentUserId) {
        if (messages.isEmpty()) return Collections.emptyList();

        Set<Long> userIds = new HashSet<>();
        Set<Long> replyIds = new HashSet<>();
        List<Long> msgIds = new ArrayList<>();
        for (CommunityMessage m : messages) {
            userIds.add(m.getUserId());
            msgIds.add(m.getId());
            if (m.getReplyToId() != null) replyIds.add(m.getReplyToId());
            if (m.getReplyToMessageId() != null) replyIds.add(m.getReplyToMessageId());
        }

        Map<Long, User> userMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            userRepo.findAllById(userIds).forEach(u -> userMap.put(u.getId(), u));
        }

        Map<Long, CommunityMessage> replyMap = new HashMap<>();
        if (!replyIds.isEmpty()) {
            messageRepo.findAllById(replyIds).forEach(rm -> replyMap.put(rm.getId(), rm));
        }

        List<CommunityMessageReaction> allReactions = reactionRepo.findByMessageIdIn(msgIds);
        Map<Long, List<CommunityMessageReaction>> reactionsByMsg = new HashMap<>();
        for (CommunityMessageReaction r : allReactions) {
            reactionsByMsg.computeIfAbsent(r.getMessageId(), k -> new ArrayList<>()).add(r);
        }

        List<Map<String, Object>> items = new ArrayList<>();
        for (CommunityMessage m : messages) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", m.getId());
            map.put("channelId", m.getChannelId());
            map.put("messageType", m.getMessageType());
            map.put("content", m.getContent());
            map.put("mediaUrl", m.getMediaUrl());
            map.put("gifUrl", m.getGifUrl());
            map.put("stickerPackId", m.getStickerPackId());
            map.put("stickerId", m.getStickerId());
            map.put("replyToId", m.getReplyToId());
            map.put("replyToMessageId", m.getReplyToMessageId());
            map.put("isSystemMessage", m.getIsSystemMessage());
            map.put("createdAt", m.getCreatedAt());
            map.put("updatedAt", m.getUpdatedAt());

            User author = userMap.get(m.getUserId());
            if (author != null) {
                map.put("userId", author.getId());
                map.put("authorName", author.getFullName());
                map.put("authorAvatar", author.getAvatarUrl());
                map.put("cosmeticStyle", author.getCosmeticStyle() != null ? author.getCosmeticStyle() : "DEFAULT");
                map.put("profileBadge", author.getProfileBadge());
                map.put("profileFrame", author.getProfileFrame());
                map.put("vipTier", author.getVipTier() != null ? author.getVipTier() : "NONE");
                map.put("role", author.getRole());
            } else {
                map.put("userId", m.getUserId());
                map.put("authorName", "Người dùng #" + m.getUserId());
                map.put("authorAvatar", null);
                map.put("cosmeticStyle", "DEFAULT");
                map.put("vipTier", "NONE");
            }

            // Reply Preview
            Long repId = m.getReplyToMessageId() != null ? m.getReplyToMessageId() : m.getReplyToId();
            if (repId != null && replyMap.containsKey(repId)) {
                CommunityMessage rm = replyMap.get(repId);
                User rAuthor = userMap.get(rm.getUserId());
                if (rAuthor == null) {
                    rAuthor = userRepo.findById(rm.getUserId()).orElse(null);
                }
                String previewTxt = rm.getContent() != null
                        ? (rm.getContent().length() > 60 ? rm.getContent().substring(0, 60) + "..." : rm.getContent())
                        : "[" + rm.getMessageType() + "]";
                map.put("replyPreview", Map.of(
                        "id", rm.getId(),
                        "content", previewTxt,
                        "authorName", rAuthor != null ? rAuthor.getFullName() : "Người dùng"
                ));
            }

            // Reactions Summary
            List<CommunityMessageReaction> rList = reactionsByMsg.getOrDefault(m.getId(), Collections.emptyList());
            Map<String, Integer> counts = new HashMap<>();
            String myReaction = null;
            for (CommunityMessageReaction r : rList) {
                counts.put(r.getReactionType(), counts.getOrDefault(r.getReactionType(), 0) + 1);
                if (currentUserId != null && Objects.equals(r.getUserId(), currentUserId)) {
                    myReaction = r.getReactionType();
                }
            }
            map.put("reactions", counts);
            map.put("myReaction", myReaction);

            items.add(map);
        }
        return items;
    }

    private Map<String, Object> getReactionSummary(Long msgId, Long currentUserId) {
        List<CommunityMessageReaction> rList = reactionRepo.findByMessageId(msgId);
        Map<String, Integer> counts = new HashMap<>();
        String myReaction = null;
        for (CommunityMessageReaction r : rList) {
            counts.put(r.getReactionType(), counts.getOrDefault(r.getReactionType(), 0) + 1);
            if (currentUserId != null && Objects.equals(r.getUserId(), currentUserId)) {
                myReaction = r.getReactionType();
            }
        }
        return Map.of("counts", counts, "myReaction", myReaction != null ? myReaction : "");
    }
}
