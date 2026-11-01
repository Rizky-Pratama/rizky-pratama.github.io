# watch-console-popups.ps1
#
# Catches the black CMD window that flashes and disappears.
#
# Two detection modes:
#   EVENT  (default) - subscribes to Win32_ProcessStartTrace. Real-time, catches
#                      even 20 ms windows. REQUIRES ADMINISTRATOR.
#   POLL   (-Mode Poll) - samples the process table every 250 ms. Works without
#                      admin, but can miss very short-lived windows.
#
# Usage:
#   # best results - run in an ADMIN PowerShell:
#   powershell -ExecutionPolicy Bypass -File scripts/watch-console-popups.ps1
#
#   # no admin needed (may miss ultra-short windows):
#   powershell -ExecutionPolicy Bypass -File scripts/watch-console-popups.ps1 -Mode Poll
#
#   powershell -ExecutionPolicy Bypass -File scripts/watch-console-popups.ps1 -Minutes 15
#   powershell -ExecutionPolicy Bypass -File scripts/watch-console-popups.ps1 -LogFile C:\tmp\popups.log
#   ... -All      # report every process, not just suspects
#
# Leave it running, keep working normally, and when a window flashes a record
# appears on screen and in the log file. Ctrl+C to stop and print a summary.

[CmdletBinding()]
param(
  [double]$Minutes = 0,                           # 0 = run until Ctrl+C
  [string]$LogFile = (Join-Path $env:USERPROFILE 'console-popups.log'),
  [ValidateSet('Event', 'Poll')][string]$Mode = 'Event',
  [switch]$All,                                    # report every process, not just suspects
  [switch]$ExcludeConhost                          # hide conhost.exe noise (see note below)
)

$ErrorActionPreference = 'Continue'

# conhost.exe owns every console window but always reports the same opaque
# command line ("\??\...\conhost.exe 0x4"), so on a busy box it drowns out the
# signal. Its *parent* is the real culprit though, and we still print that on
# the conhost record - so keeping conhost is useful. -ExcludeConhost hides it.
# (Named "console host", not the Windows Console Host.)

# Processes worth reporting: anything that can own a visible console window,
# plus known noisy auto-updaters seen on this machine.
$WatchNames = @(
  'cmd.exe', 'conhost.exe', 'powershell.exe', 'pwsh.exe',
  'wscript.exe', 'cscript.exe', 'mshta.exe', 'rundll32.exe',
  'node.exe', 'npm.cmd', 'npx.cmd', 'bash.exe', 'sh.exe', 'wt.exe',
  'Smadav.exe', 'SmadavSecondaryUpdater.exe', 'SMëRTP.exe', 'flyenv-helper.exe',
  'wenativehost.exe', 'opera_autoupdate.exe', 'OneDriveStandaloneUpdater.exe',
  'OneDriveLauncher.exe', 'platform_experience_helper.exe', 'OfficeC2RClient.exe',
  'sdxhelper.exe', 'Zoom.exe', 'msfeedssync.exe', 'cleanmgr.exe', 'nearby_share_launcher.exe'
)

