#!/bin/bash

# Get current directory path
DIR=$(pwd)

# Create directory for the tool and copy stalkermap.js to it
sudo mkdir -p /usr/local/share/stalkermap
sudo cp -r "$DIR/"* /usr/local/share/stalkermap/
sudo chmod -R 755 /usr/local/share/stalkermap
# Copy script to /usr/local/bin
sudo cp "$DIR/stalkermap.sh" /usr/local/bin/stalkermap


# Make it executable
sudo chmod +x /usr/local/bin/stalkermap

echo "Stalkermap installed with success! You can execute it anywhere!" 
