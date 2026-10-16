package com.exe201.rrms.repository;

import com.exe201.rrms.entity.CommunityMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CommunityMessageRepository extends JpaRepository<CommunityMessage, Long> {
    List<CommunityMessage> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    List<CommunityMessage> findByStatusOrderByIdDesc(String status, Pageable pageable);
    List<CommunityMessage> findByStatusAndIdLessThanOrderByIdDesc(String status, Long beforeId, Pageable pageable);
    List<CommunityMessage> findByStatusAndChannelIdOrderByIdDesc(String status, Long channelId, Pageable pageable);
    List<CommunityMessage> findByStatusAndChannelIdAndIdLessThanOrderByIdDesc(String status, Long channelId, Long beforeId, Pageable pageable);
    List<CommunityMessage> findByStatusAndUserIdOrderByIdDesc(String status, Long userId, Pageable pageable);
    
    long countByUserIdAndCreatedAtAfter(Long userId, LocalDateTime after);
    long countByStatusAndChannelIdAndIdGreaterThan(String status, Long channelId, Long lastReadId);

    @Query("SELECT m FROM CommunityMessage m WHERE m.status = 'ACTIVE' AND m.channelId = :channelId AND LOWER(m.content) LIKE LOWER(CONCAT('%', :kw, '%')) ORDER BY m.id DESC")
    List<CommunityMessage> searchMessages(@Param("channelId") Long channelId, @Param("kw") String kw, Pageable pageable);
}
