from __future__ import annotations

import argparse
import csv
import re
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps
from rembg import remove


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}
BEIGE = (239, 229, 214)
BEIGE_LIGHT = (246, 240, 231)
TEXTURE_DARK = (225, 214, 199)


@dataclass
class ProcessResult:
    source: str
    status: str
    message: str
    square_png: str = ""
    square_jpg: str = ""
    vertical_png: str = ""
    vertical_jpg: str = ""


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^\w\s.-]+", "", value, flags=re.UNICODE)
    value = re.sub(r"[\s_]+", "-", value)
    value = re.sub(r"-{2,}", "-", value)
    return value.strip("-.") or "cap"


def list_images(input_dir: Path) -> list[Path]:
    return sorted(
        path
        for path in input_dir.iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    )


def studio_background(size: tuple[int, int]) -> Image.Image:
    width, height = size
    bg = Image.new("RGB", size, BEIGE)
    pixels = bg.load()
    cx, cy = width * 0.5, height * 0.42
    max_dist = (cx * cx + cy * cy) ** 0.5

    for y in range(height):
        for x in range(width):
            dist = (((x - cx) ** 2 + ((y - cy) * 0.9) ** 2) ** 0.5) / max_dist
            t = max(0.0, min(1.0, dist))
            base = tuple(int(BEIGE_LIGHT[i] * (1 - t) + BEIGE[i] * t) for i in range(3))
            pixels[x, y] = base

    draw = ImageDraw.Draw(bg, "RGBA")
    for i in range(18):
        alpha = max(0, 14 - i)
        y = int(height * (0.74 + i * 0.012))
        draw.line((0, y, width, y), fill=(*TEXTURE_DARK, alpha), width=1)
    return bg


def keep_largest_alpha_component(product: Image.Image) -> Image.Image:
    alpha = product.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > 10 else 0)
    pix = mask.load()
    width, height = mask.size
    visited: set[tuple[int, int]] = set()
    components: list[list[tuple[int, int]]] = []

    for start_y in range(height):
        for start_x in range(width):
            if pix[start_x, start_y] == 0 or (start_x, start_y) in visited:
                continue
            stack = [(start_x, start_y)]
            visited.add((start_x, start_y))
            component: list[tuple[int, int]] = []
            while stack:
                x, y = stack.pop()
                component.append((x, y))
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < width and 0 <= ny < height and pix[nx, ny] and (nx, ny) not in visited:
                        visited.add((nx, ny))
                        stack.append((nx, ny))
            components.append(component)

    if not components:
        return product

    largest = max(components, key=len)
    clean = Image.new("L", mask.size, 0)
    clean_pix = clean.load()
    for x, y in largest:
        clean_pix[x, y] = alpha.getpixel((x, y))
    product.putalpha(clean.filter(ImageFilter.GaussianBlur(0.45)))
    return product


def clean_alpha(product: Image.Image) -> Image.Image:
    alpha = product.getchannel("A")
    alpha = alpha.filter(ImageFilter.MedianFilter(3))
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.35))
    alpha = alpha.point(lambda value: 0 if value < 8 else value)
    product.putalpha(alpha)
    return keep_largest_alpha_component(product)


def remove_bright_green_background(product: Image.Image) -> Image.Image:
    rgba = product.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            is_chair_green = (
                a > 0
                and g > 105
                and g > r * 1.25
                and g > b * 1.18
                and (g - max(r, b)) > 35
            )
            if is_chair_green:
                pixels[x, y] = (r, g, b, 0)
    return rgba


def remove_background(source: Path) -> Image.Image:
    image = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
    image.thumbnail((2200, 2200), Image.Resampling.LANCZOS)
    segmented = remove(
        image,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=8,
    ).convert("RGBA")
    segmented = remove_bright_green_background(segmented)
    segmented = clean_alpha(segmented)
    bbox = segmented.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("No se pudo detectar la gorra.")

    segmented = segmented.crop(bbox)
    segmented = clean_alpha(segmented)
    return enhance_product(segmented)


def enhance_product(product: Image.Image) -> Image.Image:
    alpha = product.getchannel("A")
    rgb = product.convert("RGB")
    rgb = ImageEnhance.Color(rgb).enhance(1.04)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.08)
    rgb = ImageEnhance.Brightness(rgb).enhance(1.03)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.35)
    product = rgb.convert("RGBA")
    product.putalpha(alpha)
    return product


def scale_product(product: Image.Image, canvas_size: tuple[int, int], target_fill: float) -> Image.Image:
    max_width = int(canvas_size[0] * target_fill)
    max_height = int(canvas_size[1] * target_fill)
    scaled = product.copy()
    scaled.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
    return scaled


def add_shadow(base: Image.Image, product: Image.Image, x: int, y: int) -> Image.Image:
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    left = x + product.width * 0.08
    top = y + product.height * 0.78
    right = x + product.width * 0.92
    bottom = y + product.height * 0.96
    draw.ellipse((left, top, right, bottom), fill=(41, 30, 22, 50))
    return Image.alpha_composite(base.convert("RGBA"), shadow.filter(ImageFilter.GaussianBlur(26)))