$isAdmin = ([Security.Principal.WindowsPrincipal] `
  [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# Make sure the log directory exists.
$logDir = Split-Path -Parent $LogFile
if ($logDir -and -not (Test-Path -LiteralPath $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Auto-fall back to poll mode when not elevated, since the event class denies.
$modeNote = $Mode
if ($Mode -eq 'Event' -and -not $isAdmin) {
  $modeNote = 'Poll (auto: Event needs Administrator)'
  $Mode = 'Poll'
}

$header = @(
  '',
  '================================================================',
  ('# console-popup watch  started {0}' -f (Get-Date).ToString('s')),
  ('# host={0} user={1} admin={2} mode={3}' -f $env:COMPUTERNAME, $env:USERNAME, $isAdmin, $modeNote),
  ('# log={0}' -f $LogFile),
  ('# filter={0}' -f $(if ($All) { 'ALL processes' } else { ($WatchNames -join ', ') }))
) -join "`n"

Write-Host $header -ForegroundColor DarkGray
Add-Content -LiteralPath $LogFile -Value $header
Write-Host '[*] Listening for process creation... (Ctrl+C to stop)' -ForegroundColor Cyan

if ($Mode -eq 'Poll') {
  Write-Host '[i] Poll mode: sampling every 250 ms. Very short windows may be missed.' -ForegroundColor DarkYellow
  Write-Host '[i] For best results, close this and re-run in an ADMIN PowerShell (event mode).' -ForegroundColor DarkYellow
}

function Get-ProcInfo([int]$ProcessId) {
  if (-not $ProcessId) { return $null }
  try {
    $p = Get-CimInstance Win32_Process -Filter "ProcessId=$ProcessId" -ErrorAction Stop
    if ($p) { return [pscustomobject]@{ Name = $p.Name; CommandLine = $p.CommandLine; Parent = $p.ParentProcessId } }
  } catch { }
  return $null
}

# Query the parent first: parents outlive their children, so the parent's command
# line is far more likely to still be readable than a flash process's own.
function Get-ParentAware {
  param([int]$ProcessId, [int]$ParentProcessId)
  $parent = Get-ProcInfo $ParentProcessId
  $proc = Get-ProcInfo $ProcessId
  return [pscustomobject]@{ Proc = $proc; Parent = $parent }
}

$seen = @{}

function Report-Process {
  param([string]$Name, [int]$ProcessId, [int]$ParentProcessId)

  if (-not $All -and ($WatchNames -notcontains $Name)) { return }
  if ($ExcludeConhost -and $Name -eq 'conhost.exe') { return }

  $lookup = Get-ParentAware -ProcessId $ProcessId -ParentProcessId $ParentProcessId
  $proc = $lookup.Proc
  $parent = $lookup.Parent

  $selfCmd = if ($proc -and $proc.CommandLine) { $proc.CommandLine } else { '<unavailable>' }
  $parentName = if ($parent -and $parent.Name) { $parent.Name } else { '<gone>' }
  $parentCmd = if ($parent -and $parent.CommandLine) { $parent.CommandLine } else { '<unavailable>' }

  $ts = Get-Date
  $line = @(
    '',
    ('=== {0}  {1}  (pid {2}) ===' -f $ts.ToString('HH:mm:ss.fff'), $Name, $ProcessId),
    ('    cmd   : {0}' -f $selfCmd),
    ('    parent: {0} (pid {1})' -f $parentName, $ParentProcessId),
    ('    p.cmd : {0}' -f $parentCmd)
  ) -join "`n"

  Write-Host $line
  Add-Content -LiteralPath $LogFile -Value $line

  $key = "$Name :: $selfCmd"
  if ($seen.ContainsKey($key)) { $seen[$key]++ } else { $seen[$key] = 1 }
}

$deadline = if ($Minutes -gt 0) { (Get-Date).AddMinutes($Minutes) } else { [DateTime]::MaxValue }

try {
  if ($Mode -eq 'Event') {
    # ---- real-time event mode (requires admin) -----------------------------
    # Build a raw WMI event watcher on Win32_ProcessStartTrace. This is an
    # *intrinsic* event class: no polling interval, fired the instant a process
    # is created. A script block handler does the reporting, so there is no
    # dependency on the PowerShell event/job queue (whose Wait-Event semantics
    # differ between PS 5.1 and 7 and silently returned null here).
    try {
      $query = New-Object System.Management.WqlEventQuery('Win32_ProcessStartTrace')
      $scope = New-Object System.Management.ManagementScope('\\.\root\cimv2')
      $watcher = New-Object System.Management.ManagementEventWatcher($scope, $query)
      $watcher.Options.Timeout = [TimeSpan]::FromMilliseconds(500)
    } catch {
      Write-Host ("[!] Event watcher init failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
      throw
    }

    # Synchronous receive loop: WaitForNextEvent returns the next process-start
    # event, or throws a timeout on a quiet machine. No PowerShell event queue,
    # no subscription object (its .Id was unavailable under -SupportEvent in
    # PS 5.1 and broke cleanup). Both directions are handled by the loop.
    $watcher.Start()
    Write-Host ('[*] Event watcher started (scope {0}).' -f $scope.Path) -ForegroundColor DarkGray

    try {
      while ((Get-Date) -lt $deadline) {
        $raw = $null
        try {
          $raw = $watcher.WaitForNextEvent()
        } catch [System.Management.ManagementException] {
          # Timeout is expected on a quiet machine; keep looping.
          continue
        } catch {
          Start-Sleep -Milliseconds 200
          continue
        }
        if ($raw -and $raw.ProcessName) {
          Report-Process -Name ([string]$raw.ProcessName) `
            -ProcessId ([int]$raw.ProcessID) `
            -ParentProcessId ([int]$raw.ParentProcessID)
        }
      }
    } finally {
      try { $watcher.Stop() } catch { }
      $watcher.Dispose()
    }
  } else {
    # ---- polling mode (no admin) -------------------------------------------
    $known = @{}
    foreach ($p in (Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)) {
      $known[$p.ProcessId] = $true
    }
    while ((Get-Date) -lt $deadline) {
      $now = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue
      foreach ($p in $now) {
        if (-not $known.ContainsKey($p.ProcessId)) {
          $known[$p.ProcessId] = $true
          Report-Process -Name ([string]$p.Name) `
            -ProcessId ([int]$p.ProcessId) `
            -ParentProcessId ([int]$p.ParentProcessId)
        }
      }
      # forget dead pids so a reused pid is detected again
      if ($known.Count -gt 4000) {
        $live = @{}
        foreach ($p in $now) { $live[$p.ProcessId] = $true }
        $known = $live
      }
      Start-Sleep -Milliseconds 250
    }
  }
} finally {
  # Event mode already stopped/unregistered the watcher in its own finally.
  $total = ($seen.Values | Measure-Object -Sum).Sum
  if (-not $total) { $total = 0 }
  $summaryLines = @('', ('# stopped {0}' -f (Get-Date).ToString('s')), ('# total events: {0}' -f $total), '# repeats:')
  foreach ($k in ($seen.Keys | Sort-Object { -$seen[$_] })) {
    $summaryLines += ('  {0,4}x  {1}' -f $seen[$k], $k)
  }
  $text = $summaryLines -join "`n"
  Write-Host $text -ForegroundColor DarkGray
  Add-Content -LiteralPath $LogFile -Value $text
  Write-Host ("[+] Log written to {0}" -f $LogFile) -ForegroundColor Green
}
