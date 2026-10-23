# Regenerate PNG icons: python3 scripts/make-icons.py  (needs: pip install pillow)
from PIL import Image, ImageDraw
def icon(size, pad, rounded):
    S = size * 4
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if rounded: d.rounded_rectangle([0, 0, S, S], radius=S * 0.22, fill='#3f5a1f')
    else: d.rectangle([0, 0, S, S], fill='#3f5a1f')
    c, r = S / 2, S * (0.5 - pad) * 0.62
    w = S * 0.085
    d.ellipse([c - r, c - r, c + r, c + r], outline='#f6f5f0', width=int(w))
    dr = w * 0.62; cy = c - r - w / 2 + w / 2 - r * 0.0
    d.ellipse([c - dr, c - r - dr, c + dr, c - r + dr], fill='#cfdcae')
    return im.resize((size, size), Image.LANCZOS)
icon(192, 0.12, True).save('public/icon-192.png')
icon(512, 0.12, True).save('public/icon-512.png')
icon(512, 0.2, False).save('public/icon-maskable-512.png')
icon(180, 0.12, False).save('public/apple-touch-icon.png')
