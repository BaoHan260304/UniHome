package com.exe201.rrms.repository;

import com.exe201.rrms.entity.RewardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, Long> {
    List<RewardTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<RewardTransaction> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
}
