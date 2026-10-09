package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "advertisement")
@Data
@NoArgsConstructor
public class Advertisement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String campaignName;
    private String advertiserName;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String bannerImage;

    @Column(length = 1000, nullable = false)
    private String destinationUrl;

    @Column(length = 50, nullable = false)
    private String targetType = "EXTERNAL";

    @Column(length = 100, nullable = false)
    private String placement;

    private Integer priority = 0;

    @Column(length = 50, nullable = false)
    private String status = "SCHEDULED";

    private LocalDateTime startAt;
    private LocalDateTime endAt;

    private Long impressions = 0L;
    private Long clickCount = 0L;

    private Long createdBy;

    @Column(columnDefinition = "TEXT")
    private String note;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (priority == null) priority = 0;
        if (impressions == null) impressions = 0L;
        if (clickCount == null) clickCount = 0L;
        if (targetType == null) targetType = "EXTERNAL";
        if (campaignName == null && title != null) campaignName = title;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
