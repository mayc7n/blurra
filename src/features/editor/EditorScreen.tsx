import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { makeImageFromView, ImageFormat } from "@shopify/react-native-skia";
import { useCallback, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, useColorScheme, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../design-system/ThemeProvider";
import { useEditorStore } from "../../store/editorStore";
import { getShapeSize, resizeBlurShape } from "../../domain/editor/shapes";
import { createBackgroundBlurOperation, getSegmentationOperationId, hasSegmentationOperation, isUsableSegmentationResult, segmentPerson } from "../../services/segmentation/segmentationService";
import { exportRenderedImage, ExportFormat, ExportedFile, saveExportToLibrary, shareExport } from "../../services/export/exportService";
import { BrushControls } from "./BrushControls";
import { EditorCanvas } from "./EditorCanvas";
import { EditorToolbar } from "./EditorToolbar";
import { ExportSheet } from "../export/ExportSheet";

export function EditorScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const canvasRef = useRef<View>(null);
  const [isExportVisible, setExportVisible] = useState(false);
  const [isExporting, setExporting] = useState(false);
  const [isSegmenting, setSegmenting] = useState(false);
  const [segmentationStatus, setSegmentationStatus] = useState<string | null>(null);
  const history = useEditorStore((state) => state.history);
  const setIntensity = useEditorStore((state) => state.setIntensity);
  const setBrushSize = useEditorStore((state) => state.setBrushSize);
  const setFeather = useEditorStore((state) => state.setFeather);
  const addOperation = useEditorStore((state) => state.addOperation);
  const removeOperation = useEditorStore((state) => state.removeOperation);
  const updateOperation = useEditorStore((state) => state.updateOperation);
  const setActiveShapeKind = useEditorStore((state) => state.setActiveShapeKind);
  const setActiveMaskMode = useEditorStore((state) => state.setActiveMaskMode);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const dispatch = useEditorStore((state) => state.dispatch);
  const session = history.present;

  const selectedOperation = session.operations.find((operation) => operation.id === session.selectedOperationId);
  const selectedShape = selectedOperation?.mask.kind === "shape" ? selectedOperation.mask.shape : undefined;
  const segmentationOperationId = getSegmentationOperationId(session.operations);
  const handleAddOperation = (operation: Parameters<typeof addOperation>[0]) => addOperation(operation);
  const handleIntensityChange = (intensity: number) => selectedOperation ? updateOperation(selectedOperation.id, { intensity }) : setIntensity(intensity);
  const handleBrushSizeChange = (size: number) => {
    if (!selectedOperation || selectedOperation.mask.kind !== "shape") {
      setBrushSize(size);
      return;
    }
    updateOperation(selectedOperation.id, { mask: { ...selectedOperation.mask, shape: resizeBlurShape(selectedOperation.mask.shape, size) } });
  };
  const handleFeatherChange = (feather: number) => selectedOperation ? updateOperation(selectedOperation.id, { feather }) : setFeather(feather);

  const handleShapeKindChange = (shapeKind: Parameters<typeof setActiveShapeKind>[0]) => {
    setActiveShapeKind(shapeKind);
    if (shapeKind !== "lasso") setActiveMaskMode("inside");
  };

  const handleSegmentBackground = async () => {
    if (!session.sourceUri || isSegmenting) return;
    if (hasSegmentationOperation(session.operations)) {
      setSegmentationStatus("O fundo já está selecionado. Ajuste a intensidade e a suavidade abaixo.");
      return;
    }
    setSegmenting(true);
    setSegmentationStatus(null);
    try {
      const result = await segmentPerson(session.sourceUri);
      if (!isUsableSegmentationResult(result)) {
        throw new Error("A máscara ficou com baixa confiança.");
      }
      addOperation(createBackgroundBlurOperation(result, session.feather, session.intensity));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSegmentationStatus("Fundo selecionado. Ajuste a intensidade e a suavidade abaixo.");
    } catch {
      setActiveShapeKind("lasso");
      setActiveMaskMode("outside");
      setSegmentationStatus("Não foi possível separar o sujeito. Contorne-o com o lasso para borrar o fundo.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } finally {
      setSegmenting(false);
    }
  };

  const handleRemoveSegmentedBackground = () => {
    if (!segmentationOperationId) return;
    removeOperation(segmentationOperationId);
    setSegmentationStatus("Blur automático removido. Você pode reaplicá-lo.");
  };

  const handleExport = useCallback(async (format: ExportFormat): Promise<ExportedFile> => {
    if (!canvasRef.current) throw new Error("Editor indisponível para exportação.");
    setExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const snapshot = await makeImageFromView(canvasRef);
      if (!snapshot) throw new Error("Não foi possível preparar a imagem.");
      const encoded = snapshot.encodeToBase64(format === "png" ? ImageFormat.PNG : ImageFormat.JPEG, format === "png" ? 100 : 92);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return exportRenderedImage(() => encoded, format);
    } finally {
      setExporting(false);
    }
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
          <Pressable accessibilityRole="button" accessibilityLabel="Ajuda do editor" onPress={() => Alert.alert("Editor", "Toque ou arraste sobre a foto para aplicar a forma selecionada. Use dois dedos para ampliar e mover.")} style={styles.headerButton}>
            <Text style={[styles.help, { color: theme.colors.foreground, borderColor: theme.colors.border }]}>?</Text>
          </Pressable>
        </View>
      </View>
      <View ref={canvasRef} collapsable={false} style={styles.canvasContainer}>
        <EditorCanvas session={session} onAddOperation={handleAddOperation} showGuides={!isExporting} />
      </View>
      <BrushControls
        intensity={selectedOperation?.intensity ?? session.intensity}
        brushSize={selectedShape ? getShapeSize(selectedShape) : session.brushSize}
        feather={selectedOperation?.feather ?? session.feather}
        shapeKind={session.activeShapeKind}
        maskMode={session.activeMaskMode}
        isSegmenting={isSegmenting}
        hasSegmentationOperation={segmentationOperationId !== null}
        statusMessage={segmentationStatus}
        onShapeKindChange={handleShapeKindChange}
        onSegmentBackground={handleSegmentBackground}
        onRemoveSegmentedBackground={handleRemoveSegmentedBackground}
        onIntensityChange={handleIntensityChange}
        onBrushSizeChange={handleBrushSizeChange}
        onFeatherChange={handleFeatherChange}
      />
      <EditorToolbar
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        isBeforeAfter={session.isBeforeAfter}
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
  canvasContainer: { flex: 1, minHeight: 220 },
  emptyTitle: { fontSize: 22, fontWeight: "800", padding: 24 },
  backText: { fontSize: 16, fontWeight: "700", paddingHorizontal: 24 },
});
