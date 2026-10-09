package com.exe201.rrms.util;

import java.net.URI;
import java.util.regex.Pattern;

public final class ValidationUtil {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern VN_PHONE_PATTERN = Pattern.compile("^0(3|5|7|8|9)[0-9]{8}$");

    private ValidationUtil() {}

    public static String normalizePhone(String raw) {
        if (raw == null) return null;
        String digits = raw.replaceAll("[^0-9+]", "");
        if (digits.startsWith("+84")) {
            digits = "0" + digits.substring(3);
        } else if (digits.startsWith("84") && digits.length() == 11) {
            digits = "0" + digits.substring(2);
        }
        return digits;
    }

    public static boolean isValidVnPhone(String phone) {
        if (phone == null) return false;
        String normalized = normalizePhone(phone);
        return VN_PHONE_PATTERN.matcher(normalized).matches();
    }

    public static boolean isValidEmail(String email) {
        if (email == null) return false;
        return EMAIL_PATTERN.matcher(email.trim().toLowerCase()).matches();
    }

    public static boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) return false;
        boolean hasLetter = password.chars().anyMatch(Character::isLetter);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        return hasLetter && hasDigit;
    }

    public static boolean isValidSafeUrl(String url) {
        if (url == null || url.isBlank()) return true;
        String lower = url.trim().toLowerCase();
        if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
            return false;
        }
        if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
            return false;
        }
        try {
            URI uri = URI.create(url.trim());
            return uri.getHost() != null;
        } catch (Exception e) {
            return false;
        }
    }
}
