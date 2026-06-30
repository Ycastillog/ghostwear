from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps
from rembg import remove, new_session


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = Path(r"C:\Users\Yeica\Downloads\ghost")
OUT_DIR = ROOT / "images" / "inventory" / "caps" / "studio"
CONTACT = ROOT / "cap-real-studio-contact.jpg"

ASSETS = [
    ("1 - azul con blanco.jpeg", "cap-01-azul-con-blanco-front.webp"),
    ("1 - azul con blanco de lado.jpeg", "cap-01-azul-con-blanco-side.webp"),
    ("2 - azul con beige.jpeg", "cap-02-azul-con-beige-front.webp"),
    ("2 - azul con beige de lado.jpeg", "cap-02-azul-con-beige-side.webp"),
    ("3 - crema con marron tela diferente.jpeg", "cap-03-crema-marron-tela-diferente-front.webp"),
    ("3 - crema con marron de lado tela diferente.jpeg", "cap-03-crema-marron-tela-diferente-side.webp"),
    ("4 - marron con marron en pana.jpeg", "cap-04-marron-pana-front.webp"),
    ("4 - marron con marron en pana de lado.jpeg", "cap-04-marron-pana-side.webp"),
    ("5 - marron con crema.jpeg", "cap-05-marron-con-crema-front.webp"),
    ("5 - marron con crema de lado.jpeg", "cap-05-marron-con-crema-side.webp"),
    ("6 - roja completa en pana ghost negro.jpeg", "cap-06-roja-pana-ghost-negro-front.webp"),
    ("6 - roja completa en pana ghost negro de lado.jpeg", "cap-06-roja-pana-ghost-negro-side.webp"),
    ("7 - roja completa en pana ghost blanco.jpeg", "cap-07-roja-pana-ghost-blanco-front.webp"),
    ("7 - roja completa en pana ghost blanco de lado.jpeg", "cap-07-roja-pana-ghost-blanco-side.webp"),
    ("8 - azul con blanco con lineas negro y azul.jpeg", "cap-08-azul-blanco-lineas-front.webp"),
    ("8 - azul con blanco con lineas negro y azul de lado.jpeg", "cap-08-azul-blanco-lineas-side.webp"),
    ("9 - negra completa con ghost blanco.jpeg", "cap-09-negra-ghost-blanco-front.webp"),
    ("9 - negra completa con ghost blanco de lado.jpeg", "cap-09-negra-ghost-blanco-side.webp"),
    ("10 - blanca con azul claro.jpeg", "cap-10-blanca-azul-claro-front.webp"),
    ("10 - blanca con azul claro de lado.jpeg", "cap-10-blanca-azul-claro-side.webp"),
    ("11 - crema con verde.jpeg", "cap-11-crema-verde-front.webp"),
    ("11 - crema con verde de lado.jpeg", "cap-11-crema-verde-side.webp"),
    ("12 - gris completa con ghost negro.jpeg", "cap-12-gris-ghost-negro-front.webp"),
    ("12 - gris completa con ghost negro de lado.jpeg", "cap-12-gris-ghost-negro-side.webp"),
    ("13 - crema con rojo.jpeg", "cap-13-crema-rojo-front.webp"),
    ("13 - crema con rojo de lado.jpeg", "cap-13-crema-rojo-side.webp"),
    ("14 - rosada completa con ghost negro.jpeg", "cap-14-rosada-ghost-negro-front.webp"),
    ("14 - rosada completa con ghost negro de lado.jpeg", "cap-14-rosada-ghost-negro-side.webp"),
]


def studio_background(size: int) -> Image.Image:
    y, x = np.mgrid[0:size, 0:size]
    cx, cy = size * 0.48, size * 0.42
    dist = np.sqrt(((x - cx) / size) ** 2 + ((y - cy) / size) ** 2)
    warm = np.array([228, 214, 196], dtype=np.float32)
    light = np.array([248, 241, 230], dtype=np.float32)
    t = np.clip(dist * 2.2, 0, 1)[..., None]
    bg = light * (1 - t) + warm * t
    floor = np.clip((y - size * 0.56) / (size * 0.44), 0, 1)[..., None]
    bg = bg * (1 - floor * 0.11)
    return Image.fromarray(np.uint8(np.clip(bg, 0, 255)), "RGB")


