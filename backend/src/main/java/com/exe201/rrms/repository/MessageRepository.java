package com.exe201.rrms.repository;

import com.exe201.rrms.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderBySentAtAsc(Long conversationId);
    Optional<Message> findTopByConversationIdOrderBySentAtDesc(Long conversationId);
    long countByConversationIdAndSenderIdNotAndReadAtIsNull(Long conversationId, Long senderId);
    List<Message> findByConversationIdAndSenderIdNotAndReadAtIsNull(Long conversationId, Long senderId);
}