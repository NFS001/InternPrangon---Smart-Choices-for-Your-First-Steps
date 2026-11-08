import math
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WIDTH, HEIGHT = 960, 540
TOTAL_FRAMES = 111  # 37 seconds * 3 fps
DURATION_PER_FRAME_MS = 333

def round_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    x0, y0, x1, y1 = bbox
    draw.rounded_rectangle((x0, y0, x1, y1), radius=radius, fill=fill, outline=outline, width=width)

def render_frame(t):
    img = Image.new("RGB", (WIDTH, HEIGHT), (8, 12, 22))
    draw = ImageDraw.Draw(img)
    
    # Background glowing orbs
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    
    gdraw.ellipse((120 - 160, 140 - 160, 120 + 160, 140 + 160), fill=(99, 102, 241, 35))
    gdraw.ellipse((820 - 150, 210 - 150, 820 + 150, 210 + 150), fill=(249, 115, 22, 30))
    glow = glow.filter(ImageFilter.GaussianBlur(30))
    img.paste(glow, (0, 0), glow)
    draw = ImageDraw.Draw(img)

    # Fonts
    font_lg = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 36)
    font_serif = ImageFont.truetype("C:/Windows/Fonts/georgiaz.ttf", 36)
    font_md = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 22)
    font_sm = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 15)
    font_mono = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 14)
    font_caption = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 13)

    caption = ""

    # Scene 1: The Hook (0.0s – 7.5s)
    if t < 7.5:
        caption = "Still taking unpaid 'exposure' internships in 2026? Yeah, let's cancel that right now."
        draw.text((WIDTH//2 - 120, 115), "ALERT: 2026 REALITY CHECK", font=font_mono, fill=(196, 181, 253))
        
        draw.text((WIDTH//2 - 250, 175), "Still taking unpaid 'exposure'", font=font_lg, fill=(255, 255, 255))
        draw.text((WIDTH//2 - 190, 230), "internships in 2026? 💀", font=font_lg, fill=(255, 255, 255))

        # Cut Line at 2.4s
        if t > 2.4:
            slash_pct = min(1.0, (t - 2.4) / 0.5)
            draw.line((WIDTH//2 - 260, 195, (WIDTH//2 - 260) + int(500 * slash_pct), 195), fill=(239, 68, 68), width=6)
            
            # Expired Stamp at 3.4s
            if t > 3.4:
                round_rect(draw, (WIDTH//2 + 80, 215, WIDTH//2 + 220, 255), 8, fill=(239, 68, 68, 90), outline=(239, 68, 68), width=2)
                draw.text((WIDTH//2 + 105, 225), "EXPIRED.", font=font_mono, fill=(239, 68, 68))

        draw.text((WIDTH//2 - 180, 315), "Yeah, let's cancel that right now.", font=font_sm, fill=(148, 163, 184))

    # Scene 2: Reveal & Search (7.5s – 16.5s)
    elif 7.5 <= t < 16.5:
        local_t = t - 7.5
        caption = "Meet InternPrangon. Smart choices, first steps. Over 380 verified companies hiring right now."
        round_rect(draw, (WIDTH//2 - 190, 60, WIDTH//2 + 190, 88), 14, fill=(255, 255, 255, 20), outline=(99, 102, 241), width=1)
        draw.ellipse((WIDTH//2 - 175, 71, WIDTH//2 - 165, 81), fill=(34, 197, 94))
        draw.text((WIDTH//2 - 150, 67), "OVER 380+ VERIFIED COMPANIES", font=font_mono, fill=(196, 181, 253))

        draw.text((WIDTH//2 - 220, 120), "Smart choices. ", font=font_lg, fill=(255, 255, 255))
        draw.text((WIDTH//2 + 30, 120), "First steps.", font=font_serif, fill=(249, 115, 22))
        draw.text((WIDTH//2 - 240, 180), "Bangladesh's premier platform for paid, verified internships.", font=font_sm, fill=(148, 163, 184))

        round_rect(draw, (WIDTH//2 - 300, 230, WIDTH//2 + 300, 280), 25, fill=(30, 41, 59), outline=(99, 102, 241), width=1)
        
        # Slower typing: 1.3s to 6.0s (8.8s to 13.5s)
        typed_chars = min(35, int((local_t - 1.3) * 7.5)) if local_t > 1.3 else 0
        search_str = "Software Engineer (Cloud) — BDT 25,000"[:typed_chars]
        draw.text((WIDTH//2 - 270, 247), search_str, font=font_sm, fill=(255, 255, 255))
        
        is_clicked = (local_t > 6.5)
        round_rect(draw, (WIDTH//2 + 200, 237, WIDTH//2 + 290, 273), 18, fill=(234, 88, 12) if is_clicked else (249, 115, 22))
        draw.text((WIDTH//2 + 225, 246), "Search" if not is_clicked else "Done", font=font_mono, fill=(255, 255, 255))
        
        if local_t > 6.8:
            draw.text((WIDTH//2 - 210, 340), "1,200+ Active Roles  •  92% Placement Rate  •  No Ghosting", font=font_mono, fill=(56, 189, 248))

    # Scene 3: Highlight 1 — Real Stipends (16.5s – 23.5s)
    elif 16.5 <= t < 23.5:
        local_t = t - 16.5
        caption = "Guaranteed paid stipends up to 25,000 taka a month. Apply in just one click."
        draw.text((WIDTH//2 - 200, 50), "Real Roles. Real Money. BDT 18k–25k.", font=font_md, fill=(255, 255, 255))
        draw.text((WIDTH//2 - 170, 85), "Transparent stipends guaranteed on every listing.", font=font_sm, fill=(148, 163, 184))

        cards = [
            ("Brain Station 23", "Cloud Intern", "BDT 22,000/mo", False),
            ("Pathao", "Mobile App Dev", "BDT 25,000/mo", True),
            ("bKash Limited", "Security Intern", "BDT 24,000/mo", False)
        ]
        for i, (comp, role, stip, active) in enumerate(cards):
            cx = 80 + i * 280
            round_rect(draw, (cx, 130, cx + 250, 420), 16, fill=(30, 41, 59) if active else (15, 23, 42), outline=(249, 115, 22) if active else (51, 65, 85), width=2 if active else 1)
            draw.text((cx + 20, 155), comp, font=font_md, fill=(255, 255, 255))
            draw.text((cx + 20, 195), role, font=font_sm, fill=(148, 163, 184))
            
            round_rect(draw, (cx + 20, 245, cx + 230, 290), 8, fill=(34, 197, 94, 30), outline=(34, 197, 94), width=1)
            draw.text((cx + 35, 257), stip, font=font_mono, fill=(74, 222, 128))
            
            # Clicked at localT > 3.5s
            round_rect(draw, (cx + 20, 340, cx + 230, 385), 10, fill=(34, 197, 94) if (active and local_t > 3.5) else ((249, 115, 22) if active else (51, 65, 85)))
            btn_txt = "✓ Applied in 1-Click!" if (active and local_t > 3.5) else ("Apply in 1-Click ⚡" if active else "View Details")
            draw.text((cx + 45, 353), btn_txt, font=font_mono, fill=(255, 255, 255))

        if local_t > 3.7:
            round_rect(draw, (WIDTH//2 - 180, 445, WIDTH//2 + 180, 480), 18, fill=(34, 197, 94))
            draw.text((WIDTH//2 - 140, 455), "🎉 Application Delivered to ATS Pipeline!", font=font_mono, fill=(255, 255, 255))

    # Scene 4: Highlight 2 — Reviews & Badges (23.5s – 30.5s)
    elif 23.5 <= t < 30.5:
        local_t = t - 23.5
        caption = "Real student reviews, zero ghosting, and contributor tiers that unlock recruiter spotlights."
        draw.text((WIDTH//2 - 200, 50), "Authentic Reviews & Contributor Tiers", font=font_md, fill=(255, 255, 255))

        round_rect(draw, (80, 110, 470, 420), 16, fill=(30, 41, 59), outline=(51, 65, 85))
        draw.text((105, 135), "Tahmina Akter • BUET '26", font=font_md, fill=(255, 255, 255))
        draw.text((105, 170), "Intern @ Brain Station 23 ⭐⭐⭐⭐⭐", font=font_mono, fill=(56, 189, 248))
        draw.text((105, 220), "\"3 interviews in 5 days.", font=font_sm, fill=(203, 213, 225))
        draw.text((105, 250), "Transparent stipends saved me", font=font_sm, fill=(203, 213, 225))
        draw.text((105, 280), "weeks of awkward negotiation!\"", font=font_sm, fill=(203, 213, 225))

        round_rect(draw, (500, 110, 880, 420), 16, fill=(30, 41, 59), outline=(249, 115, 22) if local_t > 3.7 else (51, 65, 85))
        draw.text((525, 135), "Gamified Contributor Tiers", font=font_md, fill=(255, 255, 255))
        
        tiers = [("🌱 Newbie", "0 pts"), ("🔭 Explorer", "200 pts"), ("💡 Insider", "500 pts"), ("⚡ Veteran", "800 pts"), ("🏆 Elite Tier", "1000+ pts")]
        for j, (name, pts) in enumerate(tiers):
            ty = 175 + j * 40
            active = (j == 4 and local_t > 3.7)
            round_rect(draw, (525, ty, 855, ty + 34), 8, fill=(249, 115, 22, 60) if active else (15, 23, 42), outline=(249, 115, 22) if active else None)
            draw.text((545, ty + 7), name, font=font_mono, fill=(251, 146, 60) if active else (226, 232, 240))
            draw.text((780, ty + 7), pts, font=font_mono, fill=(148, 163, 184))

        if local_t > 3.7:
            round_rect(draw, (525, 385, 855, 415), 6, fill=(249, 115, 22))
            draw.text((545, 393), "⚡ RECRUITER SPOTLIGHT UNLOCKED ⚡", font=font_mono, fill=(255, 255, 255))

    # Scene 5: Outro & Call to Action (30.5s – 37.0s)
    else:
        caption = "Your career launchpad starts today. Find your paid role at internprangon.vercel.app."
        draw.text((WIDTH//2 - 25, 120), "🎓", font=font_lg, fill=(255, 255, 255))
        draw.text((WIDTH//2 - 140, 180), "InternPrangon", font=font_lg, fill=(255, 255, 255))
        draw.text((WIDTH//2 - 160, 230), "Smart choices. First steps.", font=font_serif, fill=(249, 115, 22))
        draw.text((WIDTH//2 - 210, 290), "Your career launchpad starts today. Paid & Verified.", font=font_sm, fill=(148, 163, 184))

        round_rect(draw, (WIDTH//2 - 220, 340, WIDTH//2 + 220, 400), 30, fill=(249, 115, 22), outline=(253, 186, 116), width=2)
        draw.text((WIDTH//2 - 170, 357), "internprangon.vercel.app  🚀", font=font_md, fill=(255, 255, 255))
        draw.text((WIDTH//2 - 210, 435), "380+ Verified Companies  •  92% Placement Rate", font=font_mono, fill=(56, 189, 248))

    # Caption overlay at bottom
    if caption:
        cap_w = int(len(caption) * 7.5) + 40
        round_rect(draw, (WIDTH//2 - cap_w//2, 470, WIDTH//2 + cap_w//2, 502), 16, fill=(11, 15, 25, 230), outline=(249, 115, 22, 100), width=1)
        draw.text((WIDTH//2 - cap_w//2 + 15, 477), "🎙️ " + caption, font=font_caption, fill=(255, 255, 255))

    # Progress bar
    pct = t / 37.0
    draw.rectangle((0, HEIGHT - 5, WIDTH, HEIGHT), fill=(30, 41, 59))
    draw.rectangle((0, HEIGHT - 5, int(WIDTH * pct), HEIGHT), fill=(249, 115, 22))

    return img

def main():
    print("Generating 111 animated preview frames across 37.0s timeline...")
    frames = []
    for i in range(TOTAL_FRAMES):
        t = (i / TOTAL_FRAMES) * 37.0
        frame = render_frame(t)
        frames.append(frame)

    output_path = "brag-output/brag-preview.webp"
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=DURATION_PER_FRAME_MS,
        loop=0,
        quality=90
    )
    print(f"Updated {output_path} (37.0s)")

if __name__ == "__main__":
    main()
