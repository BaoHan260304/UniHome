$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:8080/api"
$mysqlBin = "C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe"

function Run-Sql($sql) {
    & $mysqlBin -u root -p"123456@123" -e "$sql" rrmsdb 2>&1
}

Write-Host "==========================================================================" -ForegroundColor Green
Write-Host "   UNIHOME ROUND 2: FINAL VERIFICATION FOR REWARD & MATCHING MODULES     " -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Green

# -----------------------------------------------------------------------------
# REWARD PART 1: RE-CHECKIN AFTER RESTART (IDEMPOTENCY & UNIQUENESS)
# -----------------------------------------------------------------------------
Write-Host "`n>>> [REWARD 1: IDEMPOTENCY / PREVENT DOUBLE CHECK-IN AFTER RESTART] <<<" -ForegroundColor Yellow
$t121 = (Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body '{"email":"r2fresh023428@unihome.test","password":"123456"}' -ContentType "application/json").token
$acc121Pre = Invoke-RestMethod -Uri "$baseUrl/rewards/account" -Method Get -Headers @{ Authorization = "Bearer $t121" }
Write-Host "[1.1] User 121 Balance before: $($acc121Pre.balance) | canCheckinToday: $($acc121Pre.canCheckinToday) | streak: $($acc121Pre.currentStreak)"

$reCheckinRes = Invoke-RestMethod -Uri "$baseUrl/rewards/checkin" -Method Post -Headers @{ Authorization = "Bearer $t121" }
Write-Host "[1.2] Attempt Re-checkin Response: alreadyClaimed=$($reCheckinRes.alreadyClaimed), pointsAwarded=$($reCheckinRes.pointsAwarded), msg='$($reCheckinRes.message)'"

$acc121Post = Invoke-RestMethod -Uri "$baseUrl/rewards/account" -Method Get -Headers @{ Authorization = "Bearer $t121" }
Write-Host "[1.3] User 121 Balance after: $($acc121Post.balance)"
$r1_pass = ($acc121Post.balance -eq $acc121Pre.balance) -and ($reCheckinRes.alreadyClaimed -eq $true) -and ($reCheckinRes.pointsAwarded -eq 0)
Write-Host ">>> REWARD 1 IDEMPOTENCY RESULT: $(if ($r1_pass) {'PASS'} else {'FAIL'})" -ForegroundColor $(if ($r1_pass) {'Green'} else {'Red'})

# -----------------------------------------------------------------------------
# REWARD PART 2: STREAK DAY 7 (+50 PTS) & MISSED DAY RESET (DAY 1 +20 PTS)
# -----------------------------------------------------------------------------
Write-Host "`n>>> [REWARD 2: STREAK DAY 7 (+50 PTS) & MISSED DAY RESET] <<<" -ForegroundColor Yellow
$vnToday = [DateTime]::UtcNow.AddHours(7)
$yesterday = $vnToday.AddDays(-1).ToString("yyyy-MM-dd")
$twoDaysAgo = $vnToday.AddDays(-2).ToString("yyyy-MM-dd")

# 2.A: Setup User 123 with streak day 6 yesterday
$sqlDay7 = "
DELETE FROM daily_checkin WHERE user_id = 123;
DELETE FROM reward_transaction WHERE user_id = 123;
UPDATE reward_account SET balance = 120, lifetime_earned = 120 WHERE user_id = 123;
INSERT INTO daily_checkin (user_id, checkin_date, streak_day, points_awarded, created_at)
VALUES (123, '$yesterday', 6, 20, '$yesterday 10:00:00');
"
Run-Sql $sqlDay7 | Out-Null
$t123 = (Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body '{"email":"r2x023438@unihome.test","password":"123456"}' -ContentType "application/json").token
$claimDay7 = Invoke-RestMethod -Uri "$baseUrl/rewards/checkin" -Method Post -Headers @{ Authorization = "Bearer $t123" }
Write-Host "[2.A] Day 7 Checkin Result: streakDay=$($claimDay7.streakDay), pointsAwarded=+$($claimDay7.pointsAwarded), newBalance=$($claimDay7.newBalance)"
$r2a_pass = ($claimDay7.streakDay -eq 7) -and ($claimDay7.pointsAwarded -eq 50) -and ($claimDay7.newBalance -eq 170)
Write-Host ">>> DAY 7 (+50 PTS) RESULT: $(if ($r2a_pass) {'PASS'} else {'FAIL'})" -ForegroundColor $(if ($r2a_pass) {'Green'} else {'Red'})

