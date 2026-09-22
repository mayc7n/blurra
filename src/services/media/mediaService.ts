import * as ImagePicker from "expo-image-picker";

export type PhotoAsset = {
  uri: string;
  width: number;
  height: number;
};

export type MediaResult =
  | { kind: "photo"; uri: string; width: number; height: number }
  | { kind: "cancelled" }
  | { kind: "permission-denied" }
  | { kind: "error"; message: string };

export type PhotoPickerAdapter = {
  requestPermission: () => Promise<{ granted: boolean }>;
  launch: () => Promise<{ canceled: boolean; assets?: PhotoAsset[] }>;
};

const galleryAdapter: PhotoPickerAdapter = {
  requestPermission: async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return { granted: permission.granted };
  },
  launch: async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      allowsEditing: false,
      exif: false,
    });

    return {
      canceled: result.canceled,
      assets: result.canceled ? undefined : result.assets,
    };
  },
};

const cameraAdapter: PhotoPickerAdapter = {
  requestPermission: async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    return { granted: permission.granted };
  },
  launch: async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      exif: false,
    });

    return {
      canceled: result.canceled,
      assets: result.canceled ? undefined : result.assets,
    };
  },
};

export async function pickPhoto(adapter: PhotoPickerAdapter = galleryAdapter): Promise<MediaResult> {
  try {
    const permission = await adapter.requestPermission();
    if (!permission.granted) return { kind: "permission-denied" };

    const result = await adapter.launch();
    if (result.canceled) return { kind: "cancelled" };

    const asset = result.assets?.[0];
    if (!asset) return { kind: "error", message: "Nenhuma foto foi selecionada." };
    return { kind: "photo", uri: asset.uri, width: asset.width, height: asset.height };
  } catch {
    return { kind: "error", message: "Não foi possível acessar esta foto." };
  }
}

export function capturePhoto(): Promise<MediaResult> {
  return pickPhoto(cameraAdapter);
}
