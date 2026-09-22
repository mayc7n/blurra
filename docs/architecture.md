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

Photo URIs and dimensions remain local. Brush strokes are normalized to source
image coordinates, which makes them stable across safe areas, orientation,
zoom, device density, and export resolution.

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
