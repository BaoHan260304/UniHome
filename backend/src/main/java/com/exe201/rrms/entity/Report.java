package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class Report { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private Long reporterId; private String targetType; private Long targetId; private String reasonCode; @Column(columnDefinition="TEXT") private String details; private String status="OPEN"; private Long handledBy; @Column(columnDefinition="TEXT") private String resolution; private LocalDateTime createdAt; private LocalDateTime resolvedAt; @PrePersist void p(){createdAt=LocalDateTime.now();} }
