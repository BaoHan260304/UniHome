package com.exe201.rrms.repository;

import com.exe201.rrms.entity.CommunityMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityMessageRepository extends JpaRepository<CommunityMessage, Long> {
    List<CommunityMessage> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    List<CommunityMessage> findByStatusOrderByIdDesc(String status, Pageable pageable);
    List<CommunityMessage> findByStatusAndIdLessThanOrderByIdDesc(String status, Long beforeId, Pageable pageable);
    long countByUserIdAndCreatedAtAfter(Long userId, java.time.LocalDateTime after);
}
