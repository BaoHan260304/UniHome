package com.exe201.rrms.controller;

import com.exe201.rrms.entity.CommunityMessage;
import com.exe201.rrms.entity.Report;
import com.exe201.rrms.entity.User;
import com.exe201.rrms.repository.CommunityMessageRepository;
import com.exe201.rrms.repository.ReportRepository;
import com.exe201.rrms.repository.UserRepository;
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

    public CommunityController(CommunityMessageRepository messageRepo,
                               UserRepository userRepo,
                               ReportRepository reportRepo,
                               AuthService authService) {
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.reportRepo = reportRepo;
        this.authService = authService;
    }

    @GetMapping("/messages")
    public Map<String, Object> getMessages(
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) Long beforeId
    ) {
        int safeLimit = Math.min(Math.max(limit, 10), 100);
        List<CommunityMessage> messages;
        if (beforeId != null && beforeId > 0) {
            messages = messageRepo.findByStatusAndIdLessThanOrderByIdDesc("ACTIVE", beforeId, PageRequest.of(0, safeLimit));
        } else {
            messages = messageRepo.findByStatusOrderByIdDesc("ACTIVE", PageRequest.of(0, safeLimit));
        }

        // Return chronological order (oldest to newest in the batch)
        List<CommunityMessage> chronological = new ArrayList<>(messages);
        Collections.reverse(chronological);

        // Fetch users to populate author information
        Set<Long> userIds = new HashSet<>();
        Set<Long> replyIds = new HashSet<>();
        for (CommunityMessage m : chronological) {
            userIds.add(m.getUserId());
            if (m.getReplyToId() != null) replyIds.add(m.getReplyToId());
        }

        Map<Long, User> userMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            userRepo.findAllById(userIds).forEach(u -> userMap.put(u.getId(), u));
        }

        Map<Long, CommunityMessage> replyMap = new HashMap<>();
        if (!replyIds.isEmpty()) {
            messageRepo.findAllById(replyIds).forEach(rm -> replyMap.put(rm.getId(), rm));
        }

        List<Map<String, Object>> items = new ArrayList<>();
        for (CommunityMessage m : chronological) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", m.getId());
            map.put("content", m.getContent());
            map.put("createdAt", m.getCreatedAt());
            map.put("replyToId", m.getReplyToId());

            User author = userMap.get(m.getUserId());
            if (author != null) {
                map.put("userId", author.getId());
                map.put("authorName", author.getFullName());
                map.put("authorAvatar", author.getAvatarUrl());
                map.put("cosmeticStyle", author.getCosmeticStyle());
                map.put("profileBadge", author.getProfileBadge());
                map.put("vipTier", author.getVipTier());
                map.put("role", author.getRole());
            } else {
                map.put("userId", m.getUserId());
                map.put("authorName", "Người dùng #" + m.getUserId());
                map.put("authorAvatar", null);
            }

            if (m.getReplyToId() != null && replyMap.containsKey(m.getReplyToId())) {
                CommunityMessage rm = replyMap.get(m.getReplyToId());
                User rAuthor = userMap.get(rm.getUserId());
                if (rAuthor == null) {
                    rAuthor = userRepo.findById(rm.getUserId()).orElse(null);
                }
                map.put("replyPreview", Map.of(
                        "id", rm.getId(),
                        "content", rm.getContent().length() > 60 ? rm.getContent().substring(0, 60) + "..." : rm.getContent(),
                        "authorName", rAuthor != null ? rAuthor.getFullName() : "Người dùng"
                ));
            }

            items.add(map);
        }

        return Map.of(
                "messages", items,
                "hasMore", messages.size() == safeLimit,
                "oldestId", chronological.isEmpty() ? null : chronological.getFirst().getId(),
                "newestId", chronological.isEmpty() ? null : chronological.getLast().getId()
        );
    }

    @PostMapping("/messages")
    public Map<String, Object> postMessage(HttpServletRequest req, @RequestBody Map<String, Object> body) {
        User current = authService.current(req);
        if (current == null) {
            throw new SecurityException("Vui lòng đăng nhập để tham gia trò chuyện");
        }
        if ("BANNED".equalsIgnoreCase(current.getStatus()) || "BLOCKED".equalsIgnoreCase(current.getStatus())) {
            throw new SecurityException("Tài khoản của bạn đã bị khóa tính năng cộng đồng");
        }

        String content = body.get("content") != null ? body.get("content").toString().trim() : "";
        if (content.isEmpty()) {
            throw new IllegalArgumentException("Nội dung tin nhắn không được để trống");
        }
        if (content.length() > 1000) {
            throw new IllegalArgumentException("Nội dung tin nhắn tối đa 1000 ký tự");
        }

        // Rate limit: max 5 messages in 10 seconds
        LocalDateTime tenSecAgo = LocalDateTime.now().minusSeconds(10);
        long recentCount = messageRepo.countByUserIdAndCreatedAtAfter(current.getId(), tenSecAgo);
        if (recentCount >= 5) {
            throw new IllegalStateException("Bạn đang gửi tin nhắn quá nhanh. Vui lòng thử lại sau vài giây.");
        }

        CommunityMessage msg = new CommunityMessage();
        msg.setUserId(current.getId());
        msg.setContent(content);
        if (body.get("replyToId") != null) {
            try {
                msg.setReplyToId(Long.valueOf(body.get("replyToId").toString()));
            } catch (Exception ignored) {}
        }
        msg.setStatus("ACTIVE");
        CommunityMessage saved = messageRepo.save(msg);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", saved.getId());
        res.put("content", saved.getContent());
        res.put("createdAt", saved.getCreatedAt());
        res.put("replyToId", saved.getReplyToId());
        res.put("userId", current.getId());
        res.put("authorName", current.getFullName());
        res.put("authorAvatar", current.getAvatarUrl());
        res.put("cosmeticStyle", current.getCosmeticStyle());
        res.put("profileBadge", current.getProfileBadge());
        res.put("vipTier", current.getVipTier());
        res.put("role", current.getRole());

        return res;
    }

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
        messageRepo.save(msg);
        return Map.of("success", true, "id", id);
    }

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
}
