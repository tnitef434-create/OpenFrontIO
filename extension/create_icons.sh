#!/bin/bash
# Create simple placeholder icons using ImageMagick (if available)
# If not available, user can create their own or use online tools

# Check if convert is available
if command -v convert &> /dev/null; then
    echo "Creating icons..."
    convert -size 16x16 xc:green -pointsize 12 -fill black -gravity center -annotate +0+0 "$" icon16.png
    convert -size 48x48 xc:green -pointsize 36 -fill black -gravity center -annotate +0+0 "$" icon48.png
    convert -size 128x128 xc:green -pointsize 96 -fill black -gravity center -annotate +0+0 "$" icon128.png
    echo "Icons created!"
else
    echo "ImageMagick not found. Creating placeholder files..."
    # Create empty PNG files as placeholders
    echo -n "" > icon16.png
    echo -n "" > icon48.png
    echo -n "" > icon128.png
    echo "Please create icons manually (16x16, 48x48, 128x128 PNG images)"
fi
