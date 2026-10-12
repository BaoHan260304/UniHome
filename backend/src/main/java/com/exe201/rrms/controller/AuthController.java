package com.exe201.rrms.controller;

import com.exe201.rrms.entity.User;
import com.exe201.rrms.exception.ValidationException;
import com.exe201.rrms.repository.AuthSessionRepository;
import com.exe201.rrms.repository.UserRepository;
import com.exe201.rrms.service.AuthService;
import com.exe201.rrms.service.VerificationService;
import com.exe201.rrms.util.PasswordUtil;
import com.exe201.rrms.util.ValidationUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping({"/api/auth", "/auth"})
public class AuthController {
    public record SocialTicket(String provider, String sub, String email, String fullName, String avatarUrl, LocalDateTime expiresAt) {}
    private static final Map<String, SocialTicket> socialTicketStore = new ConcurrentHashMap<>();

    private final AuthService auth;
    private final UserRepository users;
    private final AuthSessionRepository sessions;
    private final VerificationService verification;
    private final ObjectMapper mapper;

    @Value("${unihome.google.client-id:}")
    private String googleClientId;

    @Value("${unihome.facebook.app-id:}")
    private String facebookAppId;

    @Value("${unihome.facebook.app-secret:}")
    private String facebookAppSecret;

    @Value("${unihome.upload.dir:uploads}")
    private String uploadDir;

    public AuthController(AuthService auth, UserRepository users, AuthSessionRepository sessions, VerificationService verification, ObjectMapper mapper) {
        this.auth = auth;
        this.users = users;
        this.sessions = sessions;
        this.verification = verification;
        this.mapper = mapper;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, Object> body) {
        User u = new User();
        u.setFullName(Objects.toString(body.get("fullName"), ""));
        u.setEmail(Objects.toString(body.get("email"), ""));
        u.setPhone(Objects.toString(body.get("phone"), ""));
        u.setPassword(Objects.toString(body.get("password"), ""));
        u.setRole("USER");

        String confirmPassword = Objects.toString(body.get("confirmPassword"), "");
        Boolean agreeTerms = body.get("agreeTerms") != null && Boolean.parseBoolean(body.get("agreeTerms").toString());

        User saved = auth.register(u, confirmPassword, agreeTerms);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("message", "Đăng ký thành công. Vui lòng hoàn tất xác minh Email và Số điện thoại.");
        resp.put("userId", saved.getId());
        resp.put("email", saved.getEmail());
        resp.put("phone", saved.getPhone());
        resp.put("emailVerified", Boolean.TRUE.equals(saved.getEmailVerified()));
        resp.put("phoneVerified", Boolean.TRUE.equals(saved.getPhoneVerified()));
        resp.put("status", saved.getStatus());
        return resp;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String id = body.get("identifier");
        if (id == null || id.isBlank()) id = body.get("email");
        if (id == null || id.isBlank()) id = body.get("phone");
        return auth.login(id, body.get("password"));
    }

    @PostMapping("/send-otp")
    public Map<String, Object> sendOtp(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        User user = null;
        if (body.get("userId") != null) {
            Long userId = Long.valueOf(body.get("userId").toString());
            user = users.findById(userId).orElse(null);
        }
        if (user == null) {
            user = auth.optional(request);
        }
        if (user == null && body.get("email") != null) {
            user = users.findByEmail(body.get("email").toString().trim().toLowerCase()).orElse(null);
        }
        if (user == null) {
            throw new ValidationException("user", "Không tìm thấy người dùng để gửi OTP");
        }

        String channel = Objects.toString(body.get("channel"), "EMAIL").toUpperCase();
        String purpose = Objects.toString(body.get("purpose"), "REGISTER").toUpperCase();

        verification.sendOtp(user, channel, purpose);
        return Map.of("message", "Đã gửi mã xác nhận qua " + ("PHONE".equals(channel) ? "tin nhắn SMS" : "Email") + ".");
    }

