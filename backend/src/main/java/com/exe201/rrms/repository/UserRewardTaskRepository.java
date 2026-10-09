package com.exe201.rrms.repository;

import com.exe201.rrms.entity.UserRewardTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRewardTaskRepository extends JpaRepository<UserRewardTask, Long> {
    boolean existsByUserIdAndTaskCode(Long userId, String taskCode);
    List<UserRewardTask> findByUserId(Long userId);
    Optional<UserRewardTask> findByUserIdAndTaskCode(Long userId, String taskCode);
}
