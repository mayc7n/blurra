import { Preset } from "../domain/presets/types";
import { createPresetRepository, PresetDatabase, starterPresets } from "./presetRepository";

class WebPresetDatabase implements PresetDatabase {
  private rows: Array<Preset & { createdAt: number }> = [];

  async execAsync() {}

  async getAllAsync<T>(): Promise<T[]> {
    return [...this.rows].sort((first, second) => first.createdAt - second.createdAt) as T[];
  }

  async runAsync(sql: string, ...params: unknown[]) {
    if (sql.startsWith("INSERT")) {
      const [id, name, effectKind, intensity, brushSize, feather, createdAt] = params as [string, string, Preset["effectKind"], number, number, number, number];
      this.rows = this.rows.filter((row) => row.id !== id);
      this.rows.push({ id, name, effectKind, intensity, brushSize, feather, createdAt });
    }
    if (sql.startsWith("DELETE")) this.rows = this.rows.filter((row) => row.id !== params[0]);
  }
}

const webDatabase = new WebPresetDatabase();
const webRepository = createPresetRepository(webDatabase);
let isSeeded = false;

export async function getPresetRepository() {
  if (!isSeeded) {
    await Promise.all(starterPresets.map((preset) => webRepository.save(preset)));
    isSeeded = true;
  }
  return webRepository;
}
