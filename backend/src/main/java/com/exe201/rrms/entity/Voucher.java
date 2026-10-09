package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "voucher")
@Data
@NoArgsConstructor
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "partner_id", nullable = false)
    private Long partnerId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 100)
    private String category = "ALL";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "discount_type", nullable = false, length = 50)
    private String discountType = "PERCENT"; // PERCENT, FIXED_AMOUNT

    @Column(name = "discount_value", nullable = false)
    private Long discountValue;

    @Column(name = "min_order", nullable = false)
    private Long minOrder = 0L;

    @Column(name = "points_cost", nullable = false)
    private Long pointsCost = 100L;

    @Column(name = "total_stock", nullable = false)
    private Integer totalStock = 100;

    @Column(name = "remaining_stock", nullable = false)
    private Integer remainingStock = 100;

    @Column(name = "limit_per_user", nullable = false)
    private Integer limitPerUser = 1;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Column(columnDefinition = "TEXT")
    private String terms;

    @Column(name = "usage_instructions", columnDefinition = "TEXT")
    private String usageInstructions;

    @Column(name = "code_mode", nullable = false, length = 50)
    private String codeMode = "GENERATED_UNIQUE"; // SHARED_CODE, GENERATED_UNIQUE, PARTNER_CODE_POOL

    @Column(name = "shared_code", length = 100)
    private String sharedCode;

    @Column(nullable = false, length = 50)
    private String status = "ACTIVE"; // DRAFT, SCHEDULED, ACTIVE, PAUSED, EXPIRED, ARCHIVED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
