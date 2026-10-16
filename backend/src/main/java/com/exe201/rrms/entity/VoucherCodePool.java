package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "voucher_code_pool")
@Data
@NoArgsConstructor
public class VoucherCodePool {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "voucher_id", nullable = false)
    private Long voucherId;

    @Column(nullable = false, length = 100)
    private String code;

    @Column(nullable = false, length = 50)
    private String status = "AVAILABLE"; // AVAILABLE, ASSIGNED, USED, EXPIRED

    @Column(name = "assigned_to_user_id")
    private Long assignedToUserId;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
