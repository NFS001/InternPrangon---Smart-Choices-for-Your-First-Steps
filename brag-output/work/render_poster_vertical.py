import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_vertical_poster():
    width, height = 1080, 1920
    base = Image.new("RGB", (width, height), (8, 12, 22))
    
    # Glowing Auras
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse((200 - 350, 400 - 350, 200 + 350, 400 + 350), fill=(99, 102, 241, 35))
    gdraw.ellipse((850 - 300, 600 - 300, 850 + 300, 600 + 300), fill=(249, 115, 22, 30))
    gdraw.ellipse((540 - 400, 1500 - 400, 540 + 400, 1500 + 400), fill=(139, 92, 246, 25))
    glow = glow.filter(ImageFilter.GaussianBlur(50))
    base.paste(glow, (0, 0), glow)
    draw = ImageDraw.Draw(base)

    # Fonts
    font_hero = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 64)
    font_serif = ImageFont.truetype("C:/Windows/Fonts/georgiaz.ttf", 64)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 26)
    font_pill = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 20)
    font_card_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 30)
    font_card_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 22)
    font_mono = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 26)

    # Top Trust Pill
    pill_text = "380+ VERIFIED COMPANIES • FALL 2026"
    draw.rounded_rectangle((240, 140, 840, 195), radius=27, fill=(255, 255, 255, 20), outline=(99, 102, 241), width=1)
    draw.ellipse((270, 161, 284, 175), fill=(34, 197, 94))
    draw.text((305, 153), pill_text, font=font_pill, fill=(196, 181, 253))

    # Headline
    draw.text((160, 240), "Smart choices.", font=font_hero, fill=(255, 255, 255))
    draw.text((610, 240), "First steps.", font=font_serif, fill=(249, 115, 22))

    sub = "Bangladesh's Premier Platform for Paid Internships"
    draw.text((180, 330), sub, font=font_sub, fill=(148, 163, 184))

    # Opportunity Cards stacked vertically
    cards = [
        {"comp": "Pathao", "role": "Mobile App Developer (Flutter)", "stip": "BDT 25,000 / mo", "tag": "Flutter • Dart", "col": (249, 115, 22), "applied": True},
        {"comp": "Brain Station 23", "role": "Software Engineer Intern (Cloud)", "stip": "BDT 22,000 / mo", "tag": "Node.js • AWS", "col": (99, 102, 241), "applied": False},
        {"comp": "bKash Limited", "role": "Fintech Cybersecurity Intern", "stip": "BDT 24,000 / mo", "tag": "PCI-DSS • Audit", "col": (236, 72, 153), "applied": False}
    ]

    card_y = 430
    for c in cards:
        draw.rounded_rectangle((120, card_y, 960, card_y + 270), radius=22, fill=(24, 32, 52), outline=c["col"], width=2 if c["applied"] else 1)
        draw.text((160, card_y + 35), c["comp"], font=font_card_title, fill=(255, 255, 255))
        draw.text((160, card_y + 80), c["role"], font=font_card_sub, fill=(203, 213, 225))

        # Tag
        draw.rounded_rectangle((160, card_y + 130, 420, card_y + 175), radius=10, fill=(38, 48, 76))
        draw.text((180, card_y + 140), c["tag"], font=font_card_sub, fill=(196, 181, 253))

        # Stipend
        draw.rounded_rectangle((160, card_y + 195, 480, card_y + 245), radius=12, fill=(34, 197, 94, 35), outline=(34, 197, 94), width=1)
        draw.text((180, card_y + 205), c["stip"], font=font_mono, fill=(74, 222, 128))

        # Button
        draw.rounded_rectangle((620, card_y + 195, 920, card_y + 245), radius=12, fill=(249, 115, 22) if c["applied"] else (51, 65, 85))
        txt = "✓ Applied (1-Click)" if c["applied"] else "Quick Apply"
        draw.text((645, card_y + 208), txt, font=font_pill, fill=(255, 255, 255))

        card_y += 310

    # Student review callout
    draw.rounded_rectangle((120, 1380, 960, 1600), radius=22, fill=(20, 26, 44), outline=(99, 102, 241, 70), width=1)
    draw.text((160, 1415), "Tahmina Akter • BUET CSE '26", font=font_card_title, fill=(255, 255, 255))
    draw.text((160, 1460), "⭐⭐⭐⭐⭐  Intern @ Brain Station 23", font=font_mono, fill=(56, 189, 248))
    draw.text((160, 1515), "\"3 interviews in 5 days. Transparent stipends saved weeks!\"", font=font_card_sub, fill=(203, 213, 225))

    # CTA
    draw.rounded_rectangle((160, 1680, 920, 1780), radius=50, fill=(249, 115, 22))
    draw.text((250, 1710), "internprangon.vercel.app  🚀", font=font_card_title, fill=(255, 255, 255))

    base.save("brag-output/brag-vertical.jpg", quality=95)
    print("Saved brag-output/brag-vertical.jpg")

if __name__ == "__main__":
    create_vertical_poster()

