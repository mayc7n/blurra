import { Preset } from "../domain/presets/types";

export type StoredPreset = Preset & { createdAt: number };

export interface PresetDatabase {
  execAsync(sql: string): Promise<void>;
  getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]>;
  runAsync(sql: string, ...params: unknown[]): Promise<unknown>;
}

export interface PresetRepository {
  list(): Promise<Preset[]>;
  save(preset: Preset): Promise<void>;
  delete(id: string): Promise<void>;
}

export const starterPresets: Preset[] = [
  { id: "starter-portrait", name: "Retrato suave", effectKind: "blur", intensity: 0.65, brushSize: 0.18, feather: 0.5 },
  { id: "starter-detail", name: "Detalhe", effectKind: "blur", intensity: 0.85, brushSize: 0.1, feather: 0.3 },
  { id: "starter-pixel", name: "Pixel", effectKind: "pixelate", intensity: 0.8, brushSize: 0.16, feather: 0.18 },
];

export function createPresetRepository(database: PresetDatabase): PresetRepository {
  return {
    async list() {
      const rows = await database.getAllAsync<StoredPreset>(
        "SELECT id, name, effectKind, intensity, brushSize, feather, createdAt FROM presets ORDER BY createdAt ASC",
      );
      return rows.map(({ id, name, effectKind, intensity, brushSize, feather }) => ({
        id,
        name,
        effectKind,
        intensity,
        brushSize,
        feather,
      }));
    },
    async save(preset) {
      await database.runAsync(
        "INSERT OR REPLACE INTO presets (id, name, effectKind, intensity, brushSize, feather, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        preset.id,
        preset.name,
        preset.effectKind,
        preset.intensity,
        preset.brushSize,
        preset.feather,
        Date.now(),
      );
    },
    async delete(id) {
      await database.runAsync("DELETE FROM presets WHERE id = ?", id);
    },
  };
}
