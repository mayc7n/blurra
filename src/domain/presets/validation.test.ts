import { validatePreset } from "./validation";

describe("preset validation", () => {
  it("accepts a valid blur preset", () => {
    const result = validatePreset({
      id: "portrait-soft",
      name: "Retrato suave",
      effectKind: "blur",
      intensity: 0.65,
      brushSize: 0.2,
      feather: 0.4,
    });

    expect(result).toEqual({
      valid: true,
      value: {
        id: "portrait-soft",
        name: "Retrato suave",
        effectKind: "blur",
        intensity: 0.65,
        brushSize: 0.2,
        feather: 0.4,
      },
    });
  });

  it("rejects unknown effects, invalid ranges, and empty names", () => {
    const result = validatePreset({
      id: "broken",
      name: " ",
      effectKind: "glass",
      intensity: 1.2,
      brushSize: 0,
      feather: -1,
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toEqual(
        expect.arrayContaining(["name", "effectKind", "intensity", "brushSize", "feather"]),
      );
    }
  });
});
