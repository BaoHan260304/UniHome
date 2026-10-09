package com.exe201.rrms.repository;

import com.exe201.rrms.entity.ListingInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ListingInterestRepository extends JpaRepository<ListingInterest, Long> {
    Optional<ListingInterest> findByListingIdAndUserId(Long listingId, Long userId);
    List<ListingInterest> findByListingIdAndMatchingEnabledTrue(Long listingId);
    List<ListingInterest> findByUserId(Long userId);
    long countByListingId(Long listingId);
    long countByListingIdAndMatchingEnabledTrue(Long listingId);
}