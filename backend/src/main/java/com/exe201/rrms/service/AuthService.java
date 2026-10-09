package com.exe201.rrms.service;

import com.exe201.rrms.entity.AuthSession;
import com.exe201.rrms.entity.User;
import com.exe201.rrms.exception.ValidationException;
import com.exe201.rrms.repository.AuthSessionRepository;
import com.exe201.rrms.repository.UserRepository;
import com.exe201.rrms.util.PasswordUtil;
import com.exe201.rrms.util.ValidationUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthService {
    private final UserRepository users;
    private final AuthSessionRepository sessions;
    private final VerificationService verification;

    public AuthService(UserRepository users, AuthSessionRepository sessions, VerificationService verification) {
        this.users = users;
        this.sessions = sessions;
        this.verification = verification;
    }

    @Transactional
    public User register(User u, String confirmPassword, Boolean agreeTerms) {
        Map<String, String> errors = new LinkedHashMap<>();

        if (u.getFullName() == null || u.getFullName().trim().isBlank()) {
            errors.put("fullName", "Họ và tên không được để trống");
        } else if (u.getFullName().trim().length() < 2 || u.getFullName().trim().length() > 100) {
            errors.put("fullName", "Họ và tên từ 2 đến 100 ký tự");
        }

        if (u.getEmail() == null || u.getEmail().trim().isBlank()) {
            errors.put("email", "Email không được để trống");
        } else if (!ValidationUtil.isValidEmail(u.getEmail())) {
            errors.put("email", "Email không đúng định dạng");
        } else if (users.findByEmail(u.getEmail().trim().toLowerCase()).isPresent()) {
            errors.put("email", "Email đã được sử dụng");
        }

        if (u.getPhone() == null || u.getPhone().trim().isBlank()) {
            errors.put("phone", "Số điện thoại không được để trống");
        } else if (!ValidationUtil.isValidVnPhone(u.getPhone())) {
            errors.put("phone", "Số điện thoại Việt Nam không hợp lệ (10 chữ số, ví dụ 0912345678)");
        } else {
            String normPhone = ValidationUtil.normalizePhone(u.getPhone());
            if (users.findByPhone(normPhone).isPresent()) {
                errors.put("phone", "Số điện thoại đã được đăng ký bởi tài khoản khác");
            }
            u.setPhone(normPhone);
        }

        if (u.getPassword() == null || u.getPassword().isBlank()) {
            errors.put("password", "Mật khẩu không được để trống");
        } else if (u.getPassword().length() < 8) {
            errors.put("password", "Mật khẩu phải có ít nhất 8 ký tự");
        } else if (!ValidationUtil.isStrongPassword(u.getPassword())) {
            errors.put("password", "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số");
        }

        if (confirmPassword == null || !confirmPassword.equals(u.getPassword())) {
            errors.put("confirmPassword", "Mật khẩu xác nhận không khớp");
        }

        if (agreeTerms == null || !agreeTerms) {
            errors.put("agreeTerms", "Bạn cần đồng ý với điều khoản sử dụng UniHome");
        }

        if (!errors.isEmpty()) {
            throw new ValidationException("Thông tin đăng ký chưa hợp lệ", errors);
        }

        u.setFullName(u.getFullName().trim());
        u.setEmail(u.getEmail().trim().toLowerCase());
        normalizeRole(u);
        if (!Set.of("TENANT", "LANDLORD").contains(u.getRole())) {
            u.setRole("TENANT");
        }
        u.setStatus("PENDING_VERIFICATION");
        u.setEmailVerified(false);
        u.setPhoneVerified(false);
        u.setAuthProvider("LOCAL");
        u.setPassword(PasswordUtil.hash(u.getPassword()));
        u.setCreatedAt(LocalDateTime.now());

        User saved = users.save(u);

        // Send initial email OTP
        try {
            verification.sendOtp(saved, "EMAIL", "REGISTER");
        } catch (Exception e) {
            // log and continue
        }

        return saved;
    }

    public Map<String, Object> login(String email, String password) {
        if (email == null || email.trim().isBlank()) {
            throw new ValidationException("email", "Vui lòng nhập email");
        }
        if (password == null || password.isBlank()) {
            throw new ValidationException("password", "Vui lòng nhập mật khẩu");
        }

        User u = users.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ValidationException("email", "Email hoặc mật khẩu không chính xác"));

        if (!PasswordUtil.verify(password, u.getPassword())) {
            throw new ValidationException("password", "Email hoặc mật khẩu không chính xác");
        }

        // Auto-upgrade legacy hash if needed
        if (u.getPassword() != null && !u.getPassword().startsWith("pbkdf2$")) {
            u.setPassword(PasswordUtil.hash(password));
            users.save(u);
        }

        if ("SUSPENDED".equalsIgnoreCase(u.getStatus()) || "BLOCKED".equalsIgnoreCase(u.getStatus())) {
            throw new IllegalStateException("Tài khoản của bạn đã bị khóa hoặc tạm ngưng hoạt động");
        }

        if ("PENDING_VERIFICATION".equalsIgnoreCase(u.getStatus())) {
            Map<String, Object> pendingRes = new LinkedHashMap<>();
            pendingRes.put("status", "PENDING_VERIFICATION");
            pendingRes.put("message", "Tài khoản cần hoàn tất xác minh trước khi sử dụng");
            pendingRes.put("userId", u.getId());
            pendingRes.put("email", u.getEmail());
            pendingRes.put("phone", u.getPhone() != null ? u.getPhone() : "");
            pendingRes.put("emailVerified", Boolean.TRUE.equals(u.getEmailVerified()));
            pendingRes.put("phoneVerified", Boolean.TRUE.equals(u.getPhoneVerified()));
            return pendingRes;
        }

        u.setLastLoginAt(LocalDateTime.now());
        normalizeRole(u);
        users.save(u);
        return issue(u);
    }

    public Map<String, Object> issue(User u) {
        AuthSession s = new AuthSession();
        s.setToken(UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", ""));
        s.setUserId(u.getId());
        s.setExpiresAt(LocalDateTime.now().plusDays(30));
        sessions.save(s);
        return Map.of("token", s.getToken(), "user", safeUser(u));
    }

    @Transactional
    public void logout(HttpServletRequest req) {
        String token = extractToken(req);
        if (token != null && !token.isBlank()) {
            sessions.deleteById(token);
        }
    }

    @Transactional
    public void logoutAll(HttpServletRequest req) {
        User u = current(req);
        sessions.deleteByUserId(u.getId());
    }

    public User current(HttpServletRequest req) {
        String token = extractToken(req);
        if (token == null || token.isBlank()) {
            throw new SecurityException("Bạn cần đăng nhập");
        }
        AuthSession s = sessions.findById(token)
                .orElseThrow(() -> new SecurityException("Phiên đăng nhập không hợp lệ hoặc đã kết thúc"));
        if (s.getExpiresAt().isBefore(LocalDateTime.now())) {
            sessions.delete(s);
            throw new SecurityException("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
        return users.findById(s.getUserId())
                .orElseThrow(() -> new SecurityException("Không tìm thấy thông tin tài khoản"));
    }

    public User optional(HttpServletRequest req) {
        try {
            return current(req);
        } catch (Exception e) {
            return null;
        }
    }

    public void requireRole(User u, String... roles) {
        Set<String> allowed = new HashSet<>(Arrays.asList(roles));
        if (u == null || !allowed.contains(u.getRole())) {
            throw new SecurityException("Bạn không có quyền thực hiện thao tác này");
        }
    }

    public Map<String, Object> safeUser(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("fullName", u.getFullName());
        m.put("email", u.getEmail());
        m.put("role", u.getRole());
        m.put("status", u.getStatus());
        m.put("phone", u.getPhone());
        m.put("avatarUrl", u.getAvatarUrl());
        m.put("bio", u.getBio());
        m.put("dob", u.getDob());
        m.put("gender", u.getGender());
        m.put("schoolName", u.getSchoolName());
        m.put("facebookUrl", u.getFacebookUrl());
        m.put("zaloUrl", u.getZaloUrl());
        m.put("otherSocialUrl", u.getOtherSocialUrl());
        m.put("homeLat", u.getHomeLat());
        m.put("homeLng", u.getHomeLng());
        m.put("matchingRadiusKm", u.getMatchingRadiusKm());
        m.put("isLookingForRoommate", u.getIsLookingForRoommate());
        m.put("emailVerified", Boolean.TRUE.equals(u.getEmailVerified()));
        m.put("emailVerifiedAt", u.getEmailVerifiedAt());
        m.put("phoneVerified", Boolean.TRUE.equals(u.getPhoneVerified()));
        m.put("phoneVerifiedAt", u.getPhoneVerifiedAt());
        m.put("authProvider", u.getAuthProvider());
        m.put("createdAt", u.getCreatedAt());
        return m;
    }

    public void normalizeRole(User u) {
        if (u.getRole() == null) u.setRole("TENANT");
        if (u.getRole().equalsIgnoreCase("manager")) u.setRole("LANDLORD");
        if (u.getRole().equalsIgnoreCase("tenant")) u.setRole("TENANT");
        u.setRole(u.getRole().toUpperCase(Locale.ROOT));
    }

    private String extractToken(HttpServletRequest req) {
        String token = req.getHeader("X-Auth-Token");
        if ((token == null || token.isBlank()) && req.getHeader("Authorization") != null && req.getHeader("Authorization").startsWith("Bearer ")) {
            token = req.getHeader("Authorization").substring(7);
        }
        return token;
    }
}
