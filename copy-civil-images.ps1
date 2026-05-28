$brainDir = "C:\Users\HP\.gemini\antigravity-ide\brain\18733920-5b56-4d0f-84f2-a74a0755575a"
$targetDir = "public\teachers"

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir | Out-Null
}

$mapping = @{
    "media__1779990768596.png" = "mahesh.jpg"
    "media__1779990782641.png" = "paribesh.jpg"
    "media__1779990793353.png" = "raju.jpg"
    "media__1779990803263.png" = "tulasi.jpg"
    "media__1779990853428.png" = "roman.jpg"
}

foreach ($key in $mapping.Keys) {
    $source = Join-Path $brainDir $key
    $dest = Join-Path $targetDir $mapping[$key]
    
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $dest -Force
        Write-Host "Copied $key to $dest"
    } else {
        Write-Host "Warning: $source not found!"
    }
}
