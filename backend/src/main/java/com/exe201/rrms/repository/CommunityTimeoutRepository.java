package com.exe201.rrms.repository;

import com.exe201.rrms.entity.CommunityTimeout;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.Optional;

public interface CommunityTimeoutRepository extends JpaRepository<CommunityTimeout, Long> {
    Optional<CommunityTimeout> findFirstByUserIdAndExpiresAtAfterOrderByExpiresAtDesc(Long userId, LocalDateTime now);
}
