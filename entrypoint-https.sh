#!/bin/sh
set -e

CERT_PATH="${NEXTJS_TLS_CERT:-/app/certs/tls.crt}"
KEY_PATH="${NEXTJS_TLS_KEY:-/app/certs/tls.key}"

if [ ! -f "$CERT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
  echo "SSL certificate or key not found!"
  echo "CERT_PATH=$CERT_PATH"
  echo "KEY_PATH=$KEY_PATH"
  exit 1
fi

echo "Starting Next.js HTTPS server..."
exec node server-https.js
