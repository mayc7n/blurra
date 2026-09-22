import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../design-system/ThemeProvider";
import type { EditorTool } from "../../domain/editor/types";

type EditorToolbarProps = {
  tool: EditorTool;
  canUndo: boolean;
  canRedo: boolean;
  isBeforeAfter: boolean;
  onToolChange: (tool: EditorTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onBeforeAfter: () => void;
  onExport: () => void;
};

function ToolButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.toolButton,
        { backgroundColor: active ? theme.colors.accentSoft : "transparent", opacity: pressed ? 0.65 : 1 },
      ]}
    >
      <Text style={[styles.toolIcon, { color: active ? theme.colors.accent : theme.colors.muted }]}>{label === "Desfocar" ? "◌" : "░"}</Text>
      <Text style={[styles.toolLabel, { color: active ? theme.colors.foreground : theme.colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

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

export function EditorToolbar({ tool, canUndo, canRedo, isBeforeAfter, onToolChange, onUndo, onRedo, onBeforeAfter, onExport }: EditorToolbarProps) {
  const theme = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
      <View style={styles.tools}>
        <ToolButton label="Desfocar" active={tool === "blur"} onPress={() => onToolChange("blur")} />
        <ToolButton label="Pixelar" active={tool === "pixelate"} onPress={() => onToolChange("pixelate")} />
      </View>
      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
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
  );
}

const styles = StyleSheet.create({
  container: { borderTopWidth: 1, paddingHorizontal: 10, paddingTop: 10, paddingBottom: 8, gap: 8 },
  tools: { flexDirection: "row", justifyContent: "center", gap: 8 },
  toolButton: { minHeight: 50, minWidth: 86, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  toolIcon: { fontSize: 20, lineHeight: 22 },
  toolLabel: { fontSize: 11, fontWeight: "700", marginTop: 3 },
  divider: { height: 1, marginHorizontal: 4 },
  iconButton: { position: "absolute", top: 62, width: 40, height: 42, alignItems: "center", justifyContent: "center" },
  compareButton: { position: "absolute", top: 62, right: 96, minHeight: 42, justifyContent: "center", paddingHorizontal: 4 },
  compareText: { fontSize: 12, fontWeight: "700" },
  exportButton: { position: "absolute", top: 60, right: 10, minHeight: 44, borderRadius: 15, paddingHorizontal: 15, justifyContent: "center" },
  exportText: { color: "#231512", fontSize: 13, fontWeight: "800" },
});
