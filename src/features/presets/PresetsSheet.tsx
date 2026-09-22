import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../design-system/ThemeProvider";
import { EditorSession } from "../../domain/editor/types";
import { Preset } from "../../domain/presets/types";
import { getPresetRepository } from "../../db/database";

type PresetsSheetProps = {
  visible: boolean;
  session: EditorSession;
  onClose: () => void;
  onApply: (preset: Preset) => void;
};

export function PresetsSheet({ visible, session, onClose, onApply }: PresetsSheetProps) {
  const theme = useAppTheme();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [customName, setCustomName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    getPresetRepository()
      .then(async (repository) => {
        const values = await repository.list();
        if (active) setPresets(values);
      })
      .catch(() => active && setMessage("Não foi possível carregar presets locais."));
    return () => {
      active = false;
    };
  }, [visible]);

  const saveCustomPreset = async () => {
    const name = customName.trim();
    if (!name) {
      setMessage("Dê um nome ao preset antes de salvar.");
      return;
    }
    try {
      const repository = await getPresetRepository();
      const preset: Preset = {
        id: `custom-${Date.now()}`,
        name,
        effectKind: session.tool,
        intensity: session.intensity,
        brushSize: session.brushSize,
        feather: session.feather,
      };
      await repository.save(preset);
      setPresets((current) => [...current, preset]);
      setCustomName("");
      setMessage("Preset salvo neste dispositivo.");
    } catch {
      setMessage("Não foi possível salvar o preset.");
    }
  };

  const deletePreset = async (id: string) => {
    try {
      const repository = await getPresetRepository();
      await repository.delete(id);
      setPresets((current) => current.filter((preset) => preset.id !== id));
    } catch {
      setMessage("Não foi possível remover o preset.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <SafeAreaView style={[styles.sheet, { backgroundColor: theme.colors.surfaceRaised }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.foreground }]}>Presets</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar presets" onPress={onClose}>
              <Text style={[styles.close, { color: theme.colors.foreground }]}>×</Text>
            </Pressable>
          </View>
          <View style={styles.presetList}>
            {presets.map((preset) => (
              <View key={preset.id} style={[styles.presetRow, { borderColor: theme.colors.border }]}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Aplicar preset ${preset.name}`} onPress={() => onApply(preset)} style={styles.presetAction}>
                  <Text style={[styles.presetName, { color: theme.colors.foreground }]}>{preset.name}</Text>
                  <Text style={[styles.presetMeta, { color: theme.colors.muted }]}>{preset.effectKind === "blur" ? "Blur" : "Pixel"} · {Math.round(preset.intensity * 100)}%</Text>
                </Pressable>
                {preset.id.startsWith("custom-") ? (
                  <Pressable accessibilityRole="button" accessibilityLabel={`Excluir preset ${preset.name}`} onPress={() => deletePreset(preset.id)}>
                    <Text style={[styles.delete, { color: theme.colors.danger }]}>Excluir</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
          <View style={[styles.saveRow, { borderTopColor: theme.colors.border }]}>
            <TextInput
              accessibilityLabel="Nome do novo preset"
              placeholder="Salvar controles atuais como…"
              placeholderTextColor={theme.colors.muted}
              value={customName}
              onChangeText={setCustomName}
              style={[styles.input, { color: theme.colors.foreground, borderColor: theme.colors.border }]}
              maxLength={40}
            />
            <Pressable accessibilityRole="button" accessibilityLabel="Salvar preset" onPress={saveCustomPreset} style={[styles.saveButton, { backgroundColor: theme.colors.accent }]}>
              <Text style={styles.saveText}>Salvar</Text>
            </Pressable>
          </View>
          {message ? <Text style={[styles.message, { color: theme.colors.muted }]}>{message}</Text> : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(8,9,12,0.62)" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 14, gap: 14 },
  handle: { alignSelf: "center", width: 38, height: 4, borderRadius: 3, backgroundColor: "#A7A4A0", opacity: 0.6 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8 },
  close: { fontSize: 32, fontWeight: "300" },
  presetList: { gap: 8, maxHeight: 260 },
  presetRow: { borderWidth: 1, borderRadius: 15, minHeight: 56, paddingHorizontal: 13, flexDirection: "row", alignItems: "center" },
  presetAction: { flex: 1, justifyContent: "center" },
  presetName: { fontSize: 14, fontWeight: "800" },
  presetMeta: { fontSize: 12, marginTop: 3 },
  delete: { fontSize: 12, fontWeight: "800", padding: 8 },
  saveRow: { borderTopWidth: 1, paddingTop: 14, flexDirection: "row", gap: 8 },
  input: { flex: 1, minHeight: 46, borderWidth: 1, borderRadius: 14, paddingHorizontal: 13, fontSize: 13 },
  saveButton: { minHeight: 46, borderRadius: 14, paddingHorizontal: 16, justifyContent: "center" },
  saveText: { color: "#231512", fontSize: 13, fontWeight: "800" },
  message: { fontSize: 12, lineHeight: 17 },
});