def largest_subject_mask(rgba: Image.Image) -> np.ndarray:
    arr = np.array(rgba)
    alpha = arr[:, :, 3]
    rgb = arr[:, :, :3]
    h, w = alpha.shape

    green_bg = (
        (rgb[:, :, 1] > 100)
        & (rgb[:, :, 1] > rgb[:, :, 0] + 30)
        & (rgb[:, :, 1] > rgb[:, :, 2] + 30)
        & (np.indices((h, w))[0] < h * 0.78)
    )
    alpha = np.where(green_bg, 0, alpha).astype(np.uint8)

    alpha = np.where(alpha > 34, alpha, 0).astype(np.uint8)
    mask = alpha > 86
    num, labels, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    if num <= 1:
        return alpha

    areas = stats[1:, cv2.CC_STAT_AREA]
    main = int(np.argmax(areas) + 1)
    x, y, bw, bh, _ = stats[main]
    keep = labels == main
    for comp in range(1, num):
        if comp == main:
            continue
        cx, cy, cw, ch, area = stats[comp]
        overlap_w = max(0, min(cx + cw, x + bw) - max(cx, x))
        overlap_h = max(0, min(cy + ch, y + bh) - max(cy, y))
        overlap = overlap_w * overlap_h
        inside_subject = overlap > area * 0.35
        meaningful = area > max(80, areas.max() * 0.004)
        if inside_subject and meaningful:
            keep |= labels == comp

    alpha = np.where(keep, alpha, 0).astype(np.uint8)
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.35)
    alpha = np.where(alpha > 28, alpha, 0).astype(np.uint8)
    return alpha


def crop_subject(rgba: Image.Image) -> Image.Image:
    alpha = largest_subject_mask(rgba)
    mask = alpha > 72
    num, labels, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    if num > 1:
        areas = stats[1:, cv2.CC_STAT_AREA]
        main = int(np.argmax(areas) + 1)
        mx, my, mw, mh, main_area = stats[main]
        refined = labels == main
        for comp in range(1, num):
            if comp == main:
                continue
            cx, cy, cw, ch, area = stats[comp]
            center_y = cy + ch / 2
            overlap_w = max(0, min(cx + cw, mx + mw) - max(cx, mx))
            overlaps_main = overlap_w > min(cw, mw) * 0.25
            close_to_cap = center_y > my - mh * 0.05
            sizeable = area > max(90, main_area * 0.003)
            if overlaps_main and close_to_cap and sizeable:
                refined |= labels == comp
        alpha = np.where(refined, alpha, 0).astype(np.uint8)
    solid = alpha > 108
    solid_num, solid_labels, solid_stats, _ = cv2.connectedComponentsWithStats(solid.astype(np.uint8), 8)
    if solid_num > 1:
        solid_areas = solid_stats[1:, cv2.CC_STAT_AREA]
        solid_main = int(np.argmax(solid_areas) + 1)
        sx, sy, sw, sh, _ = solid_stats[solid_main]
        pad = int(max(alpha.shape) * 0.045)
        x0 = max(0, sx - pad)
        y0 = max(0, sy - pad)
        x1 = min(alpha.shape[1], sx + sw + pad)
        y1 = min(alpha.shape[0], sy + sh + pad)
        crop_gate = np.zeros_like(alpha, dtype=bool)
        crop_gate[y0:y1, x0:x1] = True
        alpha = np.where(crop_gate, alpha, 0).astype(np.uint8)
    if alpha.max() > 0:
        row_sum = alpha.sum(axis=1)
        row_threshold = row_sum.max() * 0.075
        strong_rows = np.where(row_sum > row_threshold)[0]
        if len(strong_rows):
            alpha[: max(0, strong_rows[0] - 4)] = 0
            alpha[min(alpha.shape[0], strong_rows[-1] + 5) :] = 0
        col_sum = alpha.sum(axis=0)
        col_threshold = col_sum.max() * 0.045
        strong_cols = np.where(col_sum > col_threshold)[0]
        if len(strong_cols):
            alpha[:, : max(0, strong_cols[0] - 4)] = 0
            alpha[:, min(alpha.shape[1], strong_cols[-1] + 5) :] = 0
    arr = np.array(rgba)
    arr[:, :, 3] = alpha
    ys, xs = np.where(alpha > 28)
    if len(xs) == 0 or len(ys) == 0:
        return Image.fromarray(arr, "RGBA")
    h, w = alpha.shape
    pad = int(max(w, h) * 0.04)
    x0, x1 = max(0, xs.min() - pad), min(w, xs.max() + pad)
    y0, y1 = max(0, ys.min() - pad), min(h, ys.max() + pad)
    return Image.fromarray(arr[y0:y1, x0:x1], "RGBA")


