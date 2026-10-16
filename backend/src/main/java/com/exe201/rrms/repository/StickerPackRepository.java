package com.exe201.rrms.repository;

import com.exe201.rrms.entity.StickerPack;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StickerPackRepository extends JpaRepository<StickerPack, Long> {
    List<StickerPack> findByStatusOrderBySortOrderAsc(String status);
}
