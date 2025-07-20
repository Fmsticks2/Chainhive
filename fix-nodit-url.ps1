# Fix NODIT Base URL Script
# This script replaces all instances of https://api.nodit.io with https://web3.nodit.io

Write-Host "Fixing NODIT Base URL across the entire codebase..." -ForegroundColor Cyan

# Define the old and new URLs
$oldUrl = "https://api.nodit.io"
$newUrl = "https://web3.nodit.io"

# Get all files in the project (excluding node_modules, .git, etc.)
$excludePatterns = @(
    "node_modules",
    ".git",
    "coverage",
    "out",
    "lib",
    "foundry_bin",
    "cache",
    "public",
    "dist",
    "build",
    ".vercel",
    "deployments"
)

# Function to check if path should be excluded
function Should-Exclude {
    param([string]$Path)
    foreach ($pattern in $excludePatterns) {
        if ($Path -like "*\$pattern\*" -or $Path -like "*/$pattern/*") {
            return $true
        }
    }
    return $false
}

# Get all files recursively
$allFiles = Get-ChildItem -Path "." -Recurse -File | Where-Object {
    -not (Should-Exclude $_.FullName) -and
    $_.Extension -in @('.md', '.js', '.json', '.yaml', '.yml', '.env', '.txt', '.sh', '.ps1', '.html', '.css', '.ts', '.jsx', '.tsx')
}

$filesChanged = 0
$totalReplacements = 0

Write-Host "Scanning files for NODIT URL references..." -ForegroundColor Yellow

foreach ($file in $allFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        
        if ($content -and $content.Contains($oldUrl)) {
            Write-Host "Found references in: $($file.FullName)" -ForegroundColor Green
            
            # Count occurrences before replacement
            $matches = [regex]::Matches($content, [regex]::Escape($oldUrl))
            $occurrences = $matches.Count
            
            if ($occurrences -gt 0) {
                # Replace all occurrences
                $newContent = $content.Replace($oldUrl, $newUrl)
                
                # Write back to file
                Set-Content -Path $file.FullName -Value $newContent -NoNewline
                
                $filesChanged++
                $totalReplacements += $occurrences
                
                Write-Host "  Replaced $occurrences occurrence(s)" -ForegroundColor Green
            }
        }
    }
    catch {
        Write-Warning "Could not process file: $($file.FullName) - $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Files changed: $filesChanged" -ForegroundColor White
Write-Host "  Total replacements: $totalReplacements" -ForegroundColor White
Write-Host "  Old URL: $oldUrl" -ForegroundColor Red
Write-Host "  New URL: $newUrl" -ForegroundColor Green

if ($filesChanged -gt 0) {
    Write-Host ""
    Write-Host "NODIT URL fix completed successfully!" -ForegroundColor Green
    Write-Host "All references have been updated to use the correct NODIT base URL." -ForegroundColor White
    
    # Verify the changes
    Write-Host ""
    Write-Host "Verifying changes..." -ForegroundColor Yellow
    
    $remainingOldUrls = 0
    foreach ($file in $allFiles) {
        try {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
            if ($content -and $content.Contains($oldUrl)) {
                $matches = [regex]::Matches($content, [regex]::Escape($oldUrl))
                $remainingOldUrls += $matches.Count
                Write-Warning "Still found old URL in: $($file.FullName)"
            }
        }
        catch {
            # Ignore read errors during verification
        }
    }
    
    if ($remainingOldUrls -eq 0) {
        Write-Host "Verification passed: No old URLs remaining" -ForegroundColor Green
    } else {
        Write-Warning "Verification found $remainingOldUrls remaining old URL(s)"
    }
    
} else {
    Write-Host "No files needed to be changed." -ForegroundColor Blue
}

Write-Host ""
Write-Host "Script completed!" -ForegroundColor Cyan