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

    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;

    @PrePersist
    void prePersist() {
        if (claimedAt == null) claimedAt = LocalDateTime.now();
    }
}
