from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps
from rembg import remove


ROOT = Path(__file__).resolve().parents[1]
STUDIO_DIR = Path(r"C:\Users\Yeica\Downloads\ghost estudio")
REAL_DIR = Path(r"C:\Users\Yeica\Downloads\ghost")
OUT_DIR = ROOT / "images" / "inventory" / "caps" / "studio"
CONTACT = ROOT / "cap-studio-contact.jpg"

# Curated studio renders mapped to the real 14-cap inventory.
# The source photos in C:\Users\Yeica\Downloads\ghost define the product order,
# colors, materials, and whether the cap is mesh, solid, or pana.
ASSETS = [
    ("real", "1 - azul con blanco.jpeg", "cap-01-azul-con-blanco-front.webp", "front"),
    ("real", "1 - azul con blanco de lado.jpeg", "cap-01-azul-con-blanco-side.webp", "side-mesh"),
    ("real", "2 - azul con beige.jpeg", "cap-02-azul-con-beige-front.webp", "front"),
    ("real", "2 - azul con beige de lado.jpeg", "cap-02-azul-con-beige-side.webp", "side-solid"),
    ("real", "3 - crema con marron tela diferente.jpeg", "cap-03-crema-marron-tela-diferente-front.webp", "front"),
    ("real", "3 - crema con marron de lado tela diferente.jpeg", "cap-03-crema-marron-tela-diferente-side.webp", "side-solid"),
    ("real", "4 - marron con marron en pana.jpeg", "cap-04-marron-pana-front.webp", "front"),
    ("real", "4 - marron con marron en pana de lado.jpeg", "cap-04-marron-pana-side.webp", "side-mesh"),
    ("real", "5 - marron con crema.jpeg", "cap-05-marron-con-crema-front.webp", "front"),
    ("real", "5 - marron con crema de lado.jpeg", "cap-05-marron-con-crema-side.webp", "side-solid"),
    ("real", "6 - roja completa en pana ghost negro.jpeg", "cap-06-roja-pana-ghost-negro-front.webp", "front-red"),
    ("real", "6 - roja completa en pana ghost negro de lado.jpeg", "cap-06-roja-pana-ghost-negro-side.webp", "side-red"),
    ("real", "7 - roja completa en pana ghost blanco.jpeg", "cap-07-roja-pana-ghost-blanco-front.webp", "front-red"),
    ("real", "7 - roja completa en pana ghost blanco de lado.jpeg", "cap-07-roja-pana-ghost-blanco-side.webp", "side-red"),
    ("real", "8 - azul con blanco con lineas negro y azul.jpeg", "cap-08-azul-blanco-lineas-front.webp", "front"),
    ("real", "8 - azul con blanco con lineas negro y azul de lado.jpeg", "cap-08-azul-blanco-lineas-side.webp", "side-solid"),
    ("real", "9 - negra completa con ghost blanco.jpeg", "cap-09-negra-ghost-blanco-front.webp", "front"),
    ("real", "9 - negra completa con ghost blanco de lado.jpeg", "cap-09-negra-ghost-blanco-side.webp", "side-mesh"),
    ("real", "10 - blanca con azul claro.jpeg", "cap-10-blanca-azul-claro-front.webp", "front"),
    ("real", "10 - blanca con azul claro de lado.jpeg", "cap-10-blanca-azul-claro-side.webp", "side-mesh"),
    ("real", "11 - crema con verde.jpeg", "cap-11-crema-verde-front.webp", "front"),
    ("real", "11 - crema con verde de lado.jpeg", "cap-11-crema-verde-side.webp", "side-solid"),
    ("real", "12 - gris completa con ghost negro.jpeg", "cap-12-gris-ghost-negro-front.webp", "front"),
    ("real", "12 - gris completa con ghost negro de lado.jpeg", "cap-12-gris-ghost-negro-side.webp", "side-gray"),
    ("real", "13 - crema con rojo.jpeg", "cap-13-crema-rojo-front.webp", "front-red"),
    ("real", "13 - crema con rojo de lado.jpeg", "cap-13-crema-rojo-side.webp", "side-red"),
    ("real", "14 - rosada completa con ghost negro.jpeg", "cap-14-rosada-ghost-negro-front.webp", "front"),
    ("real", "14 - rosada completa con ghost negro de lado.jpeg", "cap-14-rosada-ghost-negro-side.webp", "side-pink"),
]


