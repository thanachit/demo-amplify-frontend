#!/bin/bash
set -e

APP_ID=${1:?Usage: ./deploy-frontend.sh APP_ID [profile]}
PROFILE_ARG=""
if [ -n "$2" ]; then PROFILE_ARG="--profile $2"; fi
REGION=ap-southeast-1
BRANCH=main
FRONTEND_DIR="$(cd "$(dirname "$0")/hello-world" && pwd)"

cd "$FRONTEND_DIR"

echo "1/4 Installing dependencies..."
npm install --silent

echo "2/4 Building..."
npm run build

echo "3/4 Creating deployment..."
DEPLOYMENT=$(aws amplify create-deployment \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH" \
  --region "$REGION" \
  $PROFILE_ARG \
  --no-cli-pager)

JOB_ID=$(echo "$DEPLOYMENT" | python3 -c "import sys,json; print(json.load(sys.stdin)['jobId'])")
UPLOAD_URL=$(echo "$DEPLOYMENT" | python3 -c "import sys,json; print(json.load(sys.stdin)['zipUploadUrl'])")

rm -f build.zip
cd build && zip -r ../build.zip . && cd ..

echo "Uploading..."
curl -s -H "Content-Type: application/zip" -T build.zip "$UPLOAD_URL"

echo "4/4 Starting deployment..."
aws amplify start-deployment \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH" \
  --job-id "$JOB_ID" \
  --region "$REGION" \
  $PROFILE_ARG \
  --no-cli-pager

echo ""
echo "✓ Deployed! https://$BRANCH.$APP_ID.amplifyapp.com"
