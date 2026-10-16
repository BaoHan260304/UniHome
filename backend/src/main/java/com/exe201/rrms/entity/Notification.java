package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class Notification { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private Long senderId; private Long receiverId; private String type; private Long propertyId; private Long referenceId; private String referenceType; private String status="UNREAD"; @Column(columnDefinition="TEXT") private String message; private LocalDateTime createdAt; @PrePersist void p(){createdAt=LocalDateTime.now();} }