def normalize_image(src: Path, dest: Path) -> Image.Image:
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    img = ImageOps.contain(img, (1400, 1400), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (1400, 1400), (239, 229, 214))
    x = (canvas.width - img.width) // 2
    y = (canvas.height - img.height) // 2
    canvas.paste(img, (x, y))
    canvas.save(dest, "WEBP", quality=92, method=6)
    return canvas


FORCE_MANUAL_VIEWS: set[str] = set()
FORCE_MANUAL_FILES = {
    "2 - azul con beige.jpeg",
    "13 - crema con rojo.jpeg",
}


def cap02_front_mask(size: tuple[int, int]) -> Image.Image:
    w, h = size
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    points = [
        (0.20 * w, 0.77 * h),
        (0.21 * w, 0.64 * h),
        (0.28 * w, 0.52 * h),
        (0.38 * w, 0.45 * h),
        (0.63 * w, 0.45 * h),
        (0.73 * w, 0.52 * h),
        (0.78 * w, 0.65 * h),
        (0.78 * w, 0.79 * h),
        (0.72 * w, 0.86 * h),
        (0.58 * w, 0.90 * h),
        (0.40 * w, 0.90 * h),
        (0.27 * w, 0.85 * h),
    ]
    draw.polygon(points, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(3))


def real_mask(size: tuple[int, int], view: str) -> Image.Image:
    w, h = size
    if view in {"front", "front-red"}:
        points = [
            (0.15 * w, 0.69 * h),
            (0.18 * w, 0.58 * h),
            (0.25 * w, 0.47 * h),
            (0.36 * w, 0.41 * h),
            (0.64 * w, 0.41 * h),
            (0.75 * w, 0.48 * h),
            (0.79 * w, 0.61 * h),
            (0.80 * w, 0.70 * h),
            (0.75 * w, 0.77 * h),
            (0.60 * w, 0.81 * h),
            (0.39 * w, 0.81 * h),
            (0.22 * w, 0.76 * h),
        ]
    elif view == "side-pink":
        points = [
            (0.07 * w, 0.70 * h),
            (0.10 * w, 0.62 * h),
            (0.27 * w, 0.55 * h),
            (0.38 * w, 0.39 * h),
            (0.70 * w, 0.34 * h),
            (0.87 * w, 0.43 * h),
            (0.88 * w, 0.68 * h),
            (0.73 * w, 0.78 * h),
            (0.21 * w, 0.74 * h),
        ]
    elif view == "side-red":
        points = [
            (0.07 * w, 0.70 * h),
            (0.10 * w, 0.62 * h),
            (0.29 * w, 0.55 * h),
            (0.40 * w, 0.40 * h),
            (0.69 * w, 0.35 * h),
            (0.85 * w, 0.45 * h),
            (0.86 * w, 0.68 * h),
            (0.69 * w, 0.77 * h),
            (0.22 * w, 0.73 * h),
        ]
    elif view in {"side-solid", "side-gray"}:
        points = [
            (0.08 * w, 0.69 * h),
            (0.12 * w, 0.61 * h),
            (0.30 * w, 0.55 * h),
            (0.40 * w, 0.40 * h),
            (0.70 * w, 0.35 * h),
            (0.86 * w, 0.45 * h),
            (0.87 * w, 0.68 * h),
            (0.69 * w, 0.76 * h),
            (0.22 * w, 0.72 * h),
        ]
    else:
        points = [
            (0.06 * w, 0.71 * h),
            (0.08 * w, 0.62 * h),
            (0.28 * w, 0.56 * h),
            (0.38 * w, 0.39 * h),
            (0.70 * w, 0.33 * h),
            (0.88 * w, 0.43 * h),
            (0.89 * w, 0.69 * h),
            (0.70 * w, 0.77 * h),
            (0.22 * w, 0.73 * h),
        ]

    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(points, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(1.2))


