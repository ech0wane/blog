#!/bin/bash

# Configuration
FTP_HOST="3255157569.cloudylink.com"
FTP_USER="ech0wa"
FTP_PASSWORD="lwPQOKYtzZYg8R"
REMOTE_PATH="/domains/ech0wane.ir/public_html/blog"
LOCAL_DIST="./dist"

# Build the site
echo "Building Astro site..."
pnpm run build

# Upload using lftp
echo "Uploading to $REMOTE_PATH..."
lftp -c "
set ftp:ssl-allow no
set net:timeout 10
set net:max-retries 2
set net:reconnect-interval-base 5
open -u $FTP_USER,$FTP_PASSWORD $FTP_HOST
mirror --reverse --delete --verbose --parallel=3 dist/ $REMOTE_PATH
bye
"
