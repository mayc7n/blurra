import { Preset, PresetInput } from "./types";

export type PresetValidation =
  | { valid: true; value: Preset }
  | { valid: false; errors: string[] };

const isUnit = (value: unknown): value is number => typeof value === "number" && value >= 0 && value <= 1;

export function validatePreset(input: PresetInput): PresetValidation {
  const errors: string[] = [];
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const effectKind = input.effectKind;
  const intensity = input.intensity;
  const brushSize = input.brushSize;
  const feather = input.feather;
  const normalizedEffectKind = effectKind === "blur" || effectKind === "pixelate" ? effectKind : undefined;
  const normalizedIntensity = isUnit(intensity) ? intensity : undefined;
  const normalizedBrushSize = typeof brushSize === "number" && brushSize > 0 && brushSize <= 1 ? brushSize : undefined;
  const normalizedFeather = isUnit(feather) ? feather : undefined;

  if (!name || name.length > 40) errors.push("name");
  if (!normalizedEffectKind) errors.push("effectKind");
  if (normalizedIntensity === undefined) errors.push("intensity");
  if (normalizedBrushSize === undefined) errors.push("brushSize");
  if (normalizedFeather === undefined) errors.push("feather");

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    value: {
      id: typeof input.id === "string" && input.id.length > 0 ? input.id : `preset-${Date.now()}`,
      name,
      effectKind: normalizedEffectKind as Preset["effectKind"],
      intensity: normalizedIntensity as number,
      brushSize: normalizedBrushSize as number,
      feather: normalizedFeather as number,
    },
  };
}
