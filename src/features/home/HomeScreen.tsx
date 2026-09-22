import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../design-system/ThemeProvider";

type ActionButtonProps = {
  label: string;
  detail: string;
  icon: string;
  onPress: () => void;
  primary?: boolean;
};

function ActionButton({ label, detail, icon, onPress, primary }: ActionButtonProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${detail}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: primary ? theme.colors.accent : theme.colors.surface,
          borderColor: primary ? theme.colors.accent : theme.colors.border,
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      <Text style={[styles.actionIcon, { color: primary ? "#231512" : theme.colors.foreground }]}>
        {icon}
      </Text>
      <View style={styles.actionCopy}>
        <Text style={[styles.actionLabel, { color: primary ? "#231512" : theme.colors.foreground }]}>
          {label}
        </Text>
        <Text style={[styles.actionDetail, { color: primary ? "#5B2D25" : theme.colors.muted }]}>
          {detail}
        </Text>
      </View>
      <Text style={[styles.chevron, { color: primary ? "#5B2D25" : theme.colors.muted }]}>›</Text>
    </Pressable>
  );
}

export function HomeScreen() {
  const theme = useAppTheme();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [notice, setNotice] = useState("Tudo fica no seu dispositivo.");

  const showComingSoon = (label: string) => {
    setNotice(`${label} estará disponível no próximo passo.`);
    Alert.alert("Estamos preparando o editor", `${label} será ativado quando a foto for selecionada.`);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>EDIÇÃO LOCAL</Text>
            <Text style={[styles.wordmark, { color: theme.colors.foreground }]}>Blurra</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir configurações"
            onPress={() => router.push("/settings")}
            style={[styles.settingsButton, { borderColor: theme.colors.border }]}
          >
            <Text style={{ color: theme.colors.foreground, fontSize: 18 }}>⚙</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={[styles.heroOrb, { backgroundColor: theme.colors.accentSoft }]} />
          <Text style={[styles.heroTitle, { color: theme.colors.foreground }]}>Deixe só o que importa em foco.</Text>
          <Text style={[styles.heroBody, { color: theme.colors.muted }]}>
            Borre rostos, detalhes e distrações com precisão. Sem conta, sem upload, sem complicar.
          </Text>
        </View>

        <View style={styles.actions}>
          <ActionButton
            label="Escolher foto"
            detail="Da sua galeria"
            icon="＋"
            primary
            onPress={() => showComingSoon("Escolher foto")}
          />
          <ActionButton
            label="Tirar foto"
            detail="Usar a câmera"
            icon="◉"
            onPress={() => showComingSoon("Tirar foto")}
          />
        </View>

        <View style={[styles.notice, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={styles.noticeIcon}>✦</Text>
          <Text style={[styles.noticeText, { color: theme.colors.muted }]}>{notice}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>Comece rápido</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Ver todos os presets" onPress={() => router.push("/presets")}>
            <Text style={[styles.seeAll, { color: theme.colors.accent }]}>Ver presets</Text>
          </Pressable>
        </View>
        <View style={styles.presetRow}>
          {["Retrato", "Detalhe", "Pixel"].map((item, index) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityLabel={`Preset ${item}`}
              onPress={() => showComingSoon(`Preset ${item}`)}
              style={[styles.preset, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <View style={[styles.presetSwatch, { backgroundColor: index === 1 ? theme.colors.accent : theme.colors.accentSoft }]}>
                <Text style={styles.presetMark}>{index === 2 ? "░" : "◌"}</Text>
              </View>
              <Text style={[styles.presetName, { color: theme.colors.foreground }]}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 36, gap: 28 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10 },
  eyebrow: { fontSize: 11, letterSpacing: 2.2, fontWeight: "800" },
  wordmark: { fontSize: 34, fontWeight: "800", letterSpacing: -1.6, marginTop: 3 },
  settingsButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  hero: { minHeight: 210, justifyContent: "flex-end", overflow: "hidden", paddingBottom: 4 },
  heroOrb: { position: "absolute", width: 210, height: 210, borderRadius: 105, right: -46, top: -24, opacity: 0.8 },
  heroTitle: { maxWidth: 320, fontSize: 42, lineHeight: 45, letterSpacing: -1.8, fontWeight: "700" },
  heroBody: { maxWidth: 310, fontSize: 16, lineHeight: 23, marginTop: 14 },
  actions: { gap: 12 },
  action: { minHeight: 76, borderWidth: 1, borderRadius: 20, paddingHorizontal: 18, flexDirection: "row", alignItems: "center" },
  actionIcon: { fontSize: 26, width: 34, textAlign: "center" },
  actionCopy: { flex: 1, marginLeft: 14 },
  actionLabel: { fontSize: 17, fontWeight: "700" },
  actionDetail: { fontSize: 13, marginTop: 3 },
  chevron: { fontSize: 28, fontWeight: "300", marginLeft: 8 },
  notice: { minHeight: 48, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
  noticeIcon: { fontSize: 18, color: "#FF7058", marginRight: 10 },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 18 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: -16 },
  sectionTitle: { fontSize: 19, fontWeight: "700" },
  seeAll: { fontSize: 14, fontWeight: "700" },
  presetRow: { flexDirection: "row", gap: 10 },
  preset: { flex: 1, borderWidth: 1, borderRadius: 18, padding: 10 },
  presetSwatch: { aspectRatio: 1, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 9 },
  presetMark: { fontSize: 34, color: "#56332C" },
  presetName: { fontSize: 13, fontWeight: "700", paddingHorizontal: 2, paddingBottom: 2 },
});
