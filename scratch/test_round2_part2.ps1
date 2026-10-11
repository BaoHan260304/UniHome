$ErrorActionPreference = "Continue"
$b = "http://localhost:8080/api"
function Call($m, $u, $body = $null, $t = $null) {
    $h = @{}; if ($t) { $h["Authorization"] = "Bearer $t" }
    try {
        if ($body -ne $null) {
            $j = [Text.Encoding]::UTF8.GetBytes(($body | ConvertTo-Json -Depth 8))
            $r = Invoke-RestMethod -Uri $u -Method $m -Body $j -ContentType "application/json; charset=utf-8" -Headers $h
        } else { $r = Invoke-RestMethod -Uri $u -Method $m -Headers $h }
        return @{ S = 200; D = $r }
    } catch {
        $s = $_.Exception.Response.StatusCode.value__
        $rd = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
        return @{ S = $s; E = $rd.ReadToEnd() }
    }
}
$stamp = Get-Date -Format "HHmmss"
$email = 'r2fresh023428@unihome.test'
$reg = Call Post "$b/auth/register" @{ fullName = "R2 Fresh $stamp"; email = $email; password = "Passw0rd!23"; phone = "09$stamp" + "11"; confirmPassword = "Passw0rd!23"; agreeTerms = $true; verifyMethod = "EMAIL" }
Write-Host "REGISTER: HTTP $($reg.S) $($reg.E)"
$lg = Call Post "$b/auth/login" @{ email = $email; password = "Passw0rd!23" }
Write-Host "LOGIN fresh: HTTP $($lg.S) $($lg.E)"
$t = $lg.D.token
if ($t) {
    $a0 = Call Get "$b/rewards/account" $null $t
    Write-Host "balance before: $($a0.D.balance)"
    $c1 = Call Post "$b/rewards/checkin" @{} $t
    Write-Host "claim1: HTTP $($c1.S) $($c1.D | ConvertTo-Json -Compress)"
    $lg2 = Call Post "$b/auth/login" @{ email = $email; password = "Passw0rd!23" }
    $c2 = Call Post "$b/rewards/checkin" @{} $lg2.D.token
    Write-Host "claim2 (relogin): HTTP $($c2.S) earned=$($c2.D.earned) newBalance=$($c2.D.newBalance)"
    $tasksA = Call Get "$b/rewards/tasks" $null $t
    $tasksB = Call Get "$b/rewards/tasks" $null $lg2.D.token
    Write-Host "tasks first login : $(($tasksA.D | % { $_.taskCode }) -join ',')"
    Write-Host "tasks after relogin: $(($tasksB.D | % { $_.taskCode }) -join ',')"
}
# concurrency: second fresh user, 2 parallel check-ins
$email2 = 'r2conc023428@unihome.test'
$null = Call Post "$b/auth/register" @{ fullName = "R2 Conc $stamp"; email = $email2; password = "Passw0rd!23"; phone = "08$stamp" + "22"; confirmPassword = "Passw0rd!23"; agreeTerms = $true; verifyMethod = "EMAIL" }
$lg3 = Call Post "$b/auth/login" @{ email = $email2; password = "Passw0rd!23" }
$t3 = $lg3.D.token
if ($t3) {
    $jobs = 1..2 | % { Start-Job -ArgumentList $t3 -ScriptBlock { param($tk) try { (Invoke-RestMethod -Uri "http://localhost:8080/api/rewards/checkin" -Method Post -Headers @{Authorization = "Bearer $tk" } -Body "{}" -ContentType "application/json") | ConvertTo-Json -Compress } catch { "ERR " + $_.Exception.Message } } }
    $jobs | Wait-Job | Receive-Job | % { Write-Host "parallel: $_" }
    $a3 = Call Get "$b/rewards/account" $null $t3
    Write-Host "concurrent final balance: $($a3.D.balance) (expect 20)"
}
# rate limit status
$st = Call Post "$b/auth/login" @{ email = "student@unihome.vn"; password = "123456" }
$codes = @()
1..8 | % { $r = Call Post "$b/community/messages" @{ content = "rl $_" } $st.D.token; $codes += $r.S }
Write-Host "community rate-limit statuses: $($codes -join ',')"


