# Blurra architecture

Blurra is a local-first Expo application. The UI is divided into route-level
features, the editor state is held in a small domain model, and image effects
are rendered behind an `ImageProcessor` boundary so the editor does not depend
on a specific native engine.

```text
Expo Router
  -> feature screens
    -> Zustand session commands
      -> editor domain reducer
        -> ImageProcessor
          -> React Native Skia preview/export
```

Photo URIs and dimensions remain local. Blur operations and their masks are
normalized to source-image coordinates, which makes them stable across safe
areas, orientation, zoom, device density, and export resolution.

## Main boundaries

- `src/domain/editor`: pure types, coordinate transforms, history, and reducer.
- `src/features/editor`: canvas, gestures, toolbar, and accessible controls.
- `src/services/image`: Skia rendering and the future native processor seam.
- `src/services/media`: gallery, camera, file, and media-library adapters.
- `src/db`: SQLite preset repository on native platforms and an equivalent
  in-memory adapter for web static export.
- `src/native`: platform contracts such as future on-device segmentation.

Export snapshots the rendered Skia view, encodes PNG/JPEG locally, writes to
the app cache, and only then opens the native share sheet or media-library save
flow. Export never clears or mutates the editor session.

The MVP deliberately omits accounts, cloud sync, analytics, and server-side
image processing.

## POC rendering contract

The first vertical slice stores Gaussian blur operations in normalized source
coordinates. The canvas draws the original image, one Skia-blurred copy per
operation, and a geometry-specific alpha mask through the same render pipeline.
Gesture updates stay on the UI worklet path; the session receives the normalized
operation when the gesture ends.

The POC export snapshots the rendered working-size canvas. This validates local
encoding and sharing without pretending to solve full-resolution export. The
future native `ExportEngine` will replay the same session against the original
bitmap using Core Image/Metal on iOS and a native Android GPU/bitmap pipeline.

## Native boundary planned later

```text
React Native UI
  ├── PreviewEngine: React Native Skia
  ├── SubjectSegmenter: Vision / ML Kit
  └── ExportEngine: Core Image/Metal / Android native GPU
```

Only the first boundary is active in this POC. `SubjectSegmenter` and
full-resolution `ExportEngine` remain interfaces, not fake implementations.
