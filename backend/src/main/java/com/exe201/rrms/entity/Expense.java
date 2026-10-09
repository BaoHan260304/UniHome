package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class Expense { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private String category; private Long amount; private String description; private Long createdBy; private LocalDate expenseDate; private LocalDateTime createdAt; @PrePersist void p(){createdAt=LocalDateTime.now(); if(expenseDate==null) expenseDate=LocalDate.now();} }
