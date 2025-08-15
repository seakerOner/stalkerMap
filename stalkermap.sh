#!/bin/bash

# Find number of threads available on the cpu
CPU_THREADS=$(nproc)

# Define threadpool size for the tool
export UV_THREADPOOL_SIZE=$CPU_THREADS

echo "Detected $CPU_THREADS CPU threads. Setting UV_THREADPOOL_SIZE=$UV_THREADPOOL_SIZE"

# Get the path to the script

STALKERMAP_JS="/usr/local/share/stalkermap/stalkermap.js"

# Check if stalkermap.js exists
if [[ ! -f "$STALKERMAP_JS" ]]; then
    echo "Error: stalkermap.js not found in $SCRIPT_DIR"
    exit 1
fi

# Execute tool

node "$STALKERMAP_JS"