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
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long senderId;
    private Long receiverId;
    private String type; // RENT_REQUEST, RENT_ACCEPT
    private Long propertyId;
    private String status; // PENDING, ACCEPTED, REJECTED
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String message;
}
