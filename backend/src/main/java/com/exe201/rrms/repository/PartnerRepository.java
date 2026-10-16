package com.exe201.rrms.repository;

import com.exe201.rrms.entity.Partner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PartnerRepository extends JpaRepository<Partner, Long> {
    List<Partner> findByStatus(String status);
    List<Partner> findByCategoryAndStatus(String category, String status);
}
