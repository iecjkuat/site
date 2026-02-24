# Test the results endpoint with PowerShell

Write-Host "Testing results endpoint..." -ForegroundColor Cyan
Write-Host ""

# Test with the election ID from your SQL output
$ELECTION_ID = "4654b6e1-072d-4270-b4f9-ac766d0873bf"
$URL = "http://localhost:3000/api/v1/voting/$ELECTION_ID/results"

Write-Host "Election ID: $ELECTION_ID" -ForegroundColor Yellow
Write-Host "URL: $URL" -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "Making request..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri $URL -Method GET -UseBasicParsing
    
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content Type: $($response.Headers['Content-Type'])" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "Error occurred!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:" -ForegroundColor Red
        Write-Host $responseBody
    }
    
    Write-Host ""
    Write-Host "Full Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Cyan