    @PostMapping("/verify-otp")
    public Map<String, Object> verifyOtp(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        User user = null;
        if (body.get("userId") != null) {
            Long userId = Long.valueOf(body.get("userId").toString());
            user = users.findById(userId).orElse(null);
        }
        if (user == null) {
            user = auth.optional(request);
        }
        if (user == null && body.get("email") != null) {
            user = users.findByEmail(body.get("email").toString().trim().toLowerCase()).orElse(null);
        }
        if (user == null) {
            throw new ValidationException("user", "Không tìm thấy người dùng");
        }

        String channel = Objects.toString(body.get("channel"), "EMAIL").toUpperCase();
        String purpose = Objects.toString(body.get("purpose"), "REGISTER").toUpperCase();
        String code = Objects.toString(body.get("code"), "").trim();

        verification.verifyOtp(user, channel, purpose, code);

        User updated = users.findById(user.getId()).orElseThrow();
        boolean isComplete = "ACTIVE".equals(updated.getStatus());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("message", "Xác minh " + ("PHONE".equals(channel) ? "số điện thoại" : "email") + " thành công.");
        resp.put("isComplete", isComplete);
        resp.put("verification", verification.getVerificationStatus(updated));

        if (isComplete) {
            resp.put("auth", auth.issue(updated));
        }
        return resp;
    }

