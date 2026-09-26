import { createBackgroundBlurOperation, getSegmentationOperationId, hasSegmentationOperation, isUsableSegmentationResult, SegmentationResult } from "./segmentationService";

jest.mock("../../../modules/blurra-subject-segmentation", () => ({ default: { segment: jest.fn() } }));

const result: SegmentationResult = {
  maskUri: "file:///cache/background-mask.png",
  width: 512,
  height: 384,
  confidence: 0.82,
  foregroundCoverage: 0.34,
};

describe("segmentation service", () => {
  it("accepts a usable person mask and creates a background operation", () => {
    expect(isUsableSegmentationResult(result)).toBe(true);

    expect(createBackgroundBlurOperation(result, 0.35, 0.7)).toMatchObject({
      blurType: "gaussian",
      mask: { kind: "segmentation", uri: result.maskUri },
      feather: 0.35,
      intensity: 0.7,
    });
  });

  it("rejects low-confidence or implausible subject coverage", () => {
    expect(isUsableSegmentationResult({ ...result, confidence: 0.2 })).toBe(false);
    expect(isUsableSegmentationResult({ ...result, foregroundCoverage: 0.005 })).toBe(false);
    expect(isUsableSegmentationResult({ ...result, foregroundCoverage: 0.99 })).toBe(false);
  });

  it("rejects a native result without a usable mask or finite metadata", () => {
    expect(isUsableSegmentationResult({ ...result, maskUri: "   " })).toBe(false);
    expect(isUsableSegmentationResult({ ...result, confidence: Number.POSITIVE_INFINITY })).toBe(false);
    expect(isUsableSegmentationResult({ ...result, foregroundCoverage: Number.NaN })).toBe(false);
  });

  it("detects an existing automatic background operation", () => {
    const operation = createBackgroundBlurOperation(result, 0.35, 0.7);

    expect(hasSegmentationOperation([])).toBe(false);
    expect(hasSegmentationOperation([operation])).toBe(true);
    expect(getSegmentationOperationId([])).toBeNull();
    expect(getSegmentationOperationId([operation])).toBe(operation.id);
  });
});
