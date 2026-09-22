# Blurra MVP

## Included

- Gallery and camera import.
- Responsive editor with safe areas, zoom, pan, and brush blur.
- Gaussian blur and pixelate effects.
- Undo/redo and before/after comparison.
- Local starter and custom presets.
- PNG/JPEG export and native sharing.
- Dark mode, Dynamic Type-friendly controls, and screen-reader labels.

The editor uses a bounded preview surface for interaction and keeps brush
strokes in source-image coordinates. Export snapshots the rendered canvas at
the working size in this MVP; full-resolution replay remains a later native
processor upgrade.

## Next versions

Automatic person segmentation will use ML Kit Selfie Segmentation on Android
and Vision person segmentation on iOS through an on-device native adapter.
Custom lasso/polygon masks, radial blur, glass blur, motion blur, WebP export,
cloud sync, and optional watermark billing remain outside the local MVP.

The 16 ms preview target must be measured on physical low-memory and flagship
devices before a production release is declared.
