package com.exe201.rrms.repository;

import com.exe201.rrms.entity.PostPromotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostPromotionRepository extends JpaRepository<PostPromotion, Long> {
    List<PostPromotion> findByOwnerUserIdOrderByCreatedAtDesc(Long ownerUserId);
    List<PostPromotion> findByTargetTypeAndTargetIdAndStatus(String targetType, Long targetId, String status);
    Optional<PostPromotion> findFirstByTargetTypeAndTargetIdAndStatusAndEndAtAfter(
            String targetType, Long targetId, String status, LocalDateTime now);
}
