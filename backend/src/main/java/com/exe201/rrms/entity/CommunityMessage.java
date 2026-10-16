package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_message")
@Data
@NoArgsConstructor
public class CommunityMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "channel_id", nullable = false)
    private Long channelId = 1L;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "sender_id")
    private Long senderId;

    @Column(name = "message_type", nullable = false, length = 30)
    private String messageType = "TEXT"; // TEXT, IMAGE, STICKER, GIF, SYSTEM

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "media_url", columnDefinition = "LONGTEXT")
    private String mediaUrl;

    @Column(name = "sticker_pack_id")
    private Long stickerPackId;

    @Column(name = "sticker_id")
    private Long stickerId;

    @Column(name = "gif_url", columnDefinition = "LONGTEXT")
    private String gifUrl;

    @Column(name = "reply_to_id")
    private Long replyToId;

    @Column(name = "reply_to_message_id")
    private Long replyToMessageId;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE"; // ACTIVE, HIDDEN, DELETED

    @Column(name = "moderation_status", nullable = false, length = 30)
    private String moderationStatus = "APPROVED"; // APPROVED, UNDER_REVIEW, REMOVED

    @Column(name = "is_system_message", nullable = false)
    private Boolean isSystemMessage = false;

    @Column(name = "deleted_by")
    private Long deletedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (senderId == null) senderId = userId;
        if (replyToMessageId == null) replyToMessageId = replyToId;
        if (replyToId == null) replyToId = replyToMessageId;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
