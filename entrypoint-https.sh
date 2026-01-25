#!/bin/sh
# Entrypoint script to start Next.js with HTTPS using self-signed certs

CERT_PATH="${NEXTJS_TLS_CERT:-/app/certs/tls.crt}"
KEY_PATH="${NEXTJS_TLS_KEY:-/app/certs/tls.key}"

if [ ! -f "$CERT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
  echo "SSL certificate or key not found!"
  exit 1
fi

echo "Starting Next.js HTTPS server..."
exec node server-https.js
