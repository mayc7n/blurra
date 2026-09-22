import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../design-system/ThemeProvider";
import { BlurShapeKind } from "../../domain/editor/types";

type ShapeControlsProps = {
  value: BlurShapeKind;
  onChange: (shapeKind: BlurShapeKind) => void;
};

const shapeLabels: Record<BlurShapeKind, string> = {
  circle: "Círculo",
  square: "Quadrado",
  rectangle: "Retângulo",
  triangle: "Triângulo",
  polygon: "Polígono",
  lasso: "Lasso",
};

export function ShapeControls({ value, onChange }: ShapeControlsProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        {Object.entries(shapeLabels).map(([shapeKind, label]) => {
          const kind = shapeKind as BlurShapeKind;
          const active = kind === value;
          return (
            <Pressable
              key={kind}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Forma ${label}`}
              onPress={() => onChange(kind)}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: active ? theme.colors.accentSoft : "transparent",
                  borderColor: active ? theme.colors.accent : theme.colors.border,
                  opacity: pressed ? 0.65 : 1,
                },
              ]}
            >
              <Text style={[styles.label, { color: active ? theme.colors.foreground : theme.colors.muted }]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1, paddingVertical: 8 },
  content: { paddingHorizontal: 18, gap: 8 },
  button: { minHeight: 36, borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, justifyContent: "center" },
  label: { fontSize: 12, fontWeight: "700" },
});
