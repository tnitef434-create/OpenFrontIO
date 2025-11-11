#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    # Create green background
    img = Image.new('RGB', (size, size), color='#00ff00')
    draw = ImageDraw.Draw(img)
    
    # Draw dollar sign
    try:
        # Try to use a font
        font_size = int(size * 0.7)
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', font_size)
    except:
        font = ImageDraw.getfont()
    
    # Draw text centered
    text = "$"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size - text_width) // 2, (size - text_height) // 2 - size//10)
    
    draw.text(position, text, fill='#000000', font=font)
    
    # Save
    img.save(filename)
    print(f"Created {filename}")

create_icon(16, 'icon16.png')
create_icon(48, 'icon48.png')
create_icon(128, 'icon128.png')
