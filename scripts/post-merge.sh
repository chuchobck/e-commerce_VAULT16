#!/bin/bash
set -e

echo "=== post-merge: installing backend dependencies ==="
cd backend && npm install --prefer-offline 2>&1
cd ..

echo "=== post-merge: running prisma generate ==="
cd backend && npx prisma generate 2>&1
cd ..

echo "=== post-merge: installing frontend dependencies ==="
cd frontend && npm install --prefer-offline 2>&1
cd ..

echo "=== post-merge: done ==="
