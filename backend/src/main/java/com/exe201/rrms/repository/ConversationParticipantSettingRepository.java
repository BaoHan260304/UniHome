package com.exe201.rrms.repository;

import com.exe201.rrms.entity.ConversationParticipantSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ConversationParticipantSettingRepository extends JpaRepository<ConversationParticipantSetting, Long> {
    Optional<ConversationParticipantSetting> findByConversationIdAndUserId(Long conversationId, Long userId);
    List<ConversationParticipantSetting> findByUserId(Long userId);
}
