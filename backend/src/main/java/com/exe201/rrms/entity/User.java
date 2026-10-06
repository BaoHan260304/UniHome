package com.exe201.rrms.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fullName;
    @Column(unique = true)
    private String email;
    private String password;
    private String role;
    private String phone;
    
    // Roommate matching profile
    private String dob; 
    private Boolean isLookingForRoommate;
    @Column(columnDefinition = "TEXT")
    private String characteristics; // Checkboxes
    @Column(columnDefinition = "TEXT")
    private String matchingBio; // Free text answers
    
    private String gender; // Nam, Nữ, Khác
    private String preferredGender; // Bất kỳ, Nam, Nữ
    @Column(columnDefinition = "LONGTEXT")
    private String avatarUrl;
    
    // Post limit and expiry for Manager
    private Integer postLimit = 3;
    private String packageExpiryDate;
    private String currentPackage = "Mặc định";
}
