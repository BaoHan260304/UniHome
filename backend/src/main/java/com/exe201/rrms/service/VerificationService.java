package com.exe201.rrms.service;

import com.exe201.rrms.entity.User;
import com.exe201.rrms.entity.VerificationCode;
import com.exe201.rrms.exception.ValidationException;
import com.exe201.rrms.repository.UserRepository;
import com.exe201.rrms.repository.VerificationCodeRepository;
import com.exe201.rrms.util.PasswordUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class VerificationService {
    private static final Logger log = LoggerFactory.getLogger(VerificationService.class);
    private final VerificationCodeRepository codes;
    private final UserRepository users;
    private final SecureRandom random = new SecureRandom();

    public VerificationService(VerificationCodeRepository codes, UserRepository users) {
        this.codes = codes;
        this.users = users;
    }

    public String generateOtp() {
        int num = random.nextInt(900000) + 100000;
        return String.valueOf(num);
    }

    @Transactional
    public void sendOtp(User user, String channel, String purpose) {
        channel = channel.toUpperCase();
        purpose = purpose.toUpperCase();

        // Check rate limiting: max 1 request per 60 seconds
        Optional<VerificationCode> lastCode = codes.findTopByUserIdAndChannelAndPurposeAndUsedAtIsNullOrderByCreatedAtDesc(
                user.getId(), channel, purpose);
        if (lastCode.isPresent()) {
            LocalDateTime created = lastCode.get().getCreatedAt();
            if (created != null && created.isAfter(LocalDateTime.now().minusSeconds(60))) {
                long waitSec = 60 - java.time.Duration.between(created, LocalDateTime.now()).toSeconds();
                throw new ValidationException("channel", "Vui lòng đợi " + Math.max(1, waitSec) + " giây trước khi gửi lại mã OTP.");
            }
        }

        String otp = generateOtp();
        String hash = PasswordUtil.hash(otp);

        VerificationCode vc = new VerificationCode();
        vc.setUserId(user.getId());
        vc.setChannel(channel);
        vc.setPurpose(purpose);
        vc.setCodeHash(hash);
        vc.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        vc.setAttempts(0);
        codes.save(vc);

        // Secure log in backend console for developer / local testing
        log.info("[UniHome OTP] Channel: {} | Purpose: {} | User ID: {} ({}) | Code: {}", 
                channel, purpose, user.getId(), user.getEmail(), otp);
        System.out.println("=================================================");
        System.out.println("[UniHome OTP] Channel: " + channel + " | Purpose: " + purpose);
        System.out.println("User: " + user.getEmail() + " | Phone: " + user.getPhone());
        System.out.println("OTP CODE: " + otp + " (Expires in 5 minutes)");
        System.out.println("=================================================");
    }

    @Transactional
    public boolean verifyOtp(User user, String channel, String purpose, String rawCode) {
        if (rawCode == null || rawCode.trim().length() != 6) {
            throw new ValidationException("code", "Mã OTP phải gồm 6 chữ số");
        }

        channel = channel.toUpperCase();
        purpose = purpose.toUpperCase();

        VerificationCode vc = codes.findTopByUserIdAndChannelAndPurposeAndUsedAtIsNullOrderByCreatedAtDesc(
                user.getId(), channel, purpose)
                .orElseThrow(() -> new ValidationException("code", "Không tìm thấy mã OTP hoặc mã đã hết hạn. Vui lòng yêu cầu mã mới."));

        if (vc.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ValidationException("code", "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        if (vc.getAttempts() >= 5) {
            throw new ValidationException("code", "Mã OTP đã bị khóa do nhập sai quá 5 lần. Vui lòng yêu cầu mã mới.");
        }

        if (!PasswordUtil.verify(rawCode.trim(), vc.getCodeHash())) {
            vc.setAttempts(vc.getAttempts() + 1);
            codes.save(vc);
            int remain = 5 - vc.getAttempts();
            throw new ValidationException("code", "Mã OTP không chính xác. Còn lại " + remain + " lần thử.");
        }

        // Successfully verified
        vc.setUsedAt(LocalDateTime.now());
        codes.save(vc);

        if ("EMAIL".equals(channel)) {
            user.setEmailVerified(true);
            user.setEmailVerifiedAt(LocalDateTime.now());
        } else if ("PHONE".equals(channel)) {
            user.setPhoneVerified(true);
            user.setPhoneVerifiedAt(LocalDateTime.now());
        }

        if (Boolean.TRUE.equals(user.getEmailVerified()) && Boolean.TRUE.equals(user.getPhoneVerified())) {
            user.setStatus("ACTIVE");
        }

        users.save(user);
        return true;
    }

    public Map<String, Object> getVerificationStatus(User user) {
        return Map.of(
                "userId", user.getId(),
                "email", user.getEmail(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "status", user.getStatus(),
                "emailVerified", Boolean.TRUE.equals(user.getEmailVerified()),
                "phoneVerified", Boolean.TRUE.equals(user.getPhoneVerified()),
                "isComplete", "ACTIVE".equals(user.getStatus())
        );
    }
}
