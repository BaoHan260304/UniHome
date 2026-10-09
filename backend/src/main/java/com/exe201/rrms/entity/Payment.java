package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class Payment { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private Long userId; private String code; private Long amount; private String type; private String status="PENDING"; private String referenceType; private Long referenceId; private Long planId; @Column(columnDefinition="TEXT") private String qrUrl; private LocalDateTime createdAt; private LocalDateTime paidAt; @PrePersist void p(){createdAt=LocalDateTime.now();} }
