package com.exe201.rrms.repository;

import com.exe201.rrms.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByStatus(String status);
    List<Listing> findByLandlordIdOrderByUpdatedAtDesc(Long landlordId);
    List<Listing> findByPropertyId(Long propertyId);
    List<Listing> findByStatusIn(Collection<String> status);
    long countByStatus(String status);
}