package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class AuthSession { @Id private String token; private Long userId; private LocalDateTime expiresAt; private LocalDateTime createdAt; @PrePersist void p(){createdAt=LocalDateTime.now();} }
