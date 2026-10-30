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

    private static final Set<String> LISTING_VIEW_EVENTS = Set.of("VIEW_LISTING", "LISTING_VIEW", "ROOM_VIEW");

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardAnalytics(int days, String fromDate, String toDate, String groupBy) {
        return getDashboardAnalytics(days, fromDate, toDate, groupBy, null, null, null, null);
    }

    /**
     * Dashboard analytics. Every number is derived from real rows (analytics_event, users, favorite,
     * conversation, wallet_transaction, payment). Periods with no data return zero, nothing is synthesised.
     *
     * @param preset  TODAY, YESTERDAY, 7D, 30D, THIS_MONTH, LAST_MONTH, THIS_QUARTER, THIS_YEAR, LAST_YEAR, CUSTOM
     * @param year    optional; with month => that month, without => whole year
     * @param compare PREVIOUS_PERIOD or PREVIOUS_YEAR (optional)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardAnalytics(int days, String fromDate, String toDate, String groupBy,
                                                     String preset, Integer year, Integer month, String compare) {
        LocalDate today = LocalDate.now();
        LocalDate[] range = resolveRange(days, fromDate, toDate, preset, year, month, today);
        LocalDate startDate = range[0];
        LocalDate endDate = range[1];
        int totalDays = (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;

        String normGroupBy = groupBy == null ? "" : groupBy.trim().toUpperCase();
        if (!Set.of("DAY", "WEEK", "MONTH", "QUARTER", "YEAR").contains(normGroupBy)) {
            normGroupBy = totalDays <= 31 ? "DAY" : totalDays <= 120 ? "WEEK" : totalDays <= 800 ? "MONTH" : "QUARTER";
        }
        if ("DAY".equals(normGroupBy) && totalDays > 400) normGroupBy = "WEEK"; // protect payload size

        List<User> allUsers = userRepo.findAll();
        List<WalletTransaction> allTxs = walletTxRepo.findAll();
        List<Payment> paidPayments = paymentRepo.findByStatusOrderByCreatedAtDesc("PAID");
        List<Favorite> allFavs = favoriteRepo.findAll();
        List<Conversation> allConvs = convRepo.findAll();

        Map<String, Object> kpi = periodKpis(startDate, endDate, allUsers, allTxs, paidPayments, allFavs, allConvs);

        // ---- snapshot (not period bound) ----
        long totalUsers = allUsers.size();
        long adminsCount = allUsers.stream().filter(u -> u.getRole() != null && (u.getRole().toUpperCase().contains("ADMIN") || u.getRole().equalsIgnoreCase("MODERATOR"))).count();
        Set<Long> ownerIds = new HashSet<>();
        List<Listing> allListings = listingRepo.findAll();
        for (Listing l : allListings) if (l.getLandlordId() != null) ownerIds.add(l.getLandlordId());
        long landlords = allUsers.stream().filter(u -> ownerIds.contains(u.getId()) && !(u.getRole() != null && u.getRole().toUpperCase().contains("ADMIN"))).count();
        long tenants = totalUsers - adminsCount - landlords;

        long totalListings = allListings.size();
        long activeListings = allListings.stream().filter(l -> "ACTIVE".equalsIgnoreCase(l.getStatus())).count();
        long pendingListings = allListings.stream().filter(l -> "PENDING_REVIEW".equalsIgnoreCase(l.getStatus()) || "PENDING".equalsIgnoreCase(l.getStatus())).count();
        long rejectedListings = allListings.stream().filter(l -> "REJECTED".equalsIgnoreCase(l.getStatus()) || "NEED_REVISION".equalsIgnoreCase(l.getStatus()) || "NEEDS_CHANGES".equalsIgnoreCase(l.getStatus())).count();
        long expiredListings = allListings.stream().filter(l -> "EXPIRED".equalsIgnoreCase(l.getStatus())).count();
        long draftListings = allListings.stream().filter(l -> "DRAFT".equalsIgnoreCase(l.getStatus())).count();
        long totalProperties = propertyRepo.count();
        long matchingProfiles = matchingRepo.count();
        long matchingConnections = interestRepo.findAll().stream().filter(i -> Boolean.TRUE.equals(i.getMatchingEnabled())).count();
        long totalSecondHand = secondHandRepo.count();
        long totalServices = serviceRepo.count();
        long totalRedemptions = redemptionRepo.count();
        long totalListingViewsAllTime = allListings.stream().mapToLong(l -> l.getViewCount() != null ? l.getViewCount() : 0L).sum();

        // ---- period revenue breakdown ----
        long vipPurchases = 0L, vipRevenue = 0L, boostRevenue = 0L, featuredRevenue = 0L, otherRevenue = 0L;
        boolean hasDebits = false;
        for (WalletTransaction tx : allTxs) {
            if (!inRange(tx.getCreatedAt(), startDate, endDate) || !"DEBIT".equalsIgnoreCase(tx.getType())) continue;
            hasDebits = true;
            long spent = Math.abs(tx.getAmount() != null ? tx.getAmount() : 0L);
            String desc = (tx.getDescription() != null ? tx.getDescription().toUpperCase() : "") + " " + (tx.getReferenceType() != null ? tx.getReferenceType().toUpperCase() : "");
            if (desc.contains("VIP")) { vipRevenue += spent; vipPurchases++; }
            else if (desc.contains("BOOST") || desc.contains("ĐẨY")) boostRevenue += spent;
            else if (desc.contains("FEATURED") || desc.contains("NỔI BẬT")) featuredRevenue += spent;
            else otherRevenue += spent;
        }
        if (!hasDebits) {
            for (Payment p : paidPayments) {
                if ("PACKAGE_DIRECT".equalsIgnoreCase(p.getType()) && inRange(p.getPaidAt() != null ? p.getPaidAt() : p.getCreatedAt(), startDate, endDate)) {
                    long amt = p.getAmount() != null ? p.getAmount() : 0L;
                    if (amt <= 15000L) {
                        boostRevenue += amt;
                    } else {
                        vipRevenue += amt;
                        vipPurchases++;
                    }
                }
            }
        }
        // Advertisement has no price/budget column, so ad revenue cannot be derived honestly: report 0.
        long adRevenue = 0L;
        long adImpressions = 0L, adClicks = 0L;
        for (Advertisement a : adRepo.findAll()) {
            adImpressions += a.getImpressions() != null ? a.getImpressions() : 0L;
            adClicks += a.getClickCount() != null ? a.getClickCount() : 0L;
        }
        List<Map<String, Object>> revenueBreakdown = List.of(
                Map.of("name", "Gói VIP (VIP 1, 2, 3)", "value", vipRevenue, "color", "#6366F1"),
                Map.of("name", "Đẩy tin (BOOST)", "value", boostRevenue, "color", "#F59E0B"),
                Map.of("name", "Tin Nổi bật (FEATURED)", "value", featuredRevenue, "color", "#EC4899"),
                Map.of("name", "Quảng cáo đối tác (Ads)", "value", adRevenue, "color", "#10B981"),
                Map.of("name", "Khác", "value", otherRevenue, "color", "#8B5CF6")
        );

        // ---- series ----
        List<AnalyticsEvent> periodEvents = eventRepo.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        List<Map<String, Object>> series = new ArrayList<>();
        for (Object[] b : buildBuckets(startDate, endDate, normGroupBy)) {
            LocalDate bs = (LocalDate) b[0];
            LocalDate be = (LocalDate) b[1];
            String label = (String) b[2];
            List<AnalyticsEvent> ev = periodEvents.stream().filter(e -> inRange(e.getCreatedAt(), bs, be)).toList();
            long pageViews = ev.stream().filter(e -> "PAGE_VIEW".equalsIgnoreCase(e.getEventType())).count();
            long listingViews = ev.stream().filter(e -> LISTING_VIEW_EVENTS.contains(e.getEventType().toUpperCase())).count();
            long searches = ev.stream().filter(e -> "SEARCH".equalsIgnoreCase(e.getEventType())).count();
            long newUsers = allUsers.stream().filter(u -> inRange(u.getCreatedAt(), bs, be)).count();
            long cumulative = allUsers.stream().filter(u -> u.getCreatedAt() != null && !u.getCreatedAt().toLocalDate().isAfter(be)).count();
            long visitors = ev.stream().map(e -> e.getUserId() != null ? "u" + e.getUserId() : "s" + e.getSessionId()).distinct().count();
            long saved = allFavs.stream().filter(f -> inRange(f.getCreatedAt(), bs, be)).count();
            long chats = allConvs.stream().filter(c -> inRange(c.getCreatedAt(), bs, be)).count();
            long revenue = revenueIn(allTxs, paidPayments, bs, be);
            Map<String, Object> pt = new LinkedHashMap<>();
            pt.put("date", label);
            pt.put("from", bs.toString());
            pt.put("to", be.toString());
            pt.put("pageViews", pageViews);
            pt.put("roomViews", listingViews);
            pt.put("listingViews", listingViews);
            pt.put("searches", searches);
            pt.put("newUsers", newUsers);
            pt.put("cumulativeUsers", cumulative);
            pt.put("uniqueVisitors", visitors);
            pt.put("saved", saved);
            pt.put("chatStarted", chats);
            pt.put("recognizedRevenue", revenue);
            series.add(pt);
        }

        long funnelViews = (long) kpi.get("listingViews");
        long funnelInterests = (long) kpi.get("saved");
        long funnelContacts = (long) kpi.get("chatStarted");
        long funnelDeals = matchingConnections;
        List<Map<String, Object>> conversionFunnel = List.of(
                Map.of("stage", "1. Xem chi tiết phòng", "count", funnelViews, "pct", funnelViews > 0 ? 100 : 0),
                Map.of("stage", "2. Quan tâm / Yêu thích", "count", funnelInterests, "pct", funnelViews > 0 ? Math.min(100, (funnelInterests * 100) / funnelViews) : 0),
                Map.of("stage", "3. Mở liên hệ / Chat", "count", funnelContacts, "pct", funnelViews > 0 ? Math.min(100, (funnelContacts * 100) / funnelViews) : 0),
                Map.of("stage", "4. Hoàn tất kết nối / Thuê", "count", funnelDeals, "pct", funnelViews > 0 ? Math.min(100, (funnelDeals * 100) / funnelViews) : 0)
        );
        List<Map<String, Object>> listingStatusDistribution = List.of(
                Map.of("name", "Đang hiển thị", "value", activeListings, "color", "#10B981"),
                Map.of("name", "Chờ duyệt", "value", pendingListings, "color", "#F59E0B"),
                Map.of("name", "Cần chỉnh sửa / Từ chối", "value", rejectedListings, "color", "#EF4444"),
                Map.of("name", "Hết hạn", "value", expiredListings, "color", "#6B7280"),
                Map.of("name", "Bản nháp", "value", draftListings, "color", "#8B5CF6")
        );

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalUsers", totalUsers);
        res.put("newUsers", kpi.get("newUsers"));
        res.put("activeUsers", kpi.get("activeUsers"));
        res.put("returningUsers", kpi.get("returningUsers"));
        res.put("landlordsCount", landlords);
        res.put("tenantsCount", tenants);
        res.put("adminsCount", adminsCount);
        res.put("totalListings", totalListings);
        res.put("activeListings", activeListings);
        res.put("pendingListings", pendingListings);
        res.put("rejectedListings", rejectedListings);
        res.put("expiredListings", expiredListings);
        res.put("draftListings", draftListings);
        res.put("totalProperties", totalProperties);
        res.put("roomViews", kpi.get("listingViews"));
        res.put("listingViews", kpi.get("listingViews"));
        res.put("totalListingViewsAllTime", totalListingViewsAllTime);
        res.put("favorites", kpi.get("saved"));
        res.put("chatInitiated", kpi.get("chatStarted"));
        res.put("matchingConnections", matchingConnections);
        res.put("matchingProfiles", matchingProfiles);
        res.put("totalSecondHand", totalSecondHand);
        res.put("totalServices", totalServices);
        res.put("totalRedemptions", totalRedemptions);
        res.put("pageViews", kpi.get("pageViews"));
        res.put("sessions", kpi.get("sessions"));
        res.put("uniqueVisitors", kpi.get("uniqueVisitors"));
        res.put("searches", kpi.get("searches"));
        res.put("dau", kpi.get("dau"));
        res.put("wau", kpi.get("wau"));
        res.put("mau", kpi.get("mau"));
        res.put("walletInflow", kpi.get("walletInflow"));
        res.put("recognizedRevenue", kpi.get("recognizedRevenue"));
        res.put("packageRevenue", vipRevenue + boostRevenue + featuredRevenue);
        res.put("vipPurchases", vipPurchases);
        res.put("adRevenue", adRevenue);
        res.put("adRevenueNote", "Advertisement has no price/budget field; ad revenue is not derivable and reported as 0.");
        res.put("revenueBreakdown", revenueBreakdown);
        res.put("adImpressions", adImpressions);
        res.put("adClicks", adClicks);
        res.put("adCtr", adImpressions > 0 ? (double) (adClicks * 100) / adImpressions : 0.0);
        res.put("groupBy", normGroupBy);
        res.put("preset", preset == null || preset.isBlank() ? (year != null ? "YEAR_MONTH" : "CUSTOM") : preset.toUpperCase());
        res.put("fromDate", startDate.toString());
        res.put("toDate", endDate.toString());
        res.put("dailySeries", series);
        res.put("trendSeries", series);
        res.put("listingStatusDistribution", listingStatusDistribution);
        res.put("conversionFunnel", conversionFunnel);

        if (compare != null && !compare.isBlank() && !"NONE".equalsIgnoreCase(compare)) {
            LocalDate cs, ce;
            String mode = compare.trim().toUpperCase();
            if ("PREVIOUS_YEAR".equals(mode)) {
                cs = startDate.minusYears(1);
                ce = endDate.minusYears(1);
            } else {
                mode = "PREVIOUS_PERIOD";
                ce = startDate.minusDays(1);
                cs = ce.minusDays(totalDays - 1L);
            }
            Map<String, Object> prev = periodKpis(cs, ce, allUsers, allTxs, paidPayments, allFavs, allConvs);
            Map<String, Object> cmp = new LinkedHashMap<>();
            cmp.put("mode", mode);
            cmp.put("fromDate", cs.toString());
            cmp.put("toDate", ce.toString());
            cmp.put("kpis", prev);
            Map<String, Object> delta = new LinkedHashMap<>();
            for (String k : List.of("newUsers", "activeUsers", "pageViews", "uniqueVisitors", "sessions", "searches", "listingViews", "saved", "chatStarted", "walletInflow", "recognizedRevenue")) {
                long cur = ((Number) kpi.get(k)).longValue();
                long old = ((Number) prev.get(k)).longValue();
                delta.put(k, old == 0 ? (cur == 0 ? 0.0 : null) : ((double) (cur - old) * 100.0) / old);
            }
            cmp.put("deltaPct", delta);
            res.put("compare", cmp);
        }
        return res;
    }

    private LocalDate[] resolveRange(int days, String fromDate, String toDate, String preset, Integer year, Integer month, LocalDate today) {
        String p = preset == null ? "" : preset.trim().toUpperCase();
        if (year != null) {
            if (month != null && month >= 1 && month <= 12) {
                LocalDate s = LocalDate.of(year, month, 1);
                return new LocalDate[]{s, s.plusMonths(1).minusDays(1)};
            }
            return new LocalDate[]{LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31)};
        }
        switch (p) {
            case "TODAY": return new LocalDate[]{today, today};
            case "YESTERDAY": return new LocalDate[]{today.minusDays(1), today.minusDays(1)};
            case "7D": return new LocalDate[]{today.minusDays(6), today};
            case "30D": return new LocalDate[]{today.minusDays(29), today};
            case "THIS_MONTH": return new LocalDate[]{today.withDayOfMonth(1), today};
            case "LAST_MONTH": {
                LocalDate s = today.withDayOfMonth(1).minusMonths(1);
                return new LocalDate[]{s, s.plusMonths(1).minusDays(1)};
            }
            case "THIS_QUARTER": {
                int qm = ((today.getMonthValue() - 1) / 3) * 3 + 1;
                return new LocalDate[]{LocalDate.of(today.getYear(), qm, 1), today};
            }
            case "THIS_YEAR": return new LocalDate[]{LocalDate.of(today.getYear(), 1, 1), today};
            case "LAST_YEAR": return new LocalDate[]{LocalDate.of(today.getYear() - 1, 1, 1), LocalDate.of(today.getYear() - 1, 12, 31)};
            default: break;
        }
        if (fromDate != null && !fromDate.isBlank() && toDate != null && !toDate.isBlank()) {
            try {
                LocalDate s = LocalDate.parse(fromDate.trim());
                LocalDate e = LocalDate.parse(toDate.trim());
                return s.isAfter(e) ? new LocalDate[]{e, s} : new LocalDate[]{s, e};
            } catch (Exception ignored) { /* fall through to days */ }
        }
        int safeDays = (days == 7 || days == 30 || days == 90) ? days : 30;
        return new LocalDate[]{today.minusDays(safeDays - 1L), today};
    }

    private List<Object[]> buildBuckets(LocalDate start, LocalDate end, String group) {
        List<Object[]> out = new ArrayList<>();
        DateTimeFormatter dm = DateTimeFormatter.ofPattern("dd/MM");
        LocalDate cur = start;
        while (!cur.isAfter(end)) {
            LocalDate next;
            String label;
            switch (group) {
                case "WEEK":
                    next = cur.plusDays(7);
                    label = cur.format(dm) + "–" + (next.minusDays(1).isAfter(end) ? end : next.minusDays(1)).format(dm);
                    break;
                case "MONTH":
                    next = cur.withDayOfMonth(1).plusMonths(1);
                    label = String.format("%02d/%d", cur.getMonthValue(), cur.getYear());
                    break;
                case "QUARTER":
                    next = LocalDate.of(cur.getYear(), ((cur.getMonthValue() - 1) / 3) * 3 + 1, 1).plusMonths(3);
                    label = "Q" + ((cur.getMonthValue() - 1) / 3 + 1) + "/" + cur.getYear();
                    break;
                case "YEAR":
                    next = LocalDate.of(cur.getYear() + 1, 1, 1);
                    label = String.valueOf(cur.getYear());
                    break;
                default:
                    next = cur.plusDays(1);
                    label = cur.format(dm);
            }
            LocalDate bEnd = next.minusDays(1).isAfter(end) ? end : next.minusDays(1);
            out.add(new Object[]{cur, bEnd, label});
            cur = next;
        }
        return out;
    }

    private static boolean inRange(LocalDateTime t, LocalDate s, LocalDate e) {
        if (t == null) return false;
        LocalDate d = t.toLocalDate();
        return !d.isBefore(s) && !d.isAfter(e);
    }

    private long revenueIn(List<WalletTransaction> txs, List<Payment> pays, LocalDate s, LocalDate e) {
        long sum = 0L;
        boolean hasDebits = false;
        for (WalletTransaction tx : txs) {
            if ("DEBIT".equalsIgnoreCase(tx.getType()) && inRange(tx.getCreatedAt(), s, e)) {
                sum += Math.abs(tx.getAmount() != null ? tx.getAmount() : 0L);
                hasDebits = true;
            }
        }
        if (!hasDebits) {
            for (Payment p : pays) {
                if ("PACKAGE_DIRECT".equalsIgnoreCase(p.getType()) && inRange(p.getPaidAt() != null ? p.getPaidAt() : p.getCreatedAt(), s, e)) {
                    sum += p.getAmount() != null ? p.getAmount() : 0L;
                }
            }
        }
        return sum;
    }

    private Map<String, Object> periodKpis(LocalDate s, LocalDate e, List<User> users, List<WalletTransaction> txs,
                                           List<Payment> pays, List<Favorite> favs, List<Conversation> convs) {
        List<AnalyticsEvent> ev = eventRepo.findByCreatedAtBetweenOrderByCreatedAtDesc(s.atStartOfDay(), e.atTime(23, 59, 59));
        Set<String> sessions = new HashSet<>();
        Set<String> visitors = new HashSet<>();
        Set<Long> activeIds = new HashSet<>();
        long pageViews = 0, searches = 0, listingViews = 0;
        for (AnalyticsEvent x : ev) {
            sessions.add(x.getSessionId());
            visitors.add(x.getUserId() != null ? "u" + x.getUserId() : "s" + x.getSessionId());
            if (x.getUserId() != null) activeIds.add(x.getUserId());
            String t = x.getEventType() == null ? "" : x.getEventType().toUpperCase();
            if ("PAGE_VIEW".equals(t)) pageViews++;
            else if ("SEARCH".equals(t)) searches++;
            else if (LISTING_VIEW_EVENTS.contains(t)) listingViews++;
        }
        for (User u : users) if (inRange(u.getLastLoginAt(), s, e)) activeIds.add(u.getId());
        long newUsers = users.stream().filter(u -> inRange(u.getCreatedAt(), s, e)).count();
        Map<Long, User> byId = new HashMap<>();
        for (User u : users) byId.put(u.getId(), u);
        long returning = activeIds.stream().filter(id -> {
            User u = byId.get(id);
            return u != null && u.getCreatedAt() != null && u.getCreatedAt().toLocalDate().isBefore(s);
        }).count();
        long saved = favs.stream().filter(f -> inRange(f.getCreatedAt(), s, e)).count();
        long chats = convs.stream().filter(c -> inRange(c.getCreatedAt(), s, e)).count();
        long inflow = 0L;
        for (WalletTransaction tx : txs) {
            if ("CREDIT".equalsIgnoreCase(tx.getType()) && "TOPUP".equalsIgnoreCase(tx.getReferenceType()) && inRange(tx.getCreatedAt(), s, e)) inflow += tx.getAmount() != null ? tx.getAmount() : 0L;
        }
        LocalDate anchor = e.isAfter(LocalDate.now()) ? LocalDate.now() : e;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("fromDate", s.toString());
        m.put("toDate", e.toString());
        m.put("pageViews", pageViews);
        m.put("sessions", (long) sessions.size());
        m.put("uniqueVisitors", (long) visitors.size());
        m.put("activeUsers", (long) activeIds.size());
        m.put("newUsers", newUsers);
        m.put("returningUsers", returning);
        m.put("searches", searches);
        m.put("listingViews", listingViews);
        m.put("saved", saved);
        m.put("chatStarted", chats);
        m.put("walletInflow", inflow);
        m.put("recognizedRevenue", revenueIn(txs, pays, s, e));
        m.put("dau", distinctUsersBetween(users, anchor, anchor));
        m.put("wau", distinctUsersBetween(users, anchor.minusDays(6), anchor));
        m.put("mau", distinctUsersBetween(users, anchor.minusDays(29), anchor));
        return m;
    }

    private long distinctUsersBetween(List<User> users, LocalDate s, LocalDate e) {
        Set<Long> ids = new HashSet<>();
        for (AnalyticsEvent x : eventRepo.findByCreatedAtBetweenOrderByCreatedAtDesc(s.atStartOfDay(), e.atTime(23, 59, 59))) {
            if (x.getUserId() != null) ids.add(x.getUserId());
        }
        for (User u : users) if (inRange(u.getLastLoginAt(), s, e)) ids.add(u.getId());
        return ids.size();
    }
}

