package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
@Table(indexes={@Index(name="idx_listing_status",columnList="status"),@Index(name="idx_listing_property",columnList="property_id"),@Index(name="idx_listing_landlord",columnList="landlord_id")})
public class Listing {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="property_id") private Long propertyId; @Column(name="landlord_id") private Long landlordId; private String title;
 private String status="DRAFT"; // DRAFT/PENDING_REVIEW/NEED_REVISION/ACTIVE/HIDDEN_STALE/EXPIRED/ARCHIVED/SUSPENDED/REJECTED
 private String packageTier="FREE"; private Integer packagePriority=0;
 private LocalDateTime packageUntil; private LocalDateTime boostUntil; private LocalDateTime publishedAt; private LocalDateTime archivedAt;
 private LocalDateTime lastConfirmedAt; private LocalDateTime freshnessDueAt;
 private Long viewCount=0L; private Long interestCount=0L;
 @Column(columnDefinition="TEXT") private String revisionNote;
 private LocalDateTime createdAt; private LocalDateTime updatedAt;
 @PrePersist void p(){createdAt=LocalDateTime.now();updatedAt=createdAt;} @PreUpdate void u(){updatedAt=LocalDateTime.now();}
}
