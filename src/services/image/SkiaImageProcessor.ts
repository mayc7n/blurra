import type { EditorSession } from "../../domain/editor/types";
import {
  ImageProcessor,
  ImageProcessorUnavailableError,
  RenderResult,
  RenderTarget,
} from "./ImageProcessor";

export class SkiaImageProcessor implements ImageProcessor {
  async renderPreview(_session: EditorSession, _target: RenderTarget): Promise<RenderResult> {
    throw new ImageProcessorUnavailableError();
  }

  async renderExport(_session: EditorSession, _target: RenderTarget): Promise<RenderResult> {
    throw new ImageProcessorUnavailableError();
  }
}
