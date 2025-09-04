#!/bin/bash

# Get the path to the script

STALKERMAP_SERVER_JS="/usr/local/share/stalkermap/server.js"

# Check if stalkermap.js exists
if [[ ! -f "$STALKERMAP_SERVER_JS" ]]; then
    echo "Error: server.js not found in $SCRIPT_DIR"
    exit 1
fi

# Execute tool

node "$STALKERMAP_SERVER_JS"
