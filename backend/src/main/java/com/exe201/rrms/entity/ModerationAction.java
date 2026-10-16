package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class ModerationAction { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private Long listingId; private Long moderatorId; private String action; @Column(columnDefinition="TEXT") private String reason; private LocalDateTime createdAt; @PrePersist void p(){createdAt=LocalDateTime.now();} }
