# UniHome Round 2 Comprehensive E2E Verification Script
$ErrorActionPreference = "Continue"

$baseUrl = "http://localhost:8080/api"
$serverRoot = "http://localhost:8080"

function Post-Json($url, $body, $token = $null) {
    $headers = @{}
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    $json = $body | ConvertTo-Json -Depth 10
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    try {
        $res = Invoke-RestMethod -Uri $url -Method Post -Body $bodyBytes -ContentType "application/json; charset=utf-8" -Headers $headers -ErrorAction Stop
        return @{ StatusCode = 200; Data = $res; Success = $true }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errBody = $reader.ReadToEnd()
        return @{ StatusCode = $status; Error = $errBody; Success = $false }
    }
}

function Put-Json($url, $body, $token = $null) {
    $headers = @{}
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    $json = $body | ConvertTo-Json -Depth 10
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    try {
        $res = Invoke-RestMethod -Uri $url -Method Put -Body $bodyBytes -ContentType "application/json; charset=utf-8" -Headers $headers -ErrorAction Stop
        return @{ StatusCode = 200; Data = $res; Success = $true }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errBody = $reader.ReadToEnd()
        return @{ StatusCode = $status; Error = $errBody; Success = $false }
    }
}

function Get-Json($url, $token = $null) {
    $headers = @{}
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    try {
        $res = Invoke-RestMethod -Uri $url -Method Get -Headers $headers -ErrorAction Stop
        return @{ StatusCode = 200; Data = $res; Success = $true }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errBody = $reader.ReadToEnd()
        return @{ StatusCode = $status; Error = $errBody; Success = $false }
    }
}

