import { Preset } from "../domain/presets/types";
import { createPresetRepository, PresetDatabase } from "./presetRepository";

class MemoryDatabase implements PresetDatabase {
  rows: Preset[] = [];

  async execAsync() {}

  async getAllAsync<T>(): Promise<T[]> {
    return [...this.rows] as T[];
  }

  async runAsync(_sql: string, ...params: unknown[]) {
    if (_sql.startsWith("INSERT")) {
      const [id, name, effectKind, intensity, brushSize, feather, createdAt] = params as [string, string, Preset["effectKind"], number, number, number, number];
      this.rows.push({ id, name, effectKind, intensity, brushSize, feather, createdAt } as Preset & { createdAt: number });
    }
    if (_sql.startsWith("DELETE")) this.rows = this.rows.filter((row) => row.id !== params[0]);
  }
}

describe("preset repository", () => {
  it("lists, saves, and deletes local presets", async () => {
    const database = new MemoryDatabase();
    const repository = createPresetRepository(database);
    const preset = {
      id: "custom-1",
      name: "Meu detalhe",
      effectKind: "pixelate" as const,
      intensity: 0.8,
      brushSize: 0.12,
      feather: 0.25,
    };

    await repository.save(preset);
    expect(await repository.list()).toEqual([preset]);

    await repository.delete(preset.id);
    expect(await repository.list()).toEqual([]);
  });
});
