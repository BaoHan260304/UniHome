package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class Review { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private Long propertyId; private Long userId; private Integer rating; private Integer accuracyRating; private Integer priceTransparencyRating; private Integer utilityTransparencyRating; private Integer landlordCommunicationRating; @Column(columnDefinition="TEXT") private String comment; private String status="VISIBLE"; private LocalDateTime createdAt; @PrePersist void p(){createdAt=LocalDateTime.now();} }
