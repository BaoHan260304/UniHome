package com.exe201.rrms.repository;

import com.exe201.rrms.entity.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {
    long countByEventTypeAndCreatedAtBetween(String eventType, LocalDateTime start, LocalDateTime end);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<AnalyticsEvent> findByEventTypeOrderByCreatedAtDesc(String eventType);
    List<AnalyticsEvent> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT e.eventType, COUNT(e) FROM AnalyticsEvent e WHERE e.createdAt >= :since GROUP BY e.eventType")
    List<Object[]> countGroupedByEventType(@Param("since") LocalDateTime since);

    @Query("SELECT FUNCTION('DATE', e.createdAt), COUNT(e) FROM AnalyticsEvent e WHERE e.createdAt >= :since GROUP BY FUNCTION('DATE', e.createdAt) ORDER BY FUNCTION('DATE', e.createdAt)")
    List<Object[]> countDailyEvents(@Param("since") LocalDateTime since);
}
