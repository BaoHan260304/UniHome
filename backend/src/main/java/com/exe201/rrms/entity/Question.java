package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class Question { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private Long userId; private String title; @Column(columnDefinition="TEXT") private String content; private String category; private Long acceptedAnswerId; private String status="VISIBLE"; private LocalDateTime createdAt; @PrePersist void p(){createdAt=LocalDateTime.now();} }
