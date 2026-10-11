package com.exe201.rrms.controller;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.repository.*;
import com.exe201.rrms.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping({"/api/notifications", "/notifications"})
public class NotificationController {
    private final NotificationRepository repo;
    private final AuthService auth;

    public NotificationController(NotificationRepository r, AuthService a) {
        repo = r;
        auth = a;
    }

    @GetMapping({"", "/", "/mine"})
    public List<Notification> mine(HttpServletRequest r) {
        return repo.findByReceiverIdOrderByCreatedAtDesc(auth.current(r).getId());
    }

    @GetMapping({"/unread-count", "/unread"})
    public Map<String, Object> unread(HttpServletRequest r) {
        User u = auth.current(r);
        long cnt = repo.findByReceiverIdOrderByCreatedAtDesc(u.getId()).stream()
                .filter(n -> !"READ".equalsIgnoreCase(n.getStatus()))
                .count();
        return Map.of("count", cnt, "unreadCount", cnt);
    }

    @PostMapping("/{id}/read")
    public Notification read(@PathVariable Long id, HttpServletRequest r) {
        User u = auth.current(r);
        Notification n = repo.findById(id).orElseThrow();
        if (!u.getId().equals(n.getReceiverId())) throw new SecurityException("Không phải thông báo của bạn");
        n.setStatus("READ");
        return repo.save(n);
    }

    @PostMapping({"/read-all", "/mark-all-read"})
    public Map<String, Object> readAll(HttpServletRequest r) {
        User u = auth.current(r);
        List<Notification> ns = repo.findByReceiverIdOrderByCreatedAtDesc(u.getId()).stream()
                .filter(n -> !"READ".equalsIgnoreCase(n.getStatus()))
                .toList();
        for (Notification n : ns) {
            n.setStatus("READ");
        }
        repo.saveAll(ns);
        return Map.of("success", true, "marked", ns.size());
    }
}
