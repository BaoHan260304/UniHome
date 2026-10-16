package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reward_transaction")
@Data
@NoArgsConstructor
public class RewardTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 30)
    private String type; // EARN, SPEND, EXPIRE, ADJUST

    @Column(nullable = false, length = 50)
    private String source; // DAILY_CHECKIN, TASK, VOUCHER_REDEEM, ADMIN_ADJUST

    @Column(nullable = false)
    private Long points;

    @Column(name = "balance_after", nullable = false)
    private Long balanceAfter = 0L;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
