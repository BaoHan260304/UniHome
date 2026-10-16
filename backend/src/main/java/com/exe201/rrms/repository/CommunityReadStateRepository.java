package com.exe201.rrms.repository;

import com.exe201.rrms.entity.CommunityReadState;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CommunityReadStateRepository extends JpaRepository<CommunityReadState, Long> {
    Optional<CommunityReadState> findByUserIdAndChannelId(Long userId, Long channelId);
}
