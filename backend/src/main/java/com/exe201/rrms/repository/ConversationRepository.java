package com.exe201.rrms.repository;

import com.exe201.rrms.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByUser1IdOrUser2IdOrderByUpdatedAtDesc(Long a, Long b);
    Optional<Conversation> findFirstByUser1IdAndUser2IdAndContextTypeAndContextId(Long a, Long b, String type, Long contextId);
    long countByUser1IdOrUser2Id(Long a, Long b);
    long countByContextTypeAndContextId(String contextType, Long contextId);
}