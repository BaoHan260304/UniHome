package com.exe201.rrms.repository;

import com.exe201.rrms.entity.RewardTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RewardTaskRepository extends JpaRepository<RewardTask, String> {
    List<RewardTask> findByIsActiveTrue();
}
