package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;

@Entity @Table(name="users") @Data @NoArgsConstructor
public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 private String fullName;
 @Column(unique=true, nullable=false) private String email;
 private String password;
 private String role="TENANT";
 private String status="ACTIVE";
 private String phone;
 @Column(columnDefinition="LONGTEXT") private String avatarUrl;
 @Column(columnDefinition="TEXT") private String bio;
 private String dob;
 private String gender;
 private String schoolName;
 private String facebookUrl; private String zaloUrl; private String otherSocialUrl;
 private Double homeLat;
 private Double homeLng;
 private Integer matchingRadiusKm=5;
 private Boolean isLookingForRoommate=false;
 @Column(columnDefinition="TEXT") private String characteristics;
 @Column(columnDefinition="TEXT") private String matchingBio;
 private String preferredGender;
 private String googleSub;
 private String facebookSub;
 private String authProvider="LOCAL";
 private Boolean emailVerified=false;
 private LocalDateTime emailVerifiedAt;
 private Boolean phoneVerified=false;
 private LocalDateTime phoneVerifiedAt;
 private LocalDateTime createdAt;
 private LocalDateTime lastLoginAt;
 // Legacy fields kept only for backward compatibility with the original DB.
 private Integer postLimit=3;
 private String packageExpiryDate;
 private String currentPackage="Mặc định";
 @PrePersist void pre(){ if(createdAt==null) createdAt=LocalDateTime.now(); if(role!=null){ if(role.equalsIgnoreCase("manager")) role="LANDLORD"; if(role.equalsIgnoreCase("tenant")) role="TENANT"; } }
}
