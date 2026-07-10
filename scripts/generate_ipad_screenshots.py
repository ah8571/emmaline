"""
Generate iPad 12.9" / 13" screenshots from existing iPhone screenshots.
Places the iPhone screenshot centered on an iPad-sized canvas (2048×2732).
"""

import os
import sys
from pathlib import Path

from PIL import Image

# Config
SOURCE_DIR = Path("mobile/assets/screenshots/EMMALINE (APPLE)")
OUTPUT_DIR = Path("mobile/assets/screenshots/EMMALINE (APPLE)/ipad_12_9")
TARGET_SIZE = (2048, 2732)  # iPad 12.9" portrait
BACKGROUND_COLOR = (18, 18, 18)  # dark background matching app theme
SCALE_FACTOR = 0.72  # how large the iPhone screenshot appears on the iPad canvas


def generate_ipad_screenshots():
    if not SOURCE_DIR.exists():
        print(f"ERROR: Source directory not found: {SOURCE_DIR}")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    png_files = sorted([f for f in os.listdir(SOURCE_DIR) if f.lower().endswith(".png")])

    if not png_files:
        print(f"ERROR: No PNG files found in {SOURCE_DIR}")
        sys.exit(1)

    print(f"Found {len(png_files)} source screenshots")
    print(f"Target size: {TARGET_SIZE[0]}×{TARGET_SIZE[1]}")
    print(f"Output directory: {OUTPUT_DIR}")
    print()

    for filename in png_files:
        source_path = SOURCE_DIR / filename
        output_path = OUTPUT_DIR / filename

        # Open source image
        source = Image.open(source_path).convert("RGBA")
        src_w, src_h = source.size
        print(f"  {filename}: {src_w}x{src_h} -> ", end="")

        # Create iPad canvas
        canvas = Image.new("RGBA", TARGET_SIZE, BACKGROUND_COLOR + (255,))

        # Scale iPhone screenshot to fit within canvas
        new_w = int(TARGET_SIZE[0] * SCALE_FACTOR)
        new_h = int(src_h * (new_w / src_w))
        scaled = source.resize((new_w, new_h), Image.LANCZOS)

        # Center on canvas
        x_offset = (TARGET_SIZE[0] - new_w) // 2
        y_offset = (TARGET_SIZE[1] - new_h) // 2

        canvas.paste(scaled, (x_offset, y_offset), scaled)

        # Convert to RGB (no alpha) for App Store compatibility
        canvas_rgb = canvas.convert("RGB")
        canvas_rgb.save(output_path, "PNG", optimize=True)

        final_w, final_h = canvas_rgb.size
        print(f"{final_w}x{final_h} OK")

    print(f"\nDone! {len(png_files)} iPad screenshots saved to {OUTPUT_DIR}")


if __name__ == "__main__":
    generate_ipad_screenshots()