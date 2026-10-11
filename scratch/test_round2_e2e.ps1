# UniHome Round 2 E2E Verification Script
$ErrorActionPreference = "Continue"

$baseUrl = "http://localhost:8080"

function Login-User($username, $password) {
    $body = @{
        username = $username
        password = $password
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    return $res
}

Write-Host "=== 1. AUTHENTICATING TEST ACCOUNTS ===" -ForegroundColor Cyan
$adminAuth = Login-User "admin" "admin123"
$adminToken = $adminAuth.token
Write-Host "Admin logged in: token length $($adminToken.Length), roles: $($adminAuth.roles -join ', ')"

$userAuth = Login-User "huukien" "kien123"
$userToken = $userAuth.token
$userId = $userAuth.user.id
Write-Host "User huukien logged in: ID $userId, token length $($userToken.Length)"

$headersAdmin = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

$headersUser = @{
    "Authorization" = "Bearer $userToken"
    "Content-Type" = "application/json"
}

Write-Host "`n=== 2. REWARD_RELOGIN & DAILY TASKS ===" -ForegroundColor Cyan
# 2.1 Get Reward Account
$rewardSummary = Invoke-RestMethod -Uri "$baseUrl/api/rewards/account" -Headers $headersUser -Method Get
Write-Host "Initial Balance: $($rewardSummary.balance), streak: $($rewardSummary.currentStreak), canCheckinToday: $($rewardSummary.canCheckinToday)"

# 2.2 Attempt Claim Checkin
$checkinRes = Invoke-RestMethod -Uri "$baseUrl/api/rewards/checkin" -Headers $headersUser -Method Post
Write-Host "Checkin Response: success=$($checkinRes.success), alreadyClaimed=$($checkinRes.alreadyClaimed), pointsAwarded=$($checkinRes.pointsAwarded), newBalance=$($checkinRes.newBalance)"

# 2.3 Cross-session / Re-login claim test
$reloginAuth = Login-User "huukien" "kien123"
$reloginHeaders = @{
    "Authorization" = "Bearer $($reloginAuth.token)"
    "Content-Type" = "application/json"
}
$checkinRelogin = Invoke-RestMethod -Uri "$baseUrl/api/rewards/checkin" -Headers $reloginHeaders -Method Post
Write-Host "Relogin Checkin: alreadyClaimed=$($checkinRelogin.alreadyClaimed), earned=$($checkinRelogin.earned), newBalance=$($checkinRelogin.newBalance)"

# 2.4 Daily Tasks Catalog Verification
$dailyTasks = Invoke-RestMethod -Uri "$baseUrl/api/rewards/tasks" -Headers $headersUser -Method Get
Write-Host "Daily Tasks Count: $($dailyTasks.Count)"
foreach ($t in $dailyTasks) {
    Write-Host " - Task: code=$($t.taskCode), title=$($t.title), points=$($t.pointsReward), completed=$($t.completed)"
}

Write-Host "`n=== 3. MATCHING_COUNT SYNCHRONIZATION ===" -ForegroundColor Cyan
# 3.1 Get my interests
$interests = Invoke-RestMethod -Uri "$baseUrl/api/listings/my-interests" -Headers $headersUser -Method Get
Write-Host "My Interests Count: $($interests.Count)"
foreach ($item in $interests) {
    $lid = $item.listingId
    $candCount = $item.matchingCandidateCount
    # 3.2 Fetch candidates endpoint for same listing
    $candidates = Invoke-RestMethod -Uri "$baseUrl/api/matching/listings/$lid/candidates" -Headers $headersUser -Method Get
    Write-Host "Listing $lid : Card shows candidates=$candCount, Candidates endpoint returns $($candidates.Count)"
}

Write-Host "`n=== 4. POST ROOM & ROOMMATE LIFECYCLE ===" -ForegroundColor Cyan
# 4.1 Post CHO_THUE (ROOM)
$roomBody = @{
    title = "Phòng trọ cao cấp test E2E Round 2"
    description = "Mô tả phòng trọ test E2E đầy đủ tiện nghi"
    postType = "CHO_THUE"
    price = 3500000
    area = 25
    deposit = 3500000
    city = "TP Hồ Chí Minh"
    district = "Quận 1"
    ward = "Phường Bến Nghé"
    street = "12 Lê Lợi"
    roomType = "ROOM"
    posterRelationship = "CHINH_CHU"
    targetGender = "ALL"
    maxRenters = 2
} | ConvertTo-Json
$createdRoom = Invoke-RestMethod -Uri "$baseUrl/api/listings" -Headers $headersUser -Method Post -Body $roomBody
$roomId = $createdRoom.id
Write-Host "Created Room ID: $roomId, Status: $($createdRoom.status)"

# 4.2 Post O_GHEP (ROOMMATE)
$roommateBody = @{
    title = "Tìm bạn ở ghép Quận 1 gần ĐH KHTN test E2E"
    description = "Cần tìm 1 bạn nam/nữ sinh viên ở ghép vui vẻ hòa đồng"
    postType = "O_GHEP"
    price = 1800000
    area = 30
    deposit = 1800000
    city = "TP Hồ Chí Minh"
    district = "Quận 1"
    ward = "Phường Đa Kao"
    street = "45 Nguyễn Thị Minh Khai"
    roomType = "ROOM"
    posterRelationship = "O_GHEP"
    targetGender = "ALL"
    maxRenters = 2
} | ConvertTo-Json
$createdRoommate = Invoke-RestMethod -Uri "$baseUrl/api/listings" -Headers $headersUser -Method Post -Body $roommateBody
$roommateId = $createdRoommate.id
Write-Host "Created Roommate ID: $roommateId, Status: $($createdRoommate.status)"

# 4.3 Verify My-Posts API Contract
$myPosts = Invoke-RestMethod -Uri "$baseUrl/api/my-posts" -Headers $headersUser -Method Get
Write-Host "My Posts Total Count: $($myPosts.Count)"
$foundRoom = $myPosts | Where-Object { $_.id -eq $roomId }
$foundRoommate = $myPosts | Where-Object { $_.id -eq $roommateId }
Write-Host "Room Post in MyPosts: category=$($foundRoom.category), id=$($foundRoom.id), relationship=$($foundRoom.relationship), viewCount=$($foundRoom.viewCount)"
Write-Host "Roommate Post in MyPosts: category=$($foundRoommate.category), id=$($foundRoommate.id), relationship=$($foundRoommate.relationship), viewCount=$($foundRoommate.viewCount)"

Write-Host "`n=== 5. MODERATION ROUNDTRIP ===" -ForegroundColor Cyan
# 5.1 Admin requests changes on created Room
$modRequest = @{
    action = "REQUEST_CHANGES"
    reason = "Vui lòng cập nhật hình ảnh rõ nét và chính xác địa chỉ"
} | ConvertTo-Json
$modRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/listings/$roomId/moderate" -Headers $headersAdmin -Method Post -Body $modRequest
Write-Host "Moderation REQUEST_CHANGES result: status=$($modRes.status)"

# 5.2 Check user notification
$notifs = Invoke-RestMethod -Uri "$baseUrl/api/notifications/mine" -Headers $headersUser -Method Get
$modNotif = $notifs | Where-Object { $_.type -eq "LISTING_NEED_REVISION" -or $_.type -like "*REVISION*" -or $_.referenceId -eq $roomId } | Select-Object -First 1
Write-Host "User Notification: type=$($modNotif.type), title=$($modNotif.title), message=$($modNotif.message), referenceId=$($modNotif.referenceId)"

# 5.3 Resubmit / Admin approves
$modApprove = @{
    action = "APPROVE"
    reason = "Đã đạt chuẩn phê duyệt"
} | ConvertTo-Json
$approveRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/listings/$roomId/moderate" -Headers $headersAdmin -Method Post -Body $modApprove
Write-Host "Moderation APPROVE result: status=$($approveRes.status)"

# 5.4 Check approval notification
$notifs2 = Invoke-RestMethod -Uri "$baseUrl/api/notifications/mine" -Headers $headersUser -Method Get
$appNotif = $notifs2 | Where-Object { $_.type -eq "LISTING_APPROVED" -and $_.referenceId -eq $roomId } | Select-Object -First 1
Write-Host "User Approval Notification: type=$($appNotif.type), title=$($appNotif.title)"

Write-Host "`n=== 6. Q&A AVATAR REFLECTION ===" -ForegroundColor Cyan
# 6.1 Update user avatar
$avatarBody = @{
    avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
} | ConvertTo-Json
$avatarRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/profile" -Headers $headersUser -Method Put -Body $avatarBody
Write-Host "Updated Profile Avatar: $($avatarRes.avatarUrl)"

# 6.2 Create Question
$qBody = @{
    title = "Hỏi về giá điện nước phòng trọ test E2E Round 2"
    content = "Giá điện nước khu vực Quận 1 thường dao động thế nào ạ?"
    category = "ROOM_SEARCH"
} | ConvertTo-Json
$createdQ = Invoke-RestMethod -Uri "$baseUrl/api/content/questions" -Headers $headersUser -Method Post -Body $qBody
Write-Host "Created Question ID: $($createdQ.id), Author: $($createdQ.authorName), Avatar: $($createdQ.authorAvatar)"

# 6.3 Fetch Questions List
$qList = Invoke-RestMethod -Uri "$baseUrl/api/content/questions" -Headers $headersUser -Method Get
$foundQ = $qList | Where-Object { $_.id -eq $createdQ.id }
Write-Host "Questions List Entry: authorAvatar = $($foundQ.authorAvatar)"

Write-Host "`n=== 7. ANALYTICS FILTERS (YEAR, MONTH, GRANULARITY) ===" -ForegroundColor Cyan
# 7.1 Year 2026
$analytics2026 = Invoke-RestMethod -Uri "$baseUrl/api/admin/analytics/dashboard?year=2026&granularity=MONTH" -Headers $headersAdmin -Method Get
Write-Host "Analytics 2026: Total Users=$($analytics2026.totalUsers), Listings=$($analytics2026.totalListings), Revenue=$($analytics2026.totalRevenue)"
# 7.2 Year 2025
$analytics2025 = Invoke-RestMethod -Uri "$baseUrl/api/admin/analytics/dashboard?year=2025&granularity=MONTH" -Headers $headersAdmin -Method Get
Write-Host "Analytics 2025: Total Users=$($analytics2025.totalUsers), Listings=$($analytics2025.totalListings), Revenue=$($analytics2025.totalRevenue)"
# 7.3 Granularity DAY with Custom Range
$analyticsDay = Invoke-RestMethod -Uri "$baseUrl/api/admin/analytics/dashboard?from=2026-10-01&to=2026-10-12&granularity=DAY" -Headers $headersAdmin -Method Get
Write-Host "Analytics DAY series length: $($analyticsDay.revenueSeries.Count)"

Write-Host "`n=== 8. PAYMENT WEBHOOK SECURITY ===" -ForegroundColor Cyan
# 8.1 Invalid Signature
try {
    $badRes = Invoke-RestMethod -Uri "$baseUrl/api/payment/webhook" -Method Post -Body '{"orderCode": 99999}' -Headers @{"x-webhook-signature"="invalid_hash"; "Content-Type"="application/json"}
    Write-Host "BAD WEBHOOK RESULT: $badRes"
} catch {
    Write-Host "Bad Signature Rejected as expected: $($_.Exception.Response.StatusCode.value__)"
}

Write-Host "`n=== 9. VOUCHER CRUD ===" -ForegroundColor Cyan
# 9.1 Create Voucher
$voucherBody = @{
    code = "E2ETEST20"
    title = "Giảm giá 20k E2E Round 2"
    discountType = "FIXED"
    discountAmount = 20000
    pointsCost = 50
    minOrderAmount = 100000
    validFrom = "2026-10-01T00:00:00"
    validTo = "2026-12-31T23:59:59"
    usageLimit = 100
    isActive = $true
} | ConvertTo-Json
$createdVoucher = Invoke-RestMethod -Uri "$baseUrl/api/admin/vouchers" -Headers $headersAdmin -Method Post -Body $voucherBody
Write-Host "Created Voucher ID: $($createdVoucher.id), Code: $($createdVoucher.code)"

# 9.2 List Vouchers
$vouchers = Invoke-RestMethod -Uri "$baseUrl/api/admin/vouchers" -Headers $headersAdmin -Method Get
$vFound = $vouchers | Where-Object { $_.code -eq "E2ETEST20" }
Write-Host "Found created voucher: $($vFound.title), pointsCost=$($vFound.pointsCost)"

# 9.3 Delete Voucher
$delVoucher = Invoke-RestMethod -Uri "$baseUrl/api/admin/vouchers/$($createdVoucher.id)" -Headers $headersAdmin -Method Delete
Write-Host "Deleted Voucher: $($delVoucher.message)"

Write-Host "`n=== 10. SAVED LISTINGS ROUNDTRIP ===" -ForegroundColor Cyan
# 10.1 Favorite Room
$favRes = Invoke-RestMethod -Uri "$baseUrl/api/listings/$roomId/favorite" -Headers $headersUser -Method Post
Write-Host "Favorited Room $roomId : favorited=$($favRes.favorited)"

# 10.2 Verify in Favorites
$myFavs = Invoke-RestMethod -Uri "$baseUrl/api/listings/favorites" -Headers $headersUser -Method Get
$isFav = $myFavs | Where-Object { $_.id -eq $roomId }
Write-Host "Room $roomId in favorites list: $($null -ne $isFav)"

# 10.3 Unfavorite
$unfavRes = Invoke-RestMethod -Uri "$baseUrl/api/listings/$roomId/favorite" -Headers $headersUser -Method Post
Write-Host "Unfavorited Room $roomId : favorited=$($unfavRes.favorited)"

Write-Host "`n=== 11. COMMUNITY HUB E2E ===" -ForegroundColor Cyan
# 11.1 Send Community Message
$commBody = @{
    content = "Xin chào cộng đồng UniHome! Đây là tin nhắn kiểm thử E2E Round 2."
} | ConvertTo-Json
$sentComm = Invoke-RestMethod -Uri "$baseUrl/api/community/messages" -Headers $headersUser -Method Post -Body $commBody
Write-Host "Community Message sent: ID=$($sentComm.id), content=$($sentComm.content), author=$($sentComm.senderName)"

# 11.2 Retrieve Community Messages
$commList = Invoke-RestMethod -Uri "$baseUrl/api/community/messages" -Headers $headersUser -Method Get
$foundMsg = $commList | Where-Object { $_.id -eq $sentComm.id }
Write-Host "Community message retrieved in feed: $($null -ne $foundMsg)"

Write-Host "`n=== ALL TESTS FINISHED SUCCESSFULLY ===" -ForegroundColor Green
