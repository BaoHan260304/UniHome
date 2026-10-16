package com.exe201.rrms.repository;

import com.exe201.rrms.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    Optional<VerificationCode> findTopByUserIdAndChannelAndPurposeAndUsedAtIsNullOrderByCreatedAtDesc(
            Long userId, String channel, String purpose);

    List<VerificationCode> findByUserIdAndChannelAndPurposeOrderByCreatedAtDesc(
            Long userId, String channel, String purpose);
}
