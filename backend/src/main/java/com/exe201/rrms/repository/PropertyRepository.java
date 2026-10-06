package com.exe201.rrms.repository;

import com.exe201.rrms.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByStatus(String status);
    List<Property> findByLandlordId(Long landlordId);
}
