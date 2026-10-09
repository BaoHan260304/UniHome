package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor @Table(uniqueConstraints=@UniqueConstraint(columnNames={"follower_id","following_id"}))
public class Follow { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(name="follower_id") private Long followerId; @Column(name="following_id") private Long followingId; private LocalDateTime createdAt; @PrePersist void p(){createdAt=LocalDateTime.now();} }
