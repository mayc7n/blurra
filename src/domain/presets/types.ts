export type PresetEffectKind = "blur" | "pixelate";

export type Preset = {
  id: string;
  name: string;
  effectKind: PresetEffectKind;
  intensity: number;
  brushSize: number;
  feather: number;
};

export type PresetInput = {
  id?: unknown;
  name?: unknown;
  effectKind?: unknown;
  intensity?: unknown;
  brushSize?: unknown;
  feather?: unknown;
} & Record<string, unknown>;
