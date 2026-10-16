package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class WalletTransaction { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private Long userId; private String type; private Long amount; private Long balanceAfter; private String referenceType; private Long referenceId; private String description; private LocalDateTime createdAt; @PrePersist void p(){createdAt=LocalDateTime.now();} }