def remove_green_background(img: Image.Image, alpha: Image.Image) -> Image.Image:
    """Drop the green chair/background where it falls inside the cap mask."""
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    alpha_pixels = alpha.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = pixels[x, y]
            if g > 95 and g > r * 1.18 and g > b * 1.12:
                alpha_pixels[x, y] = 0
    return alpha


def remove_red_table(img: Image.Image, alpha: Image.Image) -> Image.Image:
    """Remove the red tablecloth from non-red manual masks."""
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    alpha_pixels = alpha.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = pixels[x, y]
            if r > 135 and r > g * 1.45 and r > b * 1.35:
                alpha_pixels[x, y] = 0
    return alpha


def clean_cap02_front_alpha(img: Image.Image, alpha: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    alpha_pixels = alpha.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = pixels[x, y]
            is_red_cloth = y > h * 0.82 and r > 60 and r > g * 1.05 and r > b * 1.05
            is_right_backdrop = x > w * 0.78 and y < h * 0.66 and g > 65 and abs(r - g) < 80 and abs(g - b) < 95
            if is_red_cloth or is_right_backdrop:
                alpha_pixels[x, y] = 0
    return alpha


def soften_alpha(product: Image.Image) -> Image.Image:
    alpha = product.getchannel("A")
    alpha = alpha.filter(ImageFilter.MedianFilter(3))
    product.putalpha(alpha)
    return product


def keep_largest_alpha_component(product: Image.Image) -> Image.Image:
    """Remove disconnected background fragments left by automatic matting."""
    alpha = product.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > 8 else 0)
    pix = mask.load()
    w, h = mask.size
    visited: set[tuple[int, int]] = set()
    components: list[list[tuple[int, int]]] = []

    for start_y in range(h):
        for start_x in range(w):
            if pix[start_x, start_y] == 0 or (start_x, start_y) in visited:
                continue
            stack = [(start_x, start_y)]
            visited.add((start_x, start_y))
            component: list[tuple[int, int]] = []
            while stack:
                x, y = stack.pop()
                component.append((x, y))
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h and pix[nx, ny] and (nx, ny) not in visited:
                        visited.add((nx, ny))
                        stack.append((nx, ny))
            components.append(component)

    if len(components) < 2:
        return product

    largest = max(components, key=len)
    clean = Image.new("L", mask.size, 0)
    clean_pix = clean.load()
    for x, y in largest:
        clean_pix[x, y] = alpha.getpixel((x, y))
    product.putalpha(clean.filter(ImageFilter.GaussianBlur(0.4)))
    return product


def trim_top_artifacts(product: Image.Image, ratio: float) -> Image.Image:
    alpha = product.getchannel("A")
    alpha_pixels = alpha.load()
    limit = int(product.height * ratio)
    for y in range(limit):
        for x in range(product.width):
            alpha_pixels[x, y] = 0
    product.putalpha(alpha)
    return product


def clear_region(product: Image.Image, left: float, top: float, right: float, bottom: float) -> Image.Image:
    alpha = product.getchannel("A")
    alpha_pixels = alpha.load()
    x0 = int(product.width * left)
    y0 = int(product.height * top)
    x1 = int(product.width * right)
    y1 = int(product.height * bottom)
    for y in range(y0, y1):
        for x in range(x0, x1):
            alpha_pixels[x, y] = 0
    product.putalpha(alpha)
    return product


def crop_to_alpha(product: Image.Image, padding: int = 12) -> Image.Image:
    bbox = product.getchannel("A").getbbox()
    if bbox is None:
        return product
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(product.width, bbox[2] + padding)
    bottom = min(product.height, bbox[3] + padding)
    return product.crop((left, top, right, bottom))


