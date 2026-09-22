import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../design-system/ThemeProvider";

type EditorToolbarProps = {
  canUndo: boolean;
  canRedo: boolean;
  isBeforeAfter: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onBeforeAfter: () => void;
  onExport: () => void;
};

function IconButton({ label, icon, disabled, onPress }: { label: string; icon: string; disabled?: boolean; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, { opacity: disabled ? 0.28 : pressed ? 0.55 : 1 }]}
    >
      <Text style={{ color: theme.colors.foreground, fontSize: 21 }}>{icon}</Text>
    </Pressable>
  );
}

export function EditorToolbar({ canUndo, canRedo, isBeforeAfter, onUndo, onRedo, onBeforeAfter, onExport }: EditorToolbarProps) {
  const theme = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
      <View style={styles.actions}>
        <IconButton label="Desfazer" icon="↶" disabled={!canUndo} onPress={onUndo} />
        <IconButton label="Refazer" icon="↷" disabled={!canRedo} onPress={onRedo} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isBeforeAfter ? "Ver edição" : "Ver original"}
          accessibilityState={{ selected: isBeforeAfter }}
          onPress={onBeforeAfter}
          style={styles.compareButton}
        >
          <Text style={[styles.compareText, { color: theme.colors.foreground }]}>{isBeforeAfter ? "Edição" : "Antes"}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exportar foto"
          onPress={onExport}
          style={[styles.exportButton, { backgroundColor: theme.colors.accent }]}
        >
          <Text style={styles.exportText}>Exportar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderTopWidth: 1, paddingHorizontal: 10, paddingTop: 10, paddingBottom: 8, gap: 8 },
  actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 },
  iconButton: { width: 40, height: 42, alignItems: "center", justifyContent: "center" },
  compareButton: { minHeight: 42, justifyContent: "center", paddingHorizontal: 4 },
  compareText: { fontSize: 12, fontWeight: "700" },
  exportButton: { minHeight: 44, borderRadius: 15, paddingHorizontal: 15, justifyContent: "center" },
  exportText: { color: "#231512", fontSize: 13, fontWeight: "800" },
});
