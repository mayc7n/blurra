import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../design-system/ThemeProvider";
import { ExportFormat, ExportedFile } from "../../services/export/exportService";
import { PermissionNotice } from "../../components/PermissionNotice";

type ExportSheetProps = {
  visible: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => Promise<ExportedFile>;
  onShare: (uri: string) => Promise<boolean>;
  onSave: (uri: string) => Promise<boolean>;
};

export function ExportSheet({ visible, onClose, onExport, onShare, onSave }: ExportSheetProps) {
  const theme = useAppTheme();
  const [format, setFormat] = useState<ExportFormat>("png");
  const [file, setFile] = useState<ExportedFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    setBusy(true);
    setMessage(null);
    try {
      setFile(await onExport(format));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível exportar a foto.");
    } finally {
      setBusy(false);
    }
  };

  const handleNativeAction = async (action: (uri: string) => Promise<boolean>, successMessage: string) => {
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      const succeeded = await action(file.uri);
      setMessage(succeeded ? successMessage : "Esta ação não está disponível agora.");
    } catch {
      setMessage("Esta ação não está disponível agora.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <SafeAreaView style={[styles.sheet, { backgroundColor: theme.colors.surfaceRaised }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>SAÍDA LOCAL</Text>
              <Text style={[styles.title, { color: theme.colors.foreground }]}>Exportar foto</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar exportação" onPress={onClose}>
              <Text style={[styles.close, { color: theme.colors.foreground }]}>×</Text>
            </Pressable>
          </View>
          <Text style={[styles.body, { color: theme.colors.muted }]}>Sua foto continua no dispositivo. Escolha um formato para gerar uma cópia editada.</Text>
          <View style={styles.formatRow}>
            {(["png", "jpeg"] as const).map((option) => (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ selected: format === option }}
                accessibilityLabel={option === "png" ? "Formato PNG" : "Formato JPEG"}
                onPress={() => setFormat(option)}
                style={[styles.format, { borderColor: format === option ? theme.colors.accent : theme.colors.border, backgroundColor: format === option ? theme.colors.accentSoft : theme.colors.surface }]}
              >
                <Text style={[styles.formatTitle, { color: theme.colors.foreground }]}>{option.toUpperCase()}</Text>
                <Text style={[styles.formatBody, { color: theme.colors.muted }]}>{option === "png" ? "Sem perda" : "Mais leve"}</Text>
              </Pressable>
            ))}
          </View>
          {message ? <PermissionNotice message={message} /> : null}
          <Pressable accessibilityRole="button" accessibilityLabel="Gerar exportação" disabled={busy} onPress={handleExport} style={[styles.primary, { backgroundColor: theme.colors.accent, opacity: busy ? 0.5 : 1 }]}>
            <Text style={styles.primaryText}>{busy ? "Processando…" : file ? "Gerar novamente" : "Gerar arquivo"}</Text>
          </Pressable>
          {file ? (
            <View style={styles.resultActions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Compartilhar arquivo" disabled={busy} onPress={() => handleNativeAction(onShare, "Pronto para compartilhar.")} style={[styles.secondary, { borderColor: theme.colors.border }]}>
                <Text style={[styles.secondaryText, { color: theme.colors.foreground }]}>Compartilhar</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Salvar na galeria" disabled={busy} onPress={() => handleNativeAction(onSave, "Salvo na galeria.")} style={[styles.secondary, { borderColor: theme.colors.border }]}>
                <Text style={[styles.secondaryText, { color: theme.colors.foreground }]}>Salvar</Text>
              </Pressable>
            </View>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(8,9,12,0.62)" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 14, gap: 16 },
  handle: { alignSelf: "center", width: 38, height: 4, borderRadius: 3, backgroundColor: "#A7A4A0", opacity: 0.6 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { fontSize: 10, letterSpacing: 1.8, fontWeight: "800" },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, marginTop: 3 },
  close: { fontSize: 32, fontWeight: "300" },
  body: { fontSize: 14, lineHeight: 20 },
  formatRow: { flexDirection: "row", gap: 10 },
  format: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 14 },
  formatTitle: { fontSize: 14, fontWeight: "800" },
  formatBody: { fontSize: 12, marginTop: 4 },
  primary: { minHeight: 50, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  primaryText: { color: "#231512", fontSize: 15, fontWeight: "800" },
  resultActions: { flexDirection: "row", gap: 10 },
  secondary: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  secondaryText: { fontSize: 14, fontWeight: "800" },
});
