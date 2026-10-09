package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reward_account")
@Data
@NoArgsConstructor
public class RewardAccount {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private Long balance = 0L;

    @Column(name = "lifetime_earned", nullable = false)
    private Long lifetimeEarned = 0L;

    @Column(name = "lifetime_spent", nullable = false)
    private Long lifetimeSpent = 0L;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