def compose_studio(product: Image.Image, canvas_size: tuple[int, int], target_fill: float) -> Image.Image:
    product = scale_product(product, canvas_size, target_fill)
    canvas = studio_background(canvas_size).convert("RGBA")
    x = (canvas_size[0] - product.width) // 2
    visual_center_y = int(canvas_size[1] * 0.48)
    y = max(int(canvas_size[1] * 0.08), visual_center_y - product.height // 2)
    y = min(y, int(canvas_size[1] * 0.86) - product.height)
    canvas = add_shadow(canvas, product, x, y)
    canvas.alpha_composite(product, (x, y))
    return canvas.convert("RGB")


def save_pair(image: Image.Image, png_path: Path, jpg_path: Path, quality: int, overwrite: bool) -> None:
    if not overwrite:
        png_path = next_available_path(png_path)
        jpg_path = next_available_path(jpg_path)
    image.save(png_path, "PNG", optimize=True)
    image.save(jpg_path, "JPEG", quality=quality, optimize=True, progressive=True)


def next_available_path(path: Path) -> Path:
    if not path.exists():
        return path
    stem = path.stem
    for index in range(2, 1000):
        candidate = path.with_name(f"{stem}-{index}{path.suffix}")
        if not candidate.exists():
            return candidate
    raise RuntimeError(f"No hay nombre disponible para {path}")


def process_one(source: Path, output_dir: Path, quality: int, overwrite: bool, skip_existing: bool) -> ProcessResult:
    base_name = slugify(source.stem)
    square_png = output_dir / "square" / "png" / f"{base_name}-studio-square.png"
    square_jpg = output_dir / "square" / "jpg" / f"{base_name}-studio-square.jpg"
    vertical_png = output_dir / "vertical" / "png" / f"{base_name}-studio-vertical.png"
    vertical_jpg = output_dir / "vertical" / "jpg" / f"{base_name}-studio-vertical.jpg"

    if skip_existing and all(path.exists() for path in (square_png, square_jpg, vertical_png, vertical_jpg)):
        return ProcessResult(
            source=str(source),
            status="skipped",
            message="ya existia",
            square_png=str(square_png),
            square_jpg=str(square_jpg),
            vertical_png=str(vertical_png),
            vertical_jpg=str(vertical_jpg),
        )

    try:
        product = remove_background(source)
        square = compose_studio(product, (1600, 1600), 0.76)
        vertical = compose_studio(product, (1600, 2000), 0.78)

        save_pair(square, square_png, square_jpg, quality, overwrite)
        save_pair(vertical, vertical_png, vertical_jpg, quality, overwrite)

        return ProcessResult(
            source=str(source),
            status="ok",
            message="procesada",
            square_png=str(square_png),
            square_jpg=str(square_jpg),
            vertical_png=str(vertical_png),
            vertical_jpg=str(vertical_jpg),
        )
    except Exception as exc:
        return ProcessResult(source=str(source), status="failed", message=str(exc))


def prepare_output(output_dir: Path) -> None:
    for subdir in (
        output_dir / "square" / "png",
        output_dir / "square" / "jpg",
        output_dir / "vertical" / "png",
        output_dir / "vertical" / "jpg",
        output_dir / "logs",
    ):
        subdir.mkdir(parents=True, exist_ok=True)


def write_logs(output_dir: Path, results: list[ProcessResult]) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    log_path = output_dir / "logs" / f"cap-studio-log-{timestamp}.csv"
    with log_path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=[
                "source",
                "status",
                "message",
                "square_png",
                "square_jpg",
                "vertical_png",
                "vertical_jpg",
            ],
        )
        writer.writeheader()
        for result in results:
            writer.writerow(result.__dict__)
    return log_path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Convierte fotos reales de gorras en imagenes de producto tipo estudio."
    )
    parser.add_argument("--input", type=Path, default=Path("input"), help="Carpeta con fotos originales.")
    parser.add_argument("--output", type=Path, default=Path("output"), help="Carpeta donde guardar resultados.")
    parser.add_argument("--quality", type=int, default=94, help="Calidad JPG, 1-100.")
    parser.add_argument("--overwrite", action="store_true", help="Sobrescribe archivos ya exportados.")
    parser.add_argument("--skip-existing", action="store_true", help="Omite imagenes que ya tengan los 4 outputs.")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    input_dir = args.input.resolve()
    output_dir = args.output.resolve()

    if not input_dir.exists() or not input_dir.is_dir():
        print(f"ERROR: no existe la carpeta input: {input_dir}", file=sys.stderr)
        return 2

    prepare_output(output_dir)
    images = list_images(input_dir)
    if not images:
        print(f"ERROR: no hay imagenes procesables en {input_dir}", file=sys.stderr)
        return 2

    results: list[ProcessResult] = []
    for index, source in enumerate(images, start=1):
        print(f"[{index}/{len(images)}] Procesando: {source.name}")
        result = process_one(source, output_dir, args.quality, args.overwrite, args.skip_existing)
        results.append(result)
        print(f"  -> {result.status}: {result.message}")

    log_path = write_logs(output_dir, results)
    ok_count = sum(1 for result in results if result.status == "ok")
    skipped_count = sum(1 for result in results if result.status == "skipped")
    failed_count = len(results) - ok_count - skipped_count
    print(f"\nListo: {ok_count} procesadas, {skipped_count} omitidas, {failed_count} fallidas.")
    print(f"Log: {log_path}")
    print(f"Output: {output_dir}")
    return 0 if failed_count == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
