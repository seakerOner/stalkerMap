#!/bin/bash

# Get current directory path
DIR=$(pwd)

# Declare the paths to the JSON files
TCP_JSON_FILE="$DIR/data/appData/misc/tcp-services.txt"
UDP_JSON_FILE="$DIR/data/appData/misc/udp-services.txt"

HOME_DIR="$HOME"

# Declare the output directory and related paths
OUTPUT_DIR="$HOME_DIR/Desktop/stalkermapOUTPUT/data/appData/misc"
WORDLIST_DIR="$HOME_DIR/Desktop/stalkermapOUTPUT/data/appData/wordlists"
# Create directory for the tool and copy stalkermap project to it
sudo mkdir -p "/usr/local/share/stalkermap"
sudo cp -r "$DIR/"* /usr/local/share/stalkermap/
sudo chmod -R 755 /usr/local/share/stalkermap

mkdir -p $OUTPUT_DIR
mkdir -p $WORDLIST_DIR 
cp -r "$TCP_JSON_FILE" "$OUTPUT_DIR" 
cp -r "$UDP_JSON_FILE" "$OUTPUT_DIR"

# Copy script to /usr/local/bin 
sudo cp "$DIR/stalkermap.sh" /usr/local/bin/stalkermap


# Make it executable
sudo chmod +x /usr/local/bin/stalkermap

echo "Stalkermap installed with success! You can execute it anywhere!" 
