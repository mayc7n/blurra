import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SkiaWebProvider } from "../src/components/SkiaWebProvider";
import { ThemeProvider } from "../src/design-system/ThemeProvider";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SkiaWebProvider>
          <Slot />
        </SkiaWebProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
