import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_poster():
    width, height = 1920, 1080
    
    # Base background
    base = Image.new("RGB", (width, height), (11, 15, 25))
    draw = ImageDraw.Draw(base)
    
    # 1. Background radial glow orbs
    glow_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    
    # Indigo aura top-left
    for r in range(450, 0, -10):
        alpha = int(40 * (1 - r / 450)**1.8)
        glow_draw.ellipse(
            (250 - r, 200 - r, 250 + r, 200 + r),
            fill=(99, 102, 241, alpha)
        )
        
    # Radiant sunset orange aura top-right
    for r in range(400, 0, -10):
        alpha = int(35 * (1 - r / 400)**1.8)
        glow_draw.ellipse(
            (1600 - r, 250 - r, 1600 + r, 250 + r),
            fill=(249, 115, 22, alpha)
        )
        
    # Violet aura bottom-center
    for r in range(500, 0, -15):
        alpha = int(25 * (1 - r / 500)**1.8)
        glow_draw.ellipse(
            (960 - r, 950 - r, 960 + r, 950 + r),
            fill=(139, 92, 246, alpha)
        )
        
    glow_blurred = glow_layer.filter(ImageFilter.GaussianBlur(radius=40))
    base.paste(glow_blurred, (0, 0), glow_blurred)
    draw = ImageDraw.Draw(base)
    
    # Subtle dot-grid texture
    for x in range(0, width, 40):
        for y in range(0, height, 40):
            if (x + y) % 80 == 0:
                draw.ellipse((x, y, x + 2, y + 2), fill=(255, 255, 255, 20))

    # Fonts
    font_bold = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 76)
    font_serif = ImageFont.truetype("C:/Windows/Fonts/georgiaz.ttf", 76) # bold italic
    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 26)
    font_pill = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 18)
    font_card_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 24)
    font_card_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 18)
    font_card_stipend = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 22)
    font_cta = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 28)

    # 2. Top Trust Badge Pill
    pill_text = "OVER 380+ VERIFIED COMPANIES HIRING • FALL 2026"
    bbox = font_pill.getbbox(pill_text)
    pw = bbox[2] - bbox[0] + 50
    px = (width - pw) // 2
    py = 100
    
    # Draw pill
    draw.rounded_rectangle((px, py, px + pw, py + 40), radius=20, fill=(255, 255, 255, 18), outline=(99, 102, 241, 90), width=1)
    draw.ellipse((px + 18, py + 14, px + 28, py + 24), fill=(34, 197, 94))
    draw.text((px + 36, py + 9), pill_text, font=font_pill, fill=(196, 181, 253))

    # 3. Main Headline: "Smart choices. First steps."
    h1_text = "Smart choices. "
    h2_text = "First steps."
    w1 = font_bold.getbbox(h1_text)[2] - font_bold.getbbox(h1_text)[0]
    w2 = font_serif.getbbox(h2_text)[2] - font_serif.getbbox(h2_text)[0]
    total_w = w1 + w2
    hx = (width - total_w) // 2
    hy = 170

    draw.text((hx, hy), h1_text, font=font_bold, fill=(248, 250, 252))
    # Gradient/Orange for "First steps."
    draw.text((hx + w1, hy), h2_text, font=font_serif, fill=(249, 115, 22))
    
    # Underline accent swoop under "First steps."
    draw.arc((hx + w1 - 10, hy + 75, hx + total_w + 10, hy + 95), start=0, end=180, fill=(251, 146, 60), width=4)

    # Subtitle
    sub_text = "Bangladesh's Premier Platform for Paid Internships & Transparent Career Starts"
    sw = font_sub.getbbox(sub_text)[2] - font_sub.getbbox(sub_text)[0]
    draw.text(((width - sw) // 2, hy + 100), sub_text, font=font_sub, fill=(148, 163, 184))

    # 4. Glassmorphic Feature Cards (3 side-by-side)
    cards = [
        {
            "company": "Brain Station 23",
            "role": "Software Engineer Intern (Cloud)",
            "mode": "Remote • 3 Months",
            "stipend": "BDT 22,000 / mo",
            "tag": "Node.js • AWS",
            "color": (99, 102, 241),
            "applied": False
        },
        {
            "company": "Pathao",
            "role": "Mobile App Developer (Flutter)",
            "mode": "Remote • 4 Months",
            "stipend": "BDT 25,000 / mo",
            "tag": "Dart • REST APIs",
            "color": (249, 115, 22),
            "applied": True
        },
        {
            "company": "bKash Limited",
            "role": "Fintech Cybersecurity Intern",
            "mode": "On-site • 6 Months",
            "stipend": "BDT 24,000 / mo",
            "tag": "PCI-DSS • Network",
            "color": (236, 72, 153),
            "applied": False
        }
    ]

    card_w = 480
    card_h = 280
    spacing = 40
    start_x = (width - (3 * card_w + 2 * spacing)) // 2
    card_y = 390

    for i, c in enumerate(cards):
        cx = start_x + i * (card_w + spacing)
        # Card glow shadow
        glow_box = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        gdraw = ImageDraw.Draw(glow_box)
        gdraw.rounded_rectangle(
            (cx - 5, card_y - 5, cx + card_w + 5, card_y + card_h + 5),
            radius=24,
            fill=(*c["color"], 40 if not c["applied"] else 70)
        )
        glow_box = glow_box.filter(ImageFilter.GaussianBlur(15))
        base.paste(glow_box, (0, 0), glow_box)
        draw = ImageDraw.Draw(base)

        # Card body
        draw.rounded_rectangle(
            (cx, card_y, cx + card_w, card_y + card_h),
            radius=20,
            fill=(26, 32, 53) if not c["applied"] else (30, 38, 66),
            outline=(*c["color"], 180 if c["applied"] else 80),
            width=2 if c["applied"] else 1
        )

        # Company Header Icon
        draw.rounded_rectangle((cx + 25, card_y + 25, cx + 70, card_y + 70), radius=12, fill=(*c["color"], 50), outline=c["color"], width=1)
        initial = c["company"][0]
        draw.text((cx + 38, card_y + 32), initial, font=font_card_title, fill=(255, 255, 255))

        draw.text((cx + 85, card_y + 26), c["company"], font=font_card_title, fill=(248, 250, 252))
        draw.text((cx + 85, card_y + 60), c["mode"], font=font_card_sub, fill=(148, 163, 184))

        # Role
        draw.text((cx + 25, card_y + 105), c["role"], font=font_card_title, fill=(226, 232, 240))
        
        # Tags Pill
        draw.rounded_rectangle((cx + 25, card_y + 155, cx + 220, card_y + 185), radius=8, fill=(40, 50, 80))
        draw.text((cx + 35, card_y + 160), c["tag"], font=font_card_sub, fill=(196, 181, 253))

        # Stipend Pill (Highlight)
        draw.rounded_rectangle((cx + 25, card_y + 210, cx + 240, card_y + 255), radius=12, fill=(34, 197, 94, 40), outline=(34, 197, 94), width=1)
        draw.text((cx + 40, card_y + 219), c["stipend"], font=font_card_stipend, fill=(74, 222, 128))

        # Action Button / Status
        if c["applied"]:
            draw.rounded_rectangle((cx + 270, card_y + 210, cx + card_w - 25, card_y + 255), radius=12, fill=(249, 115, 22))
            draw.text((cx + 285, card_y + 221), "✓ Applied (1-Click)", font=font_pill, fill=(255, 255, 255))
        else:
            draw.rounded_rectangle((cx + 280, card_y + 210, cx + card_w - 25, card_y + 255), radius=12, fill=(51, 65, 85))
            draw.text((cx + 305, card_y + 221), "Quick Apply", font=font_pill, fill=(203, 213, 225))

    # 5. Bottom Stats & Outro Bar
    bar_y = 740
    stat_box_w = 1520
    stat_box_x = (width - stat_box_w) // 2
    draw.rounded_rectangle(
        (stat_box_x, bar_y, stat_box_x + stat_box_w, bar_y + 110),
        radius=20,
        fill=(18, 24, 40),
        outline=(99, 102, 241, 50),
        width=1
    )

    stats = [
        ("1,200+", "Active Internships"),
        ("380+", "Verified Companies"),
        ("92%", "Placement Rate"),
        ("0", "Unpaid Gigs Allowed")
    ]
    col_w = stat_box_w // 4
    for i, (val, lbl) in enumerate(stats):
        col_x = stat_box_x + i * col_w
        val_w = font_card_title.getbbox(val)[2] - font_card_title.getbbox(val)[0]
        lbl_w = font_card_sub.getbbox(lbl)[2] - font_card_sub.getbbox(lbl)[0]
        
        draw.text((col_x + (col_w - val_w) // 2, bar_y + 22), val, font=font_card_title, fill=(251, 146, 60) if i == 3 else (248, 250, 252))
        draw.text((col_x + (col_w - lbl_w) // 2, bar_y + 62), lbl, font=font_card_sub, fill=(148, 163, 184))
        
        if i < 3:
            draw.line((col_x + col_w, bar_y + 25, col_x + col_w, bar_y + 85), fill=(40, 50, 80), width=1)

    # 6. Outro CTA & Live URL
    cta_y = 900
    cta_text = "Launch your career at internprangon.vercel.app  🚀"
    cw = font_cta.getbbox(cta_text)[2] - font_cta.getbbox(cta_text)[0]
    cx = (width - cw) // 2
    
    # Glowing pill behind CTA
    draw.rounded_rectangle((cx - 40, cta_y - 12, cx + cw + 40, cta_y + 55), radius=30, fill=(249, 115, 22), outline=(253, 186, 116), width=2)
    draw.text((cx, cta_y), cta_text, font=font_cta, fill=(255, 255, 255))

    # Save outputs
    base.save("brag-output/brag.jpg", quality=95)
    print("Poster saved to brag-output/brag.jpg")

if __name__ == "__main__":
    create_poster()

