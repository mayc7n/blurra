import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { makeImageFromView, ImageFormat } from "@shopify/react-native-skia";
import { useCallback, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, useColorScheme, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../design-system/ThemeProvider";
import { useEditorStore } from "../../store/editorStore";
import { BrushStroke } from "../../domain/editor/types";
import { exportRenderedImage, ExportFormat, ExportedFile, saveExportToLibrary, shareExport } from "../../services/export/exportService";
import { BrushControls } from "./BrushControls";
import { EditorCanvas } from "./EditorCanvas";
import { EditorToolbar } from "./EditorToolbar";
import { ExportSheet } from "../export/ExportSheet";
import { PresetsSheet } from "../presets/PresetsSheet";

export function EditorScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const canvasRef = useRef<View>(null);
  const [isExportVisible, setExportVisible] = useState(false);
  const [isPresetsVisible, setPresetsVisible] = useState(false);
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

  const handleExport = useCallback(async (format: ExportFormat): Promise<ExportedFile> => {
    if (!canvasRef.current) throw new Error("Editor indisponível para exportação.");
    const snapshot = await makeImageFromView(canvasRef);
    if (!snapshot) throw new Error("Não foi possível preparar a imagem.");
    const encoded = snapshot.encodeToBase64(format === "png" ? ImageFormat.PNG : ImageFormat.JPEG, format === "png" ? 100 : 92);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return exportRenderedImage(() => encoded, format);
  }, []);

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
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.headerButton}>
          <Text style={[styles.headerIcon, { color: theme.colors.foreground }]}>‹</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.foreground, fontSize: width < 360 ? 14 : 16 }]}>Editar foto</Text>
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir presets" onPress={() => setPresetsVisible(true)} style={styles.presetsButton}>
            <Text style={[styles.presetsText, { color: theme.colors.accent }]}>Presets</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Ajuda do editor" onPress={() => Alert.alert("Pincel", "Toque e arraste sobre a foto. Use dois dedos para ampliar e mover.")} style={styles.headerButton}>
            <Text style={[styles.help, { color: theme.colors.foreground, borderColor: theme.colors.border }]}>?</Text>
          </Pressable>
        </View>
      </View>
      <View ref={canvasRef} collapsable={false} style={styles.canvasContainer}>
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
        onExport={() => setExportVisible(true)}
      />
      <ExportSheet
        visible={isExportVisible}
        onClose={() => setExportVisible(false)}
        onExport={handleExport}
        onShare={shareExport}
        onSave={saveExportToLibrary}
      />
      <PresetsSheet
        visible={isPresetsVisible}
        session={session}
        onClose={() => setPresetsVisible(false)}
        onApply={(preset) => {
          setTool(preset.effectKind);
          setIntensity(preset.intensity);
          setBrushSize(preset.brushSize);
          setFeather(preset.feather);
          setPresetsVisible(false);
        }}
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
  headerActions: { flexDirection: "row", alignItems: "center" },
  presetsButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 7 },
  presetsText: { fontSize: 12, fontWeight: "800" },
  canvasContainer: { flex: 1, minHeight: 220 },
  emptyTitle: { fontSize: 22, fontWeight: "800", padding: 24 },
  backText: { fontSize: 16, fontWeight: "700", paddingHorizontal: 24 },
});