    @PostMapping("/continue-verification")
    public Map<String, Object> continueVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            throw new ValidationException("email", "Vui lòng cung cấp email");
        }
        User u = users.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ValidationException("email", "Không tìm thấy tài khoản"));
        return verification.getVerificationStatus(u);
    }

    @PostMapping("/google")
    public Map<String, Object> google(@RequestBody Map<String, String> body) throws Exception {
        String idToken = body.get("idToken");
        if (idToken == null || idToken.isBlank()) throw new ValidationException("idToken", "Thiếu Google ID token");

        String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + URLEncoder.encode(idToken, StandardCharsets.UTF_8);
        HttpRequest request = HttpRequest.newBuilder(URI.create(tokenInfoUrl)).GET().build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) throw new SecurityException("Google token không hợp lệ hoặc đã hết hạn");

        JsonNode json = mapper.readTree(response.body());
        String audience = json.path("aud").asString("");
        if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.equals(audience)) {
            throw new SecurityException("Sai Google Client ID");
        }

        boolean emailVerified = json.path("email_verified").asBoolean(false) || "true".equalsIgnoreCase(json.path("email_verified").asString());
        if (!emailVerified) throw new SecurityException("Tài khoản Google chưa được xác minh email");

        String googleSub = json.path("sub").asString("");
        String email = json.path("email").asString("").trim().toLowerCase();
        String fullName = json.path("name").asString("");
        String avatar = json.path("picture").asString("");

        if (email.isBlank()) throw new SecurityException("Google không trả về email hợp lệ");

        User user = users.findByGoogleSub(googleSub).orElseGet(() -> users.findByEmail(email).orElse(null));

        if (user == null) {
            // New user via Google: issue a short-lived secure ticket for social completion
            String ticket = UUID.randomUUID().toString();
            socialTicketStore.put(ticket, new SocialTicket("GOOGLE", googleSub, email, fullName, avatar, LocalDateTime.now().plusMinutes(10)));

            Map<String, Object> reqComp = new LinkedHashMap<>();
            reqComp.put("status", "REQUIRE_COMPLETION");
            reqComp.put("ticket", ticket);
            reqComp.put("authProvider", "GOOGLE");
            reqComp.put("googleSub", googleSub);
            reqComp.put("email", email);
            reqComp.put("fullName", fullName);
            reqComp.put("avatarUrl", avatar);
            return reqComp;
        }

        user.setGoogleSub(googleSub);
        user.setEmailVerified(true);
        if (user.getEmailVerifiedAt() == null) user.setEmailVerifiedAt(LocalDateTime.now());
        if (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) user.setAvatarUrl(avatar);
        if (user.getFullName() == null || user.getFullName().isBlank()) user.setFullName(fullName);
        user.setLastLoginAt(LocalDateTime.now());
        users.save(user);

        return auth.issue(user);
    }

    @PostMapping("/facebook")
    public Map<String, Object> facebook(@RequestBody Map<String, String> body) throws Exception {
        String accessToken = body.get("accessToken");
        if (accessToken == null || accessToken.isBlank()) {
            throw new ValidationException("accessToken", "Thiếu Facebook access token");
        }

        String graphUrl = "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token="
                + URLEncoder.encode(accessToken, StandardCharsets.UTF_8);
        HttpRequest request = HttpRequest.newBuilder(URI.create(graphUrl)).GET().build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new SecurityException("Facebook access token không hợp lệ hoặc đã hết hạn");
        }

        JsonNode json = mapper.readTree(response.body());
        String fbSub = json.path("id").asString("");
        String fullName = json.path("name").asString("");
        String email = json.path("email").asString("").trim().toLowerCase();
        String avatar = json.path("picture").path("data").path("url").asString("");

        if (fbSub.isBlank()) throw new SecurityException("Không xác định được danh tính Facebook");

        User user = users.findByFacebookSub(fbSub).orElse(null);
        if (user == null && !email.isBlank()) {
            user = users.findByEmail(email).orElse(null);
        }

        if (user == null) {
            String ticket = UUID.randomUUID().toString();
            socialTicketStore.put(ticket, new SocialTicket("FACEBOOK", fbSub, email, fullName, avatar, LocalDateTime.now().plusMinutes(10)));

            Map<String, Object> reqComp = new LinkedHashMap<>();
            reqComp.put("status", "REQUIRE_COMPLETION");
            reqComp.put("ticket", ticket);
            reqComp.put("authProvider", "FACEBOOK");
            reqComp.put("facebookSub", fbSub);
            reqComp.put("email", email);
            reqComp.put("fullName", fullName);
            reqComp.put("avatarUrl", avatar);
            reqComp.put("requireEmail", email.isBlank());
            return reqComp;
        }

        user.setFacebookSub(fbSub);
        if (!email.isBlank()) {
            user.setEmail(email);
            user.setEmailVerified(true);
        }
        if (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) user.setAvatarUrl(avatar);
        user.setLastLoginAt(LocalDateTime.now());
        users.save(user);

        return auth.issue(user);
    }

    @PostMapping("/social-complete")
    public Map<String, Object> socialComplete(@RequestBody Map<String, Object> body) {
        String ticket = Objects.toString(body.get("ticket"), "").trim();
        if (ticket.isBlank()) {
            throw new SecurityException("Phiên hoàn tất liên kết mạng xã hội không hợp lệ hoặc thiếu mã xác thực (ticket missing)");
        }

        SocialTicket st = socialTicketStore.remove(ticket);
        if (st == null || st.expiresAt().isBefore(LocalDateTime.now())) {
            throw new SecurityException("Phiên hoàn tất đã hết hạn hoặc đã được sử dụng. Vui lòng đăng nhập lại.");
        }

        String authProvider = st.provider();
        String sub = st.sub();
        String email = st.email();
        // If OAuth provider didn't provide email (e.g. some FB accounts), allow user to supply valid email
        if (email.isBlank()) {
            email = Objects.toString(body.get("email"), "").trim().toLowerCase();
        }

        String fullName = Objects.toString(body.get("fullName"), st.fullName()).trim();
        String avatarUrl = st.avatarUrl();
        String phone = Objects.toString(body.get("phone"), "").trim();

        Map<String, String> errors = new LinkedHashMap<>();
        if (email.isBlank() || !ValidationUtil.isValidEmail(email)) {
            errors.put("email", "Email không hợp lệ");
        }
        if (!phone.isBlank() && !ValidationUtil.isValidVnPhone(phone)) {
            errors.put("phone", "Số điện thoại Việt Nam không hợp lệ (10 số, ví dụ 0912345678)");
        }
        if (!errors.isEmpty()) {
            // Re-store ticket so user can fix their form input
            socialTicketStore.put(ticket, st);
            throw new ValidationException("Dữ liệu chưa hợp lệ", errors);
        }

        String normPhone = phone.isBlank() ? null : ValidationUtil.normalizePhone(phone);
        if (normPhone != null && users.findByPhone(normPhone).isPresent()) {
            socialTicketStore.put(ticket, st);
            throw new ValidationException("phone", "Số điện thoại đã được liên kết với tài khoản khác");
        }

        User user = users.findByEmail(email).orElseGet(User::new);
        user.setEmail(email);
        user.setFullName(fullName.isBlank() ? (st.fullName().isBlank() ? "Người dùng UniHome" : st.fullName()) : fullName);
        if (avatarUrl != null && !avatarUrl.isBlank()) {
            user.setAvatarUrl(avatarUrl);
        }
        if (user.getRole() == null || user.getRole().isBlank() || Set.of("TENANT", "LANDLORD", "SERVICE_PROVIDER").contains(user.getRole())) {
            user.setRole("USER");
        }
        user.setTermsVersion("1.0");
        user.setTermsAcceptedAt(LocalDateTime.now());
        user.setPrivacyVersion("1.0");
        user.setPrivacyAcceptedAt(LocalDateTime.now());
        if (normPhone != null) {
            user.setPhone(normPhone);
            user.setPhoneVerified(true);
            user.setPhoneVerifiedAt(LocalDateTime.now());
        }
        user.setAuthProvider(authProvider);
        if ("GOOGLE".equals(authProvider)) {
            user.setGoogleSub(sub);
        } else if ("FACEBOOK".equals(authProvider)) {
            user.setFacebookSub(sub);
        }
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setStatus("ACTIVE");
        user.setPassword(PasswordUtil.hash(UUID.randomUUID().toString()));
        user.setCreatedAt(LocalDateTime.now());
        User saved = users.save(user);

        return auth.issue(saved);
    }

    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        if (identifier == null || identifier.isBlank()) identifier = body.get("email");
        if (identifier == null || identifier.isBlank()) identifier = body.get("phone");
        if (identifier == null || identifier.isBlank()) {
            throw new ValidationException("identifier", "Vui lòng nhập Email hoặc Số điện thoại");
        }
        String idStr = identifier.trim().toLowerCase();
        User user = users.findByEmail(idStr)
                .or(() -> users.findByPhone(ValidationUtil.normalizePhone(idStr)))
                .orElseThrow(() -> new ValidationException("identifier", "Không tìm thấy tài khoản với thông tin này"));

        String channel = body.getOrDefault("channel", (user.getEmail() != null && !user.getEmail().isBlank()) ? "EMAIL" : "PHONE").toUpperCase();
        verification.sendOtp(user, channel, "RESET_PASSWORD");
        return Map.of(
                "message", "Mã xác thực OTP đã được gửi qua " + ("PHONE".equals(channel) ? "tin nhắn SMS" : "Email") + ".",
                "userId", user.getId(),
                "channel", channel
        );
    }

    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        if (identifier == null || identifier.isBlank()) identifier = body.get("email");
        if (identifier == null || identifier.isBlank()) identifier = body.get("phone");
        String code = body.get("code");
        String newPassword = body.get("newPassword");
        String confirmPassword = body.get("confirmPassword");
        String channel = body.getOrDefault("channel", "EMAIL").toUpperCase();

        Map<String, String> errors = new LinkedHashMap<>();
        if (identifier == null || identifier.isBlank()) errors.put("identifier", "Thiếu Email hoặc Số điện thoại");
        if (code == null || code.isBlank()) errors.put("code", "Thiếu mã xác thực OTP");
        if (newPassword == null || newPassword.length() < 8) errors.put("newPassword", "Mật khẩu mới tối thiểu 8 ký tự");
        else if (!ValidationUtil.isStrongPassword(newPassword)) errors.put("newPassword", "Mật khẩu phải gồm ít nhất 1 chữ cái và 1 số");
        if (confirmPassword == null || !confirmPassword.equals(newPassword)) errors.put("confirmPassword", "Mật khẩu xác nhận không khớp");

        if (!errors.isEmpty()) {
            throw new ValidationException("Dữ liệu chưa hợp lệ", errors);
        }

        String idStr = identifier.trim().toLowerCase();
        User user = users.findByEmail(idStr)
                .or(() -> users.findByPhone(ValidationUtil.normalizePhone(idStr)))
                .orElseThrow(() -> new ValidationException("identifier", "Không tìm thấy người dùng"));

        verification.verifyOtp(user, channel, "RESET_PASSWORD", code);

        user.setPassword(PasswordUtil.hash(newPassword));
        users.save(user);

        // Revoke old sessions for security
        try {
            sessions.deleteByUserId(user.getId());
        } catch (Exception ignored) {}

        return Map.of("message", "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.");
    }

    @PostMapping("/avatar")
    public Map<String, Object> uploadAvatar(@RequestParam("file") MultipartFile file, HttpServletRequest request) throws Exception {
        User user = auth.current(request);
        if (file == null || file.isEmpty()) {
            throw new ValidationException("file", "Vui lòng chọn file ảnh");
        }

        String contentType = file.getContentType();
        if (contentType == null || !Set.of("image/jpeg", "image/png", "image/webp", "image/gif").contains(contentType.toLowerCase())) {
            throw new ValidationException("file", "Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPEG, PNG, WEBP, GIF");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ValidationException("file", "Kích thước ảnh tối đa 5MB");
        }

        Path uploadPath = Paths.get(uploadDir, "avatars");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String ext = "jpg";
        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
        }

        String uniqueFilename = "avatar_" + user.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + "." + ext;
        Path targetPath = uploadPath.resolve(uniqueFilename);

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
        }

        String avatarUrl = "/uploads/avatars/" + uniqueFilename;
        user.setAvatarUrl(avatarUrl);
        users.save(user);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("message", "Cập nhật ảnh đại diện thành công");
        resp.put("avatarUrl", avatarUrl);
        resp.put("user", auth.safeUser(user));
        return resp;
    }

    @GetMapping("/me")
    public Map<String, Object> me(HttpServletRequest request) {
        return auth.safeUser(auth.current(request));
    }

    @PutMapping("/me")
    public Map<String, Object> updateProfile(HttpServletRequest request, @RequestBody User data) {
        User user = auth.current(request);
        Map<String, String> errors = new LinkedHashMap<>();

        if (data.getFullName() != null) {
            if (data.getFullName().trim().isBlank()) {
                errors.put("fullName", "Họ và tên không được để trống");
            } else {
                user.setFullName(data.getFullName().trim());
            }
        }

        if (data.getPhone() != null && !data.getPhone().equals(user.getPhone())) {
            if (!ValidationUtil.isValidVnPhone(data.getPhone())) {
                errors.put("phone", "Số điện thoại không hợp lệ");
            } else {
                String normPhone = ValidationUtil.normalizePhone(data.getPhone());
                user.setPhone(normPhone);
                user.setPhoneVerified(false);
                user.setPhoneVerifiedAt(null);
            }
        }

        if (data.getDob() != null && !data.getDob().isBlank()) {
            try {
                LocalDate dob = LocalDate.parse(data.getDob());
                if (dob.isAfter(LocalDate.now())) {
                    errors.put("dob", "Ngày sinh không được là ngày trong tương lai");
                } else {
                    user.setDob(data.getDob());
                }
            } catch (Exception e) {
                user.setDob(data.getDob());
            }
        }

        if (data.getFacebookUrl() != null && !ValidationUtil.isValidSafeUrl(data.getFacebookUrl())) {
            errors.put("facebookUrl", "Link Facebook không hợp lệ");
        } else {
            user.setFacebookUrl(data.getFacebookUrl());
        }

        if (data.getZaloUrl() != null && !ValidationUtil.isValidSafeUrl(data.getZaloUrl())) {
            errors.put("zaloUrl", "Link Zalo không hợp lệ");
        } else {
            user.setZaloUrl(data.getZaloUrl());
        }

        if (data.getOtherSocialUrl() != null && !ValidationUtil.isValidSafeUrl(data.getOtherSocialUrl())) {
            errors.put("otherSocialUrl", "Link mạng xã hội không hợp lệ");
        } else {
            user.setOtherSocialUrl(data.getOtherSocialUrl());
        }

        if (!errors.isEmpty()) {
            throw new ValidationException("Thông tin cập nhật chưa hợp lệ", errors);
        }

        user.setBio(data.getBio());
        user.setGender(data.getGender());
        user.setSchoolName(data.getSchoolName());
        user.setHomeLat(data.getHomeLat());
        user.setHomeLng(data.getHomeLng());
        if (data.getMatchingRadiusKm() != null) {
            user.setMatchingRadiusKm(Math.max(1, Math.min(10, data.getMatchingRadiusKm())));
        }

        users.save(user);
        return auth.safeUser(user);
    }

    @PostMapping("/change-password")
    public Map<String, Object> changePassword(HttpServletRequest request, @RequestBody Map<String, String> body) {
        User user = auth.current(request);
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        String confirm = body.get("confirm");

        if (oldPassword == null || newPassword == null) throw new ValidationException("oldPassword", "Thiếu thông tin mật khẩu");
        if (!PasswordUtil.verify(oldPassword, user.getPassword())) throw new ValidationException("oldPassword", "Mật khẩu cũ không chính xác");
        if (newPassword.length() < 8) throw new ValidationException("newPassword", "Mật khẩu mới tối thiểu 8 ký tự");
        if (!ValidationUtil.isStrongPassword(newPassword)) throw new ValidationException("newPassword", "Mật khẩu mới phải có ít nhất 1 chữ cái và 1 số");
        if (confirm != null && !confirm.equals(newPassword)) throw new ValidationException("confirm", "Mật khẩu xác nhận không khớp");

        user.setPassword(PasswordUtil.hash(newPassword));
        users.save(user);
        return Map.of("message", "Đổi mật khẩu thành công");
    }

    @PostMapping("/logout")
    public Map<String, Object> logout(HttpServletRequest request) {
        auth.logout(request);
        return Map.of("message", "Đăng xuất thành công");
    }

    @PostMapping("/logout-all")
    public Map<String, Object> logoutAll(HttpServletRequest request) {
        auth.logoutAll(request);
        return Map.of("message", "Đã đăng xuất khỏi tất cả thiết bị");
    }
}
