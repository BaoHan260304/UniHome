package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*;
@Entity @Data @NoArgsConstructor
public class PackagePlan { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(unique=true) private String code; private String name; private String productType="LISTING"; private Long price; private Integer durationDays; private Integer priority; private Boolean featured=false; private Integer boostCredits=0; private Boolean active=true; @Column(columnDefinition="TEXT") private String benefits; }
