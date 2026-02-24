#!/bin/bash
# Test the results endpoint with curl

echo "Testing results endpoint..."
echo ""

# Test with the election ID from your SQL output
ELECTION_ID="4654b6e1-072d-4270-b4f9-ac766d0873bf"

echo "Election ID: $ELECTION_ID"
echo "URL: http://localhost:3000/api/v1/voting/$ELECTION_ID/results"
echo ""

# Make the request and show full response
curl -v "http://localhost:3000/api/v1/voting/$ELECTION_ID/results" 2>&1

echo ""
echo "Done!"
