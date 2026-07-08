import struct, zlib

def lerp(a, b, t): return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))

def make(size, path):
    top, bot = (18, 92, 68), (11, 61, 46)   # verde MELI-ish gradient
    white = (255, 255, 255)
    px = bytearray()
    cx = size/2
    # bar chart geometry
    bw = size*0.13
    gap = size*0.06
    base_y = size*0.74
    bars = [0.30, 0.45, 0.62]  # heights as fraction of size
    bx0 = size*0.22
    # arrow polyline points (x,y) fractions -> pixels
    pts = [(0.22, 0.55), (0.40, 0.40), (0.55, 0.50), (0.80, 0.24)]
    pts = [(p[0]*size, p[1]*size) for p in pts]

    def near_seg(x, y, x1, y1, x2, y2, w):
        dx, dy = x2-x1, y2-y1
        L2 = dx*dx + dy*dy
        if L2 == 0:
            return (x-x1)**2 + (y-y1)**2 <= w*w
        t = max(0, min(1, ((x-x1)*dx + (y-y1)*dy)/L2))
        px_, py_ = x1+t*dx, y1+t*dy
        return (x-px_)**2 + (y-py_)**2 <= w*w

    for y in range(size):
        px.append(0)  # PNG filter byte per row
        for x in range(size):
            # rounded corners
            r = size*0.22
            corner = False
            for (cxr, cyr) in [(r,r),(size-r,r),(r,size-r),(size-r,size-r)]:
                if ((x < r and y < r and (cxr==r and cyr==r)) or
                    (x > size-r and y < r and (cxr==size-r and cyr==r)) or
                    (x < r and y > size-r and (cxr==r and cyr==size-r)) or
                    (x > size-r and y > size-r and (cxr==size-r and cyr==size-r))):
                    if (x-cxr)**2 + (y-cyr)**2 > r*r:
                        corner = True
            if corner:
                px.extend((0,0,0,0)); continue
            col = lerp(top, bot, y/size); a = 255
            # bars
            for i, h in enumerate(bars):
                left = bx0 + i*(bw+gap)
                if left <= x <= left+bw and base_y-h*size <= y <= base_y:
                    col = white
            # arrow line (thick)
            w = size*0.035
            for i in range(len(pts)-1):
                if near_seg(x, y, pts[i][0], pts[i][1], pts[i+1][0], pts[i+1][1], w):
                    col = white
            # arrow head
            hx, hy = pts[-1]
            if near_seg(x, y, hx, hy, hx-size*0.10, hy, w) or near_seg(x, y, hx, hy, hx, hy+size*0.10, w):
                col = white
            px.extend((col[0], col[1], col[2], a))

    raw = bytes(px)
    comp = zlib.compress(raw, 9)
    def chunk(typ, data):
        c = typ + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xffffffff)
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)  # 8-bit RGBA
    with open(path, "wb") as f:
        f.write(sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", comp) + chunk(b"IEND", b""))
    print("ok", path)

make(192, "icon-192.png")
make(512, "icon-512.png")
