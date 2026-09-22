import { exportRenderedImage, getExportConfig, ExportFileAdapter, ExportError } from "./exportService";

describe("export service", () => {
  it("maps PNG and JPEG formats to native file metadata", () => {
    expect(getExportConfig("png")).toEqual({ extension: "png", mimeType: "image/png", quality: 1 });
    expect(getExportConfig("jpeg")).toEqual({ extension: "jpg", mimeType: "image/jpeg", quality: 0.92 });
  });

  it("returns a local file without touching editor state", async () => {
    const adapter: ExportFileAdapter = {
      writeBase64: jest.fn(async () => "file:///cache/blurra-export.png"),
    };

    await expect(exportRenderedImage(() => "encoded-image", "png", adapter)).resolves.toEqual({
      uri: "file:///cache/blurra-export.png",
      extension: "png",
      mimeType: "image/png",
    });
    expect(adapter.writeBase64).toHaveBeenCalledWith(expect.stringContaining("blurra-export-"), "encoded-image");
  });

  it("returns a typed error when encoding or writing fails", async () => {
    const adapter: ExportFileAdapter = {
      writeBase64: jest.fn(async () => {
        throw new Error("disk full");
      }),
    };

    await expect(exportRenderedImage(() => "encoded-image", "jpeg", adapter)).rejects.toBeInstanceOf(ExportError);
  });
});
