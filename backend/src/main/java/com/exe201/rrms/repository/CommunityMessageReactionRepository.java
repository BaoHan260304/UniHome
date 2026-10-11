package com.exe201.rrms.repository;

import com.exe201.rrms.entity.CommunityMessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CommunityMessageReactionRepository extends JpaRepository<CommunityMessageReaction, Long> {
    List<CommunityMessageReaction> findByMessageId(Long messageId);
    List<CommunityMessageReaction> findByMessageIdIn(List<Long> messageIds);
    Optional<CommunityMessageReaction> findByMessageIdAndUserId(Long messageId, Long userId);
    long countByMessageId(Long messageId);
}
