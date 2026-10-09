package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class BlogPost { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private Long authorId; private String category; private String title; @Column(columnDefinition="TEXT") private String summary; @Column(columnDefinition="LONGTEXT") private String content; @Column(columnDefinition="LONGTEXT") private String coverImage; private String tags; private String status="DRAFT"; private Integer readingMinutes; private LocalDateTime publishedAt; private LocalDateTime updatedAt; @PrePersist @PreUpdate void u(){updatedAt=LocalDateTime.now();} }
