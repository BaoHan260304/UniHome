package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_reward_task")
@Data
@NoArgsConstructor
public class UserRewardTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "task_code", nullable = false, length = 50)
    private String taskCode;

    @Column(nullable = false, length = 30)
    private String status = "CLAIMED"; // COMPLETED, CLAIMED

    @Column(name = "task_date")
    private java.time.LocalDate taskDate;

    @Column(nullable = false)
    private Integer progress = 0;

    @Column(name = "target_count", nullable = false)
    private Integer targetCount = 1;

    @Column(nullable = false)
    private Boolean completed = false;

    @Column(nullable = false)
    private Boolean claimed = false;

    @Column(name = "reward_points_snapshot", nullable = false)
    private Long rewardPointsSnapshot = 0L;

    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;

    @PrePersist
    void prePersist() {
        if (claimedAt == null && Boolean.TRUE.equals(claimed)) claimedAt = LocalDateTime.now();
        if (taskDate == null) taskDate = java.time.LocalDate.now();
    }
}
