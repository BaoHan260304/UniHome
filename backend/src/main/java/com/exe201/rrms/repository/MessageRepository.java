package com.exe201.rrms.repository;

import com.exe201.rrms.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderBySentAtAsc(Long conversationId);
    Optional<Message> findTopByConversationIdOrderBySentAtDesc(Long conversationId);
    Optional<Message> findTopByConversationIdAndSenderIdOrderBySentAtDesc(Long conversationId, Long senderId);
    long countByConversationIdAndSenderIdNotAndReadAtIsNull(Long conversationId, Long senderId);
    List<Message> findByConversationIdAndSenderIdNotAndReadAtIsNull(Long conversationId, Long senderId);
    List<Message> findByConversationIdAndIdLessThanOrderByIdDesc(Long conversationId, Long beforeId, org.springframework.data.domain.Pageable pageable);
    List<Message> findByConversationIdOrderByIdDesc(Long conversationId, org.springframework.data.domain.Pageable pageable);
    List<Message> findByConversationIdAndIdGreaterThanOrderByIdAsc(Long conversationId, Long afterId);
    long countByConversationIdAndIdLessThan(Long conversationId, Long id);
}