package com.exe201.rrms.repository;

import com.exe201.rrms.entity.DailyCheckin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyCheckinRepository extends JpaRepository<DailyCheckin, Long> {
    Optional<DailyCheckin> findByUserIdAndCheckinDate(Long userId, LocalDate date);
    Optional<DailyCheckin> findTopByUserIdOrderByCheckinDateDesc(Long userId);
    List<DailyCheckin> findByUserIdAndCheckinDateBetweenOrderByCheckinDateAsc(Long userId, LocalDate start, LocalDate end);
    long countByUserId(Long userId);
}
