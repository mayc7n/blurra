import { pickPhoto, PhotoPickerAdapter } from "./mediaService";

const photo = { uri: "file:///blurra/photo.heic", width: 3024, height: 4032 };

function adapter(overrides: Partial<PhotoPickerAdapter>): PhotoPickerAdapter {
  return {
    requestPermission: async () => ({ granted: true }),
    launch: async () => ({ canceled: false, assets: [photo] }),
    ...overrides,
  };
}

describe("media service", () => {
  it("returns cancelled when the user closes the picker", async () => {
    await expect(pickPhoto(adapter({ launch: async () => ({ canceled: true }) }))).resolves.toEqual({ kind: "cancelled" });
  });

  it("normalizes a selected asset without copying or uploading it", async () => {
    await expect(pickPhoto(adapter({}))).resolves.toEqual({ kind: "photo", ...photo });
  });

  it("returns permission-denied without opening the picker", async () => {
    const launch = jest.fn(async () => ({ canceled: false, assets: [photo] }));
    await expect(pickPhoto(adapter({ requestPermission: async () => ({ granted: false }), launch }))).resolves.toEqual({
      kind: "permission-denied",
    });
    expect(launch).not.toHaveBeenCalled();
  });
});
