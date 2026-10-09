package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class Advertisement { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private String title; @Column(columnDefinition="LONGTEXT") private String bannerImage; private String destinationUrl; private String placement; private String status="SCHEDULED"; private LocalDateTime startAt; private LocalDateTime endAt; private Long clickCount=0L; private LocalDateTime createdAt; @PrePersist void p(){createdAt=LocalDateTime.now();} }
