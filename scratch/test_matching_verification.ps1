$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:8080/api"
$mysqlBin = "C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe"

function Run-Sql($sql) {
    & $mysqlBin -u root -p"123456@123" -e "$sql" rrmsdb 2>&1
}

# 1. Setup Property and Listing owned by User 130
$setupSql = "
INSERT INTO property (id, landlord_id, name, address, province, district, ward, street, latitude, longitude, price, area, deposit, property_type, post_type, availability, status)
VALUES (9901, 130, 'Phòng Trọ E2E Matching Room', 'Khu phố 6 Linh Trung', 'Hồ Chí Minh', 'Thủ Đức', 'Linh Trung', 'Đường 10', 10.8700, 106.8030, 3000000, 25, 3000000, 'Phòng trọ', 'ROOM_FOR_RENT', 'AVAILABLE', 'ACTIVE')
ON DUPLICATE KEY UPDATE landlord_id = 130, availability = 'AVAILABLE', status = 'ACTIVE';

INSERT INTO listing (id, property_id, landlord_id, title, status, interest_count, package_tier)
VALUES (9901, 9901, 130, 'Phòng Trọ E2E Matching Room', 'ACTIVE', 0, 'STANDARD')
ON DUPLICATE KEY UPDATE landlord_id = 130, status = 'ACTIVE', interest_count = 0;

DELETE FROM listing_interest WHERE listing_id = 9901;

-- Setup Matching Profiles
-- User 130 (Male, Student, Enabled)
INSERT INTO matching_profile (user_id, gender, school_name, enabled, budget_min, budget_max, sleep_schedule, cleanliness_level, smoking, noise_preference, pets, guest_frequency, cooking, expense_style, communication_style, latitude, longitude, radius_km, facebook_url, zalo_url)
VALUES (130, 'Nam', 'ĐHQG TP.HCM', 1, 2000000, 3500000, '23h-0h', 4, 'Không', 'Yên tĩnh', 'Không', 'Hiếm khi', 'Thỉnh thoảng', 'Chia đều', 'Hòa đồng', 10.8700, 106.8030, 5, 'https://fb.com/user130', '0901234567')
ON DUPLICATE KEY UPDATE gender = 'Nam', enabled = 1, budget_min = 2000000, budget_max = 3500000, sleep_schedule = '23h-0h', cleanliness_level = 4, smoking = 'Không', noise_preference = 'Yên tĩnh', pets = 'Không', guest_frequency = 'Hiếm khi', cooking = 'Thỉnh thoảng', expense_style = 'Chia đều', communication_style = 'Hòa đồng';

-- Candidate 131 (High score candidate: Male, same habits -> score >= 80)
INSERT INTO matching_profile (user_id, gender, school_name, enabled, budget_min, budget_max, sleep_schedule, cleanliness_level, smoking, noise_preference, pets, guest_frequency, cooking, expense_style, communication_style, latitude, longitude, radius_km, facebook_url, zalo_url)
VALUES (131, 'Nam', 'ĐHQG TP.HCM', 1, 2000000, 3500000, '23h-0h', 4, 'Không', 'Yên tĩnh', 'Không', 'Hiếm khi', 'Thỉnh thoảng', 'Chia đều', 'Hòa đồng', 10.8700, 106.8030, 5, 'https://fb.com/user131', '0901234568')
ON DUPLICATE KEY UPDATE gender = 'Nam', enabled = 1, budget_min = 2000000, budget_max = 3500000, sleep_schedule = '23h-0h', cleanliness_level = 4, smoking = 'Không', noise_preference = 'Yên tĩnh', pets = 'Không', guest_frequency = 'Hiếm khi', cooking = 'Thỉnh thoảng', expense_style = 'Chia đều', communication_style = 'Hòa đồng';

