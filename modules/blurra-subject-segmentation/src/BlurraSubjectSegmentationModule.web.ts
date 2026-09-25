import { NativeModule, registerWebModule } from "expo";

class BlurraSubjectSegmentationModule extends NativeModule<Record<string, never>> {
  async segment(): Promise<never> {
    throw new Error("Segmentação de sujeito exige um development build nativo.");
  }
}

export default registerWebModule(BlurraSubjectSegmentationModule, "BlurraSubjectSegmentationModule");
