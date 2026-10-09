package com.exe201.rrms.controller;

import com.exe201.rrms.entity.Conversation;
import com.exe201.rrms.entity.Message;
import com.exe201.rrms.entity.User;
import com.exe201.rrms.repository.ConversationRepository;
import com.exe201.rrms.repository.MessageRepository;
import com.exe201.rrms.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final AuthService auth;
    private final ConversationRepository conversations;
    private final MessageRepository messages;

    public ChatController(AuthService auth, ConversationRepository conversations, MessageRepository messages) {
        this.auth = auth;
        this.conversations = conversations;
        this.messages = messages;
    }

    @GetMapping("/conversations")
    public List<Conversation> getConversations(HttpServletRequest request) {
        Long me = auth.current(request).getId();
        return conversations.findByUser1IdOrUser2IdOrderByUpdatedAtDesc(me, me);
    }

    @PostMapping("/conversations")
    public Conversation openConversation(HttpServletRequest request, @RequestBody Map<String, Object> body) {
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

        return conversations.findFirstByUser1IdAndUser2IdAndContextTypeAndContextId(user1, user2, contextType, contextId)
                .orElseGet(() -> {
                    Conversation c = new Conversation();
                    c.setUser1Id(user1);
                    c.setUser2Id(user2);
                    c.setContextType(contextType);
                    c.setContextId(contextId);
                    return conversations.save(c);
                });
    }

    @GetMapping("/{conversationId}/messages")
    public List<Message> getMessages(@PathVariable Long conversationId, HttpServletRequest request) {
        User user = auth.current(request);
        Conversation c = conversations.findById(conversationId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hội thoại"));
        checkConversationPermission(user, c);
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
        Message saved = messages.save(message);
        c.setUpdatedAt(LocalDateTime.now());
        conversations.save(c);
        return saved;
    }

    private void checkConversationPermission(User user, Conversation c) {
        Long userId = user.getId();
        if (!userId.equals(c.getUser1Id()) && !userId.equals(c.getUser2Id())) throw new SecurityException("Bạn không thuộc hội thoại này");
    }
}
