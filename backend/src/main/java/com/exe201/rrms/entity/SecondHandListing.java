package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "second_hand_listing")
@Data
@NoArgsConstructor
public class SecondHandListing {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "seller_id", nullable = false) private Long sellerId;
    @Column(nullable = false, length = 255) private String title;
    @Column(length = 100) private String category;
    private Long price;
    @Column(name = "condition_text", length = 255) private String conditionText;
    @Column(length = 255) private String province;
    @Column(length = 255) private String district;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "image_url", columnDefinition = "LONGTEXT") private String imageUrl;
    @Column(length = 50) private String status = "ACTIVE";
    @Column(name = "expires_at") private LocalDateTime expiresAt;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void p() { createdAt = LocalDateTime.now(); if (expiresAt == null) expiresAt = createdAt.plusDays(30); }
}
