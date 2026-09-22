import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import { PropsWithChildren, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export function SkiaWebProvider({ children }: PropsWithChildren) {
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    LoadSkiaWeb().then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#FF7058" />
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#101114" },
});