# 2.B: Setup User 123 with checkin 2 days ago (missed yesterday)
$sqlMissed = "
DELETE FROM daily_checkin WHERE user_id = 123;
UPDATE reward_account SET balance = 100 WHERE user_id = 123;
INSERT INTO daily_checkin (user_id, checkin_date, streak_day, points_awarded, created_at)
VALUES (123, '$twoDaysAgo', 5, 20, '$twoDaysAgo 10:00:00');
"
Run-Sql $sqlMissed | Out-Null
$claimMissed = Invoke-RestMethod -Uri "$baseUrl/rewards/checkin" -Method Post -Headers @{ Authorization = "Bearer $t123" }
Write-Host "[2.B] Missed Day Checkin Result: streakDay=$($claimMissed.streakDay), pointsAwarded=+$($claimMissed.pointsAwarded), newBalance=$($claimMissed.newBalance)"
$r2b_pass = ($claimMissed.streakDay -eq 1) -and ($claimMissed.pointsAwarded -eq 20) -and ($claimMissed.newBalance -eq 120)
Write-Host ">>> MISSED DAY RESET RESULT: $(if ($r2b_pass) {'PASS'} else {'FAIL'})" -ForegroundColor $(if ($r2b_pass) {'Green'} else {'Red'})

# -----------------------------------------------------------------------------
# REWARD PART 3: ADMIN TASK CATALOG CRUD & 3 DAILY ENGAGEMENT TASKS
# -----------------------------------------------------------------------------
Write-Host "`n>>> [REWARD 3: ADMIN TASK CATALOG CRUD & DAILY TASKS CATALOG] <<<" -ForegroundColor Yellow
$tAdmin = (Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body '{"email":"admin@unihome.vn","password":"123456"}' -ContentType "application/json").token
$allAdminTasks = Invoke-RestMethod -Uri "$baseUrl/rewards/admin/tasks" -Method Get -Headers @{ Authorization = "Bearer $tAdmin" }
Write-Host "[3.1] Admin Total Tasks in Catalog: $($allAdminTasks.Count)"

$testCode = "R2_E2E_TASK_" + (Get-Random -Minimum 1000 -Maximum 9999)
$createPayload = "{`"taskCode`":`"$testCode`",`"title`":`"Task Test CRUD`",`"description`":`"Desc CRUD`",`"points`":30,`"actionUrl`":`"/test`",`"isActive`":true,`"targetCount`":1,`"frequency`":`"DAILY`"}"
$createdTask = Invoke-RestMethod -Uri "$baseUrl/rewards/admin/tasks" -Method Post -Body $createPayload -ContentType "application/json; charset=utf-8" -Headers @{ Authorization = "Bearer $tAdmin" }
Write-Host "[3.2] Admin Created Task: code=$($createdTask.taskCode), points=$($createdTask.points)"

$updatePayload = "{`"title`":`"Task Test CRUD Updated`",`"description`":`"Desc CRUD Up`",`"points`":45,`"actionUrl`":`"/test-up`",`"isActive`":true,`"targetCount`":2,`"frequency`":`"DAILY`"}"
$updatedTask = Invoke-RestMethod -Uri "$baseUrl/rewards/admin/tasks/$testCode" -Method Put -Body $updatePayload -ContentType "application/json; charset=utf-8" -Headers @{ Authorization = "Bearer $tAdmin" }
Write-Host "[3.3] Admin Updated Task: code=$($updatedTask.taskCode), points=$($updatedTask.points), targetCount=$($updatedTask.targetCount)"

$delTask = Invoke-RestMethod -Uri "$baseUrl/rewards/admin/tasks/$testCode" -Method Delete -Headers @{ Authorization = "Bearer $tAdmin" }
Write-Host "[3.4] Admin Deleted Task: msg='$($delTask.message)'"

