package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "post_promotion")
@Data
@NoArgsConstructor
public class PostPromotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String targetType; // ROOM, SECOND_HAND, SERVICE

    @Column(nullable = false)
    private Long targetId;

    @Column(nullable = false)
    private Long ownerUserId;

    @Column(nullable = false)
    private Long planId;

    @Column(nullable = false)
    private Integer priority = 0;

    @Column(nullable = false)
    private LocalDateTime startAt;

    @Column(nullable = false)
    private LocalDateTime endAt;

    private LocalDateTime boostUntil;

    @Column(nullable = false, length = 50)
    private String status = "ACTIVE";

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void pre() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (startAt == null) startAt = createdAt;
    }
}
