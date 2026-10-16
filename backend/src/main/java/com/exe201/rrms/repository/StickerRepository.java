package com.exe201.rrms.repository;

import com.exe201.rrms.entity.Sticker;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StickerRepository extends JpaRepository<Sticker, Long> {
    List<Sticker> findByPackIdAndStatusOrderBySortOrderAsc(Long packId, String status);
}
