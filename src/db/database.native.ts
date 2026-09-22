import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";
import { createPresetRepository, PresetDatabase, starterPresets } from "./presetRepository";

let databasePromise: Promise<SQLiteDatabase> | undefined;

export async function getDatabase(): Promise<SQLiteDatabase> {
  databasePromise ??= openDatabaseAsync("blurra.db");
  const database = await databasePromise;
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS presets (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      effectKind TEXT NOT NULL,
      intensity REAL NOT NULL,
      brushSize REAL NOT NULL,
      feather REAL NOT NULL,
      createdAt INTEGER NOT NULL
    );
  `);
  return database;
}

export async function getPresetRepository() {
  const database = await getDatabase();
  const repository = createPresetRepository(database as unknown as PresetDatabase);
  if ((await repository.list()).length === 0) {
    await Promise.all(starterPresets.map((preset) => repository.save(preset)));
  }
  return repository;
}
