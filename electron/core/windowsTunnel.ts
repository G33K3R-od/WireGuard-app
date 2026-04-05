import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { VpnProfile } from "../shared/types";
import { RuntimeErrorCode, runtimeError } from "../shared/runtimeErrorCodes";

const execFileAsync = promisify(execFile);

function psQuote(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

function endpointHost(endpoint: string): string {
  const v = endpoint.trim();
  if (v.startsWith("[")) {
    const end = v.indexOf("]");
    if (end > 1) {
      return v.slice(1, end);
    }
    return v;
  }
  const idx = v.lastIndexOf(":");
  if (idx > 0) {
    return v.slice(0, idx);
  }
  return v;
}

/**
 * Assign tunnel IP, AllowedIPs routes, and optional DNS on the Wintun adapter.
 * Adding default routes (0.0.0.0/0, ::/0) usually requires an elevated process.
 * Returns PowerShell diagnostic text (stdout) for logs.
 */
export async function configureWireGuardTunnelWindows(iface: string, profile: VpnProfile): Promise<string> {
  const firstAddr = profile.address.split(",")[0].trim();
  const dns = profile.dns?.trim();
  const epHost = endpointHost(profile.endpoint);

  const allowed = profile.allowedIps
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const allowedPs = allowed.map((a) => psQuote(a)).join(",");
  const dnsPs = dns ? psQuote(dns) : "";

  const script = `
$ErrorActionPreference = 'Stop'
$base = ${psQuote(iface)}
$addr = ${psQuote(firstAddr)}
$endpointHost = ${psQuote(epHost)}
Start-Sleep -Milliseconds 800
$na = $null
$deadline = (Get-Date).AddSeconds(35)
while ($null -eq $na -and (Get-Date) -lt $deadline) {
  $candidates = @(Get-NetAdapter -ErrorAction SilentlyContinue | Where-Object {
    ($_.Name -eq $base) -or ($_.Name -like ($base + ' *'))
  })
  if ($candidates.Count -eq 0) {
    Start-Sleep -Milliseconds 250
    continue
  }
  $wintun = @($candidates | Where-Object { $_.InterfaceDescription -match 'Wintun' })
  if ($wintun.Count -gt 0) { $candidates = $wintun }
  $exact = $candidates | Where-Object { $_.Name -eq $base } | Select-Object -First 1
  if ($exact) { $na = $exact; break }
  $upOnly = @($candidates | Where-Object { $_.Status -eq 'Up' })
  if ($upOnly.Count -eq 1) { $na = $upOnly[0]; break }
  if ($upOnly.Count -gt 1) { $na = $upOnly | Sort-Object -Property ifIndex -Descending | Select-Object -First 1; break }
  if ($candidates.Count -eq 1) { $na = $candidates[0]; break }
  $na = $candidates | Sort-Object -Property ifIndex -Descending | Select-Object -First 1
  break
}
if ($null -eq $na) {
  throw "Адаптер Wintun не найден в NetAdapter как '$base' / '$base *' (описание Wintun)."
}
$iface = $na.Name
Get-NetIPAddress -InterfaceAlias $iface -ErrorAction SilentlyContinue | Remove-NetIPAddress -Confirm:$false -ErrorAction SilentlyContinue
$parts = $addr -split '/', 2
$ip = $parts[0]
$prefix = if ($parts.Length -gt 1) { [int]$parts[1] } else { 32 }
$family = if ($ip -match ':') { 'IPv6' } else { 'IPv4' }
New-NetIPAddress -InterfaceAlias $iface -IPAddress $ip -PrefixLength $prefix -AddressFamily $family -ErrorAction Stop
Set-NetIPInterface -InterfaceAlias $iface -AddressFamily IPv4 -InterfaceMetric 0 -ErrorAction Stop
Set-NetIPInterface -InterfaceAlias $iface -AddressFamily IPv6 -InterfaceMetric 0 -ErrorAction SilentlyContinue
Set-NetIPInterface -InterfaceAlias $iface -NlMtuBytes 1420 -ErrorAction SilentlyContinue

try {
  $ep = Resolve-DnsName -Name $endpointHost -Type A,AAAA -ErrorAction Stop |
    Where-Object { $_.IPAddress } |
    Select-Object -ExpandProperty IPAddress -Unique
} catch {
  $ep = @($endpointHost)
}
foreach ($ipTarget in @($ep)) {
  if ($ipTarget -match ':') {
    $def6 = Get-NetRoute -DestinationPrefix '::/0' -ErrorAction SilentlyContinue |
      Where-Object { $_.InterfaceAlias -ne $iface -and $_.NextHop -ne '::' } |
      Sort-Object RouteMetric, InterfaceMetric |
      Select-Object -First 1
    if ($def6) {
      Remove-NetRoute -DestinationPrefix ($ipTarget + '/128') -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
      New-NetRoute -DestinationPrefix ($ipTarget + '/128') -NextHop $def6.NextHop -InterfaceIndex $def6.InterfaceIndex -RouteMetric 0 -ErrorAction SilentlyContinue | Out-Null
    }
  } else {
    $def4 = Get-NetRoute -DestinationPrefix '0.0.0.0/0' -ErrorAction SilentlyContinue |
      Where-Object { $_.InterfaceAlias -ne $iface -and $_.NextHop -ne '0.0.0.0' } |
      Sort-Object RouteMetric, InterfaceMetric |
      Select-Object -First 1
    if ($def4) {
      Remove-NetRoute -DestinationPrefix ($ipTarget + '/32') -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
      New-NetRoute -DestinationPrefix ($ipTarget + '/32') -NextHop $def4.NextHop -InterfaceIndex $def4.InterfaceIndex -RouteMetric 0 -ErrorAction SilentlyContinue | Out-Null
    }
  }
}

$allowed = @(${allowedPs})
foreach ($cidr in $allowed) {
  Remove-NetRoute -DestinationPrefix $cidr -InterfaceAlias $iface -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
  $m = if ($cidr -eq '0.0.0.0/0' -or $cidr -eq '::/0') { 0 } else { 5 }
  try {
    if ($cidr -eq '0.0.0.0/0') {
      Remove-NetRoute -DestinationPrefix '0.0.0.0/1' -InterfaceAlias $iface -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
      Remove-NetRoute -DestinationPrefix '128.0.0.0/1' -InterfaceAlias $iface -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
      New-NetRoute -DestinationPrefix '0.0.0.0/1' -InterfaceAlias $iface -NextHop 0.0.0.0 -RouteMetric $m -ErrorAction Stop | Out-Null
      New-NetRoute -DestinationPrefix '128.0.0.0/1' -InterfaceAlias $iface -NextHop 0.0.0.0 -RouteMetric $m -ErrorAction Stop | Out-Null
    } elseif ($cidr -eq '::/0') {
      Remove-NetRoute -DestinationPrefix '::/1' -InterfaceAlias $iface -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
      Remove-NetRoute -DestinationPrefix '8000::/1' -InterfaceAlias $iface -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
      New-NetRoute -DestinationPrefix '::/1' -InterfaceAlias $iface -NextHop :: -RouteMetric $m -ErrorAction Stop | Out-Null
      New-NetRoute -DestinationPrefix '8000::/1' -InterfaceAlias $iface -NextHop :: -RouteMetric $m -ErrorAction Stop | Out-Null
    } elseif ($cidr -match ':') {
      New-NetRoute -DestinationPrefix $cidr -InterfaceAlias $iface -NextHop :: -RouteMetric $m -ErrorAction Stop | Out-Null
    } else {
      New-NetRoute -DestinationPrefix $cidr -InterfaceAlias $iface -NextHop 0.0.0.0 -RouteMetric $m -ErrorAction Stop | Out-Null
    }
  } catch {
    if ($_.Exception.Message -match 'already exists|уже существует|System Error 87') {
      continue
    }
    if ($cidr -eq '::/0') {
      Write-Warning "IPv6 default route ::/0 skipped: $_"
    } else {
      throw
    }
  }
}
if (${dnsPs ? "1" : "0"} -eq 1) {
  $dns = ${dnsPs} -split '[,\\s]+' | Where-Object { $_ }
  Set-DnsClientServerAddress -InterfaceAlias $iface -ServerAddresses $dns -ErrorAction Stop
}
ipconfig /flushdns | Out-Null
Write-Output '--- WirePN: выбран адаптер ---'
Write-Output ($na | Format-List Name, InterfaceDescription, Status, ifIndex | Out-String)
Write-Output '--- Маршруты на интерфейсе туннеля ---'
Get-NetRoute -InterfaceAlias $iface -ErrorAction SilentlyContinue |
  Select-Object DestinationPrefix, NextHop, RouteMetric, InterfaceAlias |
  Format-Table -AutoSize | Out-String
Write-Output '--- Все default routes (0.0.0.0/0 и ::/0) ---'
Get-NetRoute -DestinationPrefix '0.0.0.0/0','::/0' -ErrorAction SilentlyContinue |
  Select-Object DestinationPrefix, NextHop, RouteMetric, InterfaceAlias |
  Format-Table -AutoSize | Out-String
Write-Output '--- Endpoint bypass routes (/32,/128) ---'
Get-NetRoute -ErrorAction SilentlyContinue |
  Where-Object {
    $_.DestinationPrefix -match '/32$|/128$' -and
    ($_.DestinationPrefix -like ($endpointHost + '/*'))
  } |
  Select-Object DestinationPrefix, NextHop, RouteMetric, InterfaceAlias |
  Format-Table -AutoSize | Out-String
Write-Output '--- Split-default routes (/1) ---'
Get-NetRoute -DestinationPrefix '0.0.0.0/1','128.0.0.0/1','::/1','8000::/1' -ErrorAction SilentlyContinue |
  Select-Object DestinationPrefix, NextHop, RouteMetric, InterfaceAlias |
  Format-Table -AutoSize | Out-String
`.trim();

  try {
    const { stdout, stderr } = await execFileAsync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
      windowsHide: true,
      encoding: "utf-8"
    });
    return [stdout, stderr].filter(Boolean).join("\n").trim();
  } catch (e: unknown) {
    const err = e as NodeJS.ErrnoException & { stderr?: string; stdout?: string; status?: number };
    const detail = [err.stderr, err.stdout, err.message].filter(Boolean).join("\n");
    if (/Access is denied|Отказано в доступе|0x80070005|denied/i.test(detail)) {
      throw runtimeError(RuntimeErrorCode.TUNNEL_ROUTE_DENIED, detail);
    }
    if (/already exists|уже существует|MSFT_NetRoute already exists|System Error 87/i.test(detail)) {
      throw runtimeError(RuntimeErrorCode.TUNNEL_ROUTE_DUPLICATE, detail);
    }
    if (/Element not found|1168|не найден/i.test(detail)) {
      throw runtimeError(RuntimeErrorCode.TUNNEL_ADAPTER_NOT_FOUND, detail);
    }
    throw runtimeError(RuntimeErrorCode.TUNNEL_POWERSHELL_FAILED, detail || String(e));
  }
}

