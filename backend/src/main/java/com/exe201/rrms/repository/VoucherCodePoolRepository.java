package com.exe201.rrms.repository;

import com.exe201.rrms.entity.VoucherCodePool;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VoucherCodePoolRepository extends JpaRepository<VoucherCodePool, Long> {
    List<VoucherCodePool> findByVoucherId(Long voucherId);
    Optional<VoucherCodePool> findFirstByVoucherIdAndStatus(Long voucherId, String status);
    long countByVoucherIdAndStatus(Long voucherId, String status);
    Optional<VoucherCodePool> findByVoucherIdAndCode(Long voucherId, String code);
}
