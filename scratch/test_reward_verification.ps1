$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:8080/api"
$mysqlBin = "C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe"

function Run-Sql($sql) {
    & $mysqlBin -u root -p"123456@123" -e "$sql" rrmsdb 2>&1
}

Write-Host "=== TEST 1: RESTART BACKEND RE-CHECKIN IDEMPOTENCY ===" -ForegroundColor Cyan
# Login user 121 (already claimed today in previous test)
$login121 = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body '{"email":"r2fresh023428@unihome.test","password":"Password123!"}' -ContentType "application/json"
$t121 = $login121.token
$acc121 = Invoke-RestMethod -Uri "$baseUrl/rewards/account" -Method Get -Headers @{ Authorization = "Bearer $t121" }
Write-Host "User 121 before re-checkin: balance=$($acc121.balance), canCheckin=$($acc121.canCheckinToday), streak=$($acc121.currentStreak)"

$claim121 = Invoke-RestMethod -Uri "$baseUrl/rewards/checkin" -Method Post -Headers @{ Authorization = "Bearer $t121" }
Write-Host "User 121 re-checkin response: alreadyClaimed=$($claim121.alreadyClaimed), pointsAwarded=$($claim121.pointsAwarded), newBalance=$($claim121.newBalance), msg=$($claim121.message)"

$acc121After = Invoke-RestMethod -Uri "$baseUrl/rewards/account" -Method Get -Headers @{ Authorization = "Bearer $t121" }
Write-Host "User 121 after re-checkin: balance=$($acc121After.balance) (Unchanged: $($acc121After.balance -eq $acc121.balance))"

Write-Host "`n=== TEST 2: STREAK DAY 7 (+50 PTS) & MISSED DAY RESET ===" -ForegroundColor Cyan
# Ensure test user 123 has account and password set
$now = [DateTime]::UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
$yesterday = [DateTime]::UtcNow.AddDays(-1).ToString("yyyy-MM-dd")
$twoDaysAgo = [DateTime]::UtcNow.AddDays(-2).ToString("yyyy-MM-dd")

# Register or reset password for user 123
$resetSql = "
DELETE FROM daily_checkin WHERE user_id = 123;
DELETE FROM reward_transaction WHERE user_id = 123;
INSERT INTO reward_account (user_id, balance, lifetime_earned, lifetime_spent, updated_at) 
VALUES (123, 120, 120, 0, NOW()) 
ON DUPLICATE KEY UPDATE balance = 120, lifetime_earned = 120;
-- Fixture: yesterday checkin with streak_day = 6
INSERT INTO daily_checkin (user_id, checkin_date, streak_day, points_awarded, created_at)
VALUES (123, '$yesterday', 6, 20, '$yesterday 10:00:00');
"
Run-Sql $resetSql | Out-Null

$login123 = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body '{"email":"r2x023438@unihome.test","password":"Password123!"}' -ContentType "application/json"
$t123 = $login123.token

$acc123 = Invoke-RestMethod -Uri "$baseUrl/rewards/account" -Method Get -Headers @{ Authorization = "Bearer $t123" }
Write-Host "User 123 (streak day 6 yesterday): balance=$($acc123.balance), currentStreak=$($acc123.currentStreak), nextStreakDay=$($acc123.streakDay)"

$claim123Day7 = Invoke-RestMethod -Uri "$baseUrl/rewards/checkin" -Method Post -Headers @{ Authorization = "Bearer $t123" }
Write-Host "User 123 Day 7 checkin result: streakDay=$($claim123Day7.streakDay), pointsAwarded=+$($claim123Day7.pointsAwarded), newBalance=$($claim123Day7.newBalance)"
Write-Host "Day 7 +50 Points verified: $($claim123Day7.streakDay -eq 7 -and $claim123Day7.pointsAwarded -eq 50 -and $claim123Day7.newBalance -eq 170)"

