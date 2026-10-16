package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class Answer { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private Long questionId; private Long userId; @Column(columnDefinition="TEXT") private String content; private String status="VISIBLE"; private LocalDateTime createdAt; @PrePersist void p(){createdAt=LocalDateTime.now();} }
