package com.exe201.rrms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long landlordId;
    private String name; 
    
    // Address components
    private String province;
    private String district;
    private String ward;
    private String street;
    
    private Double price;
    private Double area;
    private Double electricityPrice;
    private Double waterPrice;
    private String furniture; // full, basic, none
    
    // single or group
    private String postType; 
    private Integer totalRooms;
    private Integer availableRooms;
    
    private String status; // Available, Occupied, Under Maintenance
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "LONGTEXT") // LONGTEXT supports huge base64 strings
    private String imageUrl;
    
    private Boolean autoDrafted = false;
}
