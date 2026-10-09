package com.exe201.rrms.controller;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.exception.ValidationException;
import com.exe201.rrms.repository.PartnerRepository;
import com.exe201.rrms.repository.VoucherCodePoolRepository;
import com.exe201.rrms.repository.VoucherRepository;
import com.exe201.rrms.service.AuthService;
import com.exe201.rrms.service.RewardService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    private final AuthService auth;
    private final RewardService rewardService;
    private final PartnerRepository partnerRepo;
    private final VoucherRepository voucherRepo;
    private final VoucherCodePoolRepository codePoolRepo;

    public RewardController(AuthService auth,
                            RewardService rewardService,
                            PartnerRepository partnerRepo,
                            VoucherRepository voucherRepo,
                            VoucherCodePoolRepository codePoolRepo) {
        this.auth = auth;
        this.rewardService = rewardService;
        this.partnerRepo = partnerRepo;
        this.voucherRepo = voucherRepo;
        this.codePoolRepo = codePoolRepo;
    }

    @GetMapping("/account")
    public Map<String, Object> getAccount(HttpServletRequest r) {
        User u = auth.current(r);
        return rewardService.getAccountSummary(u.getId());
    }

    @GetMapping("/daily-status")
    public Map<String, Object> dailyStatus(HttpServletRequest r) {
        User u = auth.optional(r);
        if (u == null) {
            return Map.of("visitedToday", false, "claimedToday", false, "canClaim", false, "currentStreak", 0, "balance", 0);
        }
        return rewardService.getDailyStatus(u.getId());
    }

    @PostMapping("/checkin")
    public Map<String, Object> checkin(HttpServletRequest r) {
        User u = auth.current(r);
        return rewardService.performDailyCheckin(u.getId());
    }

    @GetMapping("/tasks")
    public List<Map<String, Object>> getTasks(HttpServletRequest r) {
        User u = auth.current(r);
        return rewardService.getRewardTasks(u.getId());
    }

    @PostMapping("/claim-task")
    public Map<String, Object> claimTask(HttpServletRequest r, @RequestBody Map<String, String> body) {
        User u = auth.current(r);
        String taskCode = body.get("taskCode");
        if (taskCode == null || taskCode.isBlank()) {
            throw new ValidationException("taskCode", "Mã nhiệm vụ không được để trống");
        }
        return rewardService.claimRewardTask(u.getId(), taskCode);
    }

    @GetMapping("/vouchers")
    public List<Map<String, Object>> listVouchers(@RequestParam(required = false) String category) {
        List<Voucher> vs = (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category))
                ? voucherRepo.findByCategoryAndStatus(category, "ACTIVE")
                : voucherRepo.findByStatus("ACTIVE");

        List<Map<String, Object>> res = new ArrayList<>();
        for (Voucher v : vs) {
            Partner p = partnerRepo.findById(v.getPartnerId()).orElse(null);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", v.getId());
            m.put("partnerId", v.getPartnerId());
            m.put("partnerName", p != null ? p.getName() : "Đối tác UniHome");
            m.put("partnerLogo", p != null ? p.getLogoUrl() : null);
            m.put("partnerCategory", p != null ? p.getCategory() : null);
            m.put("title", v.getTitle());
            m.put("category", v.getCategory());
            m.put("description", v.getDescription());
            m.put("imageUrl", v.getImageUrl());
            m.put("discountType", v.getDiscountType());
            m.put("discountValue", v.getDiscountValue());
            m.put("minOrder", v.getMinOrder());
            m.put("pointsCost", v.getPointsCost());
            m.put("totalStock", v.getTotalStock());
            m.put("remainingStock", v.getRemainingStock());
            m.put("limitPerUser", v.getLimitPerUser());
            m.put("startAt", v.getStartAt());
            m.put("endAt", v.getEndAt());
            m.put("terms", v.getTerms());
            m.put("usageInstructions", v.getUsageInstructions());
            m.put("codeMode", v.getCodeMode());
            m.put("status", v.getStatus());
            res.add(m);
        }
        return res;
    }

    @PostMapping("/redeem")
    public Map<String, Object> redeem(HttpServletRequest r, @RequestBody Map<String, Object> body) {
        User u = auth.current(r);
        Object rawId = body.get("voucherId");
        if (rawId == null) throw new ValidationException("voucherId", "Vui lòng chọn voucher");
        Long voucherId = Long.valueOf(rawId.toString());
        return rewardService.redeemVoucher(u.getId(), voucherId);
    }

    @GetMapping("/my-vouchers")
    public List<VoucherRedemption> getMyVouchers(HttpServletRequest r) {
        User u = auth.current(r);
        return rewardService.getMyVouchers(u.getId());
    }

    @PostMapping("/verify/{token}")
    public Map<String, Object> verifyToken(@PathVariable String token) {
        return rewardService.verifyRedemptionToken(token);
    }

    @GetMapping("/partners")
    public List<Partner> listPartners() {
        return partnerRepo.findByStatus("ACTIVE");
    }

    // Admin management endpoints
    @PostMapping("/admin/partners")
    public Partner createPartner(HttpServletRequest r, @RequestBody Partner p) {
        User u = auth.current(r);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        return partnerRepo.save(p);
    }

    @PostMapping("/admin/vouchers")
    public Voucher createVoucher(HttpServletRequest r, @RequestBody Voucher v) {
        User u = auth.current(r);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        if (v.getRemainingStock() == null) v.setRemainingStock(v.getTotalStock());
        return voucherRepo.save(v);
    }

    @PutMapping("/admin/vouchers/{id}")
    public Voucher updateVoucher(HttpServletRequest r, @PathVariable Long id, @RequestBody Voucher updated) {
        User u = auth.current(r);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        Voucher existing = voucherRepo.findById(id).orElseThrow(() -> new ValidationException("id", "Voucher không tồn tại"));
        existing.setTitle(updated.getTitle());
        existing.setCategory(updated.getCategory());
        existing.setDescription(updated.getDescription());
        existing.setImageUrl(updated.getImageUrl());
        existing.setDiscountType(updated.getDiscountType());
        existing.setDiscountValue(updated.getDiscountValue());
        existing.setMinOrder(updated.getMinOrder());
        existing.setPointsCost(updated.getPointsCost());
        existing.setTotalStock(updated.getTotalStock());
        existing.setRemainingStock(updated.getRemainingStock());
        existing.setLimitPerUser(updated.getLimitPerUser());
        existing.setStartAt(updated.getStartAt());
        existing.setEndAt(updated.getEndAt());
        existing.setTerms(updated.getTerms());
        existing.setUsageInstructions(updated.getUsageInstructions());
        existing.setCodeMode(updated.getCodeMode());
        existing.setSharedCode(updated.getSharedCode());
        existing.setStatus(updated.getStatus());
        return voucherRepo.save(existing);
    }

    @PostMapping("/admin/vouchers/{id}/codes")
    public Map<String, Object> importCodes(HttpServletRequest r, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        User u = auth.current(r);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        Object rawCodes = body.get("codes");
        int count = 0;
        if (rawCodes instanceof List<?> list) {
            for (Object obj : list) {
                if (obj != null) {
                    String codeStr = obj.toString().trim();
                    if (!codeStr.isBlank() && codePoolRepo.findByVoucherIdAndCode(id, codeStr).isEmpty()) {
                        VoucherCodePool p = new VoucherCodePool();
                        p.setVoucherId(id);
                        p.setCode(codeStr);
                        p.setStatus("AVAILABLE");
                        codePoolRepo.save(p);
                        count++;
                    }
                }
            }
        }
        return Map.of("importedCount", count, "voucherId", id);
    }
}
