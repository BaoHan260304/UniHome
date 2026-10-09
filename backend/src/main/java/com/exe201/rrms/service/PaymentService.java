package com.exe201.rrms.service;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PaymentService {

    private final PaymentRepository payments;
    private final WalletTransactionRepository txs;
    private final PackagePlanRepository plans;
    private final ListingRepository listings;
    private final PostPromotionRepository promotions;
    private final SecondHandListingRepository secondHands;
    private final ServiceListingRepository services;
    private final NotificationService noti;

    @Value("${unihome.bank.bin:970436}")
    private String bankBin;

    @Value("${unihome.bank.account:0000000000}")
    private String account;

    @Value("${unihome.bank.name:UNIHOME}")
    private String accountName;

    public PaymentService(PaymentRepository payments,
                          WalletTransactionRepository txs,
                          PackagePlanRepository plans,
                          ListingRepository listings,
                          PostPromotionRepository promotions,
                          SecondHandListingRepository secondHands,
                          ServiceListingRepository services,
                          NotificationService noti) {
        this.payments = payments;
        this.txs = txs;
        this.plans = plans;
        this.listings = listings;
        this.promotions = promotions;
        this.secondHands = secondHands;
        this.services = services;
        this.noti = noti;
    }

    public long balance(Long userId) {
        return txs.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .findFirst()
                .map(WalletTransaction::getBalanceAfter)
                .orElse(0L);
    }

    public Payment createQr(Long userId, long amount, String type, String refType, Long refId) {
        Payment p = new Payment();
        p.setUserId(userId);
        p.setAmount(amount);
        p.setType(type);
        p.setReferenceType(refType);
        p.setReferenceId(refId);
        p.setCode("UH" + System.currentTimeMillis() + userId);
        String info = URLEncoder.encode(p.getCode(), StandardCharsets.UTF_8);
        p.setQrUrl("https://img.vietqr.io/image/" + bankBin + "-" + account + "-compact2.png?amount="
                + amount + "&addInfo=" + info + "&accountName=" + URLEncoder.encode(accountName, StandardCharsets.UTF_8));
        return payments.save(p);
    }

    @Transactional
    public void markPaid(Payment p) {
        if ("PAID".equals(p.getStatus())) return;
        p.setStatus("PAID");
        p.setPaidAt(LocalDateTime.now());
        payments.save(p);

        if ("WALLET_TOPUP".equals(p.getType())) {
            credit(p.getUserId(), p.getAmount(), "TOPUP", p.getId(), "Nạp tiền vào ví qua QR ngân hàng");
            noti.send(p.getUserId(), "WALLET_TOPUP_SUCCESS", "Nạp thành công " + p.getAmount() + "đ vào ví UniHome", "WALLET", p.getId());
        } else if ("PACKAGE_DIRECT".equals(p.getType())) {
            String targetType = p.getReferenceType() != null ? p.getReferenceType() : "ROOM";
            activatePromotion(p.getUserId(), targetType, p.getReferenceId(), p.getPlanId());
        }
    }

    @Transactional
    public WalletTransaction credit(Long uid, long amt, String refType, Long refId, String desc) {
        WalletTransaction t = new WalletTransaction();
        t.setUserId(uid);
        t.setType("CREDIT");
        t.setAmount(amt);
        t.setBalanceAfter(balance(uid) + amt);
        t.setReferenceType(refType);
        t.setReferenceId(refId);
        t.setDescription(desc);
        return txs.save(t);
    }

    @Transactional
    public WalletTransaction debit(Long uid, long amt, String refType, Long refId, String desc) {
        long b = balance(uid);
        if (b < amt) {
            throw new IllegalStateException("Số dư Ví UniHome không đủ. Vui lòng nạp thêm tiền.");
        }
        WalletTransaction t = new WalletTransaction();
        t.setUserId(uid);
        t.setType("DEBIT");
        t.setAmount(-amt);
        t.setBalanceAfter(b - amt);
        t.setReferenceType(refType);
        t.setReferenceId(refId);
        t.setDescription(desc);
        return txs.save(t);
    }

    @Transactional
    public void buyWithWallet(Long uid, Long listingId, Long planId) {
        buyPromotionWithWallet(uid, "ROOM", listingId, planId);
    }

    @Transactional
    public void buyPromotionWithWallet(Long uid, String targetType, Long targetId, Long planId) {
        PackagePlan plan = plans.findById(planId).orElseThrow(() -> new IllegalArgumentException("Gói không tồn tại"));
        debit(uid, plan.getPrice(), "PACKAGE", targetId, "Kích hoạt gói " + plan.getName() + " cho bài đăng #" + targetId);
        activatePromotion(uid, targetType, targetId, planId);
    }

    @Transactional
    public void activatePromotion(Long uid, String targetType, Long targetId, Long planId) {
        PackagePlan plan = plans.findById(planId).orElseThrow();
        int days = Math.max(1, plan.getDurationDays());

        if ("ROOM".equalsIgnoreCase(targetType) || "LISTING".equalsIgnoreCase(targetType)) {
            Listing li = listings.findById(targetId).orElseThrow();
            if (!Objects.equals(li.getLandlordId(), uid)) {
                throw new SecurityException("Không phải bài đăng của bạn");
            }
            if ("BOOST".equalsIgnoreCase(plan.getCode())) {
                li.setBoostUntil(LocalDateTime.now().plusDays(days));
            } else {
                li.setPackageTier(plan.getCode());
                li.setPackagePriority(plan.getPriority());
                li.setPackageUntil(LocalDateTime.now().plusDays(days));
                li.setFreshnessDueAt(li.getPackageUntil().plusDays(15));
            }
            listings.save(li);
        } else if ("SECOND_HAND".equalsIgnoreCase(targetType)) {
            SecondHandListing sh = secondHands.findById(targetId).orElseThrow();
            if (!Objects.equals(sh.getSellerId(), uid)) {
                throw new SecurityException("Không phải bài đăng đồ cũ của bạn");
            }
        } else if ("SERVICE".equalsIgnoreCase(targetType)) {
            ServiceListing sv = services.findById(targetId).orElseThrow();
            if (!Objects.equals(sv.getProviderId(), uid)) {
                throw new SecurityException("Không phải bài đăng dịch vụ của bạn");
            }
        }

        // Universal post_promotion record
        PostPromotion promo = new PostPromotion();
        promo.setTargetType(targetType.toUpperCase());
        promo.setTargetId(targetId);
        promo.setOwnerUserId(uid);
        promo.setPlanId(plan.getId());
        promo.setPriority(plan.getPriority() != null ? plan.getPriority() : 0);
        promo.setStartAt(LocalDateTime.now());
        promo.setEndAt(LocalDateTime.now().plusDays(days));
        if ("BOOST".equalsIgnoreCase(plan.getCode())) {
            promo.setBoostUntil(LocalDateTime.now().plusDays(days));
        }
        promo.setStatus("ACTIVE");
        promotions.save(promo);

        noti.send(uid, "PACKAGE_ACTIVE", "Gói " + plan.getName() + " đã được kích hoạt thành công cho bài đăng #" + targetId, targetType, targetId);
    }
}
