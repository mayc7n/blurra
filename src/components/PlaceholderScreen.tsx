import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../design-system/ThemeProvider";

export function PlaceholderScreen({ title, body }: { title: string; body: string }) {
  const theme = useAppTheme();
  const router = useRouter();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()}>
          <Text style={[styles.back, { color: theme.colors.accent }]}>‹ Voltar</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>{title}</Text>
        <Text style={[styles.body, { color: theme.colors.muted }]}>{body}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 24, gap: 20 },
  back: { fontSize: 16, fontWeight: "800" },
  title: { fontSize: 34, fontWeight: "800", letterSpacing: -1 },
  body: { fontSize: 16, lineHeight: 24 },
});
