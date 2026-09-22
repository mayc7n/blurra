export type SegmentationResult = {
  maskUri: string;
  width: number;
  height: number;
  confidence: number;
};

export interface SubjectSegmenter {
  segment(uri: string): Promise<SegmentationResult>;
}

export class SubjectSegmenterUnavailableError extends Error {
  readonly code = "SUBJECT_SEGMENTER_UNAVAILABLE";

  constructor() {
    super("Automatic subject segmentation is not available in the MVP.");
    this.name = "SubjectSegmenterUnavailableError";
  }
}

export class UnavailableSubjectSegmenter implements SubjectSegmenter {
  async segment(_uri: string): Promise<SegmentationResult> {
    throw new SubjectSegmenterUnavailableError();
  }
}
