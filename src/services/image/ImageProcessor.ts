import type { EditorSession } from "../../domain/editor/types";

export type RenderTarget = {
  width: number;
  height: number;
  sourceUri?: string;
};

export type RenderResult = {
  uri: string;
  width: number;
  height: number;
  mimeType: "image/png" | "image/jpeg";
};

export interface ImageProcessor {
  renderPreview(session: EditorSession, target: RenderTarget): Promise<RenderResult>;
  renderExport(session: EditorSession, target: RenderTarget): Promise<RenderResult>;
}

export class ImageProcessorUnavailableError extends Error {
  readonly code = "IMAGE_PROCESSOR_UNAVAILABLE";

  constructor() {
    super("The image processor is not available in this runtime.");
    this.name = "ImageProcessorUnavailableError";
  }
}
