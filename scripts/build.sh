#!/bin/bash
# Build script that sets environment variables to skip page data collection
# This script should be used in CI/CD to prevent build timeouts

# Set environment variables to skip unnecessary build phases
export NEXT_SKIP_ANALYZE=1
export SKIP_ENV_VALIDATION=true
export NODE_ENV=production

# Run the build with optimizations
next build --no-lint

