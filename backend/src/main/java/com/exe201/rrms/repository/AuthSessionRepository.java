package com.exe201.rrms.repository;

import com.exe201.rrms.entity.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

public interface AuthSessionRepository extends JpaRepository<AuthSession, String> {
    List<AuthSession> findByUserId(Long userId);

    @Transactional
    @Modifying
    void deleteByUserId(Long userId);
}