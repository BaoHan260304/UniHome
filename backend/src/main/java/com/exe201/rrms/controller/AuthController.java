package com.exe201.rrms.controller;

import com.exe201.rrms.entity.User;
import com.exe201.rrms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.ok(userOpt.get());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email hoặc mật khẩu không đúng");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email đã tồn tại");
        }
        user.setIsLookingForRoommate(false);
        return ResponseEntity.ok(userRepository.save(user));
    }
    
    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id).orElseThrow();
        user.setFullName(userDetails.getFullName());
        user.setPhone(userDetails.getPhone());
        user.setDob(userDetails.getDob());
        user.setIsLookingForRoommate(userDetails.getIsLookingForRoommate());
        user.setCharacteristics(userDetails.getCharacteristics());
        user.setMatchingBio(userDetails.getMatchingBio());
        user.setGender(userDetails.getGender());
        user.setPreferredGender(userDetails.getPreferredGender());
        user.setAvatarUrl(userDetails.getAvatarUrl());
        if (userDetails.getPostLimit() != null) {
            user.setPostLimit(userDetails.getPostLimit());
        }
        if (userDetails.getPackageExpiryDate() != null) {
            user.setPackageExpiryDate(userDetails.getPackageExpiryDate());
        }
        if (userDetails.getCurrentPackage() != null) {
            user.setCurrentPackage(userDetails.getCurrentPackage());
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/change-password/{id}")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> passwords) {
        User user = userRepository.findById(id).orElseThrow();
        String oldPassword = passwords.get("oldPassword");
        String newPassword = passwords.get("newPassword");
        
        if (!user.getPassword().equals(oldPassword)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu cũ không chính xác!");
        }
        user.setPassword(newPassword);
        userRepository.save(user);
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userRepository.findById(id).orElseThrow());
    }

    @GetMapping("/roommates")
    public ResponseEntity<List<User>> getRoommates() {
        return ResponseEntity.ok(userRepository.findByIsLookingForRoommateTrue());
    }
}
