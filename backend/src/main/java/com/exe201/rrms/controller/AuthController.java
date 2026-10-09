package com.exe201.rrms.controller;

import com.exe201.rrms.entity.PasswordResetToken;
import com.exe201.rrms.entity.User;
import com.exe201.rrms.repository.PasswordResetTokenRepository;
import com.exe201.rrms.repository.UserRepository;
import com.exe201.rrms.service.AuthService;
import com.exe201.rrms.util.PasswordUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final UserRepository users;
    private final PasswordResetTokenRepository resets;
    private final ObjectMapper mapper;

    @Value("${unihome.google.client-id:}")
    private String googleClientId;

    public AuthController(AuthService auth, UserRepository users, PasswordResetTokenRepository resets, ObjectMapper mapper) {
        this.auth = auth;
        this.users = users;
        this.resets = resets;
        this.mapper = mapper;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {
        return auth.issue(auth.register(user));
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        return auth.login(body.get("email"), body.get("password"));
    }

    @PostMapping("/google")
    public Map<String, Object> google(@RequestBody Map<String, String> body) throws Exception {
        String idToken = body.get("idToken");
        if (idToken == null || idToken.isBlank()) throw new IllegalArgumentException("Thiếu Google ID token");

        String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + URLEncoder.encode(idToken, StandardCharsets.UTF_8);
        java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder(URI.create(tokenInfoUrl)).GET().build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) throw new SecurityException("Google token không hợp lệ");

        JsonNode json = mapper.readTree(response.body());
        String audience = json.path("aud").asString("");
        if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.equals(audience)) throw new SecurityException("Sai Google Client ID");

        String googleSub = json.path("sub").asString("");
        String email = json.path("email").asString("");
        String fullName = json.path("name").asString("");
        String avatar = json.path("picture").asString("");
        if (email.isBlank()) throw new SecurityException("Google không trả về email hợp lệ");

        User user = users.findByGoogleSub(googleSub).orElseGet(() -> users.findByEmail(email).orElseGet(User::new));
        if (user.getId() == null) {
            user.setEmail(email);
            user.setRole("TENANT");
            user.setStatus("ACTIVE");
            user.setPassword(PasswordUtil.hash(UUID.randomUUID().toString()));
        }
        user.setGoogleSub(googleSub);
        if (user.getFullName() == null || user.getFullName().isBlank()) user.setFullName(fullName);
        if (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) user.setAvatarUrl(avatar);
        user.setLastLoginAt(LocalDateTime.now());
        users.save(user);
        return auth.issue(user);
    }

    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) throw new IllegalArgumentException("Vui lòng nhập email");
        User user = users.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy email"));
        PasswordResetToken token = new PasswordResetToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUserId(user.getId());
        token.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        resets.save(token);
        return Map.of("message", "Đã tạo yêu cầu đặt lại mật khẩu.", "devResetToken", token.getToken());
    }

    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> body) {
        String tokenValue = body.get("token");
        String newPassword = body.get("newPassword");
        if (tokenValue == null || tokenValue.isBlank()) throw new IllegalArgumentException("Thiếu reset token");
        if (newPassword == null || newPassword.isBlank()) throw new IllegalArgumentException("Vui lòng nhập mật khẩu mới");
        PasswordResetToken token = resets.findById(tokenValue).orElseThrow(() -> new IllegalArgumentException("Token không hợp lệ"));
        if (Boolean.TRUE.equals(token.getUsed())) throw new IllegalArgumentException("Token đã được sử dụng");
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) throw new IllegalArgumentException("Token đã hết hạn");
        User user = users.findById(token.getUserId()).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
        user.setPassword(PasswordUtil.hash(newPassword));
        users.save(user);
        token.setUsed(true);
        resets.save(token);
        return Map.of("message", "Đặt lại mật khẩu thành công");
    }

    @GetMapping("/me")
    public Map<String, Object> me(HttpServletRequest request) { return auth.safeUser(auth.current(request)); }

    @PutMapping("/me")
    public Map<String, Object> updateProfile(HttpServletRequest request, @RequestBody User data) {
        User user = auth.current(request);
        user.setFullName(data.getFullName());
        user.setPhone(data.getPhone());
        user.setAvatarUrl(data.getAvatarUrl());
        user.setBio(data.getBio());
        user.setDob(data.getDob());
        user.setGender(data.getGender());
        user.setSchoolName(data.getSchoolName());
        user.setHomeLat(data.getHomeLat());
        user.setHomeLng(data.getHomeLng());
        user.setMatchingRadiusKm(data.getMatchingRadiusKm());
        user.setFacebookUrl(data.getFacebookUrl());
        user.setZaloUrl(data.getZaloUrl());
        user.setOtherSocialUrl(data.getOtherSocialUrl());
        users.save(user);
        return auth.safeUser(user);
    }

    @PostMapping("/change-password")
    public Map<String, Object> changePassword(HttpServletRequest request, @RequestBody Map<String, String> body) {
        User user = auth.current(request);
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        if (oldPassword == null || newPassword == null) throw new IllegalArgumentException("Thiếu thông tin mật khẩu");
        if (!PasswordUtil.verify(oldPassword, user.getPassword())) throw new IllegalArgumentException("Mật khẩu cũ không chính xác");
        user.setPassword(PasswordUtil.hash(newPassword));
        users.save(user);
        return Map.of("message", "Đổi mật khẩu thành công");
    }

    @PostMapping("/logout")
    public Map<String, Object> logout() { return Map.of("message", "Đăng xuất thành công. Client hãy xóa token."); }
}
