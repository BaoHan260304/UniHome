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
    private final com.exe201.rrms.repository.RewardTaskRepository taskRepo;

    public RewardController(AuthService auth,
                            RewardService rewardService,
                            PartnerRepository partnerRepo,
                            VoucherRepository voucherRepo,
                            VoucherCodePoolRepository codePoolRepo,
                            com.exe201.rrms.repository.RewardTaskRepository taskRepo) {
        this.auth = auth;
        this.rewardService = rewardService;
        this.partnerRepo = partnerRepo;
        this.voucherRepo = voucherRepo;
        this.codePoolRepo = codePoolRepo;
        this.taskRepo = taskRepo;
    }

    @GetMapping("/account")
    public Map<String, Object> getAccount(HttpServletRequest r) {
        User u = auth.current(r);
        if (List.of("ADMIN", "SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN", "FINANCE_ADMIN").contains(u.getRole())) {
            throw new SecurityException("Tài khoản quản trị viên không tham gia chương trình tích điểm thưởng.");
        }
        return rewardService.getAccountSummary(u.getId());
    }

    @GetMapping("/daily-status")
    public Map<String, Object> dailyStatus(HttpServletRequest r) {
        User u = auth.optional(r);
        if (u == null || List.of("ADMIN", "SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN", "FINANCE_ADMIN").contains(u.getRole())) {
            return Map.of("visitedToday", false, "claimedToday", false, "canClaim", false, "currentStreak", 0, "balance", 0);
        }
        return rewardService.getDailyStatus(u.getId());
    }

    @PostMapping({"/checkin", "/check-in"})
    public Map<String, Object> checkin(HttpServletRequest r) {
        User u = auth.current(r);
        if (List.of("ADMIN", "SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN", "FINANCE_ADMIN").contains(u.getRole())) {
            throw new SecurityException("Tài khoản quản trị viên không tham gia chương trình tích điểm thưởng.");
        }
        return rewardService.performDailyCheckin(u.getId());
    }

    @GetMapping("/tasks")
    public List<Map<String, Object>> getTasks(HttpServletRequest r) {
        User u = auth.current(r);
        if (List.of("ADMIN", "SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN", "FINANCE_ADMIN").contains(u.getRole())) {
            throw new SecurityException("Tài khoản quản trị viên không tham gia nhiệm vụ tích điểm.");
        }
        return rewardService.getRewardTasks(u.getId());
    }

    @PostMapping("/claim-task")
    public Map<String, Object> claimTask(HttpServletRequest r, @RequestBody Map<String, String> body) {
        User u = auth.current(r);
        if (List.of("ADMIN", "SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN", "FINANCE_ADMIN").contains(u.getRole())) {
            throw new SecurityException("Tài khoản quản trị viên không tham gia nhiệm vụ tích điểm.");
        }
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

    // --- Admin Partner CRUD ---
    @GetMapping("/admin/partners")
    public List<Partner> listAllPartnersAdmin(HttpServletRequest r) {
        User u = auth.current(r);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        return partnerRepo.findAll();
    }

    @PostMapping("/admin/partners")
    public Partner createPartner(HttpServletRequest r, @RequestBody Partner p) {
        User u = auth.current(r);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        return partnerRepo.save(p);
    }

    @PutMapping("/admin/partners/{id}")
    public Partner updatePartner(HttpServletRequest r, @PathVariable Long id, @RequestBody Partner updated) {
        User u = auth.current(r);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        Partner p = partnerRepo.findById(id).orElseThrow(() -> new ValidationException("id", "Đối tác không tồn tại"));
        p.setName(updated.getName());
        p.setCategory(updated.getCategory());
        p.setLogoUrl(updated.getLogoUrl());
        p.setContactPhone(updated.getContactPhone());
        p.setWebsiteUrl(updated.getWebsiteUrl());
        p.setStatus(updated.getStatus());
        return partnerRepo.save(p);
    }

    @DeleteMapping("/admin/partners/{id}")
    public Map<String, Object> deletePartner(HttpServletRequest r, @PathVariable Long id) {
        User u = auth.current(r);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        partnerRepo.deleteById(id);
        return Map.of("success", true, "message", "Đã xóa đối tác #" + id);
    }

    // --- Admin Voucher CRUD ---
    @GetMapping("/admin/vouchers")
    public List<Voucher> listAllVouchersAdmin(HttpServletRequest r) {
        User u = auth.current(r);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        return voucherRepo.findAll();
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

    @DeleteMapping("/admin/vouchers/{id}")
    public Map<String, Object> deleteVoucher(HttpServletRequest r, @PathVariable Long id) {
        User u = auth.current(r);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        voucherRepo.deleteById(id);
        return Map.of("success", true, "message", "Đã xóa voucher #" + id);
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

    // --- Admin Reward Task CRUD ---
    @GetMapping("/admin/tasks")
    public List<RewardTask> listAllTasksAdmin(HttpServletRequest r) {
        User u = auth.current(r);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        return taskRepo.findAll();
    }

    @PostMapping("/admin/tasks")
    public RewardTask createTaskAdmin(HttpServletRequest r, @RequestBody RewardTask task) {
        User u = auth.current(r);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        if (task.getTaskCode() == null || task.getTaskCode().isBlank()) {
            throw new ValidationException("taskCode", "Mã nhiệm vụ không được để trống");
        }
        return taskRepo.save(task);
    }

    @PutMapping("/admin/tasks/{code}")
    public RewardTask updateTaskAdmin(HttpServletRequest r, @PathVariable String code, @RequestBody RewardTask updated) {
        User u = auth.current(r);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        RewardTask existing = taskRepo.findById(code).orElseThrow(() -> new ValidationException("code", "Nhiệm vụ không tồn tại"));
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setPoints(updated.getPoints());
        existing.setActionUrl(updated.getActionUrl());
        existing.setIsActive(updated.getIsActive());
        existing.setTargetCount(updated.getTargetCount());
        existing.setFrequency(updated.getFrequency());
        existing.setMinDurationSeconds(updated.getMinDurationSeconds());
        existing.setEventType(updated.getEventType());
        return taskRepo.save(existing);
    }

    @DeleteMapping("/admin/tasks/{code}")
    public Map<String, Object> deleteTaskAdmin(HttpServletRequest r, @PathVariable String code) {
        User u = auth.current(r);
        auth.requireRole(u, "ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN");
        taskRepo.deleteById(code);
        return Map.of("success", true, "message", "Đã xóa nhiệm vụ " + code);
    }
}
