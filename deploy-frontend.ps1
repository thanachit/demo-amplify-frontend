param(
    [Parameter(Mandatory)][string]$AppId,
    [string]$Region = "ap-southeast-1",
    [string]$Profile
)

$Branch = "main"
$ProfileArg = if ($Profile) { @("--profile", $Profile) } else { @() }
$FrontendDir = Join-Path $PSScriptRoot "hello-world"
Push-Location $FrontendDir

try {
    Write-Host "1/4 Installing dependencies..."
    npm install

    Write-Host "2/4 Building..."
    npm run build

    Write-Host "3/4 Creating deployment..."
    $Deployment = aws amplify create-deployment `
        --app-id $AppId `
        --branch-name $Branch `
        --region $Region `
        @ProfileArg `
        --no-cli-pager | ConvertFrom-Json

    $JobId = $Deployment.jobId
    $UploadUrl = $Deployment.zipUploadUrl

    Write-Host "Zipping build..."
    if (Test-Path build.zip) { Remove-Item build.zip }
    Push-Location build
    tar -cf ..\build.zip --format=zip *
    Pop-Location

    Write-Host "Uploading..."
    Invoke-RestMethod -Uri $UploadUrl -Method PUT -InFile (Resolve-Path "build.zip") -ContentType "application/zip"
    Write-Host "Upload complete."

    Write-Host "4/4 Starting deployment..."
    aws amplify start-deployment `
        --app-id $AppId `
        --branch-name $Branch `
        --job-id $JobId `
        --region $Region `
        @ProfileArg `
        --no-cli-pager

    Write-Host ""
    Write-Host "Done! https://$Branch.$AppId.amplifyapp.com"
} finally {
    Pop-Location
}
