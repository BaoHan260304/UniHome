package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class Property {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 private Long landlordId; private String name;
 private String province; private String district; private String ward; private String street;
 private Double latitude; private Double longitude;
 private Long price; private Double area; private Long deposit; private Long electricityPrice; private Long waterPrice; private Long internetPrice; private Long parkingFee; private Long otherFees;
 private String furniture; private String propertyType; private String postType; private Integer totalRooms; private Integer availableRooms; private Integer totalFloors; private String floorText; private Integer maxOccupants;
 private String nearestSchool; private Double nearestSchoolDistanceKm;
 @Column(columnDefinition="TEXT") private String amenities; @Column(columnDefinition="TEXT") private String rules;
 private String contactPhone; private String contactZalo;
 private String status="ACTIVE"; private String availability="AVAILABLE";
 private LocalDateTime lastAvailabilityConfirmedAt;
 @Column(columnDefinition="TEXT") private String description;
 @Column(columnDefinition="LONGTEXT") private String imageUrl;
 @Column(columnDefinition="LONGTEXT") private String mediaJson;
 @Column(columnDefinition="LONGTEXT") private String verificationEvidenceJson;
 private Integer panoramaCount = 0;
 private Integer videoCount = 0;
 private Boolean autoDrafted=false;
 private LocalDateTime createdAt; private LocalDateTime updatedAt;
 @PrePersist void p(){createdAt=LocalDateTime.now();updatedAt=createdAt;} @PreUpdate void u(){updatedAt=LocalDateTime.now();}
}
