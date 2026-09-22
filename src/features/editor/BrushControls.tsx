import Slider from "@react-native-community/slider";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../design-system/ThemeProvider";
import { BlurShapeKind } from "../../domain/editor/types";
import { ShapeControls } from "./ShapeControls";

type BrushControlsProps = {
  intensity: number;
  brushSize: number;
  feather: number;
  shapeKind: BlurShapeKind;
  onIntensityChange: (value: number) => void;
  onBrushSizeChange: (value: number) => void;
  onFeatherChange: (value: number) => void;
  onShapeKindChange: (shapeKind: BlurShapeKind) => void;
};

function ControlSlider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const theme = useAppTheme();
  const percentage = `${Math.round(value * 100)}%`;
  return (
    <View style={styles.sliderGroup}>
      <View style={styles.sliderHeader}>
        <Text style={[styles.sliderLabel, { color: theme.colors.foreground }]}>{label}</Text>
        <Text accessibilityLabel={`${label}: ${percentage}`} style={[styles.sliderValue, { color: theme.colors.muted }]}>{percentage}</Text>
      </View>
      <Slider
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100), text: percentage }}
        minimumValue={0}
        maximumValue={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={theme.colors.accent}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={theme.colors.accent}
      />
    </View>
  );
}

export function BrushControls({ intensity, brushSize, feather, shapeKind, onIntensityChange, onBrushSizeChange, onFeatherChange, onShapeKindChange }: BrushControlsProps) {
  const theme = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <ShapeControls value={shapeKind} onChange={onShapeKindChange} />
      <ControlSlider label="Intensidade" value={intensity} onChange={onIntensityChange} />
      <ControlSlider label="Raio do blur" value={brushSize} onChange={onBrushSizeChange} />
      <ControlSlider label="Suavidade" value={feather} onChange={onFeatherChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 2 },
  sliderGroup: { marginBottom: 4 },
  sliderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sliderLabel: { fontSize: 12, fontWeight: "700" },
  sliderValue: { fontSize: 12, fontVariant: ["tabular-nums"] },
});
