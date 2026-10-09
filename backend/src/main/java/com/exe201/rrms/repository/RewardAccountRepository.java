package com.exe201.rrms.repository;

import com.exe201.rrms.entity.RewardAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RewardAccountRepository extends JpaRepository<RewardAccount, Long> {
    default Optional<RewardAccount> findByUserId(Long userId) {
        return findById(userId);
    }
}