def clean_real_photo(src: Path, dest: Path, view: str) -> Image.Image:
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    w, h = img.size
    top = int(h * (0.20 if view.startswith("front") else 0.24))
    bottom = int(h * (0.91 if view.startswith("front") else 0.90))
    crop = img.crop((0, top, w, bottom))

    product = remove(crop).convert("RGBA")
    bbox = product.getchannel("A").getbbox()
    min_height = crop.height * (0.42 if view.startswith("front") else 0.52)
    min_width = crop.width * (0.45 if view.startswith("front") else 0.52)
    needs_manual_mask = (
        bbox is None
        or view in FORCE_MANUAL_VIEWS
        or src.name in FORCE_MANUAL_FILES
        or (bbox[3] - bbox[1]) < min_height
        or (bbox[2] - bbox[0]) < min_width
    )

    if needs_manual_mask:
        mask = cap02_front_mask(img.size) if src.name == "2 - azul con beige.jpeg" else real_mask(img.size, view)
        bbox = mask.getbbox()
        if bbox is None:
            raise ValueError(f"Empty mask for {src}")
        product = img.crop(bbox).convert("RGBA")
        alpha = remove_green_background(product, mask.crop(bbox))
        if src.name == "2 - azul con beige.jpeg":
            alpha = remove_red_table(product, alpha)
            alpha = clean_cap02_front_alpha(product, alpha)
        product.putalpha(alpha)
        if src.name == "1 - azul con blanco de lado.jpeg":
            product = clear_region(product, 0.30, 0.00, 0.62, 0.28)
        product = keep_largest_alpha_component(product)
    else:
        product = product.crop(bbox)
        product = keep_largest_alpha_component(product)

    if src.name == "1 - azul con blanco de lado.jpeg":
        product = clear_region(product, 0.30, 0.00, 0.62, 0.28)

    product = soften_alpha(product)
    if src.name == "4 - marron con marron en pana.jpeg":
        product = trim_top_artifacts(product, 0.42)
    product = crop_to_alpha(product)

    product = ImageEnhance.Color(product).enhance(1.05)
    product = ImageEnhance.Contrast(product).enhance(1.08)
    product = ImageEnhance.Sharpness(product).enhance(1.28)

    max_w, max_h = (1160, 900) if view.startswith("side") else (1080, 860)
    product.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGB", (1400, 1400), (239, 229, 214))
    floor = Image.new("RGBA", canvas.size, (239, 229, 214, 0))

    x = (canvas.width - product.width) // 2
    y = 315 if view.startswith("side") else 330
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.ellipse(
        (
            x + product.width * 0.12,
            y + product.height * 0.77,
            x + product.width * 0.88,
            y + product.height * 0.91,
        ),
        fill=(43, 31, 22, 48),
    )
    floor = Image.alpha_composite(floor, shadow.filter(ImageFilter.GaussianBlur(22)))
    floor.alpha_composite(product, (x, y))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), floor).convert("RGB")
    canvas.save(dest, "WEBP", quality=92, method=6)
    return canvas


def make_contact(images: list[tuple[str, Image.Image]]) -> None:
    thumb_w, thumb_h = 220, 220
    label_h = 42
    cols = 7
    rows = (len(images) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * thumb_w, rows * (thumb_h + label_h)), (245, 239, 229))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("arial.ttf", 15)
    except OSError:
        font = ImageFont.load_default()

    for i, (name, image) in enumerate(images):
        im = ImageOps.contain(image, (thumb_w - 12, thumb_h - 12), Image.Resampling.LANCZOS)
        col = i % cols
        row = i // cols
        x = col * thumb_w + (thumb_w - im.width) // 2
        y = row * (thumb_h + label_h) + 6
        sheet.paste(im, (x, y))
        label = name.replace("cap-", "").replace(".webp", "")
        draw.text((col * thumb_w + 8, row * (thumb_h + label_h) + thumb_h + 8), label, fill=(22, 22, 22), font=font)

    sheet.save(CONTACT, quality=92)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rendered = []
    for source_type, src_name, dest_name, view in ASSETS:
        src = (STUDIO_DIR if source_type == "studio" else REAL_DIR) / src_name
        dest = OUT_DIR / dest_name
        if not src.exists():
            raise FileNotFoundError(src)
        if source_type == "studio":
            image = normalize_image(src, dest)
        else:
            image = clean_real_photo(src, dest, view or "side")
        rendered.append((dest_name, image))
        print(f"{src_name} -> {dest_name}")
    make_contact(rendered)
    print(f"contact={CONTACT}")


if __name__ == "__main__":
    main()
