package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "voucher_redemption")
@Data
@NoArgsConstructor
public class VoucherRedemption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "voucher_id", nullable = false)
    private Long voucherId;

    @Column(name = "voucher_code", nullable = false, length = 100)
    private String voucherCode;

    @Column(name = "redemption_token", nullable = false, length = 100, unique = true)
    private String redemptionToken;

    @Column(name = "points_spent", nullable = false)
    private Long pointsSpent;

    @Column(name = "discount_type", nullable = false, length = 50)
    private String discountType;

    @Column(name = "discount_value", nullable = false)
    private Long discountValue;

    @Column(name = "min_order", nullable = false)
    private Long minOrder = 0L;

    @Column(name = "partner_name", length = 255)
    private String partnerName;

    @Column(name = "voucher_title", length = 255)
    private String voucherTitle;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(nullable = false, length = 50)
    private String status = "AVAILABLE"; // AVAILABLE, USED, EXPIRED, CANCELLED

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
