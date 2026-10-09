package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class Message { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private Long conversationId; private Long senderId; @Column(columnDefinition="TEXT") private String content; private String type="TEXT"; private LocalDateTime sentAt; private LocalDateTime readAt; @PrePersist void p(){sentAt=LocalDateTime.now();} }
