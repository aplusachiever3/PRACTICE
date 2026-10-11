from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path("mobile/android/app/src/main/res")
GREEN = (21, 148, 71, 255)
WHITE = (255, 255, 255, 255)
FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
]

font_path = next((p for p in FONT_PATHS if Path(p).exists()), None)
if not font_path:
    raise SystemExit("No suitable bold font found on the build runner.")

def make_icon(size, adaptive_foreground=False):
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0) if adaptive_foreground else WHITE)
    draw = ImageDraw.Draw(image)
    # Keep the wordmark inside the adaptive-icon safe zone.
    max_width = int(size * 0.78)
    max_height = int(size * 0.30)
    font_size = int(size * 0.28)
    while font_size > 8:
        font = ImageFont.truetype(font_path, font_size)
        box = draw.textbbox((0, 0), "Aplus", font=font, stroke_width=0)
        if box[2] - box[0] <= max_width and box[3] - box[1] <= max_height:
            break
        font_size -= 1
    box = draw.textbbox((0, 0), "Aplus", font=font)
    x = (size - (box[2] - box[0])) / 2 - box[0]
    y = (size - (box[3] - box[1])) / 2 - box[1]
    draw.text((int(x), int(y)), "Aplus", font=font, fill=GREEN)
    return image

for density, size in [("mdpi", 48), ("hdpi", 72), ("xhdpi", 96), ("xxhdpi", 144), ("xxxhdpi", 192)]:
    folder = ROOT / f"mipmap-{density}"
    folder.mkdir(parents=True, exist_ok=True)
    make_icon(size).save(folder / "ic_launcher.png")
    make_icon(size).save(folder / "ic_launcher_round.png")
    foreground_size = int(size * 2.25)
    make_icon(foreground_size, adaptive_foreground=True).save(folder / "ic_launcher_foreground.png")

adaptive = ROOT / "mipmap-anydpi-v26"
adaptive.mkdir(parents=True, exist_ok=True)
xml = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
'''
(adaptive / "ic_launcher.xml").write_text(xml, encoding="utf-8")
(adaptive / "ic_launcher_round.xml").write_text(xml, encoding="utf-8")
values = ROOT / "values"
values.mkdir(parents=True, exist_ok=True)
(values / "ic_launcher_background.xml").write_text('''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
''', encoding="utf-8")
print("Generated green Aplus launcher icons for all Android densities.")
