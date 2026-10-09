package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor
public class MatchingProfile {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(unique=true) private Long userId; private Boolean enabled=false;
 private String gender; private String schoolName; private Double latitude; private Double longitude; private Integer radiusKm=5;
 private Long budgetMin; private Long budgetMax; private String moveInDate;
 private String sleepSchedule; private Integer cleanlinessLevel; private String smoking; private String pets; private String cooking; private String noisePreference; private String guestFrequency; private String studyWorkSchedule; private String expenseStyle; private String communicationStyle;
 @Column(columnDefinition="TEXT") private String intro;
 private String facebookUrl; private String zaloUrl; private String otherSocialUrl;
 private LocalDateTime updatedAt; @PrePersist @PreUpdate void u(){updatedAt=LocalDateTime.now();}
}
