package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;

@Entity
@Data
@NoArgsConstructor
public class ServiceListing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long providerId;
    private String category;
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    private Long priceFrom;
    private String province;
    private String district;
    private Double latitude;
    private Double longitude;
    private String phone;
    private String zaloUrl;
    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;
    @Column(columnDefinition = "LONGTEXT")
    private String galleryJson;
    private String serviceArea;
    @Column(columnDefinition = "TEXT")
    private String pricingTiersJson;
    @Column(columnDefinition = "TEXT")
    private String addOnFeesJson;
    private String businessHours;
    private String responseTime;
    @Column(columnDefinition = "TEXT")
    private String faqJson;
    @Column(columnDefinition = "TEXT")
    private String terms;
    private String status = "PENDING_REVIEW";
    private Boolean featured = false;
    private LocalDateTime createdAt;

    @PrePersist
    void p() {
        createdAt = LocalDateTime.now();
    }
}
