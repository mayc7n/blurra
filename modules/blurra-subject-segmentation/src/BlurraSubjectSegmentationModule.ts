import { NativeModule, requireNativeModule } from "expo";
import type { BlurraSubjectSegmentationResult } from "./BlurraSubjectSegmentation.types";

declare class BlurraSubjectSegmentationModule extends NativeModule<Record<string, never>> {
  segment(sourceUri: string): Promise<BlurraSubjectSegmentationResult>;
}

export default requireNativeModule<BlurraSubjectSegmentationModule>("BlurraSubjectSegmentation");
