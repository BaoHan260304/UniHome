package com.exe201.rrms.repository;

import com.exe201.rrms.entity.UserBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface UserBlockRepository extends JpaRepository<UserBlock, Long> {
    boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId);
    Optional<UserBlock> findByBlockerIdAndBlockedId(Long blockerId, Long blockedId);
    List<UserBlock> findByBlockerId(Long blockerId);
    @Transactional
    void deleteByBlockerIdAndBlockedId(Long blockerId, Long blockedId);
}
