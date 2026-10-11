package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_read_state")
@Data
@NoArgsConstructor
public class CommunityReadState {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "channel_id", nullable = false)
    private Long channelId = 1L;

    @Column(name = "last_read_message_id", nullable = false)
    private Long lastReadMessageId = 0L;

    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;

    @PrePersist
    @PreUpdate
    void pre() {
        lastReadAt = LocalDateTime.now();
    }
}
