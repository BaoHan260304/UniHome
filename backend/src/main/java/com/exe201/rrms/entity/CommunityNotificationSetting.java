package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_notification_setting")
@Data
@NoArgsConstructor
public class CommunityNotificationSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "channel_id", nullable = false)
    private Long channelId = 1L;

    @Column(nullable = false, length = 30)
    private String mode = "MENTION_REPLY_ONLY"; // ALL_MESSAGES, MENTION_REPLY_ONLY, IMPORTANT_ONLY, FULL_MUTE

    @Column(name = "muted_until")
    private LocalDateTime mutedUntil;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void pre() {
        updatedAt = LocalDateTime.now();
    }
}
