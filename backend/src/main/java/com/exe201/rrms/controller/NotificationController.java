package com.exe201.rrms.controller;

import com.exe201.rrms.entity.Notification;
import com.exe201.rrms.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/receiver/{id}")
    public List<Notification> getForReceiver(@PathVariable Long id) {
        return notificationRepository.findByReceiverId(id);
    }
    
    @GetMapping("/sender/{id}")
    public List<Notification> getForSender(@PathVariable Long id) {
        return notificationRepository.findBySenderId(id);
    }

    @PostMapping
    public Notification create(@RequestBody Notification notif) {
        return notificationRepository.save(notif);
    }
    
    @PutMapping("/{id}/status")
    public Notification updateStatus(@PathVariable Long id, @RequestBody String status) {
        Notification notif = notificationRepository.findById(id).orElseThrow();
        notif.setStatus(status);
        return notificationRepository.save(notif);
    }
}