-- Candidate 132 (Low score / ineligible candidate: Female -> score 0 < threshold 50)
INSERT INTO matching_profile (user_id, gender, school_name, enabled, budget_min, budget_max, sleep_schedule, cleanliness_level, smoking, noise_preference, pets, guest_frequency, cooking, expense_style, communication_style, latitude, longitude, radius_km, facebook_url, zalo_url)
VALUES (132, 'Nữ', 'ĐHQG TP.HCM', 1, 5000000, 8000000, 'Sau 1h', 1, 'Có', 'Thích tiệc', 'Có', 'Thường xuyên', 'Không', 'Tự túc', 'Kín đáo', 10.8700, 106.8030, 5, 'https://fb.com/user132', '0901234569')
ON DUPLICATE KEY UPDATE gender = 'Nữ', enabled = 1, budget_min = 5000000, budget_max = 8000000, sleep_schedule = 'Sau 1h', cleanliness_level = 1, smoking = 'Có', noise_preference = 'Thích tiệc', pets = 'Có', guest_frequency = 'Thường xuyên', cooking = 'Không', expense_style = 'Tự túc', communication_style = 'Kín đáo';
"
Run-Sql $setupSql | Out-Null
Write-Host "Fixture database setup completed for Listing 9901 and Users 130, 131, 132." -ForegroundColor Green

# 2. Login User 130 (Owner), User 131 (High Candidate), User 132 (Low Candidate)
$l130 = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body '{"email":"landlord130@unihome.test","password":"123456"}' -ContentType "application/json"
$t130 = $l130.token

$l131 = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body '{"email":"cand_high131@unihome.test","password":"123456"}' -ContentType "application/json"
$t131 = $l131.token

$l132 = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body '{"email":"cand_low132@unihome.test","password":"123456"}' -ContentType "application/json"
$t132 = $l132.token

# Both candidates express interest in Listing 9901 with matchingEnabled = true
$int131 = Invoke-RestMethod -Uri "$baseUrl/listings/9901/interest" -Method Post -Body '{"matchingEnabled":true}' -ContentType "application/json" -Headers @{ Authorization = "Bearer $t131" }
Write-Host "Candidate 131 expressed interest: matchingEnabled=$($int131.matchingEnabled)"

$int132 = Invoke-RestMethod -Uri "$baseUrl/listings/9901/interest" -Method Post -Body '{"matchingEnabled":true}' -ContentType "application/json" -Headers @{ Authorization = "Bearer $t132" }
Write-Host "Candidate 132 expressed interest: matchingEnabled=$($int132.matchingEnabled)"

# Query candidates from perspective of Candidate 131
$cand131Res = Invoke-RestMethod -Uri "$baseUrl/matching/listings/9901/candidates" -Method Get -Headers @{ Authorization = "Bearer $t131" }
Write-Host "Candidates for User 131: totalElements=$($cand131Res.totalElements), itemsCount=$($cand131Res.items.Count)"
foreach ($item in $cand131Res.items) {
    Write-Host " - Found Candidate: userId=$($item.userId), name=$($item.fullName), score=$($item.score)"
}

# Also verify User 130 (Owner) cannot match themselves
$cand130Res = Invoke-RestMethod -Uri "$baseUrl/matching/listings/9901/candidates" -Method Get -Headers @{ Authorization = "Bearer $t130" }
Write-Host "Candidates for User 130: totalElements=$($cand130Res.totalElements)"

# Verify Candidate 131's my-interests card count
$myInterests131 = Invoke-RestMethod -Uri "$baseUrl/listings/interests" -Method Get -Headers @{ Authorization = "Bearer $t131" }
$card131 = $myInterests131 | Where-Object { $_.listingId -eq 9901 }
Write-Host "Candidate 131 Interest Card: matchingCandidateCount=$($card131.matchingCandidateCount), matchCount=$($card131.matchCount)"
Write-Host "MATCHING CARD COUNT == CANDIDATE LIST COUNT: $($card131.matchingCandidateCount -eq $cand131Res.items.Count)"

# Test when Candidate 131 toggles matchingEnabled = false
Invoke-RestMethod -Uri "$baseUrl/listings/9901/interest" -Method Post -Body '{"matchingEnabled":false}' -ContentType "application/json" -Headers @{ Authorization = "Bearer $t131" } | Out-Null
$myInterests131Off = Invoke-RestMethod -Uri "$baseUrl/listings/interests" -Method Get -Headers @{ Authorization = "Bearer $t131" }
$card131Off = $myInterests131Off | Where-Object { $_.listingId -eq 9901 }
Write-Host "Candidate 131 Interest Card (Disabled): matchingEnabled=$($card131Off.matchingEnabled), matchingCandidateCount=$($card131Off.matchingCandidateCount)"
Write-Host "MATCHING CARD COUNT DROPS TO 0 ON DISABLE: $($card131Off.matchingCandidateCount -eq 0)"
