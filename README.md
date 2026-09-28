# WebP Conversion Lab

Sandbox for testing image → WebP conversion with [sharp](https://sharp.pixelplumbing.com/) before adding it to the Strive Space upload flow.

## Why server-side

Client-side checks (`file.type`, Canvas conversion) can be bypassed. Decoding and re-encoding the image on the server is the real security layer: it validates the actual file contents, strips metadata (EXIF/GPS), and discards anything that isn't valid pixel data.

## Requirements

- Node.js 20.9 or newer
- npm

## Setup

```bash
npm install
mkdir -p input output
```

Put test images in `input/` (this folder is git-ignored, so nothing you drop in it gets committed).

## Run

```bash
npm run test:batch
```

For every file in `input/`, the script:

1. Reads the real format from the file contents (not the extension)
2. Rejects formats outside the allow-list (`jpeg`, `png`, `webp`, `gif`, `tiff`)
3. Enforces a pixel limit (`limitInputPixels: 50,000,000`) to block decompression bombs
4. Applies EXIF orientation, converts to WebP (quality 80), and writes to `output/`
5. Logs format, dimensions, size before/after, time, and whether EXIF survived

## Suggested test set

- Large phone JPEG
- PNG with transparency
- GIF, BMP/TIFF
- HEIC (expected to fail with prebuilt sharp binaries)
- Rotated photo with GPS EXIF (verify `exif kept: false`)
- Text file renamed to `.jpg` (must fail)
- Very large dimensions (must hit the pixel limit)

## Security notes

- Keep sharp up to date (older versions shipped a vulnerable libwebp, CVE-2023-4863)
- Restrict inputs to raster formats
- Never trust `file.type` or the file extension
- Don't commit test images

## Next steps

- [ ] Compare against `cwebp` (size/quality baseline)
- [ ] Test client-side pre-compression (Canvas / browser-image-compression)
- [ ] Wrap in a Netlify Function for Strive Space uploads
- [ ] Upload the converted file to the Supabase `user_images` bucket