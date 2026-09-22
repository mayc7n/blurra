# Blurra MVP

## Included

- Gallery and camera import.
- Responsive editor with safe areas, zoom, pan, and six blur shapes.
- Gaussian blur rendered by React Native Skia.
- Undo/redo and before/after comparison.
- Local PNG/JPEG export and native sharing.
- Dark mode, Dynamic Type-friendly controls, and screen-reader labels.

The POC keeps Gaussian blur operations and masks in normalized source-image
coordinates. Export snapshots the rendered canvas at the working size;
full-resolution replay remains a later native processor upgrade.

## Next versions

Presets, automatic person segmentation, radial blur, glass blur, motion blur,
WebP export, cloud sync, and optional watermark billing remain outside this POC.

The 16 ms preview target must be measured on physical low-memory and flagship
devices before a production release is declared.
