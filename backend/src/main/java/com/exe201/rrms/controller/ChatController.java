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

    public ChatController(AuthService auth, ConversationRepository conversations, MessageRepository messages,
                          UserRepository users, ListingRepository listings, PropertyRepository props,
                          SecondHandListingRepository secondHand, ServiceListingRepository services) {
        this.auth = auth;
        this.conversations = conversations;
        this.messages = messages;
        this.users = users;
        this.listings = listings;
        this.props = props;
        this.secondHand = secondHand;
        this.services = services;
    }

    @GetMapping("/conversations")
    public List<Map<String, Object>> getConversations(HttpServletRequest request) {
        Long me = auth.current(request).getId();
        List<Conversation> list = conversations.findByUser1IdOrUser2IdOrderByUpdatedAtDesc(me, me);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Conversation c : list) {
            Long otherId = c.getUser1Id().equals(me) ? c.getUser2Id() : c.getUser1Id();
            User other = users.findById(otherId).orElse(null);

            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", c.getId());
            dto.put("conversationId", c.getId());
            dto.put("otherUserId", otherId);
            dto.put("otherUserName", other != null ? other.getFullName() : "Người dùng #" + otherId);
            dto.put("otherUserAvatar", other != null ? other.getAvatarUrl() : null);
            dto.put("otherUserRole", other != null ? other.getRole() : "TENANT");

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

    @PostMapping("/conversations")
    public Map<String, Object> openConversation(HttpServletRequest request, @RequestBody Map<String, Object> body) {
        Long me = auth.current(request).getId();
        Object otherRaw = body.get("otherUserId");
        if (otherRaw == null) throw new IllegalArgumentException("Thiếu otherUserId");
        Long other = Long.valueOf(otherRaw.toString());
        if (me.equals(other)) throw new IllegalArgumentException("Không thể tạo hội thoại với chính mình");

        String contextType = body.get("contextType") == null ? "GENERAL" : body.get("contextType").toString().trim().toUpperCase();
        Object contextRaw = body.get("contextId");
        Long contextId = contextRaw == null || contextRaw.toString().isBlank() ? 0L : Long.valueOf(contextRaw.toString());
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
    public List<Message> getMessages(@PathVariable Long conversationId, HttpServletRequest request) {
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

        return messages.findByConversationIdOrderBySentAtAsc(conversationId);
    }

    @PostMapping("/{conversationId}/messages")
    public Message sendMessage(@PathVariable Long conversationId, HttpServletRequest request, @RequestBody Message input) {
        User user = auth.current(request);
        Conversation c = conversations.findById(conversationId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hội thoại"));
        checkConversationPermission(user, c);
        if (input.getContent() == null || input.getContent().isBlank()) throw new IllegalArgumentException("Tin nhắn không được để trống");

        Message message = new Message();
        message.setConversationId(conversationId);
        message.setSenderId(user.getId());
        message.setContent(input.getContent().trim());
        message.setType(input.getType() == null || input.getType().isBlank() ? "TEXT" : input.getType().toUpperCase());
        message.setSentAt(LocalDateTime.now());
        Message saved = messages.save(message);

        c.setUpdatedAt(LocalDateTime.now());
        conversations.save(c);
        return saved;
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
}
