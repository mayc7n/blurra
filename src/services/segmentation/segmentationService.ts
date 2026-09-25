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
  return result.width > 0
    && result.height > 0
    && result.confidence >= 0.35
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

export async function segmentPerson(sourceUri: string): Promise<SegmentationResult> {
  return nativeSegmentationModule.segment(sourceUri);
}
