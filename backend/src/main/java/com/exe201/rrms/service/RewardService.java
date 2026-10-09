package com.exe201.rrms.service;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.exception.ValidationException;
import com.exe201.rrms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class RewardService {

    private final RewardAccountRepository accountRepo;
    private final RewardTransactionRepository txRepo;
    private final DailyCheckinRepository checkinRepo;
    private final RewardTaskRepository taskRepo;
    private final UserRewardTaskRepository userTaskRepo;
    private final VoucherRepository voucherRepo;
    private final VoucherCodePoolRepository codePoolRepo;
    private final VoucherRedemptionRepository redemptionRepo;
    private final PartnerRepository partnerRepo;
    private final UserRepository userRepo;
    private final MatchingProfileRepository matchingRepo;
    private final FavoriteRepository favRepo;
    private final ListingInterestRepository interestRepo;
    private final ConversationRepository convRepo;
    private final ReviewRepository reviewRepo;

    public RewardService(RewardAccountRepository accountRepo,
                         RewardTransactionRepository txRepo,
                         DailyCheckinRepository checkinRepo,
                         RewardTaskRepository taskRepo,
                         UserRewardTaskRepository userTaskRepo,
                         VoucherRepository voucherRepo,
                         VoucherCodePoolRepository codePoolRepo,
                         VoucherRedemptionRepository redemptionRepo,
                         PartnerRepository partnerRepo,
                         UserRepository userRepo,
                         MatchingProfileRepository matchingRepo,
                         FavoriteRepository favRepo,
                         ListingInterestRepository interestRepo,
                         ConversationRepository convRepo,
                         ReviewRepository reviewRepo) {
        this.accountRepo = accountRepo;
        this.txRepo = txRepo;
        this.checkinRepo = checkinRepo;
        this.taskRepo = taskRepo;
        this.userTaskRepo = userTaskRepo;
        this.voucherRepo = voucherRepo;
        this.codePoolRepo = codePoolRepo;
        this.redemptionRepo = redemptionRepo;
        this.partnerRepo = partnerRepo;
        this.userRepo = userRepo;
        this.matchingRepo = matchingRepo;
        this.favRepo = favRepo;
        this.interestRepo = interestRepo;
        this.convRepo = convRepo;
        this.reviewRepo = reviewRepo;
    }

    @Transactional
    public RewardAccount getOrCreateAccount(Long userId) {
        return accountRepo.findById(userId).orElseGet(() -> {
            RewardAccount acc = new RewardAccount();
            acc.setUserId(userId);
            acc.setBalance(0L);
            acc.setLifetimeEarned(0L);
            acc.setLifetimeSpent(0L);
            return accountRepo.save(acc);
        });
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAccountSummary(Long userId) {
        RewardAccount account = getOrCreateAccount(userId);
        LocalDate today = LocalDate.now();

        Optional<DailyCheckin> todayCheckin = checkinRepo.findByUserIdAndCheckinDate(userId, today);
        boolean canCheckinToday = todayCheckin.isEmpty();

        int currentStreak = 0;
        if (todayCheckin.isPresent()) {
            currentStreak = todayCheckin.get().getStreakDay();
        } else {
            Optional<DailyCheckin> yesterdayCheckin = checkinRepo.findByUserIdAndCheckinDate(userId, today.minusDays(1));
            if (yesterdayCheckin.isPresent()) {
                currentStreak = yesterdayCheckin.get().getStreakDay();
            }
        }

        List<RewardTransaction> recentTxs = txRepo.findTop20ByUserIdOrderByCreatedAtDesc(userId);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("userId", userId);
        res.put("balance", account.getBalance());
        res.put("lifetimeEarned", account.getLifetimeEarned());
        res.put("lifetimeSpent", account.getLifetimeSpent());
        res.put("canCheckinToday", canCheckinToday);
        res.put("currentStreak", currentStreak);
        res.put("streakDay", canCheckinToday ? (currentStreak % 7) + 1 : currentStreak);
        res.put("recentTransactions", recentTxs);

        // Streak rewards cycle: 20, 20, 20, 20, 20, 20, 50
        long[] streakRewards = {20, 20, 20, 20, 20, 20, 50};
        res.put("streakRewards", streakRewards);

        return res;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDailyStatus(Long userId) {
        RewardAccount account = getOrCreateAccount(userId);
        LocalDate today = LocalDate.now();
        Optional<DailyCheckin> todayCheckin = checkinRepo.findByUserIdAndCheckinDate(userId, today);
        boolean claimedToday = todayCheckin.isPresent();

        int currentStreak = 0;
        if (claimedToday) {
            currentStreak = todayCheckin.get().getStreakDay();
        } else {
            Optional<DailyCheckin> yesterdayCheckin = checkinRepo.findByUserIdAndCheckinDate(userId, today.minusDays(1));
            if (yesterdayCheckin.isPresent()) {
                currentStreak = yesterdayCheckin.get().getStreakDay();
            }
        }
        int cycleDay = claimedToday ? currentStreak : (currentStreak % 7) + 1;
        long[] streakRewards = {20, 20, 20, 20, 20, 20, 50};
        long todayReward = streakRewards[cycleDay - 1];

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("visitedToday", true);
        res.put("claimedToday", claimedToday);
        res.put("canClaim", !claimedToday);
        res.put("currentStreak", currentStreak);
        res.put("cycleDay", cycleDay);
        res.put("todayReward", todayReward);
        res.put("balance", account.getBalance());
        return res;
    }

    @Transactional
    public Map<String, Object> performDailyCheckin(Long userId) {
        RewardAccount account = getOrCreateAccount(userId);
        LocalDate today = LocalDate.now();

        if (checkinRepo.findByUserIdAndCheckinDate(userId, today).isPresent()) {
            throw new ValidationException("checkin", "Bạn đã điểm danh hôm nay rồi. Hãy quay lại vào ngày mai!");
        }

        Optional<DailyCheckin> yesterdayCheckin = checkinRepo.findByUserIdAndCheckinDate(userId, today.minusDays(1));
        int streakDay = 1;
        if (yesterdayCheckin.isPresent()) {
            int prevStreak = yesterdayCheckin.get().getStreakDay();
            streakDay = (prevStreak % 7) + 1;
        }

        long[] streakRewards = {20, 20, 20, 20, 20, 20, 50};
        long pointsAwarded = streakRewards[streakDay - 1];

        DailyCheckin checkin = new DailyCheckin();
        checkin.setUserId(userId);
        checkin.setCheckinDate(today);
        checkin.setStreakDay(streakDay);
        checkin.setPointsAwarded(pointsAwarded);
        checkinRepo.save(checkin);

        long newBalance = account.getBalance() + pointsAwarded;
        account.setBalance(newBalance);
        account.setLifetimeEarned(account.getLifetimeEarned() + pointsAwarded);
        accountRepo.save(account);

        RewardTransaction tx = new RewardTransaction();
        tx.setUserId(userId);
        tx.setType("EARN");
        tx.setSource("DAILY_CHECKIN");
        tx.setPoints(pointsAwarded);
        tx.setBalanceAfter(newBalance);
        tx.setDescription("Điểm danh ngày " + streakDay + "/7 liên tiếp");
        txRepo.save(tx);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("pointsAwarded", pointsAwarded);
        res.put("streakDay", streakDay);
        res.put("newBalance", newBalance);
        res.put("message", "Điểm danh thành công! Nhận được +" + pointsAwarded + " Điểm UniHome (Chuỗi " + streakDay + " ngày).");
        return res;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRewardTasks(Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        List<RewardTask> tasks = taskRepo.findByIsActiveTrue();
        List<UserRewardTask> claimedTasks = userTaskRepo.findByUserId(userId);
        Set<String> claimedCodes = new HashSet<>();
        for (UserRewardTask urt : claimedTasks) {
            claimedCodes.add(urt.getTaskCode());
        }

        List<Map<String, Object>> list = new ArrayList<>();
        for (RewardTask t : tasks) {
            boolean isClaimed = claimedCodes.contains(t.getTaskCode());
            boolean isCompleted = isClaimed || checkTaskEligibility(user, t.getTaskCode());

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("taskCode", t.getTaskCode());
            map.put("title", t.getTitle());
            map.put("description", t.getDescription());
            map.put("points", t.getPoints());
            map.put("actionUrl", t.getActionUrl());
            map.put("isCompleted", isCompleted);
            map.put("isClaimed", isClaimed);
            list.add(map);
        }
        return list;
    }

    private boolean checkTaskEligibility(User user, String taskCode) {
        if (user == null) return false;
        switch (taskCode) {
            case "ACCOUNT_CREATED":
                return true;
            case "EMAIL_VERIFIED":
                return Boolean.TRUE.equals(user.getEmailVerified());
            case "PHONE_VERIFIED":
                return Boolean.TRUE.equals(user.getPhoneVerified());
            case "PROFILE_COMPLETED":
                return (user.getDob() != null || user.getBio() != null) && user.getFullName() != null;
            case "AVATAR_UPLOADED":
                return user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank();
            case "MATCHING_PROFILE_COMPLETED":
                return matchingRepo.findByUserId(user.getId()).isPresent();
            case "FIRST_ROOM_FAVORITE":
                return favRepo.countByUserId(user.getId()) > 0;
            case "FIRST_ROOM_INTEREST":
                return interestRepo.countByUserId(user.getId()) > 0;
            case "FIRST_CHAT_STARTED":
                return convRepo.countByUser1IdOrUser2Id(user.getId(), user.getId()) > 0;
            case "FIRST_VALID_REVIEW":
                return reviewRepo.countByUserId(user.getId()) > 0;
            default:
                return false;
        }
    }

    @Transactional
    public Map<String, Object> claimRewardTask(Long userId, String taskCode) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ValidationException("user", "Người dùng không tồn tại"));
        RewardTask task = taskRepo.findById(taskCode).orElseThrow(() -> new ValidationException("task", "Nhiệm vụ không tồn tại"));

        if (!Boolean.TRUE.equals(task.getIsActive())) {
            throw new ValidationException("task", "Nhiệm vụ không còn hiệu lực");
        }

        if (userTaskRepo.existsByUserIdAndTaskCode(userId, taskCode)) {
            throw new ValidationException("task", "Bạn đã nhận thưởng nhiệm vụ này rồi");
        }

        if (!checkTaskEligibility(user, taskCode)) {
            throw new ValidationException("task", "Bạn chưa hoàn thành điều kiện của nhiệm vụ này");
        }

        RewardAccount account = getOrCreateAccount(userId);
        long newBalance = account.getBalance() + task.getPoints();
        account.setBalance(newBalance);
        account.setLifetimeEarned(account.getLifetimeEarned() + task.getPoints());
        accountRepo.save(account);

        UserRewardTask urt = new UserRewardTask();
        urt.setUserId(userId);
        urt.setTaskCode(taskCode);
        urt.setStatus("CLAIMED");
        userTaskRepo.save(urt);

        RewardTransaction tx = new RewardTransaction();
        tx.setUserId(userId);
        tx.setType("EARN");
        tx.setSource("TASK");
        tx.setPoints(task.getPoints());
        tx.setBalanceAfter(newBalance);
        tx.setReferenceType("TASK");
        tx.setReferenceId(taskCode);
        tx.setDescription("Nhận thưởng nhiệm vụ: " + task.getTitle());
        txRepo.save(tx);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("pointsAwarded", task.getPoints());
        res.put("newBalance", newBalance);
        res.put("message", "Nhận thưởng thành công +" + task.getPoints() + " Điểm UniHome!");
        return res;
    }

    @Transactional
    public Map<String, Object> redeemVoucher(Long userId, Long voucherId) {
        RewardAccount account = getOrCreateAccount(userId);
        Voucher voucher = voucherRepo.findById(voucherId).orElseThrow(() -> new ValidationException("voucher", "Voucher không tồn tại"));

        if (!"ACTIVE".equalsIgnoreCase(voucher.getStatus())) {
            throw new ValidationException("voucher", "Voucher hiện không khả dụng");
        }

        if (voucher.getRemainingStock() <= 0) {
            throw new ValidationException("voucher", "Voucher đã hết số lượng");
        }

        long userRedemptions = redemptionRepo.countByUserIdAndVoucherId(userId, voucherId);
        if (voucher.getLimitPerUser() != null && userRedemptions >= voucher.getLimitPerUser()) {
            throw new ValidationException("voucher", "Bạn đã đạt giới hạn nhận voucher này (" + voucher.getLimitPerUser() + " lần)");
        }

        if (account.getBalance() < voucher.getPointsCost()) {
            throw new ValidationException("balance", "Số dư Điểm UniHome không đủ. Cần " + voucher.getPointsCost() + " điểm (hiện có " + account.getBalance() + " điểm)");
        }

        // Deduct points
        long newBalance = account.getBalance() - voucher.getPointsCost();
        account.setBalance(newBalance);
        account.setLifetimeSpent(account.getLifetimeSpent() + voucher.getPointsCost());
        accountRepo.save(account);

        // Deduct stock
        voucher.setRemainingStock(voucher.getRemainingStock() - 1);
        voucherRepo.save(voucher);

        // Determine voucher code
        String assignedCode;
        if ("SHARED_CODE".equalsIgnoreCase(voucher.getCodeMode())) {
            assignedCode = voucher.getSharedCode() != null ? voucher.getSharedCode() : ("UNI-" + voucher.getId());
        } else if ("PARTNER_CODE_POOL".equalsIgnoreCase(voucher.getCodeMode())) {
            Optional<VoucherCodePool> poolItem = codePoolRepo.findFirstByVoucherIdAndStatus(voucherId, "AVAILABLE");
            if (poolItem.isPresent()) {
                VoucherCodePool p = poolItem.get();
                p.setStatus("ASSIGNED");
                p.setAssignedToUserId(userId);
                p.setAssignedAt(LocalDateTime.now());
                codePoolRepo.save(p);
                assignedCode = p.getCode();
            } else {
                assignedCode = "UNI-" + voucher.getId() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            }
        } else {
            assignedCode = "UNI-" + voucher.getId() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        Partner partner = partnerRepo.findById(voucher.getPartnerId()).orElse(null);
        String partnerName = partner != null ? partner.getName() : "Đối tác UniHome";

        String token = UUID.randomUUID().toString().replace("-", "");

        VoucherRedemption red = new VoucherRedemption();
        red.setUserId(userId);
        red.setVoucherId(voucherId);
        red.setVoucherCode(assignedCode);
        red.setRedemptionToken(token);
        red.setPointsSpent(voucher.getPointsCost());
        red.setDiscountType(voucher.getDiscountType());
        red.setDiscountValue(voucher.getDiscountValue());
        red.setMinOrder(voucher.getMinOrder());
        red.setPartnerName(partnerName);
        red.setVoucherTitle(voucher.getTitle());
        red.setExpiresAt(voucher.getEndAt() != null ? voucher.getEndAt() : LocalDateTime.now().plusDays(30));
        red.setStatus("AVAILABLE");
        red = redemptionRepo.save(red);

        RewardTransaction tx = new RewardTransaction();
        tx.setUserId(userId);
        tx.setType("SPEND");
        tx.setSource("VOUCHER_REDEEM");
        tx.setPoints(voucher.getPointsCost());
        tx.setBalanceAfter(newBalance);
        tx.setReferenceType("VOUCHER_REDEMPTION");
        tx.setReferenceId(red.getId().toString());
        tx.setDescription("Đổi voucher đối tác: " + voucher.getTitle() + " (" + partnerName + ")");
        txRepo.save(tx);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("redemption", red);
        result.put("newBalance", newBalance);
        result.put("message", "Đổi voucher thành công! Mã ưu đãi: " + assignedCode);
        return result;
    }

    @Transactional(readOnly = true)
    public List<VoucherRedemption> getMyVouchers(Long userId) {
        return redemptionRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Map<String, Object> verifyRedemptionToken(String token) {
        VoucherRedemption red = redemptionRepo.findByRedemptionToken(token)
                .orElseThrow(() -> new ValidationException("token", "Mã xác thực voucher không hợp lệ hoặc không tồn tại"));

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("token", token);
        res.put("voucherCode", red.getVoucherCode());
        res.put("voucherTitle", red.getVoucherTitle());
        res.put("partnerName", red.getPartnerName());
        res.put("discountType", red.getDiscountType());
        res.put("discountValue", red.getDiscountValue());
        res.put("minOrder", red.getMinOrder());
        res.put("status", red.getStatus());
        res.put("expiresAt", red.getExpiresAt());

        if ("USED".equalsIgnoreCase(red.getStatus())) {
            res.put("valid", false);
            res.put("message", "Voucher đã được sử dụng lúc " + red.getUsedAt());
            return res;
        }

        if (red.getExpiresAt() != null && red.getExpiresAt().isBefore(LocalDateTime.now())) {
            red.setStatus("EXPIRED");
            redemptionRepo.save(red);
            res.put("valid", false);
            res.put("message", "Voucher đã hết hạn");
            return res;
        }

        // Mark as used
        red.setStatus("USED");
        red.setUsedAt(LocalDateTime.now());
        redemptionRepo.save(red);

        res.put("valid", true);
        res.put("status", "USED");
        res.put("usedAt", red.getUsedAt());
        res.put("message", "Xác thực và sử dụng voucher thành công!");
        return res;
    }
}
