"""Defter uygulama ikonu: mor degrade zemin + not sayfasi + baglanti dugumleri.
Kullanim: python scripts/make-icon.py  ->  build/icon.png, build/icon.ico
"""
import os
from PIL import Image, ImageDraw

S = 1024
OUT = os.path.join(os.path.dirname(__file__), "..", "build")


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def main():
    os.makedirs(OUT, exist_ok=True)
    grad = Image.new("RGB", (S, S))
    px = grad.load()
    top, bottom = (167, 139, 250), (91, 61, 230)
    for y in range(S):
        for x in range(S):
            px[x, y] = lerp(top, bottom, (x * 0.35 + y * 0.65) / S)
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([40, 40, S - 40, S - 40], radius=220, fill=255)
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    img.paste(grad, (0, 0), mask)
    d = ImageDraw.Draw(img)

    # sayfa
    page = [270, 210, 720, 810]
    d.rounded_rectangle([page[0] + 18, page[1] + 22, page[2] + 18, page[3] + 22], radius=60, fill=(40, 20, 120, 90))
    d.rounded_rectangle(page, radius=60, fill=(255, 255, 255, 255))
    d.rectangle([page[0], page[1] + 40, page[0] + 70, page[3] - 40], fill=(232, 228, 255, 255))
    for i, w in enumerate((330, 280, 300)):
        y = 340 + i * 95
        d.rounded_rectangle([370, y, 370 + w * 0.9, y + 34], radius=17, fill=(196, 186, 250, 255))

    # baglanti dugumleri
    nodes = [(560, 640), (680, 560), (690, 720)]
    for a, b in ((0, 1), (0, 2), (1, 2)):
        d.line([nodes[a], nodes[b]], fill=(110, 80, 240, 255), width=22)
    for x, y in nodes:
        d.ellipse([x - 42, y - 42, x + 42, y + 42], fill=(110, 80, 240, 255))
        d.ellipse([x - 20, y - 20, x + 20, y + 20], fill=(255, 255, 255, 255))

    img.resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, "icon.png"))
    img.save(os.path.join(OUT, "icon.ico"), sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print("icon: ok")


if __name__ == "__main__":
    main()
