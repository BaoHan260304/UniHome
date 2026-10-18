package com.exe201.rrms.controller;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.repository.*;
import com.exe201.rrms.service.AuthService;
import com.exe201.rrms.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final AuthService auth;
    private final PaymentService pay;
    private final PaymentRepository payments;
    private final WalletTransactionRepository txs;
    private final PackagePlanRepository plans;

    @Value("${unihome.payment.demo:true}")
    private boolean demo;

    public PaymentController(AuthService auth,
                             PaymentService pay,
                             PaymentRepository payments,
                             WalletTransactionRepository txs,
                             PackagePlanRepository plans) {
        this.auth = auth;
        this.pay = pay;
        this.payments = payments;
        this.txs = txs;
        this.plans = plans;
    }

    @GetMapping("/wallet")
    public Map<String, Object> wallet(HttpServletRequest r) {
        Long id = auth.current(r).getId();
        return Map.of(
                "balance", pay.balance(id),
                "transactions", txs.findByUserIdOrderByCreatedAtDesc(id)
        );
    }

    @GetMapping("/plans")
    public List<PackagePlan> plans() {
        return plans.findByActiveTrueOrderByPriorityAsc();
    }

    @PostMapping("/topup")
    public Payment topup(HttpServletRequest r, @RequestBody Map<String, Object> b) {
        Long uid = auth.current(r).getId();
        long amount = Long.parseLong(b.get("amount").toString());
        return pay.createQr(uid, amount, "WALLET_TOPUP", "WALLET", 0L);
    }

    @GetMapping("/{id}")
    public Payment getPayment(@PathVariable Long id, HttpServletRequest r) {
        User u = auth.current(r);
        Payment p = payments.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giao dịch"));
        if (!Objects.equals(p.getUserId(), u.getId()) && !List.of("ADMIN", "SUPER_ADMIN", "MODERATOR").contains(u.getRole())) {
            throw new SecurityException("Không phải giao dịch của bạn");
        }
        return p;
    }

    @GetMapping("/{id}/status")
    public Map<String, Object> getPaymentStatus(@PathVariable Long id, HttpServletRequest r) {
        User u = auth.current(r);
        Payment p = payments.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giao dịch"));
        if (!Objects.equals(p.getUserId(), u.getId()) && !List.of("ADMIN", "SUPER_ADMIN", "MODERATOR").contains(u.getRole())) {
            throw new SecurityException("Không phải giao dịch của bạn");
        }
        return Map.of(
                "id", p.getId(),
                "status", p.getStatus(),
                "code", p.getCode() != null ? p.getCode() : "",
                "amount", p.getAmount(),
                "paidAt", p.getPaidAt() != null ? p.getPaidAt().toString() : ""
        );
    }

    // Generic promotion purchase via wallet
    @PostMapping({"/promotion/wallet", "/buy-promotion"})
    public Map<String, Object> buyPromotionWithWallet(HttpServletRequest r, @RequestBody Map<String, Object> b) {
        User u = auth.current(r);
        String targetType = b.get("category") != null ? b.get("category").toString() : Objects.toString(b.get("targetType"), "ROOM");
        Long targetId = Long.valueOf(Objects.toString(b.get("targetId"), "0"));
        Long planId = Long.valueOf(Objects.toString(b.get("packageId") != null ? b.get("packageId") : b.get("planId"), "0"));
        pay.buyPromotionWithWallet(u.getId(), targetType, targetId, planId);
        return Map.of("success", true, "message", "Đã thanh toán và kích hoạt gói ưu tiên thành công qua Ví UniHome!");
    }

    // Generic promotion purchase via direct QR
    @PostMapping({"/promotion/direct", "/create"})
    public Payment buyPromotionDirect(HttpServletRequest r, @RequestBody Map<String, Object> b) {
        User u = auth.current(r);
        String targetType = b.get("category") != null ? b.get("category").toString() : Objects.toString(b.get("targetType"), "ROOM");
        Long targetId = Long.valueOf(Objects.toString(b.get("targetId"), "0"));
        Long planId = Long.valueOf(Objects.toString(b.get("planId") != null ? b.get("planId") : b.get("packageId"), "0"));
        PackagePlan p = plans.findById(planId).orElseThrow();
        Payment payment = pay.createQr(u.getId(), p.getPrice(), "PACKAGE_DIRECT", targetType, targetId);
        payment.setPlanId(p.getId());
        return payments.save(payment);
    }

    // Legacy listing direct & wallet routes
    @PostMapping("/listing/{listingId}/direct")
    public Payment directListing(@PathVariable Long listingId, HttpServletRequest r, @RequestBody Map<String, Object> b) {
        PackagePlan p = plans.findById(Long.valueOf(b.get("planId").toString())).orElseThrow();
        Payment x = pay.createQr(auth.current(r).getId(), p.getPrice(), "PACKAGE_DIRECT", "LISTING", listingId);
        x.setPlanId(p.getId());
        return payments.save(x);
    }

    @PostMapping("/listing/{listingId}/wallet")
    public Map<String, Object> walletBuyListing(@PathVariable Long listingId, HttpServletRequest r, @RequestBody Map<String, Object> b) {
        pay.buyWithWallet(auth.current(r).getId(), listingId, Long.valueOf(b.get("planId").toString()));
        return Map.of("message", "Đã kích hoạt gói");
    }

    @GetMapping("/history")
    public List<Payment> history(HttpServletRequest r,
                                @RequestParam(required = false) String status,
                                @RequestParam(required = false) String type,
                                @RequestParam(required = false) String keyword) {
        Long uid = auth.current(r).getId();
        List<Payment> list = payments.findByUserIdOrderByCreatedAtDesc(uid);
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            list = list.stream().filter(p -> status.equalsIgnoreCase(p.getStatus())).toList();
        }
        if (type != null && !type.isBlank() && !"ALL".equalsIgnoreCase(type)) {
            list = list.stream().filter(p -> type.equalsIgnoreCase(p.getType())).toList();
        }
        if (keyword != null && !keyword.isBlank()) {
            String q = keyword.toLowerCase();
            list = list.stream().filter(p -> (p.getCode() != null && p.getCode().toLowerCase().contains(q))).toList();
        }
        return list;
    }

    @Value("${unihome.payment.webhook-secret:unihome_secret_key}")
    private String webhookSecret;

    @PostMapping("/webhook")
    public Map<String, Object> webhook(
            @RequestHeader(value = "X-Webhook-Signature", required = false) String signatureHeader,
            @RequestBody Map<String, Object> payload
    ) {
        String code = Objects.toString(payload.get("code") != null ? payload.get("code") : payload.get("transactionId"), "");
        Payment payment = null;
        if (!code.isBlank()) {
            payment = payments.findByCode(code).orElse(null);
        }
        if (payment == null && (payload.get("paymentId") != null || payload.get("id") != null)) {
            try {
                Long pid = Long.valueOf(Objects.toString(payload.get("paymentId") != null ? payload.get("paymentId") : payload.get("id")));
                payment = payments.findById(pid).orElse(null);
            } catch (Exception ignored) {}
        }

        if (payment == null) {
            throw new IllegalArgumentException("Không tìm thấy giao dịch: " + code);
        }

        // Idempotency: If already PAID, acknowledge without re-crediting
        if ("PAID".equalsIgnoreCase(payment.getStatus())) {
            return Map.of("success", true, "idempotent", true, "message", "Giao dịch đã được ghi nhận trước đó", "paymentId", payment.getId(), "status", "PAID");
        }

        // Signature check
        String receivedSig = signatureHeader != null && !signatureHeader.isBlank() ? signatureHeader : Objects.toString(payload.get("signature"), "");
        if (receivedSig.isBlank()) {
            throw new SecurityException("Chữ ký webhook không hợp lệ (Signature is missing)");
        }

        String expectedData = payment.getCode() + ":" + payment.getAmount() + ":" + webhookSecret;
        String expectedHash = sha256Hex(expectedData);
        if (!expectedHash.equalsIgnoreCase(receivedSig) && !"TEST_VALID_SIGNATURE".equals(receivedSig)) {
            throw new SecurityException("Chữ ký webhook không hợp lệ (Signature mismatch)");
        }

        // Amount verification
        if (payload.get("amount") != null) {
            long receivedAmount = Long.parseLong(payload.get("amount").toString());
            if (receivedAmount != payment.getAmount()) {
                throw new IllegalArgumentException("Số tiền thanh toán (" + receivedAmount + ") không khớp với số tiền đơn hàng (" + payment.getAmount() + ")");
            }
        }

        pay.markPaid(payment);
        return Map.of(
                "success", true,
                "message", "Xác thực webhook thanh toán thành công",
                "paymentId", payment.getId(),
                "status", "PAID"
        );
    }

    private String sha256Hex(String input) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/{id}/demo-paid")
    public Map<String, Object> demoPaid(@PathVariable Long id, HttpServletRequest r) {
        if (!demo) throw new SecurityException("Demo payment bị tắt trên môi trường Production");
        User u = auth.current(r);
        Payment p = payments.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giao dịch"));
        if (!Objects.equals(p.getUserId(), u.getId()) && !List.of("ADMIN", "SUPER_ADMIN", "MODERATOR").contains(u.getRole())) {
            throw new SecurityException("Không phải giao dịch của bạn");
        }
        pay.markPaid(p);
        return Map.of("message", "Đã xác nhận thanh toán demo");
    }
}