def polish_subject(subject: Image.Image) -> Image.Image:
    rgb = subject.convert("RGB")
    rgb = ImageEnhance.Color(rgb).enhance(1.05)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.08)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.35)
    out = Image.merge("RGBA", (*rgb.split(), subject.getchannel("A")))
    return out


def compose(subject: Image.Image, dest: Path, is_side: bool) -> Image.Image:
    size = 1400
    bg = studio_background(size).convert("RGBA")
    subject = polish_subject(subject)

    max_w = int(size * (0.88 if is_side else 0.78))
    max_h = int(size * (0.63 if is_side else 0.66))
    scale = min(max_w / subject.width, max_h / subject.height)
    new_size = (max(1, int(subject.width * scale)), max(1, int(subject.height * scale)))
    subject = subject.resize(new_size, Image.Resampling.LANCZOS)

    x = int((size - subject.width) / 2)
    y = int(size * (0.49 if is_side else 0.43) - subject.height / 2)
    y = max(int(size * 0.18), min(y, int(size * 0.68 - subject.height)))

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sw, sh = int(subject.width * 0.72), int(subject.height * 0.14)
    shadow_layer = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow_layer)
    draw.ellipse((12, 10, sw - 12, sh - 8), fill=(0, 0, 0, 84))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=34))
    sx = int(x + subject.width * 0.15)
    sy = int(y + subject.height * 0.88)
    shadow.alpha_composite(shadow_layer, (sx, sy))
    bg.alpha_composite(shadow)
    bg.alpha_composite(subject, (x, y))

    final = bg.convert("RGB")
    final.save(dest, quality=92, method=6)
    return final


def make_contact(images: list[Image.Image]) -> None:
    thumb = (260, 260)
    cols = 7
    rows = int(np.ceil(len(images) / cols))
    sheet = Image.new("RGB", (cols * thumb[0], rows * thumb[1]), (245, 239, 229))
    for i, img in enumerate(images):
        im = ImageOps.contain(img, (thumb[0] - 18, thumb[1] - 18), Image.Resampling.LANCZOS)
        x = (i % cols) * thumb[0] + (thumb[0] - im.width) // 2
        y = (i // cols) * thumb[1] + (thumb[1] - im.height) // 2
        sheet.paste(im, (x, y))
    sheet.save(CONTACT, quality=90)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    session = new_session("u2net")
    rendered = []
    for src_name, dest_name in ASSETS:
        src = SOURCE_DIR / src_name
        dest = OUT_DIR / dest_name
        img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        if max(img.size) > 1500:
            img.thumbnail((1500, 1500), Image.Resampling.LANCZOS)
        rgba = remove(
            img,
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=245,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=6,
        )
        subject = crop_subject(rgba)
        rendered.append(compose(subject, dest, "-side" in dest_name))
        print(dest_name)
    make_contact(rendered)
    print(f"contact={CONTACT}")


if __name__ == "__main__":
    main()