# Now test missed day streak reset
# Setup user 123 with checkin 2 days ago (yesterday missed)
$missedSql = "
DELETE FROM daily_checkin WHERE user_id = 123;
UPDATE reward_account SET balance = 100 WHERE user_id = 123;
-- Fixture: 2 days ago checkin with streak_day = 5 (yesterday missed!)
INSERT INTO daily_checkin (user_id, checkin_date, streak_day, points_awarded, created_at)
VALUES (123, '$twoDaysAgo', 5, 20, '$twoDaysAgo 10:00:00');
"
Run-Sql $missedSql | Out-Null

$claim123Reset = Invoke-RestMethod -Uri "$baseUrl/rewards/checkin" -Method Post -Headers @{ Authorization = "Bearer $t123" }
Write-Host "User 123 Missed Day checkin result: streakDay=$($claim123Reset.streakDay), pointsAwarded=+$($claim123Reset.pointsAwarded), newBalance=$($claim123Reset.newBalance)"
Write-Host "Streak reset to Day 1 (+20 pts) verified: $($claim123Reset.streakDay -eq 1 -and $claim123Reset.pointsAwarded -eq 20 -and $claim123Reset.newBalance -eq 120)"

Write-Host "`n=== TEST 3: ADMIN TASK CATALOG CRUD & DAILY ENGAGEMENT TASKS ===" -ForegroundColor Cyan
$loginAdmin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body '{"email":"admin@unihome.vn","password":"123456"}' -ContentType "application/json"
$tAdmin = $loginAdmin.token

# Admin list tasks
$allTasks = Invoke-RestMethod -Uri "$baseUrl/rewards/admin/tasks" -Method Get -Headers @{ Authorization = "Bearer $tAdmin" }
Write-Host "Admin total tasks in catalog: $($allTasks.Count)"

# Create new task
$testTaskCode = "TEST_DAILY_TASK_" + (Get-Random -Minimum 1000 -Maximum 9999)
$newTaskBody = @{
    taskCode = $testTaskCode
    title = "Nhiệm vụ kiểm thử E2E"
    description = "Mô tả kiểm thử E2E Round 2"
    points = 25
    actionUrl = "/test"
    isActive = $true
    targetCount = 1
    frequency = "DAILY"
    minDurationSeconds = 15
    eventType = "TEST_EVENT"
} | ConvertTo-Json
$createTask = Invoke-RestMethod -Uri "$baseUrl/rewards/admin/tasks" -Method Post -Body $newTaskBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $tAdmin" }
Write-Host "Created admin task: code=$($createTask.taskCode), points=$($createTask.points), freq=$($createTask.frequency)"

# Update task
$updateBody = @{
    title = "Nhiệm vụ kiểm thử E2E Updated"
    description = "Mô tả kiểm thử updated"
    points = 35
    actionUrl = "/test-updated"
    isActive = $true
    targetCount = 2
    frequency = "DAILY"
    minDurationSeconds = 20
    eventType = "TEST_EVENT_UPDATED"
} | ConvertTo-Json
$updateTask = Invoke-RestMethod -Uri "$baseUrl/rewards/admin/tasks/$testTaskCode" -Method Put -Body $updateBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $tAdmin" }
Write-Host "Updated admin task: code=$($updateTask.taskCode), points=$($updateTask.points), targetCount=$($updateTask.targetCount)"

# Delete task
$delTask = Invoke-RestMethod -Uri "$baseUrl/rewards/admin/tasks/$testTaskCode" -Method Delete -Headers @{ Authorization = "Bearer $tAdmin" }
Write-Host "Deleted admin task: msg=$($delTask.message)"

# Verify user daily tasks assignment: exactly 3 DAILY engagement tasks
$userTasks = Invoke-RestMethod -Uri "$baseUrl/rewards/tasks" -Method Get -Headers @{ Authorization = "Bearer $t121" }
Write-Host "User 121 assigned daily tasks count: $($userTasks.Count)"
foreach ($ut in $userTasks) {
    Write-Host " - Task: $($ut.taskCode) | $($ut.title) | points=$($ut.points) | progress=$($ut.progress)/$($ut.targetCount)"
}

