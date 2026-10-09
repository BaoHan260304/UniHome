package com.exe201.rrms.repository;

import com.exe201.rrms.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    Optional<Favorite> findByListingIdAndUserId(Long listingId, Long userId);
    List<Favorite> findByUserId(Long userId);
    long countByListingId(Long listingId);
}