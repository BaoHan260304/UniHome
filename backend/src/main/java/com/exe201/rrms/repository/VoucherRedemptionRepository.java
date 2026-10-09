package com.exe201.rrms.repository;

import com.exe201.rrms.entity.VoucherRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VoucherRedemptionRepository extends JpaRepository<VoucherRedemption, Long> {
    List<VoucherRedemption> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<VoucherRedemption> findByRedemptionToken(String redemptionToken);
    long countByUserIdAndVoucherId(Long userId, Long voucherId);
    Optional<VoucherRedemption> findByVoucherCode(String voucherCode);
}
