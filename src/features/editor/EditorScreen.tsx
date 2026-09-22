import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../design-system/ThemeProvider";
import { useEditorStore } from "../../store/editorStore";
import { BrushStroke } from "../../domain/editor/types";
import { BrushControls } from "./BrushControls";
import { EditorCanvas } from "./EditorCanvas";
import { EditorToolbar } from "./EditorToolbar";

export function EditorScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const history = useEditorStore((state) => state.history);
  const setTool = useEditorStore((state) => state.setTool);
  const setIntensity = useEditorStore((state) => state.setIntensity);
  const setBrushSize = useEditorStore((state) => state.setBrushSize);
  const setFeather = useEditorStore((state) => state.setFeather);
  const addStroke = useEditorStore((state) => state.addStroke);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const dispatch = useEditorStore((state) => state.dispatch);
  const session = history.present;

  const handleAddStroke = useCallback((stroke: BrushStroke) => addStroke(stroke), [addStroke]);

  if (!session.sourceUri) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyTitle, { color: theme.colors.foreground }]}>Escolha uma foto para começar.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar para início" onPress={() => router.back()}>
          <Text style={[styles.backText, { color: theme.colors.accent }]}>Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" />
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.headerButton}>
          <Text style={[styles.headerIcon, { color: theme.colors.foreground }]}>‹</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.foreground }]}>Editar foto</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Ajuda do editor" onPress={() => Alert.alert("Pincel", "Toque e arraste sobre a foto. Use dois dedos para ampliar e mover.")} style={styles.headerButton}>
          <Text style={[styles.help, { color: theme.colors.foreground, borderColor: theme.colors.border }]}>?</Text>
        </Pressable>
      </View>
      <View style={styles.canvasContainer}>
        <EditorCanvas session={session} onAddStroke={handleAddStroke} />
      </View>
      <BrushControls
        intensity={session.intensity}
        brushSize={session.brushSize}
        feather={session.feather}
        onIntensityChange={setIntensity}
        onBrushSizeChange={setBrushSize}
        onFeatherChange={setFeather}
      />
      <EditorToolbar
        tool={session.tool}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        isBeforeAfter={session.isBeforeAfter}
        onToolChange={setTool}
        onUndo={undo}
        onRedo={redo}
        onBeforeAfter={() => dispatch({ type: "toggleBeforeAfter" })}
        onExport={() => Alert.alert("Exportar", "A exportação será concluída ao abrir o painel de exportação.")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, paddingHorizontal: 10 },
  headerButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerIcon: { fontSize: 34, fontWeight: "300", lineHeight: 38 },
  help: { width: 22, height: 22, borderWidth: 1, borderRadius: 11, textAlign: "center", lineHeight: 20, fontWeight: "800" },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  canvasContainer: { flex: 1, minHeight: 220 },
  emptyTitle: { fontSize: 22, fontWeight: "800", padding: 24 },
  backText: { fontSize: 16, fontWeight: "700", paddingHorizontal: 24 },
});
