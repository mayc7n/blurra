import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS, useDerivedValue, useSharedValue } from "react-native-reanimated";
import {
  Blur,
  BlurMask,
  Canvas,
  Circle,
  Fill,
  Group,
  Image as SkiaImage,
  Mask,
  Rect,
  useImage,
  vec,
} from "@shopify/react-native-skia";
import { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { clampNormalizedPoint, getContainFrame, Dimensions, sourceToCanvas } from "../../domain/editor/coordinates";
import { CircularBlur, EditorSession } from "../../domain/editor/types";

type EditorCanvasProps = {
  session: EditorSession;
  onSetCircularBlur: (circularBlur: CircularBlur) => void;
  showGuides?: boolean;
};

function getBlurRadius(circularBlur: CircularBlur, frame: ReturnType<typeof getContainFrame>) {
  return Math.max(24, circularBlur.radius * Math.min(frame.width, frame.height));
}

export function EditorCanvas({ session, onSetCircularBlur, showGuides = true }: EditorCanvasProps) {
  const image = useImage(session.sourceUri ?? "");
  const [viewport, setViewport] = useState<Dimensions>({ width: 0, height: 0 });
  const frame = useMemo(
    () => getContainFrame({ width: session.sourceWidth || 1, height: session.sourceHeight || 1 }, viewport),
    [session.sourceHeight, session.sourceWidth, viewport],
  );
  const previewX = useSharedValue(viewport.width / 2);
  const previewY = useSharedValue(viewport.height / 2);
  const previewRadius = useSharedValue(0);
  const previewVisible = useSharedValue(0);
  const previewCenter = useSharedValue({ x: 0.5, y: 0.5 });
  const pinchStart = useSharedValue(1);
  const panStart = useSharedValue({ x: 0, y: 0 });
  const zoom = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const persistedCenter = session.circularBlur ? sourceToCanvas(session.circularBlur.center, frame) : null;
  const persistedRadius = session.circularBlur ? getBlurRadius(session.circularBlur, frame) : 0;
  const previewCircleCenter = useDerivedValue(() => vec(previewX.value, previewY.value));
  const previewCircleRadius = useDerivedValue(() => previewRadius.value);
  const previewOpacity = useDerivedValue(() => (session.isBeforeAfter ? 0 : previewVisible.value));
  const persistedOpacity = useDerivedValue(() => (session.isBeforeAfter ? 0 : 1 - previewVisible.value));

  const transform = useDerivedValue(() => [
    { translateX: offsetX.value },
    { translateY: offsetY.value },
    { scale: zoom.value },
  ]);

  const toNormalized = (x: number, y: number) => {
    "worklet";
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;
    const unscaledX = (x - centerX - offsetX.value) / zoom.value + centerX;
    const unscaledY = (y - centerY - offsetY.value) / zoom.value + centerY;
    const normalizedX = (unscaledX - frame.x) / frame.width;
    const normalizedY = (unscaledY - frame.y) / frame.height;
    return {
      x: Math.max(0, Math.min(1, normalizedX)),
      y: Math.max(0, Math.min(1, normalizedY)),
    };
  };

  const updatePreview = (x: number, y: number) => {
    "worklet";
    const normalizedPoint = toNormalized(x, y);
    previewCenter.value = normalizedPoint;
    previewX.value = frame.x + normalizedPoint.x * frame.width;
    previewY.value = frame.y + normalizedPoint.y * frame.height;
    previewRadius.value = Math.max(24, session.brushSize * Math.min(frame.width, frame.height));
    previewVisible.value = 1;
  };

  const commitCircularBlur = useCallback(
    (center: { x: number; y: number }) => {
      onSetCircularBlur({
        center: clampNormalizedPoint(center),
        radius: session.brushSize,
        feather: session.feather,
        intensity: session.intensity,
      });
    },
    [onSetCircularBlur, session.brushSize, session.feather, session.intensity],
  );

  const circleGesture = Gesture.Pan()
    .maxPointers(1)
    .minDistance(0)
    .onStart((event) => {
      if (session.isBeforeAfter || viewport.width === 0) return;
      updatePreview(event.x, event.y);
    })
    .onUpdate((event) => {
      if (session.isBeforeAfter || viewport.width === 0) return;
      updatePreview(event.x, event.y);
    })
    .onEnd(() => {
      if (session.isBeforeAfter) return;
      runOnJS(commitCircularBlur)(previewCenter.value);
      previewVisible.value = 0;
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      pinchStart.value = zoom.value;
    })
    .onUpdate((event) => {
      zoom.value = Math.max(1, Math.min(5, pinchStart.value * event.scale));
    });

  const viewportPanGesture = Gesture.Pan()
    .minPointers(2)
    .maxPointers(2)
    .onStart(() => {
      panStart.value = { x: offsetX.value, y: offsetY.value };
    })
    .onUpdate((event) => {
      offsetX.value = panStart.value.x + event.translationX;
      offsetY.value = panStart.value.y + event.translationY;
    });

  const gesture = Gesture.Simultaneous(circleGesture, pinchGesture, viewportPanGesture);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewport({ width, height });
  };

  if (!session.sourceUri || !image || viewport.width === 0) {
    return <View style={styles.empty} onLayout={onLayout} />;
  }

  return (
    <View style={styles.root} onLayout={onLayout}>
      <GestureDetector gesture={gesture}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Fill color="#111217" />
          <Group origin={vec(viewport.width / 2, viewport.height / 2)} transform={transform}>
            <SkiaImage image={image} x={frame.x} y={frame.y} width={frame.width} height={frame.height} fit="fill" />
            {session.circularBlur && (
              <Group opacity={persistedOpacity}>
                <Mask
                  mode="alpha"
                  mask={
                    <Circle
                      c={vec(persistedCenter?.x ?? frame.x, persistedCenter?.y ?? frame.y)}
                      r={persistedRadius}
                      color="white"
                    >
                      <BlurMask blur={session.circularBlur.feather * 28} style="normal" />
                    </Circle>
                  }
                >
                  <SkiaImage image={image} x={frame.x} y={frame.y} width={frame.width} height={frame.height} fit="fill">
                    <Blur blur={Math.max(1, session.circularBlur.intensity * 32)} mode="clamp" />
                  </SkiaImage>
                </Mask>
              </Group>
            )}
            <Group opacity={previewOpacity}>
              <Mask
                mode="alpha"
                mask={
                  <Circle c={previewCircleCenter} r={previewCircleRadius} color="white">
                    <BlurMask blur={session.feather * 28} style="normal" />
                  </Circle>
                }
              >
                <SkiaImage image={image} x={frame.x} y={frame.y} width={frame.width} height={frame.height} fit="fill">
                  <Blur blur={Math.max(1, session.intensity * 32)} mode="clamp" />
                </SkiaImage>
              </Mask>
            </Group>
            {showGuides && (
              <Circle
                c={previewCircleCenter}
                r={previewCircleRadius}
                color="#FF8973"
                opacity={previewOpacity}
                style="stroke"
                strokeWidth={2}
              />
            )}
            {showGuides && session.circularBlur && persistedCenter && !session.isBeforeAfter && (
              <Circle
                c={vec(persistedCenter.x, persistedCenter.y)}
                r={persistedRadius}
                color="#FFFFFF"
                opacity={0.7}
                style="stroke"
                strokeWidth={1}
              />
            )}
          </Group>
          <Rect x={frame.x} y={frame.y} width={frame.width} height={frame.height} color="rgba(255,255,255,0.12)" style="stroke" strokeWidth={1} />
        </Canvas>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden", backgroundColor: "#111217" },
  empty: { flex: 1, backgroundColor: "#111217" },
});
