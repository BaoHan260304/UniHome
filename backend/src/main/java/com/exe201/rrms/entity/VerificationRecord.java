package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class VerificationRecord {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private Long propertyId; private Long listingId; private Long verifierId;
 private String level="CONTENT_REVIEWED"; private String status="PENDING";
 private Boolean roomExists=false, locationVerified=false, mediaVerified=false, priceVerified=false, utilityVerified=false, amenityVerified=false, availabilityVerified=false;
 @Column(columnDefinition="TEXT") private String note; @Column(columnDefinition="LONGTEXT") private String evidenceUrls;
 private LocalDateTime verifiedAt; private LocalDateTime expiresAt; private LocalDateTime createdAt; @PrePersist void p(){createdAt=LocalDateTime.now();}
}
