package com.exe201.rrms.service;
import com.exe201.rrms.entity.Notification; import com.exe201.rrms.repository.NotificationRepository; import org.springframework.stereotype.Service;
@Service
public class NotificationService {
    private final NotificationRepository repo;

    public NotificationService(NotificationRepository r) {
        repo = r;
    }

    public Notification send(Long receiver, String type, String message, String refType, Long refId) {
        return send(null, receiver, type, message, refType, refId);
    }

    public Notification send(Long senderId, Long receiver, String type, String message, String refType, Long refId) {
        Notification n = new Notification();
        n.setSenderId(senderId);
        n.setReceiverId(receiver);
        n.setType(type);
        n.setMessage(message);
        n.setReferenceType(refType);
        n.setReferenceId(refId);
        return repo.save(n);
    }
}
