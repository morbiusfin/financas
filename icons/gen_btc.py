"""Moeda de Bitcoin REALISTA (metal, borda serrilhada, ₿ em relevo, brilho).
Gera coin.png (fundo transparente, p/ o splash) e icon-512/192 (moeda no fundo verde)."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

FONT = "C:/Windows/Fonts/arialbd.ttf"

def lerp(a, b, t): return tuple(int(a[k] + (b[k] - a[k]) * t) for k in range(3))
def grad(stops, t):
    for i in range(len(stops) - 1):
        t0, c0 = stops[i]; t1, c1 = stops[i + 1]
        if t <= t1:
            f = (t - t0) / (t1 - t0) if t1 > t0 else 0
            return lerp(c0, c1, f)
    return stops[-1][1]

def draw_btc(d, cx, cy, h, color, font):
    """desenha o ₿ (B bold + 2 barras verticais) centrado em (cx,cy) com altura-alvo h."""
    fs = int(h / 0.72)
    font = ImageFont.truetype(FONT, fs)
    bb = d.textbbox((0, 0), "B", font=font)
    bw, bh = bb[2] - bb[0], bb[3] - bb[1]
    d.text((cx - bw / 2 - bb[0], cy - bh / 2 - bb[1]), "B", font=font, fill=color)
    barw = int(h * 0.085); gap = int(h * 0.15)
    top = cy - bh / 2 - int(h * 0.13); bot = cy + bh / 2 + int(h * 0.13)
    for offx in (-gap, 0):
        x0 = cx - barw / 2 + offx - int(h * 0.04)
        d.rectangle([x0, top, x0 + barw, bot], fill=color)

def make_coin(S):
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    cx = cy = S // 2
    R = int(S * 0.47)
    # --- disco: gradiente metálico com hotspot no canto superior-esquerdo ---
    lx, ly = cx - R * 0.30, cy - R * 0.34
    stops = [(0.0, (255, 245, 205)), (0.20, (255, 216, 116)), (0.48, (247, 178, 52)),
             (0.72, (212, 138, 27)), (0.88, (175, 107, 17)), (1.0, (138, 82, 11))]
    px = img.load()
    for y in range(cy - R - 1, cy + R + 1):
        for x in range(cx - R - 1, cx + R + 1):
            d = math.hypot(x - cx, y - cy)
            if d <= R:
                t = min(1.0, math.hypot(x - lx, y - ly) / (R * 1.28))
                px[x, y] = grad(stops, t) + (255,)

    # --- borda serrilhada (reeded edge) na coroa externa ---
    ridge = Image.new("RGBA", (S, S), (0, 0, 0, 0)); rd = ImageDraw.Draw(ridge)
    n = 150
    for i in range(n):
        a = 2 * math.pi * i / n
        x1 = cx + math.cos(a) * R * 0.905; y1 = cy + math.sin(a) * R * 0.905
        x2 = cx + math.cos(a) * R * 0.995; y2 = cy + math.sin(a) * R * 0.995
        col = (255, 238, 195, 95) if i % 2 == 0 else (110, 66, 8, 120)
        rd.line([x1, y1, x2, y2], fill=col, width=max(2, int(S * 0.0065)))
    img.alpha_composite(ridge)

    dr = ImageDraw.Draw(img)
    # aro externo escuro (recorte nítido)
    dr.ellipse([cx - R, cy - R, cx + R, cy + R], outline=(120, 72, 8, 255), width=int(S * 0.012))

    # --- face interna rebaixada (bisel) ---
    rf = int(R * 0.84)
    face = Image.new("RGBA", (S, S), (0, 0, 0, 0)); fp = face.load()
    for y in range(cy - rf - 1, cy + rf + 1):
        for x in range(cx - rf - 1, cx + rf + 1):
            d = math.hypot(x - cx, y - cy)
            if d <= rf:
                t = min(1.0, math.hypot(x - lx, y - ly) / (rf * 1.25))
                c = grad(stops, t)
                fp[x, y] = lerp(c, (90, 54, 6), 0.10) + (255,)
    img.alpha_composite(face)
    fd = ImageDraw.Draw(img)
    # sombra interna (anel) + realce → sensação de rebaixo
    shadow = Image.new("RGBA", (S, S), (0, 0, 0, 0)); sd = ImageDraw.Draw(shadow)
    sd.ellipse([cx - rf, cy - rf, cx + rf, cy + rf], outline=(70, 42, 4, 200), width=int(S * 0.02))
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(S * 0.012)))
    img.alpha_composite(shadow)
    fd.ellipse([cx - int(rf*0.97), cy - int(rf*0.97), cx + int(rf*0.97), cy + int(rf*0.97)],
               outline=(255, 240, 200, 110), width=int(S * 0.007))

    # --- ₿ em relevo (sombra + realce + corpo) ---
    sym = Image.new("RGBA", (S, S), (0, 0, 0, 0)); syd = ImageDraw.Draw(sym)
    h = int(R * 0.92); off = int(S * 0.007)
    draw_btc(syd, cx + off, cy + off, h, (84, 50, 6, 255), FONT)          # sombra (baixo-dir)
    draw_btc(syd, cx - off, cy - off, h, (255, 230, 165, 235), FONT)      # realce (cima-esq)
    draw_btc(syd, cx, cy, h, (150, 92, 14, 255), FONT)                    # corpo
    img.alpha_composite(sym)

    # --- brilho especular: blob superior-esquerdo + glint na borda + sombra inferior ---
    spec = Image.new("RGBA", (S, S), (0, 0, 0, 0)); spd = ImageDraw.Draw(spec)
    spd.ellipse([cx - R*0.58, cy - R*0.82, cx + R*0.08, cy - R*0.14], fill=(255, 255, 255, 105))
    spd.ellipse([cx - R*0.40, cy - R*0.62, cx - R*0.10, cy - R*0.34], fill=(255, 255, 255, 90))
    spec = spec.filter(ImageFilter.GaussianBlur(int(S * 0.028)))
    # glint fino na borda superior (luz batendo no metal)
    spd.arc([cx - R*0.92, cy - R*0.92, cx + R*0.92, cy + R*0.92], 200, 320, fill=(255, 255, 255, 150), width=int(S*0.01))
    # sombra suave na parte inferior (volume)
    sh2 = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(sh2).ellipse([cx - R*0.7, cy + R*0.18, cx + R*0.7, cy + R*0.95], fill=(60, 36, 4, 70))
    sh2 = sh2.filter(ImageFilter.GaussianBlur(int(S*0.04)))
    spec.alpha_composite(sh2)
    # recorta tudo ao disco
    mask = Image.new("L", (S, S), 0); ImageDraw.Draw(mask).ellipse([cx - R, cy - R, cx + R, cy + R], fill=255)
    img.alpha_composite(Image.composite(spec, Image.new("RGBA", (S, S), (0, 0, 0, 0)), mask))
    return img

S = 1024
coin = make_coin(S)
coin.save("icons/coin.png")  # fundo transparente → splash

# ícone = moeda sobre fundo radial verde (igual ao app), com leve margem
icon = Image.new("RGBA", (S, S), (0, 0, 0, 0)); ip = icon.load()
cx, cy = S * 0.5, S * 0.40; maxd = math.hypot(S, S) * 0.62
c_in, c_out = (14, 74, 54), (5, 17, 12)
for y in range(S):
    for x in range(S):
        t = min(1.0, math.hypot(x - cx, y - cy) / maxd)
        ip[x, y] = lerp(c_in, c_out, t) + (255,)
# sombra da moeda
sh = Image.new("RGBA", (S, S), (0, 0, 0, 0)); ImageDraw.Draw(sh).ellipse([S*0.22, S*0.74, S*0.78, S*0.88], fill=(0, 0, 0, 150))
icon.alpha_composite(sh.filter(ImageFilter.GaussianBlur(26)))
cscaled = coin.resize((int(S * 0.84), int(S * 0.84)), Image.LANCZOS)
icon.alpha_composite(cscaled, (int(S * 0.08), int(S * 0.08)))
for sz in (512, 192):
    icon.resize((sz, sz), Image.LANCZOS).save(f"icons/icon-{sz}.png")
print("ok - moeda realista gerada (coin.png + icon-512/192)")
