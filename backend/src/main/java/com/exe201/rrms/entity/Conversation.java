package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class Conversation { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private Long user1Id; private Long user2Id; private String contextType; private Long contextId; private String contextTitle; @Column(columnDefinition="LONGTEXT") private String contextImage; private String contextPrice; private LocalDateTime updatedAt; private LocalDateTime createdAt; @PrePersist void p(){createdAt=LocalDateTime.now();updatedAt=createdAt;} @PreUpdate void u(){updatedAt=LocalDateTime.now();} }
