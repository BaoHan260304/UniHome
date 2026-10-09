package com.exe201.rrms.controller;

import com.exe201.rrms.entity.AnalyticsEvent;
import com.exe201.rrms.entity.User;
import com.exe201.rrms.service.AnalyticsService;
import com.exe201.rrms.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AuthService auth;

    public AnalyticsController(AnalyticsService analyticsService, AuthService auth) {
        this.analyticsService = analyticsService;
        this.auth = auth;
    }

    @PostMapping("/analytics/event")
    public Map<String, Object> recordEvent(HttpServletRequest req, @RequestBody AnalyticsEvent event) {
        try {
            User current = auth.current(req);
            if (current != null && event.getUserId() == null) {
                event.setUserId(current.getId());
            }
        } catch (Exception ignored) {
            // Unauthenticated event is valid (guest search, impression, etc.)
        }
        analyticsService.recordEvent(event);
        return Map.of("success", true);
    }

    @PostMapping("/analytics/events")
    public Map<String, Object> recordEvents(HttpServletRequest req, @RequestBody List<AnalyticsEvent> events) {
        Long currentUserId = null;
        try {
            User current = auth.current(req);
            if (current != null) currentUserId = current.getId();
        } catch (Exception ignored) {}

        if (events != null) {
            for (AnalyticsEvent e : events) {
                if (currentUserId != null && e.getUserId() == null) {
                    e.setUserId(currentUserId);
                }
                analyticsService.recordEvent(e);
            }
        }
        return Map.of("success", true, "recorded", events != null ? events.size() : 0);
    }

    @GetMapping("/admin/analytics/dashboard")
    public Map<String, Object> getAdminDashboardAnalytics(
            HttpServletRequest req,
            @RequestParam(defaultValue = "30") int days
    ) {
        User u = auth.current(req);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN", "FINANCE_ADMIN");
        return analyticsService.getDashboardAnalytics(days);
    }
}