/**
 * Best-effort cleanup for Wintun interface: remove tunnel IP/routes and restore DNS auto mode.
 * This is intentionally tolerant to missing objects during disconnect.
 */
export async function cleanupWireGuardTunnelWindows(iface: string, profile?: VpnProfile): Promise<string> {
  const epHost = profile ? endpointHost(profile.endpoint) : "";
  const script = `
$ErrorActionPreference = 'Stop'
$base = ${psQuote(iface)}
$endpointHost = ${psQuote(epHost)}
$targets = @(Get-NetAdapter -ErrorAction SilentlyContinue | Where-Object {
  ($_.Name -eq $base) -or ($_.Name -like ($base + ' *'))
})
if ($targets.Count -eq 0) {
  Write-Output 'WirePN cleanup: Wintun adapter not found, nothing to clean.'
  return
}
foreach ($na in $targets) {
  $ifn = $na.Name
  Get-NetRoute -InterfaceAlias $ifn -ErrorAction SilentlyContinue | Remove-NetRoute -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
  Get-NetIPAddress -InterfaceAlias $ifn -ErrorAction SilentlyContinue | Remove-NetIPAddress -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
  Set-DnsClientServerAddress -InterfaceAlias $ifn -ResetServerAddresses -ErrorAction SilentlyContinue | Out-Null
}
if ($endpointHost) {
  try {
    $ep = Resolve-DnsName -Name $endpointHost -Type A,AAAA -ErrorAction Stop |
      Where-Object { $_.IPAddress } |
      Select-Object -ExpandProperty IPAddress -Unique
  } catch {
    $ep = @($endpointHost)
  }
  foreach ($ipTarget in @($ep)) {
    if ($ipTarget -match ':') {
      Remove-NetRoute -DestinationPrefix ($ipTarget + '/128') -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
    } else {
      Remove-NetRoute -DestinationPrefix ($ipTarget + '/32') -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
    }
  }
}
Write-Output 'WirePN cleanup: done.'
`.trim();

  try {
    const { stdout, stderr } = await execFileAsync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
      windowsHide: true,
      encoding: "utf-8"
    });
    return [stdout, stderr].filter(Boolean).join("\n").trim();
  } catch (e: unknown) {
    const err = e as NodeJS.ErrnoException & { stderr?: string; stdout?: string };
    return [err.stdout, err.stderr, err.message].filter(Boolean).join("\n").trim();
  }
}
