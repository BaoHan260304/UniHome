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
@RequestMapping({"/api/chat", "/api/chats", "/chat", "/chats"})
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
    public Map<String, Object> getConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestParam(defaultValue = "ALL") String filter,
            @RequestParam(required = false) String keyword,
            HttpServletRequest request) {
        Long me = auth.current(request).getId();
        List<Conversation> list = conversations.findByUser1IdOrUser2IdOrderByUpdatedAtDesc(me, me);
        List<Map<String, Object>> filtered = new ArrayList<>();

        for (Conversation c : list) {
            Long otherId = c.getUser1Id().equals(me) ? c.getUser2Id() : c.getUser1Id();
            boolean isBlockedByMe = blocks.existsByBlockerIdAndBlockedId(me, otherId);
            boolean isBlockedByOther = blocks.existsByBlockerIdAndBlockedId(otherId, me);
            boolean isBlocked = isBlockedByMe || isBlockedByOther;

            var setting = participantSettings.findByConversationIdAndUserId(c.getId(), me).orElse(null);
            boolean isHidden = setting != null && Boolean.TRUE.equals(setting.getIsHidden());
            boolean isMuted = setting != null && Boolean.TRUE.equals(setting.getIsMuted());

            long unread = messages.countByConversationIdAndSenderIdNotAndReadAtIsNull(c.getId(), me);

            // Tab filtering
            if ("HIDDEN".equalsIgnoreCase(filter)) {
                if (!isHidden) continue;
            } else if ("UNREAD".equalsIgnoreCase(filter)) {
                if (isHidden || unread == 0) continue;
            } else { // "ALL"
                if (isHidden) continue;
            }

            User other = users.findById(otherId).orElse(null);
            String otherName = (other != null && other.getFullName() != null && !other.getFullName().isBlank())
                    ? other.getFullName().trim()
                    : (other != null && other.getEmail() != null ? other.getEmail().split("@")[0] : "Người dùng");

            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", c.getId());
            dto.put("conversationId", c.getId());
            dto.put("otherUserId", otherId);
            dto.put("otherUserName", otherName);
            dto.put("otherUserAvatar", other != null ? other.getAvatarUrl() : null);
            dto.put("otherUserRole", other != null ? other.getRole() : "USER");
            dto.put("isMuted", isMuted);
            dto.put("isHidden", isHidden);
            dto.put("isBlocked", isBlocked);
            dto.put("isBlockedByMe", isBlockedByMe);
            dto.put("isBlockedByOther", isBlockedByOther);

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

            dto.put("unreadCount", unread);

            // Search filter by keyword
            if (keyword != null && !keyword.isBlank()) {
                String kw = keyword.toLowerCase().trim();
                boolean match = otherName.toLowerCase().contains(kw)
                        || (dto.get("lastMessage") != null && dto.get("lastMessage").toString().toLowerCase().contains(kw))
                        || (dto.get("contextTitle") != null && dto.get("contextTitle").toString().toLowerCase().contains(kw));
                if (!match) continue;
            }

            filtered.add(dto);
        }

        int total = filtered.size();
        int start = Math.min(page * size, total);
        int end = Math.min(start + size, total);
        List<Map<String, Object>> pageContent = filtered.subList(start, end);
        int totalPages = size > 0 ? (int) Math.ceil((double) total / size) : 1;

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", pageContent);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", total);
        res.put("totalPages", totalPages);
        return res;
    }

    @GetMapping({"/unread-count", "/unread"})
    public Map<String, Object> getUnreadCount(HttpServletRequest request) {
        User me = auth.optional(request);
        if (me == null) {
            Map<String, Object> empty = new LinkedHashMap<>();
            empty.put("count", 0L);
            empty.put("unreadCount", 0L);
            empty.put("unreadMessages", 0L);
            empty.put("unreadConversations", 0L);
            return empty;
        }
        Long myId = me.getId();
        List<Conversation> list = conversations.findByUser1IdOrUser2IdOrderByUpdatedAtDesc(myId, myId);
        long totalUnreadMessages = 0;
        long totalUnreadConversations = 0;
        for (Conversation c : list) {
            Long otherId = c.getUser1Id().equals(myId) ? c.getUser2Id() : c.getUser1Id();
            if (blocks.existsByBlockerIdAndBlockedId(myId, otherId) || blocks.existsByBlockerIdAndBlockedId(otherId, myId)) {
                continue;
            }
            var setting = participantSettings.findByConversationIdAndUserId(c.getId(), myId).orElse(null);
            if (setting != null && (Boolean.TRUE.equals(setting.getIsHidden()) || Boolean.TRUE.equals(setting.getIsMuted()))) {
                continue;
            }
            long unread = messages.countByConversationIdAndSenderIdNotAndReadAtIsNull(c.getId(), myId);
            if (unread > 0) {
                totalUnreadMessages += unread;
                totalUnreadConversations++;
            }
        }
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("count", totalUnreadMessages);
        res.put("unreadCount", totalUnreadMessages);
        res.put("unreadMessages", totalUnreadMessages);
        res.put("unreadConversations", totalUnreadConversations);
        return res;
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

    @GetMapping({"/{conversationId}/messages", "/conversations/{conversationId}/messages"})
    public Map<String, Object> getMessages(@PathVariable Long conversationId,
                                          @RequestParam(required = false) Long beforeId,
                                          @RequestParam(required = false) Long afterId,
                                          @RequestParam(defaultValue = "30") int size,
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

        List<Message> list;
        boolean hasMore = false;

        if (afterId != null) {
            // Polling newer messages
            list = messages.findByConversationIdAndIdGreaterThanOrderByIdAsc(conversationId, afterId);
        } else if (beforeId != null) {
            // Pagination: load older messages
            list = new ArrayList<>(messages.findByConversationIdAndIdLessThanOrderByIdDesc(conversationId, beforeId, PageRequest.of(0, size)));
            Collections.reverse(list); // chronological
            hasMore = !list.isEmpty() && messages.countByConversationIdAndIdLessThan(conversationId, list.get(0).getId()) > 0;
        } else {
            // Initial load: newest messages
            list = new ArrayList<>(messages.findByConversationIdOrderByIdDesc(conversationId, PageRequest.of(0, size)));
            Collections.reverse(list); // chronological
            hasMore = !list.isEmpty() && messages.countByConversationIdAndIdLessThan(conversationId, list.get(0).getId()) > 0;
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("messages", list);
        res.put("hasMore", hasMore);
        return res;
    }

    @PostMapping({"/{conversationId}/messages", "/conversations/{conversationId}/messages"})
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

        // Auto-unhide for both sender and recipient if hidden
        try {
            var otherSetting = participantSettings.findByConversationIdAndUserId(conversationId, otherId).orElse(null);
            if (otherSetting != null && Boolean.TRUE.equals(otherSetting.getIsHidden())) {
                otherSetting.setIsHidden(false);
                participantSettings.save(otherSetting);
            }
            var mySetting = participantSettings.findByConversationIdAndUserId(conversationId, user.getId()).orElse(null);
            if (mySetting != null && Boolean.TRUE.equals(mySetting.getIsHidden())) {
                mySetting.setIsHidden(false);
                participantSettings.save(mySetting);
            }
        } catch (Exception ignored) {}

        // Send in-app Bell notification ONLY if other user has NOT muted this conversation
        try {
            var otherSetting = participantSettings.findByConversationIdAndUserId(conversationId, otherId).orElse(null);
            if (otherSetting == null || !Boolean.TRUE.equals(otherSetting.getIsMuted())) {
                String senderName = (user.getFullName() != null && !user.getFullName().isBlank()) ? user.getFullName() : "Người dùng";
                String preview = message.getContent().length() > 60 ? message.getContent().substring(0, 57) + "..." : message.getContent();
                noti.send(user.getId(), otherId, "CHAT_MESSAGE", "Tin nhắn mới từ " + senderName + ": " + preview, "CONVERSATION", conversationId);
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

    @RequestMapping(value = {"/{conversationId}/mute", "/conversations/{conversationId}/mute"}, method = {RequestMethod.POST, RequestMethod.PUT})
    public Map<String, Object> toggleMute(@PathVariable Long conversationId,
                                         @RequestBody(required = false) Map<String, Object> body,
                                         HttpServletRequest request) {
        User user = auth.current(request);
        Conversation c = conversations.findById(conversationId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy hội thoại #" + conversationId));
        checkConversationPermission(user, c);

        ConversationParticipantSetting setting = participantSettings.findByConversationIdAndUserId(conversationId, user.getId())
                .orElseGet(() -> {
                    ConversationParticipantSetting s = new ConversationParticipantSetting();
                    s.setConversationId(conversationId);
                    s.setUserId(user.getId());
                    return s;
                });
        if (body != null && body.containsKey("muted")) {
            setting.setIsMuted(Boolean.parseBoolean(body.get("muted").toString()));
        } else {
            setting.setIsMuted(!Boolean.TRUE.equals(setting.getIsMuted()));
        }
        setting.setUpdatedAt(LocalDateTime.now());
        participantSettings.save(setting);
        return Map.of("conversationId", conversationId, "isMuted", Boolean.TRUE.equals(setting.getIsMuted()));
    }

    @RequestMapping(value = {"/{conversationId}/hide", "/conversations/{conversationId}/hide"}, method = {RequestMethod.POST, RequestMethod.PUT})
    public Map<String, Object> toggleHide(@PathVariable Long conversationId,
                                         @RequestBody(required = false) Map<String, Object> body,
                                         HttpServletRequest request) {
        User user = auth.current(request);
        Conversation c = conversations.findById(conversationId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy hội thoại #" + conversationId));
        checkConversationPermission(user, c);

        ConversationParticipantSetting setting = participantSettings.findByConversationIdAndUserId(conversationId, user.getId())
                .orElseGet(() -> {
                    ConversationParticipantSetting s = new ConversationParticipantSetting();
                    s.setConversationId(conversationId);
                    s.setUserId(user.getId());
                    return s;
                });
        if (body != null && body.containsKey("hidden")) {
            setting.setIsHidden(Boolean.parseBoolean(body.get("hidden").toString()));
        } else {
            setting.setIsHidden(true);
        }
        setting.setUpdatedAt(LocalDateTime.now());
        participantSettings.save(setting);
        return Map.of("conversationId", conversationId, "isHidden", Boolean.TRUE.equals(setting.getIsHidden()));
    }

    @RequestMapping(value = {"/{conversationId}/unhide", "/conversations/{conversationId}/unhide", "/{conversationId}/restore", "/conversations/{conversationId}/restore"}, method = {RequestMethod.POST, RequestMethod.PUT})
    public Map<String, Object> unhide(@PathVariable Long conversationId, HttpServletRequest request) {
        User user = auth.current(request);
        Conversation c = conversations.findById(conversationId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy hội thoại #" + conversationId));
        checkConversationPermission(user, c);

        ConversationParticipantSetting setting = participantSettings.findByConversationIdAndUserId(conversationId, user.getId())
                .orElseGet(() -> {
                    ConversationParticipantSetting s = new ConversationParticipantSetting();
                    s.setConversationId(conversationId);
                    s.setUserId(user.getId());
                    return s;
                });
        setting.setIsHidden(false);
        setting.setUpdatedAt(LocalDateTime.now());
        participantSettings.save(setting);
        return Map.of("conversationId", conversationId, "isHidden", false);
    }

    @RequestMapping(value = {"/{conversationId}/unread", "/conversations/{conversationId}/unread"}, method = {RequestMethod.POST, RequestMethod.PUT})
    public Map<String, Object> markUnread(@PathVariable Long conversationId, HttpServletRequest request) {
        User user = auth.current(request);
        Conversation c = conversations.findById(conversationId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy hội thoại #" + conversationId));
        checkConversationPermission(user, c);

        Long otherId = c.getUser1Id().equals(user.getId()) ? c.getUser2Id() : c.getUser1Id();
        Optional<Message> lastOther = messages.findTopByConversationIdAndSenderIdOrderBySentAtDesc(conversationId, otherId);
        if (lastOther.isPresent()) {
            Message m = lastOther.get();
            m.setReadAt(null);
            messages.save(m);
        }
        return Map.of("success", true, "conversationId", conversationId);
    }

    @PostMapping("/block/{userId}")
    public Map<String, Object> blockUser(@PathVariable Long userId, @RequestBody(required = false) Map<String, String> body, HttpServletRequest request) {
        User user = auth.current(request);
        if (user.getId().equals(userId)) throw new IllegalArgumentException("Không thể tự chặn chính mình");
        if (!blocks.existsByBlockerIdAndBlockedId(user.getId(), userId)) {
            UserBlock b = new UserBlock();
            b.setBlockerId(user.getId());
            b.setBlockedId(userId);
            b.setReason(body != null && body.containsKey("reason") ? body.get("reason") : "Người dùng chặn");
            blocks.save(b);
        }
        return Map.of("success", true, "blocked", true, "userId", userId);
    }

    @PostMapping("/unblock/{userId}")
    public Map<String, Object> unblockUserPost(@PathVariable Long userId, HttpServletRequest request) {
        User user = auth.current(request);
        blocks.deleteByBlockerIdAndBlockedId(user.getId(), userId);
        return Map.of("success", true, "blocked", false, "userId", userId);
    }

    @DeleteMapping("/block/{userId}")
    public Map<String, Object> unblockUserDelete(@PathVariable Long userId, HttpServletRequest request) {
        User user = auth.current(request);
        blocks.deleteByBlockerIdAndBlockedId(user.getId(), userId);
        return Map.of("success", true, "blocked", false, "userId", userId);
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

    @PostMapping("/users/{userId}/report")
    public Map<String, Object> reportUser(@PathVariable Long userId, @RequestBody Map<String, String> body, HttpServletRequest request) {
        User user = auth.current(request);
        User target = users.findById(userId).orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        Report rep = new Report();
        rep.setReporterId(user.getId());
        rep.setTargetType("USER");
        rep.setTargetId(userId);
        rep.setReasonCode(body.getOrDefault("reason", "OTHER"));
        rep.setDetails(body.getOrDefault("description", "Báo cáo người dùng " + target.getFullName()));
        rep.setStatus("OPEN");
        reports.save(rep);
        return Map.of("success", true, "message", "Báo cáo người dùng đã được gửi đến ban quản trị");
    }
}
