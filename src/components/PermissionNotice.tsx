import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../design-system/ThemeProvider";

export function PermissionNotice({ message, actionLabel, onAction }: { message: string; actionLabel?: string; onAction?: () => void }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.border }]}>
      <Text style={[styles.message, { color: theme.colors.foreground }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction}>
          <Text style={[styles.action, { color: theme.colors.accent }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 14, padding: 13, gap: 8 },
  message: { fontSize: 13, lineHeight: 19 },
  action: { fontSize: 13, fontWeight: "800" },
});
