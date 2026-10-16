package com.exe201.rrms.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Data @NoArgsConstructor @Table(uniqueConstraints=@UniqueConstraint(columnNames={"listing_id","user_id"}))
public class ListingInterest { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(name="listing_id") private Long listingId; @Column(name="user_id") private Long userId; private Boolean matchingEnabled=false; private String status="INTERESTED"; private LocalDateTime createdAt; @PrePersist void p(){createdAt=LocalDateTime.now();} }
