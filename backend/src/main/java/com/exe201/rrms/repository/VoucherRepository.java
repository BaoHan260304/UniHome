package com.exe201.rrms.repository;

import com.exe201.rrms.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    List<Voucher> findByStatus(String status);
    List<Voucher> findByCategoryAndStatus(String category, String status);
    List<Voucher> findByPartnerId(Long partnerId);
}
