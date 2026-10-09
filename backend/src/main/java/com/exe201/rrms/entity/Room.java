package com.exe201.rrms.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long propertyId;
    private String roomNumber;
    private Integer floorNumber;
    private Integer maxOccupants;
    private Long price;
    private Double area;
    private String status; // AVAILABLE / OCCUPIED / UNDER_MAINTENANCE
    private String description;
    private String imageUrl;
}
