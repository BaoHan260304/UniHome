package com.exe201.rrms.controller;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.repository.*;
import com.exe201.rrms.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final AuthService auth;
    private final ConversationRepository conversations;
    private final MessageRepository messages;
    private final UserRepository users;
    private final ListingRepository listings;
    private final PropertyRepository props;
    private final SecondHandListingRepository secondHand;
    private final ServiceListingRepository services;
    private final UserBlockRepository blocks;
    private final ConversationParticipantSettingRepository participantSettings;
    private final ReportRepository reports;
    private final com.exe201.rrms.service.NotificationService noti;

    public ChatController(AuthService auth, ConversationRepository conversations, MessageRepository messages,
                          UserRepository users, ListingRepository listings, PropertyRepository props,
                          SecondHandListingRepository secondHand, ServiceListingRepository services,
                          UserBlockRepository blocks,
                          ConversationParticipantSettingRepository participantSettings,
                          ReportRepository reports,
                          com.exe201.rrms.service.NotificationService noti) {
        this.auth = auth;
        this.conversations = conversations;
        this.messages = messages;
        this.users = users;
        this.listings = listings;
        this.props = props;
        this.secondHand = secondHand;
        this.services = services;
        this.blocks = blocks;
        this.participantSettings = participantSettings;
        this.reports = reports;
        this.noti = noti;
    }

    @GetMapping("/conversations")
    public List<Map<String, Object>> getConversations(HttpServletRequest request) {
        Long me = auth.current(request).getId();
        List<Conversation> list = conversations.findByUser1IdOrUser2IdOrderByUpdatedAtDesc(me, me);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Conversation c : list) {
            Long otherId = c.getUser1Id().equals(me) ? c.getUser2Id() : c.getUser1Id();
            if (blocks.existsByBlockerIdAndBlockedId(me, otherId) || blocks.existsByBlockerIdAndBlockedId(otherId, me)) {
                continue; // Skip blocked conversations
            }

            var setting = participantSettings.findByConversationIdAndUserId(c.getId(), me).orElse(null);
            if (setting != null && Boolean.TRUE.equals(setting.getIsHidden())) {
                continue; // Skip hidden conversations
            }

            User other = users.findById(otherId).orElse(null);

            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", c.getId());
            dto.put("conversationId", c.getId());
            dto.put("otherUserId", otherId);
            dto.put("otherUserName", other != null ? other.getFullName() : "Người dùng #" + otherId);
            dto.put("otherUserAvatar", other != null ? other.getAvatarUrl() : null);
            dto.put("otherUserRole", other != null ? other.getRole() : "TENANT");
            dto.put("isMuted", setting != null && Boolean.TRUE.equals(setting.getIsMuted()));
            dto.put("isHidden", setting != null && Boolean.TRUE.equals(setting.getIsHidden()));

            dto.put("contextType", c.getContextType());
            dto.put("contextId", c.getContextId());
            dto.put("updatedAt", c.getUpdatedAt());

            // Context card metadata
            resolveContext(c, dto);

            // Last message & unread
            Optional<Message> last = messages.findTopByConversationIdOrderBySentAtDesc(c.getId());
            if (last.isPresent()) {
                dto.put("lastMessage", last.get().getContent());
                dto.put("lastMessageTime", last.get().getSentAt());
                dto.put("lastSenderId", last.get().getSenderId());
            } else {
                dto.put("lastMessage", "Chưa có tin nhắn");
                dto.put("lastMessageTime", c.getCreatedAt());
                dto.put("lastSenderId", null);
            }

            long unread = messages.countByConversationIdAndSenderIdNotAndReadAtIsNull(c.getId(), me);
            dto.put("unreadCount", unread);

            result.add(dto);
        }

        return result;
    }

    @GetMapping("/unread-count")
    public Map<String, Object> getUnreadCount(HttpServletRequest request) {
        Long me = auth.current(request).getId();
        List<Conversation> list = conversations.findByUser1IdOrUser2IdOrderByUpdatedAtDesc(me, me);
        long totalUnread = 0;
        for (Conversation c : list) {
            Long otherId = c.getUser1Id().equals(me) ? c.getUser2Id() : c.getUser1Id();
            if (blocks.existsByBlockerIdAndBlockedId(me, otherId) || blocks.existsByBlockerIdAndBlockedId(otherId, me)) {
                continue;
            }
            var setting = participantSettings.findByConversationIdAndUserId(c.getId(), me).orElse(null);
            if (setting != null && Boolean.TRUE.equals(setting.getIsHidden())) {
                continue;
            }
            totalUnread += messages.countByConversationIdAndSenderIdNotAndReadAtIsNull(c.getId(), me);
        }
        return Map.of("unreadCount", totalUnread);
    }

    @PostMapping("/conversations")
    public Map<String, Object> openConversation(HttpServletRequest request, @RequestBody Map<String, Object> body) {
        Long me = auth.current(request).getId();
        String contextType = body.get("contextType") == null ? "GENERAL" : body.get("contextType").toString().trim().toUpperCase();
        Object contextRaw = body.get("contextId");
        Long contextId = contextRaw == null || contextRaw.toString().isBlank() ? 0L : Long.valueOf(contextRaw.toString());

        Long other = null;
        Object otherRaw = body.get("otherUserId");
        if (otherRaw != null && !otherRaw.toString().isBlank()) {
            other = Long.valueOf(otherRaw.toString());
        } else {
            // Auto-resolve recipient based on context
            if ("ROOM".equalsIgnoreCase(contextType) || "ROOM_MATCH".equalsIgnoreCase(contextType)) {
                listings.findById(contextId).ifPresent(l -> props.findById(l.getPropertyId()).ifPresent(p -> {}));
                var l = listings.findById(contextId).orElse(null);
                if (l != null) other = l.getLandlordId();
            } else if ("SECOND_HAND".equalsIgnoreCase(contextType)) {
                var sh = secondHand.findById(contextId).orElse(null);
                if (sh != null) other = sh.getSellerId();
            } else if ("SERVICE".equalsIgnoreCase(contextType)) {
                var s = services.findById(contextId).orElse(null);
                if (s != null) other = s.getProviderId();
            }
        }

        if (other == null) throw new IllegalArgumentException("Thiếu otherUserId hoặc không xác định được người nhận");
        if (me.equals(other)) throw new IllegalArgumentException("Bạn là chủ bài đăng này, không thể nhắn tin cho chính mình.");

        Long user1 = Math.min(me, other);
        Long user2 = Math.max(me, other);

        Conversation conv = conversations.findFirstByUser1IdAndUser2IdAndContextTypeAndContextId(user1, user2, contextType, contextId)
                .orElseGet(() -> {
                    Conversation c = new Conversation();
                    c.setUser1Id(user1);
                    c.setUser2Id(user2);
                    c.setContextType(contextType);
                    c.setContextId(contextId);
                    c.setUpdatedAt(LocalDateTime.now());
                    return conversations.save(c);
                });

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", conv.getId());
        dto.put("conversationId", conv.getId());
        dto.put("otherUserId", other);
        User otherUser = users.findById(other).orElse(null);
        dto.put("otherUserName", otherUser != null ? otherUser.getFullName() : "Người dùng #" + other);
        dto.put("otherUserAvatar", otherUser != null ? otherUser.getAvatarUrl() : null);
        dto.put("contextType", conv.getContextType());
        dto.put("contextId", conv.getContextId());
        resolveContext(conv, dto);
        return dto;
    }

    @GetMapping("/{conversationId}/messages")
    public List<Message> getMessages(@PathVariable Long conversationId,
                                    @RequestParam(required = false) Long beforeId,
                                    @RequestParam(defaultValue = "50") int size,
                                    HttpServletRequest request) {
        User user = auth.current(request);
        Conversation c = conversations.findById(conversationId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hội thoại"));
        checkConversationPermission(user, c);

        // Mark unread messages sent by other as read
        List<Message> unread = messages.findByConversationIdAndSenderIdNotAndReadAtIsNull(conversationId, user.getId());
        if (!unread.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            for (Message m : unread) {
                m.setReadAt(now);
            }
            messages.saveAll(unread);
        }

        List<Message> all = messages.findByConversationIdOrderBySentAtAsc(conversationId);
        if (beforeId != null) {
            all = all.stream().filter(m -> m.getId() < beforeId).toList();
        }
        if (all.size() > size) {
            all = all.subList(all.size() - size, all.size());
        }
        return all;
    }

    @PostMapping("/{conversationId}/messages")
    public Message sendMessage(@PathVariable Long conversationId, HttpServletRequest request, @RequestBody Message input) {
        User user = auth.current(request);
        Conversation c = conversations.findById(conversationId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hội thoại"));
        checkConversationPermission(user, c);
        if (input.getContent() == null || input.getContent().isBlank()) throw new IllegalArgumentException("Tin nhắn không được để trống");

        Long otherId = c.getUser1Id().equals(user.getId()) ? c.getUser2Id() : c.getUser1Id();
        if (blocks.existsByBlockerIdAndBlockedId(user.getId(), otherId) || blocks.existsByBlockerIdAndBlockedId(otherId, user.getId())) {
            throw new IllegalArgumentException("Không thể gửi tin nhắn cho người dùng này do trạng thái chặn");
        }

        Message message = new Message();
        message.setConversationId(conversationId);
        message.setSenderId(user.getId());
        message.setContent(input.getContent().trim());
        message.setType(input.getType() == null || input.getType().isBlank() ? "TEXT" : input.getType().toUpperCase());
        message.setSentAt(LocalDateTime.now());
        Message saved = messages.save(message);

        c.setUpdatedAt(LocalDateTime.now());
        conversations.save(c);

        // Send in-app notification if not muted
        try {
            var otherSetting = participantSettings.findByConversationIdAndUserId(conversationId, otherId).orElse(null);
            if (otherSetting == null || !Boolean.TRUE.equals(otherSetting.getIsMuted())) {
                String preview = message.getContent().length() > 60 ? message.getContent().substring(0, 57) + "..." : message.getContent();
                noti.send(otherId, "CHAT_MESSAGE", user.getFullName() + ": " + preview, "CONVERSATION", conversationId);
            }
        } catch (Exception ignored) {}

        return saved;
    }

    @PostMapping("/messages/{id}/recall")
    public Map<String, Object> recallMessage(@PathVariable Long id, HttpServletRequest request) {
        User user = auth.current(request);
        Message msg = messages.findById(id).orElseThrow(() -> new IllegalArgumentException("Tin nhắn không tồn tại"));
        if (!msg.getSenderId().equals(user.getId())) {
            throw new SecurityException("Chỉ người gửi mới có thể thu hồi tin nhắn");
        }
        msg.setIsRecalled(true);
        msg.setRecalledAt(LocalDateTime.now());
        msg.setContent("Tin nhắn đã được thu hồi.");
        messages.save(msg);
        return Map.of("success", true, "messageId", id, "isRecalled", true);
    }

    @PostMapping("/{conversationId}/read")
    public Map<String, Object> markRead(@PathVariable Long conversationId, HttpServletRequest request) {
        User user = auth.current(request);
        Conversation c = conversations.findById(conversationId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hội thoại"));
        checkConversationPermission(user, c);
        List<Message> unread = messages.findByConversationIdAndSenderIdNotAndReadAtIsNull(conversationId, user.getId());
        if (!unread.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            for (Message m : unread) {
                m.setReadAt(now);
            }
            messages.saveAll(unread);
        }
        return Map.of("marked", unread.size());
    }

    private void resolveContext(Conversation c, Map<String, Object> dto) {
        String type = c.getContextType();
        Long cid = c.getContextId();

        if ("ROOM".equalsIgnoreCase(type) || "ROOM_MATCH".equalsIgnoreCase(type)) {
            if (cid != null && cid > 0) {
                listings.findById(cid).ifPresent(l -> {
                    dto.put("contextTitle", l.getTitle());
                    props.findById(l.getPropertyId()).ifPresent(p -> {
                        if (dto.get("contextTitle") == null) dto.put("contextTitle", p.getName());
                        dto.put("contextImage", extractFirstImage(p.getImageUrl()));
                        dto.put("contextPrice", p.getPrice());
                    });
                });
            }
            if (!dto.containsKey("contextTitle")) dto.put("contextTitle", "Phòng trọ #" + cid);
        } else if ("SECOND_HAND".equalsIgnoreCase(type)) {
            if (cid != null && cid > 0) {
                secondHand.findById(cid).ifPresent(sh -> {
                    dto.put("contextTitle", sh.getTitle());
                    dto.put("contextImage", extractFirstImage(sh.getImageUrl()));
                    dto.put("contextPrice", sh.getPrice());
                });
            }
            if (!dto.containsKey("contextTitle")) dto.put("contextTitle", "Đồ cũ #" + cid);
        } else if ("SERVICE".equalsIgnoreCase(type)) {
            if (cid != null && cid > 0) {
                services.findById(cid).ifPresent(s -> {
                    dto.put("contextTitle", s.getTitle());
                    dto.put("contextImage", extractFirstImage(s.getImageUrl()));
                    dto.put("contextPrice", s.getPriceFrom());
                });
            }
            if (!dto.containsKey("contextTitle")) dto.put("contextTitle", "Dịch vụ #" + cid);
        } else if ("NEARBY_MATCH".equalsIgnoreCase(type)) {
            dto.put("contextTitle", "Tìm bạn cùng phòng gần đây");
        } else {
            dto.put("contextTitle", "Trao đổi chung");
        }
    }

    private String extractFirstImage(String raw) {
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

    private void checkConversationPermission(User user, Conversation c) {
        Long userId = user.getId();
        if (!userId.equals(c.getUser1Id()) && !userId.equals(c.getUser2Id())) {
            throw new SecurityException("Bạn không thuộc hội thoại này");
        }
    }

    @PostMapping("/{conversationId}/mute")
    public Map<String, Object> toggleMute(@PathVariable Long conversationId, HttpServletRequest request) {
        User user = auth.current(request);
        Conversation c = conversations.findById(conversationId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hội thoại"));
        checkConversationPermission(user, c);

        ConversationParticipantSetting setting = participantSettings.findByConversationIdAndUserId(conversationId, user.getId())
                .orElseGet(() -> {
                    ConversationParticipantSetting s = new ConversationParticipantSetting();
                    s.setConversationId(conversationId);
                    s.setUserId(user.getId());
                    return s;
                });
        setting.setIsMuted(!Boolean.TRUE.equals(setting.getIsMuted()));
        participantSettings.save(setting);
        return Map.of("conversationId", conversationId, "isMuted", setting.getIsMuted());
    }

    @PostMapping("/{conversationId}/hide")
    public Map<String, Object> toggleHide(@PathVariable Long conversationId, HttpServletRequest request) {
        User user = auth.current(request);
        Conversation c = conversations.findById(conversationId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hội thoại"));
        checkConversationPermission(user, c);

        ConversationParticipantSetting setting = participantSettings.findByConversationIdAndUserId(conversationId, user.getId())
                .orElseGet(() -> {
                    ConversationParticipantSetting s = new ConversationParticipantSetting();
                    s.setConversationId(conversationId);
                    s.setUserId(user.getId());
                    return s;
                });
        setting.setIsHidden(!Boolean.TRUE.equals(setting.getIsHidden()));
        participantSettings.save(setting);
        return Map.of("conversationId", conversationId, "isHidden", setting.getIsHidden());
    }

    @PostMapping("/messages/{id}/report")
    public Map<String, Object> reportMessage(@PathVariable Long id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        User user = auth.current(request);
        Message msg = messages.findById(id).orElseThrow(() -> new IllegalArgumentException("Tin nhắn không tồn tại"));
        Report rep = new Report();
        rep.setReporterId(user.getId());
        rep.setTargetType("MESSAGE");
        rep.setTargetId(id);
        rep.setReasonCode(body.getOrDefault("reason", "VIOLATION"));
        rep.setDetails(body.getOrDefault("description", "Báo cáo tin nhắn: " + msg.getContent()));
        rep.setStatus("OPEN");
        reports.save(rep);
        return Map.of("success", true, "message", "Báo cáo tin nhắn đã được gửi đến ban quản trị");
    }
}
