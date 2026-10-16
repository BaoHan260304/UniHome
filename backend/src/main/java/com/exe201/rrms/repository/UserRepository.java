package com.exe201.rrms.repository;

import com.exe201.rrms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleSub(String googleSub);
    Optional<User> findByFacebookSub(String facebookSub);
    Optional<User> findByPhone(String phone);
    List<User> findByRole(String role);
    List<User> findByIsLookingForRoommateTrue();
}