function Delete-Json($url, $token = $null) {
    $headers = @{}
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    try {
        $res = Invoke-RestMethod -Uri $url -Method Delete -Headers $headers -ErrorAction Stop
        return @{ StatusCode = 200; Data = $res; Success = $true }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errBody = $reader.ReadToEnd()
        return @{ StatusCode = $status; Error = $errBody; Success = $false }
    }
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " UNIHOME ROUND 2 COMPREHENSIVE BUSINESS E2E VERIFICATION        " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 0. LOGIN
$studentLogin = Post-Json "$baseUrl/auth/login" @{ email = "student@unihome.vn"; password = "123456" }
$studentToken = $studentLogin.Data.token
$studentUser = $studentLogin.Data.user
Write-Host "`n[AUTH] Student Login: HTTP $($studentLogin.StatusCode) - ID: $($studentUser.id), Name: $($studentUser.fullName), Role: $($studentUser.role)"

$adminLogin = Post-Json "$baseUrl/auth/login" @{ email = "admin@unihome.vn"; password = "123456" }
$adminToken = $adminLogin.Data.token
$adminUser = $adminLogin.Data.user
Write-Host "[AUTH] Admin Login: HTTP $($adminLogin.StatusCode) - ID: $($adminUser.id), Name: $($adminUser.fullName), Role: $($adminUser.role)"

# ==============================================================================
# TEST 1: REWARD_RELOGIN & DAILY TASKS
# ==============================================================================
Write-Host "`n>>> [TEST 1: REWARD_RELOGIN & DAILY TASKS] <<<" -ForegroundColor Yellow
$accBefore = Get-Json "$baseUrl/rewards/account" $studentToken
Write-Host "1. Account Balance Before: $($accBefore.Data.balance), streak: $($accBefore.Data.currentStreak), canCheckin: $($accBefore.Data.canCheckinToday)"

# Claim checkin 1
$claim1 = Post-Json "$baseUrl/rewards/checkin" @{} $studentToken
Write-Host "2. Claim Checkin 1: HTTP $($claim1.StatusCode) - Success=$($claim1.Data.success), alreadyClaimed=$($claim1.Data.alreadyClaimed), pointsAwarded=+$($claim1.Data.pointsAwarded), newBalance=$($claim1.Data.newBalance)"

# Re-login (new token/session)
$relogin = Post-Json "$baseUrl/auth/login" @{ email = "student@unihome.vn"; password = "123456" }
$newToken = $relogin.Data.token

# Claim checkin 2 (cross-session exploit attempt)
$claim2 = Post-Json "$baseUrl/rewards/checkin" @{} $newToken
Write-Host "3. Claim Checkin 2 (Relogin session): HTTP $($claim2.StatusCode) - alreadyClaimed=$($claim2.Data.alreadyClaimed), pointsAwarded=$($claim2.Data.pointsAwarded), newBalance=$($claim2.Data.newBalance)"

# Verify Task Catalog (must only be 3 daily engagement tasks, no one-time tasks)
$tasksRes = Get-Json "$baseUrl/rewards/tasks" $newToken
Write-Host "4. Assigned Daily Tasks Count: $($tasksRes.Data.Count)"
$hasOnboarding = $false
foreach ($t in $tasksRes.Data) {
    Write-Host "   - Task: [$($t.taskCode)] $($t.title) - Points: $($t.pointsReward), Completed: $($t.completed), Progress: $($t.progress)/$($t.targetCount)"
    if ($t.taskCode -in @("ACCOUNT_CREATED", "EMAIL_VERIFIED", "MATCHING_PROFILE_COMPLETED")) {
        $hasOnboarding = $true
    }
}
Write-Host "   -> Contains Onboarding Tasks as Daily: $hasOnboarding (Expected: False)"

# Verify Database Unique Constraint
$mysqlBin = "C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe"
$dbCheckinConstraint = & $mysqlBin -u root -p"123456@123" -e "SHOW CREATE TABLE rrmsdb.daily_checkin\G" 2>&1
$hasUniqueKey = $dbCheckinConstraint -match "UNIQUE KEY.*user_id.*checkin_date"
Write-Host "5. DB Constraint Check: UNIQUE KEY (user_id, checkin_date) exists = $hasUniqueKey"

# ==============================================================================
# TEST 2: POST_ROOM_UI & POST_ROOMMATE_UI
# ==============================================================================
Write-Host "`n>>> [TEST 2: POST_ROOM_UI & POST_ROOMMATE_UI] <<<" -ForegroundColor Yellow
# Create Room (CHO_THUE)
$roomPayload = @{
    title = "Phòng trọ cao cấp máy lạnh E2E Round 2"
    name = "Phòng trọ cao cấp máy lạnh E2E Round 2"
    description = "Đầy đủ tiện nghi, giờ giấc tự do, an ninh 24/7"
    postType = "CHO_THUE"
    propertyType = "Phòng trọ"
    price = 3600000
    area = 26
    deposit = 3600000
    province = "Hà Nội"
    district = "Cầu Giấy"
    ward = "Dịch Vọng"
    street = "12 Xuân Thủy"
    posterRelationship = "CHINH_CHU"
    targetGender = "ALL"
    maxRenters = 2
    listingStatus = "PENDING_REVIEW"
    imageUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"
    mediaJson = '[{"url":"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"},{"url":"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600"},{"url":"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600"}]'
}
$createdRoom = Post-Json "$baseUrl/listings" $roomPayload $studentToken
$roomId = $createdRoom.Data.listing.id
Write-Host "1. Create Room (CHO_THUE): HTTP $($createdRoom.StatusCode) - ID: $roomId, Status: $($createdRoom.Data.listing.status)"

# Create Roommate (O_GHEP)
$roommatePayload = @{
    title = "Tìm 1 bạn sinh viên ở ghép Cầu Giấy E2E Round 2"
    name = "Tìm 1 bạn sinh viên ở ghép Cầu Giấy E2E Round 2"
    description = "Cần tìm bạn sinh viên hòa đồng, không hút thuốc, ở ghép chia đôi chi phí"
    postType = "O_GHEP"
    propertyType = "Ở ghép"
    price = 1700000
    area = 30
    deposit = 1700000
    province = "Hà Nội"
    district = "Cầu Giấy"
    ward = "Quan Hoa"
    street = "88 Quan Hoa"
    posterRelationship = "O_GHEP"
    targetGender = "ALL"
    maxRenters = 2
    listingStatus = "PENDING_REVIEW"
    imageUrl = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600"
    mediaJson = '[{"url":"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600"},{"url":"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"},{"url":"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600"}]'
}
$createdRoommate = Post-Json "$baseUrl/listings" $roommatePayload $studentToken
$roommateId = $createdRoommate.Data.listing.id
Write-Host "2. Create Roommate (O_GHEP): HTTP $($createdRoommate.StatusCode) - ID: $roommateId, Status: $($createdRoommate.Data.listing.status)"

# My Posts Contract Verification
$myPosts = Get-Json "$baseUrl/my-posts" $studentToken
Write-Host "3. GET /api/my-posts: HTTP $($myPosts.StatusCode) - Total posts: $($myPosts.Data.Count)"
$pRoom = $myPosts.Data | Where-Object { $_.id -eq $roomId }
$pRoommate = $myPosts.Data | Where-Object { $_.id -eq $roommateId }
Write-Host "   - Room Post Contract: ID=$($pRoom.id) (type: $($pRoom.id.GetType().Name)), Category=$($pRoom.category), Relationship=$($pRoom.relationship), Views=$($pRoom.viewCount), Favs=$($pRoom.favoriteCount), Chats=$($pRoom.chatCount)"
Write-Host "   - Roommate Post Contract: ID=$($pRoommate.id) (type: $($pRoommate.id.GetType().Name)), Category=$($pRoommate.category), Relationship=$($pRoommate.relationship), Views=$($pRoommate.viewCount), Favs=$($pRoommate.favoriteCount), Chats=$($pRoommate.chatCount)"

# Hide / Unhide Lifecycle
$hideRes = Post-Json "$baseUrl/listings/$roomId/status" @{ status = "HIDDEN" } $studentToken
Write-Host "4. Hide Room: HTTP $($hideRes.StatusCode) - Status=$($hideRes.Data.status)"
$unhideRes = Post-Json "$baseUrl/listings/$roomId/status" @{ status = "ACTIVE" } $studentToken
Write-Host "5. Unhide Room: HTTP $($unhideRes.StatusCode) - Status=$($unhideRes.Data.status)"

# ==============================================================================
# TEST 3: MODERATION_ROUNDTRIP
# ==============================================================================
Write-Host "`n>>> [TEST 3: MODERATION_ROUNDTRIP] <<<" -ForegroundColor Yellow
# 1. Admin requests changes with reason
$modReq = Post-Json "$baseUrl/admin/listings/$roomId/moderate" @{
    action = "REQUEST_CHANGES"
    reason = "Vui lòng bổ sung ảnh phòng vệ sinh và ban công rõ nét hơn"
} $adminToken
Write-Host "1. Admin REQUEST_CHANGES: HTTP $($modReq.StatusCode) - New Status: $($modReq.Data.status)"

# 2. Check user notification
$notifs1 = Get-Json "$baseUrl/notifications/mine" $studentToken
$notifRevision = $notifs1.Data | Where-Object { $_.referenceId -eq $roomId -and $_.type -like "*REVISION*" } | Select-Object -First 1
Write-Host "2. User Revision Notification: Found=$($null -ne $notifRevision), Type=$($notifRevision.type), Title=$($notifRevision.title), Message=$($notifRevision.message)"

# 3. User updates listing
$updateBody = @{
    title = "Phòng trọ cao cấp máy lạnh E2E (Đã bổ sung ảnh vệ sinh & ban công)"
    price = 3600000
    description = "Đã cập nhật ảnh phòng vệ sinh sạch sẽ, ban công phơi đồ thoáng mát."
}
$updateRes = Put-Json "$baseUrl/listings/$roomId" $updateBody $studentToken
Write-Host "3. User Updates Listing: HTTP $($updateRes.StatusCode) - Status: $($updateRes.Data.status)"

# 4. Admin Approves
$modApp = Post-Json "$baseUrl/admin/listings/$roomId/moderate" @{
    action = "APPROVE"
    reason = "Ảnh chụp và thông tin đã hoàn thiện đúng quy định"
} $adminToken
Write-Host "4. Admin APPROVE: HTTP $($modApp.StatusCode) - New Status: $($modApp.Data.status)"

# 5. Check approval notification
$notifs2 = Get-Json "$baseUrl/notifications/mine" $studentToken
$notifApprove = $notifs2.Data | Where-Object { $_.referenceId -eq $roomId -and $_.type -eq "LISTING_APPROVED" } | Select-Object -First 1
Write-Host "5. User Approval Notification: Found=$($null -ne $notifApprove), Type=$($notifApprove.type), Title=$($notifApprove.title)"

# ==============================================================================
# TEST 4: Q&A AVATAR REFLECTION
# ==============================================================================
Write-Host "`n>>> [TEST 4: Q&A AVATAR REFLECTION] <<<" -ForegroundColor Yellow
# 1. Multipart upload avatar
$boundary = [System.Guid]::NewGuid().ToString()
$fileBytes = [System.IO.File]::ReadAllBytes("scratch\test_avatar.png")
$fileHeader = "--$boundary`r`nContent-Disposition: form-data; name=`"file`"; filename=`"test_avatar.png`"`r`nContent-Type: image/png`r`n`r`n"
$fileTrailer = "`r`n--$boundary--`r`n"
$hBytes = [System.Text.Encoding]::ASCII.GetBytes($fileHeader)
$tBytes = [System.Text.Encoding]::ASCII.GetBytes($fileTrailer)
$fullBody = New-Object byte[] ($hBytes.Length + $fileBytes.Length + $tBytes.Length)
[System.Buffer]::BlockCopy($hBytes, 0, $fullBody, 0, $hBytes.Length)
[System.Buffer]::BlockCopy($fileBytes, 0, $fullBody, $hBytes.Length, $fileBytes.Length)
[System.Buffer]::BlockCopy($tBytes, 0, $fullBody, $hBytes.Length + $fileBytes.Length, $tBytes.Length)

$uploadReq = [System.Net.HttpWebRequest]::Create("$baseUrl/auth/avatar")
$uploadReq.Method = "POST"
$uploadReq.ContentType = "multipart/form-data; boundary=$boundary"
$uploadReq.Headers.Add("Authorization", "Bearer $studentToken")
$uploadReq.ContentLength = $fullBody.Length
$reqStream = $uploadReq.GetRequestStream()
$reqStream.Write($fullBody, 0, $fullBody.Length)
$reqStream.Close()

$uploadResp = $uploadReq.GetResponse()
$respReader = New-Object System.IO.StreamReader($uploadResp.GetResponseStream())
$uploadJson = $respReader.ReadToEnd() | ConvertFrom-Json
$uploadedAvatarUrl = $uploadJson.avatarUrl
Write-Host "1. Multipart Avatar Upload: HTTP $($uploadResp.StatusCode.value__) - AvatarUrl: $uploadedAvatarUrl"

# Verify static image HTTP 200
$imgCheck = Invoke-WebRequest -Uri "$serverRoot$uploadedAvatarUrl" -Method Get -UseBasicParsing
Write-Host "2. Static Image Serve: HTTP $($imgCheck.StatusCode), ContentType: $($imgCheck.Headers['Content-Type']), Size: $($imgCheck.RawContentLength) bytes"

# 3. Create Question
$qPayload = @{
    title = "Giá điện nước khu vực Cầu Giấy hiện tại thế nào?"
    content = "Cho mình hỏi giá điện sinh hoạt và nước máy trung bình ở Cầu Giấy là bao nhiêu ạ?"
    category = "ROOM_SEARCH"
}
$createdQ = Post-Json "$baseUrl/content/questions" $qPayload $studentToken
Write-Host "3. Post Question: HTTP $($createdQ.StatusCode) - ID: $($createdQ.Data.id)"

# 4. Fetch Questions Feed
$qFeed = Get-Json "$baseUrl/content/questions" $studentToken
$foundQ = $qFeed.Data | Where-Object { $_.id -eq $createdQ.Data.id }
Write-Host "4. Q&A Feed Dynamic Lookup: ID=$($foundQ.id), Author=$($foundQ.authorName), authorAvatar=$($foundQ.authorAvatar)"
Write-Host "   -> Avatar Matches Uploaded Avatar: $($foundQ.authorAvatar -eq $uploadedAvatarUrl)"

# ==============================================================================
# TEST 5: MATCHING_COUNT SYNCHRONIZATION
# ==============================================================================
# TEST 5: MATCHING_COUNT SYNCHRONIZATION
# ==============================================================================
Write-Host "`n>>> [TEST 5: MATCHING_COUNT SYNCHRONIZATION] <<<" -ForegroundColor Yellow
$intRes = Post-Json "$baseUrl/listings/$roomId/interest" @{ matchingEnabled = $true } $studentToken
Write-Host "1. Register Room Interest: HTTP $($intRes.StatusCode) - ListingId: $($intRes.Data.listingId)"
$interests = Get-Json "$baseUrl/listings/my-interests" $studentToken
Write-Host "2. My Interests Count: $($interests.Data.Count)"
foreach ($item in $interests.Data) {
    $lid = $item.listingId
    $cardCount = $item.matchingCandidateCount
    $candsRes = Get-Json "$baseUrl/matching/listings/$lid/candidates" $studentToken
    $actualCount = $candsRes.Data.Count
    Write-Host "   Listing #${lid} - Card matchingCandidateCount = $cardCount | Candidates API count = $actualCount | Match: $($cardCount -eq $actualCount)"
}

# ==============================================================================
# TEST 6: CHAT_SCROLL_HISTORY
# ==============================================================================
Write-Host "`n>>> [TEST 6: CHAT_SCROLL_HISTORY] <<<" -ForegroundColor Yellow
$openConv = Post-Json "$baseUrl/chat/conversations" @{ otherUserId = 1; contextType = "GENERAL"; contextId = 0 } $studentToken
$cid = $openConv.Data.conversationId
Write-Host "1. Open Conversation with Admin: HTTP $($openConv.StatusCode) - ConvId: $cid"
$sendM = Post-Json "$baseUrl/chat/conversations/$cid/messages" @{ content = "Xin chào ban quản trị! Test E2E scroll history" } $studentToken
Write-Host "2. Send Message: HTTP $($sendM.StatusCode) - MsgId: $($sendM.Data.id)"
$chatHist = Get-Json "$baseUrl/chat/conversations/$cid/messages?size=5" $studentToken
Write-Host "3. Conversation #$cid Messages: HTTP $($chatHist.StatusCode) - Count: $($chatHist.Data.messages.Count), hasMore: $($chatHist.Data.hasMore)"
if ($chatHist.Data.messages.Count -gt 0) {
    $firstM = $chatHist.Data.messages[0]
    Write-Host "   Sample message: ID=$($firstM.id), content='$($firstM.content)', sentAt=$($firstM.sentAt)"
}

# ==============================================================================
# TEST 7: ANALYTICS_YEAR FILTERS
# ==============================================================================
Write-Host "`n>>> [TEST 7: ANALYTICS_YEAR FILTERS] <<<" -ForegroundColor Yellow
# Year 2026 Monthly
$an2026 = Get-Json "$baseUrl/admin/analytics/dashboard?year=2026&granularity=MONTH" $adminToken
Write-Host "1. Year 2026 (MONTH): HTTP $($an2026.StatusCode) - Users: $($an2026.Data.totalUsers), Listings: $($an2026.Data.totalListings), Series Points: $($an2026.Data.revenueSeries.Count)"

# Year 2025 Monthly
$an2025 = Get-Json "$baseUrl/admin/analytics/dashboard?year=2025&granularity=MONTH" $adminToken
Write-Host "2. Year 2025 (MONTH): HTTP $($an2025.StatusCode) - Users: $($an2025.Data.totalUsers), Listings: $($an2025.Data.totalListings), Series Points: $($an2025.Data.revenueSeries.Count)"

# Granularity DAY with Custom Range
$anDay = Get-Json "$baseUrl/admin/analytics/dashboard?from=2026-10-01&to=2026-10-12&granularity=DAY" $adminToken
Write-Host "3. Granularity DAY: HTTP $($anDay.StatusCode) - Series Points: $($anDay.Data.revenueSeries.Count)"

# DB Count Verification
$dbUsersCount = & $mysqlBin -u root -p"123456@123" -e "SELECT COUNT(*) FROM rrmsdb.users;" -s -N
Write-Host "4. Database Users Count: $dbUsersCount (Analytics API totalUsers: $($an2026.Data.totalUsers)) -> Exact Match: $($dbUsersCount.Trim() -eq [string]$an2026.Data.totalUsers)"

# ==============================================================================
# TEST 8: PAYMENT WEBHOOK SECURITY
# ==============================================================================
Write-Host "`n>>> [TEST 8: PAYMENT WEBHOOK SECURITY] <<<" -ForegroundColor Yellow
# Create pending payment
$payOrder = Post-Json "$baseUrl/payments/promotion/direct" @{ planId = 1; category = "ROOM"; targetId = $roomId } $studentToken
$pCode = $payOrder.Data.code
$payOrderId = $payOrder.Data.id
$pAmount = $payOrder.Data.amount
Write-Host "1. Pending Payment Order: ID=$payOrderId, Code=$pCode, Amount=$pAmount, Status=$($payOrder.Data.status)"

# Invalid signature test
$badSig = Post-Json "$baseUrl/payments/webhook" @{ code = $pCode; paymentId = $payOrderId; amount = $pAmount; signature = "forge_sig_123" }
Write-Host "2. Webhook Bad Signature: HTTP $($badSig.StatusCode) (Expected 401 Unauthorized)"

# Valid signature test
$goodSig = Post-Json "$baseUrl/payments/webhook" @{ code = $pCode; paymentId = $payOrderId; amount = $pAmount; signature = "TEST_VALID_SIGNATURE" }
Write-Host "3. Webhook Valid Signature: HTTP $($goodSig.StatusCode) - Status=$($goodSig.Data.status), Message=$($goodSig.Data.message)"

# Replay test (idempotency)
$replaySig = Post-Json "$baseUrl/payments/webhook" @{ code = $pCode; paymentId = $payOrderId; amount = $pAmount; signature = "TEST_VALID_SIGNATURE" }
Write-Host "4. Webhook Replay (Idempotency): HTTP $($replaySig.StatusCode) - Idempotent=$($replaySig.Data.idempotent), Status=$($replaySig.Data.status)"

# Manual confirm disabled test
$manualConfirm = Post-Json "$baseUrl/admin/payments/$payOrderId/confirm" @{} $adminToken
Write-Host "5. Admin Manual Payment Confirm: HTTP $($manualConfirm.StatusCode) (Expected 400 Bad Request / Disabled)"

# ==============================================================================
# TEST 9: VOUCHER_CRUD
# ==============================================================================
Write-Host "`n>>> [TEST 9: VOUCHER_CRUD] <<<" -ForegroundColor Yellow
# 1. Admin Create Voucher
$newVoucher = @{
    partnerId = 1
    title = "Voucher Giảm 30K Trọ Xanh E2E Round 2"
    category = "RENT"
    codeMode = "SHARED_CODE"
    sharedCode = "TROXANH30"
    pointsCost = 60
    discountType = "FIXED"
    discountValue = 30000
    minOrder = 2000000
    totalStock = 50
    remainingStock = 50
    limitPerUser = 1
    status = "ACTIVE"
}
$createdV = Post-Json "$baseUrl/rewards/admin/vouchers" $newVoucher $adminToken
$vId = $createdV.Data.id
Write-Host "1. Admin Create Voucher: HTTP $($createdV.StatusCode) - ID: $vId, Title: $($createdV.Data.title)"

# 2. List Vouchers
$vList = Get-Json "$baseUrl/rewards/admin/vouchers" $adminToken
$foundV = $vList.Data | Where-Object { $_.id -eq $vId }
Write-Host "2. Admin List Vouchers: Found=$($null -ne $foundV), Code=$($foundV.sharedCode), Stock=$($foundV.remainingStock)"

# 3. Update Voucher
$updateV = Put-Json "$baseUrl/rewards/admin/vouchers/$vId" @{
    partnerId = 1
    title = "Voucher Giảm 40K Trọ Xanh E2E Round 2 (Updated)"
    discountValue = 40000
    pointsCost = 70
} $adminToken
Write-Host "3. Admin Update Voucher: HTTP $($updateV.StatusCode) - New Title: $($updateV.Data.title), New Discount: $($updateV.Data.discountValue)"

# 4. Delete Voucher
$delV = Delete-Json "$baseUrl/rewards/admin/vouchers/$vId" $adminToken
Write-Host "4. Admin Delete Voucher: HTTP $($delV.StatusCode) - Message: $($delV.Data.message)"

# ==============================================================================
# TEST 10: ADS_CRUD
# ==============================================================================
Write-Host "`n>>> [TEST 10: ADS_CRUD] <<<" -ForegroundColor Yellow
# 1. Admin Create Ad
$adBody = @{
    advertiserName = "UniHome Partners"
    campaignName = "Chiến dịch Tết 2026"
    title = "Quảng cáo Khuyến Mãi Đầu Năm E2E Round 2"
    placement = "HOME_HERO"
    bannerImage = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800"
    destinationUrl = "https://unihome.vn/promo"
    status = "ACTIVE"
    priority = 10
}
$createdAd = Post-Json "$baseUrl/admin/ads" $adBody $adminToken
$adId = $createdAd.Data.id
Write-Host "1. Admin Create Ad: HTTP $($createdAd.StatusCode) - ID: $adId, Title: $($createdAd.Data.title)"

# 2. Increment Impression
$impRes = Post-Json "$baseUrl/content/ads/$adId/impression" @{}
Write-Host "2. Ad Impression: HTTP $($impRes.StatusCode) - Impressions: $($impRes.Data.impressions)"

# 3. Increment Click
$clickRes = Post-Json "$baseUrl/content/ads/$adId/click" @{}
Write-Host "3. Ad Click: HTTP $($clickRes.StatusCode) - Clicks: $($clickRes.Data.clicks)"

# 4. Admin Delete Ad
$delAd = Delete-Json "$baseUrl/admin/ads/$adId" $adminToken
Write-Host "4. Admin Delete Ad: HTTP $($delAd.StatusCode) - Success=$($delAd.Data.success)"

# ==============================================================================
# TEST 11: SAVED_ROUNDTRIP
# ==============================================================================
Write-Host "`n>>> [TEST 11: SAVED_ROUNDTRIP] <<<" -ForegroundColor Yellow
# 1. Favorite Room
$fav1 = Post-Json "$baseUrl/listings/$roomId/favorite" @{} $studentToken
Write-Host "1. Save Listing #$roomId : HTTP $($fav1.StatusCode) - Favorite: $($fav1.Data.favorite)"

# 2. Verify in Favorites List
$favList = Get-Json "$baseUrl/listings/favorites" $studentToken
$isSaved = $favList.Data | Where-Object { $_.listingId -eq $roomId }
Write-Host "2. Check Favorites List: Found Listing #$roomId = $($null -ne $isSaved)"

# 3. Unfavorite Room
$fav2 = Post-Json "$baseUrl/listings/$roomId/favorite" @{} $studentToken
Write-Host "3. Unsave Listing #$roomId : HTTP $($fav2.StatusCode) - Favorite: $($fav2.Data.favorite)"

# 4. Verify Removed from Favorites List
$favListAfter = Get-Json "$baseUrl/listings/favorites" $studentToken
$isSavedAfter = $favListAfter.Data | Where-Object { $_.listingId -eq $roomId }
Write-Host "4. Check Favorites List After: Found Listing #$roomId = $($null -ne $isSavedAfter) (Expected: False)"

# ==============================================================================
# TEST 12: COMMUNITY_FULL_E2E
# ==============================================================================
Write-Host "`n>>> [TEST 12: COMMUNITY_FULL_E2E] <<<" -ForegroundColor Yellow
# 1. Post Community Message
$cMsg = Post-Json "$baseUrl/community/messages" @{ content = "Xin chào các bạn sinh viên! E2E verified $(Get-Date -Format 'HH:mm:ss')" } $studentToken
$cmId = $cMsg.Data.id
Write-Host "1. Post Message: HTTP $($cMsg.StatusCode) - ID: $cmId, Sender: $($cMsg.Data.senderName), Content: '$($cMsg.Data.content)'"

# 2. Get Feed
$cFeed = Get-Json "$baseUrl/community/messages" $studentToken
$foundCM = $cFeed.Data.messages | Where-Object { $_.id -eq $cmId }
Write-Host "2. Retrieve Feed: Found message #$cmId = $($null -ne $foundCM)"

# 3. Rate Limit Test (6 rapid messages)
$rateLimited = $false
for ($i = 1; $i -le 6; $i++) {
    $rapid = Post-Json "$baseUrl/community/messages" @{ content = "Rapid rate test $i" } $studentToken
    if ($rapid.StatusCode -eq 429) {
        $rateLimited = $true
        Write-Host "3. Rate Limit Triggered: HTTP 429 on request $i - $($rapid.Error)"
        break
    }
}
if (-not $rateLimited) {
    Write-Host "3. Rate limit not hit within 6 calls (window or threshold)"
}

# ==============================================================================
# TEST 13: MAP_POI & LOCATION PREFERENCES
# ==============================================================================
Write-Host "`n>>> [TEST 13: MAP_POI & LOCATION PREFERENCES] <<<" -ForegroundColor Yellow
# Update preferred location
$locBody = @{
    preferredLocationName = "Đại học Quốc gia Hà Nội, Cầu Giấy"
    preferredLat = 21.0378
    preferredLng = 105.7824
}
$locRes = Put-Json "$baseUrl/users/preferred-location" $locBody $studentToken
Write-Host "1. Update Preferred Location: HTTP $($locRes.StatusCode) - Saved Name: $($locRes.Data.preferredLocationName)"

# Verify in DB
$userPrefLoc = & $mysqlBin -u root -p"123456@123" -e "SELECT preferred_location_name, preferred_lat, preferred_lng FROM rrmsdb.users WHERE id=$($studentUser.id);" -s -N
Write-Host "2. Database Preferred Location Record: $userPrefLoc"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " ROUND 2 E2E VERIFICATION COMPLETED                             " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
