#!/usr/bin/env bash
set -euo pipefail

BRANCH_NAME="${GITHUB_REF_NAME:-${1:-}}"
TARGET_BRANCH="main"

if [[ -z "$BRANCH_NAME" ]]; then
  echo "Unable to determine branch name. Pass it as the first argument or run in GitHub Actions."
  exit 1
fi

if [[ "$BRANCH_NAME" != "$TARGET_BRANCH" ]]; then
  echo "Branch '$BRANCH_NAME' is not '$TARGET_BRANCH'. Build and upload skipped."
  exit 0
fi

if [[ -z "${S3_BUCKET:-}" ]]; then
  echo "S3_BUCKET is required (for example: my-static-site-bucket)."
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "AWS CLI is required but not installed."
  exit 1
fi

echo "Installing dependencies..."
npm ci

echo "Building site..."
npm run build

if [[ ! -d "dist" ]]; then
  echo "Build output directory 'dist' was not found."
  exit 1
fi

S3_URI="s3://${S3_BUCKET}"

echo "Syncing dist/ to ${S3_URI}..."
aws s3 sync dist/ "$S3_URI" --delete --exclude "img/*"

echo "Deployment complete."
