import type { BlurOperation } from "../../domain/editor/types";
import nativeSegmentationModule from "../../../modules/blurra-subject-segmentation";

export type SegmentationResult = {
  maskUri: string;
  width: number;
  height: number;
  confidence: number;
  foregroundCoverage: number;
};

export function isUsableSegmentationResult(result: SegmentationResult): boolean {
  return typeof result.maskUri === "string"
    && result.maskUri.trim().length > 0
    && Number.isInteger(result.width)
    && result.width > 0
    && Number.isInteger(result.height)
    && result.height > 0
    && Number.isFinite(result.confidence)
    && result.confidence >= 0.35
    && result.confidence <= 1
    && Number.isFinite(result.foregroundCoverage)
    && result.foregroundCoverage >= 0.01
    && result.foregroundCoverage <= 0.95;
}

export function createBackgroundBlurOperation(result: SegmentationResult, feather: number, intensity: number): BlurOperation {
  return {
    id: `segmentation-${Date.now()}`,
    blurType: "gaussian",
    mask: {
      kind: "segmentation",
      uri: result.maskUri,
      width: result.width,
      height: result.height,
      confidence: result.confidence,
      foregroundCoverage: result.foregroundCoverage,
    },
    feather,
    intensity,
  };
}

export function hasSegmentationOperation(operations: BlurOperation[]): boolean {
  return getSegmentationOperationId(operations) !== null;
}

export function getSegmentationOperationId(operations: BlurOperation[]): string | null {
  return operations.find((operation) => operation.mask.kind === "segmentation")?.id ?? null;
}

export async function segmentPerson(sourceUri: string): Promise<SegmentationResult> {
  return nativeSegmentationModule.segment(sourceUri);
}
