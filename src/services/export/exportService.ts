import * as FileSystem from "expo-file-system/legacy";

export type ExportFormat = "png" | "jpeg";

export type ExportConfig = {
  extension: "png" | "jpg";
  mimeType: "image/png" | "image/jpeg";
  quality: number;
};

export type ExportedFile = {
  uri: string;
  extension: ExportConfig["extension"];
  mimeType: ExportConfig["mimeType"];
};

export interface ExportFileAdapter {
  writeBase64(fileName: string, contents: string): Promise<string>;
}

export class ExportError extends Error {
  readonly code = "EXPORT_FAILED";

  constructor(message = "Não foi possível exportar esta imagem.") {
    super(message);
    this.name = "ExportError";
  }
}

export function getExportConfig(format: ExportFormat): ExportConfig {
  return format === "png"
    ? { extension: "png", mimeType: "image/png", quality: 1 }
    : { extension: "jpg", mimeType: "image/jpeg", quality: 0.92 };
}

const defaultAdapter: ExportFileAdapter = {
  async writeBase64(fileName, contents) {
    const cacheDirectory = FileSystem.cacheDirectory;
    if (!cacheDirectory) throw new ExportError("Armazenamento local indisponível.");
    const uri = `${cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(uri, contents, { encoding: FileSystem.EncodingType.Base64 });
    return uri;
  },
};

export async function exportRenderedImage(
  encode: () => string | Promise<string>,
  format: ExportFormat,
  adapter: ExportFileAdapter = defaultAdapter,
): Promise<ExportedFile> {
  const config = getExportConfig(format);
  const fileName = `blurra-export-${Date.now()}.${config.extension}`;

  try {
    const contents = await encode();
    const uri = await adapter.writeBase64(fileName, contents);
    return { uri, extension: config.extension, mimeType: config.mimeType };
  } catch (error) {
    if (error instanceof ExportError) throw error;
    throw new ExportError(error instanceof Error ? error.message : undefined);
  }
}

export async function shareExport(uri: string): Promise<boolean> {
  const Sharing = await import("expo-sharing");
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri);
  return true;
}

export async function saveExportToLibrary(uri: string): Promise<boolean> {
  const MediaLibrary = await import("expo-media-library");
  const permission = await MediaLibrary.requestPermissionsAsync();
  if (!permission.granted) return false;
  await MediaLibrary.createAssetAsync(uri);
  return true;
}