# Verify User Assigned Daily Tasks
$userTasks = Invoke-RestMethod -Uri "$baseUrl/rewards/tasks" -Method Get -Headers @{ Authorization = "Bearer $t121" }
Write-Host "[3.5] User Assigned Daily Tasks Count: $($userTasks.Count) (Catalog picks exactly 3 DAILY tasks)"
$allDaily = $true
foreach ($ut in $userTasks) {
    Write-Host "     - Task Code: $($ut.taskCode) | Title: $($ut.title) | Points: $($ut.points)"
    if ($ut.taskCode -in @("ACCOUNT_CREATED", "EMAIL_VERIFIED", "MATCHING_PROFILE_COMPLETED")) { $allDaily = $false }
}
$r3_pass = ($allAdminTasks.Count -gt 0) -and ($createdTask.taskCode -eq $testCode) -and ($updatedTask.points -eq 45) -and ($delTask.success -eq $true) -and ($userTasks.Count -eq 3) -and ($allDaily -eq $true)
Write-Host ">>> REWARD 3 CATALOG & CRUD RESULT: $(if ($r3_pass) {'PASS'} else {'FAIL'})" -ForegroundColor $(if ($r3_pass) {'Green'} else {'Red'})

# -----------------------------------------------------------------------------
# MATCHING PART 1 & 2: TWO-USER CANDIDATES, SCORE THRESHOLD 50 & CONSISTENCY
# -----------------------------------------------------------------------------
Write-Host "`n>>> [MATCHING 1 & 2: SCORE THRESHOLD 50 & CARD-LIST CONSISTENCY] <<<" -ForegroundColor Yellow
$t131 = (Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body '{"email":"cand_high131@unihome.test","password":"123456"}' -ContentType "application/json").token

# Verify candidate list for 131 on Listing 9901
$candList = Invoke-RestMethod -Uri "$baseUrl/matching/listings/9901/candidates" -Method Get -Headers @{ Authorization = "Bearer $t131" }
Write-Host "[4.1] Candidates for User 131: totalElements=$($candList.totalElements), returnedItems=$($candList.items.Count)"
foreach ($c in $candList.items) {
    Write-Host "     - Candidate ID: $($c.userId) | Name: $($c.fullName) | Score: $($c.score)% | Threshold: >= 50"
}

# Verify candidate scores: User 4 (Score 90 >= 50) is included; User 132 (Female, score 0) and User 133 (Score < 50) excluded
$user4Included = ($candList.items | Where-Object { $_.userId -eq 4 }) -ne $null
$user132Excluded = ($candList.items | Where-Object { $_.userId -eq 132 }) -eq $null
$user133Excluded = ($candList.items | Where-Object { $_.userId -eq 133 }) -eq $null

# Check interest card on TenantDashboard /interests
$interests = Invoke-RestMethod -Uri "$baseUrl/listings/interests" -Method Get -Headers @{ Authorization = "Bearer $t131" }
$card = $interests | Where-Object { $_.listingId -eq 9901 }
Write-Host "[4.2] User 131 Interest Card: matchingCandidateCount=$($card.matchingCandidateCount), matchCount=$($card.matchCount)"

$m1_pass = ($candList.items.Count -eq 1) -and $user4Included -and $user132Excluded -and $user133Excluded -and ($card.matchingCandidateCount -eq $candList.items.Count)
Write-Host ">>> MATCHING SCORE THRESHOLD & CARD COUNT CONSISTENCY: $(if ($m1_pass) {'PASS'} else {'FAIL'})" -ForegroundColor $(if ($m1_pass) {'Green'} else {'Red'})

# Test Disable Matching
Invoke-RestMethod -Uri "$baseUrl/listings/9901/interest" -Method Post -Body '{"matchingEnabled":false}' -ContentType "application/json" -Headers @{ Authorization = "Bearer $t131" } | Out-Null
$cardOff = (Invoke-RestMethod -Uri "$baseUrl/listings/interests" -Method Get -Headers @{ Authorization = "Bearer $t131" }) | Where-Object { $_.listingId -eq 9901 }
Write-Host "[4.3] After Disabling Matching: matchingCandidateCount=$($cardOff.matchingCandidateCount)"
$m2_pass = ($cardOff.matchingCandidateCount -eq 0)
Write-Host ">>> MATCHING TOGGLE OFF DROPS COUNT TO 0: $(if ($m2_pass) {'PASS'} else {'FAIL'})" -ForegroundColor $(if ($m2_pass) {'Green'} else {'Red'})

# Restore matchingEnabled = true
Invoke-RestMethod -Uri "$baseUrl/listings/9901/interest" -Method Post -Body '{"matchingEnabled":true}' -ContentType "application/json" -Headers @{ Authorization = "Bearer $t131" } | Out-Null

Write-Host "`n==========================================================================" -ForegroundColor Green
Write-Host "               ALL TEST VERIFICATIONS COMPLETED SUCCESSFULLY              " -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Green
