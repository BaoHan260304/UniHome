package com.exe201.rrms.service;

import com.exe201.rrms.entity.*;
import com.exe201.rrms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AnalyticsService {

    private final AnalyticsEventRepository eventRepo;
    private final UserRepository userRepo;
    private final ListingRepository listingRepo;
    private final PropertyRepository propertyRepo;
    private final ConversationRepository convRepo;
    private final MessageRepository messageRepo;
    private final MatchingProfileRepository matchingRepo;
    private final SecondHandListingRepository secondHandRepo;
    private final ServiceListingRepository serviceRepo;
    private final VoucherRedemptionRepository redemptionRepo;
    private final RewardAccountRepository rewardAccountRepo;
    private final WalletTransactionRepository walletTxRepo;
    private final PaymentRepository paymentRepo;
    private final AdvertisementRepository adRepo;
    private final FavoriteRepository favoriteRepo;
    private final ListingInterestRepository interestRepo;

    public AnalyticsService(AnalyticsEventRepository eventRepo,
                            UserRepository userRepo,
                            ListingRepository listingRepo,
                            PropertyRepository propertyRepo,
                            ConversationRepository convRepo,
                            MessageRepository messageRepo,
                            MatchingProfileRepository matchingRepo,
                            SecondHandListingRepository secondHandRepo,
                            ServiceListingRepository serviceRepo,
                            VoucherRedemptionRepository redemptionRepo,
                            RewardAccountRepository rewardAccountRepo,
                            WalletTransactionRepository walletTxRepo,
                            PaymentRepository paymentRepo,
                            AdvertisementRepository adRepo,
                            FavoriteRepository favoriteRepo,
                            ListingInterestRepository interestRepo) {
        this.eventRepo = eventRepo;
        this.userRepo = userRepo;
        this.listingRepo = listingRepo;
        this.propertyRepo = propertyRepo;
        this.convRepo = convRepo;
        this.messageRepo = messageRepo;
        this.matchingRepo = matchingRepo;
        this.secondHandRepo = secondHandRepo;
        this.serviceRepo = serviceRepo;
        this.redemptionRepo = redemptionRepo;
        this.rewardAccountRepo = rewardAccountRepo;
        this.walletTxRepo = walletTxRepo;
        this.paymentRepo = paymentRepo;
        this.adRepo = adRepo;
        this.favoriteRepo = favoriteRepo;
        this.interestRepo = interestRepo;
    }

    @Transactional
    public void recordEvent(AnalyticsEvent event) {
        if (event.getSessionId() == null || event.getSessionId().isBlank()) {
            event.setSessionId(UUID.randomUUID().toString());
        }
        if (event.getMetadataJson() != null) {
            String sanitized = event.getMetadataJson()
                    .replaceAll("\"password\"\\s*:\\s*\"[^\"]*\"", "\"password\":\"***\"")
                    .replaceAll("\"token\"\\s*:\\s*\"[^\"]*\"", "\"token\":\"***\"");
            event.setMetadataJson(sanitized);
        }
        eventRepo.save(event);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardAnalytics(int days) {
        return getDashboardAnalytics(days, null, null, "DAY");
    }

