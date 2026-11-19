import os
from PIL import Image, ImageDraw

def create_dealflow_icon(size):
    scale = 4
    canvas_size = size * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = int(canvas_size * 0.08)
    w = canvas_size - 2 * margin
    h = canvas_size - 2 * margin
    cx = canvas_size // 2
    cy = canvas_size // 2

    # Draw rounded badge background
    r = int(canvas_size * 0.22)
    draw.rounded_rectangle(
        [margin, margin, canvas_size - margin, canvas_size - margin],
        radius=r,
        fill=(15, 23, 42, 255) # Slate dark base
    )

    # Gradient border ring (Indigo to Emerald)
    border_w = max(int(canvas_size * 0.06), 2)
    draw.rounded_rectangle(
        [margin, margin, canvas_size - margin, canvas_size - margin],
        radius=r,
        outline=(16, 185, 129, 255),
        width=border_w
    )

    # Stylized Price Tag / Shopping Bag Glyph
    tag_top = margin + int(h * 0.22)
    tag_bottom = margin + int(h * 0.78)
    tag_left = margin + int(w * 0.25)
    tag_right = margin + int(w * 0.75)

    # Draw shopping tag shape
    tag_pts = [
        (cx, tag_top),
        (tag_right, tag_top + int(h * 0.18)),
        (tag_right, tag_bottom),
        (tag_left, tag_bottom),
        (tag_left, tag_top + int(h * 0.18)),
    ]
    draw.polygon(tag_pts, fill=(99, 102, 241, 230)) # Indigo #6366f1

    # Eyelet hole at top of tag
    hole_r = int(canvas_size * 0.04)
    hole_y = tag_top + int(h * 0.12)
    draw.ellipse([cx - hole_r, hole_y - hole_r, cx + hole_r, hole_y + hole_r], fill=(15, 23, 42, 255))

    # Downward Price Drop Arrow or Rupee/Percent sign in center
    arrow_top = hole_y + int(h * 0.12)
    arrow_bottom = tag_bottom - int(h * 0.12)
    arrow_w = max(int(canvas_size * 0.07), 2)

    # Vertical line of arrow
    draw.line([(cx, arrow_top), (cx, arrow_bottom)], fill=(16, 185, 129, 255), width=arrow_w)
    # Arrow head pointing down
    arrow_wing = int(w * 0.14)
    draw.line([(cx - arrow_wing, arrow_bottom - arrow_wing), (cx, arrow_bottom)], fill=(16, 185, 129, 255), width=arrow_w)
    draw.line([(cx + arrow_wing, arrow_bottom - arrow_wing), (cx, arrow_bottom)], fill=(16, 185, 129, 255), width=arrow_w)

    res = img.resize((size, size), Image.Resampling.LANCZOS)
    return res

output_dir = r"D:\dealflow-price-tracker\icons"
for s in [16, 32, 48, 128]:
    icon = create_dealflow_icon(s)
    out_path = os.path.join(output_dir, f"icon{s}.png")
    icon.save(out_path, "PNG")
    print(f"Generated {out_path} ({s}x{s})")
