#!/bin/bash
# Build script that skips build trace collection
export NEXT_SKIP_BUILD_TRACE=1
export NEXT_TELEMETRY_DISABLED=1
next build

