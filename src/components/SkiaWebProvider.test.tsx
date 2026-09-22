import { SkiaWebProvider } from "./SkiaWebProvider";

describe("Skia web provider", () => {
  it("exposes a platform-safe provider boundary", () => {
    expect(SkiaWebProvider).toBeDefined();
  });
});
