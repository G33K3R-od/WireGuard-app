# Downloads wintun.dll and builds wireguard-go.exe into ../runtime/bin
# Run from apps/wirepn-windows:
#   powershell -ExecutionPolicy Bypass -File .\scripts\fetch-runtime.ps1
#
# Requires: git, Go in PATH (or winget to install GoLang.Go)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$BinDir = Join-Path $Root "runtime\bin"
$BuildDir = Join-Path $env:TEMP "wireguard-go-build-$(Get-Random)"

New-Item -ItemType Directory -Force -Path $BinDir | Out-Null

function Ensure-Go {
    $goCmd = Get-Command go -ErrorAction SilentlyContinue
    if ($goCmd) {
        go version
        return
    }
    $goExe = "$env:ProgramFiles\Go\bin\go.exe"
    if (Test-Path $goExe) {
        $env:Path = "$env:ProgramFiles\Go\bin;" + $env:Path
        & $goExe version
        return
    }
    Write-Host "Go not in PATH. Install: winget install -e --id GoLang.Go"
    Write-Host "Or: https://go.dev/dl/ - add Go\bin to PATH, reopen terminal."
    exit 1
}

function Ensure-Wintun {
    $dll = Join-Path $BinDir "wintun.dll"
    if (Test-Path $dll) {
        Write-Host "wintun.dll already present: $dll"
        return
    }
    $zipUrl = "https://www.wintun.net/builds/wintun-0.14.1.zip"
    $zipPath = Join-Path $env:TEMP "wintun.zip"
    Write-Host "Downloading Wintun..."
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
    $extract = Join-Path $env:TEMP "wintun-extract"
    if (Test-Path $extract) { Remove-Item -Recurse -Force $extract }
    Expand-Archive -Path $zipPath -DestinationPath $extract -Force
    $arch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "amd64" }
    $candidate = Get-ChildItem -Path $extract -Recurse -Filter "wintun.dll" -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match [regex]::Escape("\bin\$arch\") } |
        Select-Object -First 1
    if (-not $candidate) {
        $candidate = Get-ChildItem -Path $extract -Recurse -Filter "wintun.dll" -ErrorAction SilentlyContinue | Select-Object -First 1
    }
    if (-not $candidate) {
        Write-Error "wintun.dll not found inside zip"
    }
    Copy-Item -Force $candidate.FullName $dll
    Write-Host "OK: $dll"
}

function Build-WireGuardGo {
    $out = Join-Path $BinDir "wireguard-go.exe"
    Write-Host "Cloning wireguard-go (shallow)..."
    git clone --depth 1 https://github.com/WireGuard/wireguard-go.git $BuildDir

    $patchedUapi = Join-Path $PSScriptRoot "patches\ipc-uapi_windows.go"
    if (-not (Test-Path $patchedUapi)) {
        Write-Error "Missing patch file: $patchedUapi"
    }
    Copy-Item -Force $patchedUapi (Join-Path $BuildDir "ipc\uapi_windows.go")
    Write-Host "Applied ipc/uapi_windows.go patch (WirePN UAPI pipe path)."

    Push-Location $BuildDir
    try {
        $env:GOOS = "windows"
        $env:GOARCH = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "amd64" }
        $env:CGO_ENABLED = "0"
        Write-Host "Building GOOS=$($env:GOOS) GOARCH=$($env:GOARCH) ..."
        go build -trimpath -ldflags "-s -w" -o $out .
    } finally {
        Pop-Location
    }

    if (-not (Test-Path $out)) {
        Write-Error "Build did not produce: $out"
    }
    Write-Host "OK: $out"
}

Ensure-Go
Ensure-Wintun
Build-WireGuardGo

if (Test-Path $BuildDir) {
    Remove-Item -Recurse -Force $BuildDir -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Done. Runtime bin:"
Get-ChildItem $BinDir
