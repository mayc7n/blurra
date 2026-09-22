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
  Path,
  Rect,
  RuntimeShader,
  Skia,
  useImage,
  vec,
} from "@shopify/react-native-skia";
import { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { canvasToSource, getContainFrame, clampNormalizedPoint, Dimensions } from "../../domain/editor/coordinates";
import { BrushStroke, EditorSession } from "../../domain/editor/types";

type EditorCanvasProps = {
  session: EditorSession;
  onAddStroke: (stroke: BrushStroke) => void;
};

const pixelateShader = `
uniform shader image;
uniform float pixelSize;

half4 main(float2 xy) {
  float2 samplePoint = floor(xy / pixelSize) * pixelSize + pixelSize * 0.5;
  return image.eval(samplePoint);
}
`;

function makeStrokePath(stroke: BrushStroke, frame: ReturnType<typeof getContainFrame>) {
  const path = Skia.Path.Make();
  const points = stroke.points.map((point) => ({
    x: frame.x + point.x * frame.width,
    y: frame.y + point.y * frame.height,
  }));

  if (points.length === 0) return path;
  if (points.length === 1) {
    path.addCircle(points[0].x, points[0].y, (stroke.size * Math.min(frame.width, frame.height)) / 2);
    return path;
  }

  path.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1)) path.lineTo(point.x, point.y);
  return path;
}

export function EditorCanvas({ session, onAddStroke }: EditorCanvasProps) {
  const image = useImage(session.sourceUri ?? "");
  const pixelateSource = useMemo(() => Skia?.RuntimeEffect?.Make(pixelateShader) ?? null, []);
  const [viewport, setViewport] = useState<Dimensions>({ width: 0, height: 0 });
  const frame = useMemo(
    () => getContainFrame({ width: session.sourceWidth || 1, height: session.sourceHeight || 1 }, viewport),
    [session.sourceHeight, session.sourceWidth, viewport],
  );
  const zoom = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const pinchStart = useSharedValue(1);
  const panStart = useSharedValue({ x: 0, y: 0 });
  const strokePoints = useSharedValue<{ x: number; y: number }[]>([]);
  const cursorX = useSharedValue(-100);
  const cursorY = useSharedValue(-100);
  const cursorVisible = useSharedValue(0);

  const transform = useDerivedValue(() => [
    { translateX: offsetX.value },
    { translateY: offsetY.value },
    { scale: zoom.value },
  ]);
  const cursor = useDerivedValue(() => vec(cursorX.value, cursorY.value));
  const cursorOpacity = useDerivedValue(() => cursorVisible.value);

  const toNormalized = (x: number, y: number) => {
    "worklet";
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;
    const unscaledX = (x - centerX - offsetX.value) / zoom.value + centerX;
    const unscaledY = (y - centerY - offsetY.value) / zoom.value + centerY;
    return {
      x: (unscaledX - frame.x) / frame.width,
      y: (unscaledY - frame.y) / frame.height,
    };
  };

  const commitStroke = useCallback(
    (points: { x: number; y: number }[]) => {
      const normalizedPoints = points.map(clampNormalizedPoint);
      if (normalizedPoints.length === 0) return;
      onAddStroke({
        id: `stroke-${Date.now()}`,
        points: normalizedPoints,
        size: session.brushSize,
        feather: session.feather,
        intensity: session.intensity,
      });
    },
    [onAddStroke, session.brushSize, session.feather, session.intensity],
  );

  const brushGesture = Gesture.Pan()
    .maxPointers(1)
    .minDistance(0)
    .onStart((event) => {
      if (session.isBeforeAfter || viewport.width === 0) return;
      strokePoints.value = [toNormalized(event.x, event.y)];
      cursorX.value = event.x;
      cursorY.value = event.y;
      cursorVisible.value = 1;
    })
    .onUpdate((event) => {
      if (session.isBeforeAfter || viewport.width === 0) return;
      strokePoints.value = [...strokePoints.value, toNormalized(event.x, event.y)];
      cursorX.value = event.x;
      cursorY.value = event.y;
    })
    .onEnd(() => {
      if (session.isBeforeAfter) return;
      runOnJS(commitStroke)(strokePoints.value);
      cursorVisible.value = 0;
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

  const gesture = Gesture.Simultaneous(brushGesture, pinchGesture, viewportPanGesture);

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
            {!session.isBeforeAfter && session.strokes.length > 0 && (
              <Mask
                mode="alpha"
                mask={
                  <Group>
                    {session.strokes.map((stroke) => (
                      <Path
                        key={stroke.id}
                        path={makeStrokePath(stroke, frame)}
                        color="white"
                        style="stroke"
                        strokeWidth={Math.max(8, stroke.size * Math.min(frame.width, frame.height))}
                        strokeCap="round"
                      >
                        <BlurMask blur={Math.max(0.5, stroke.feather * 24)} style="normal" />
                      </Path>
                    ))}
                  </Group>
                }
              >
                <SkiaImage image={image} x={frame.x} y={frame.y} width={frame.width} height={frame.height} fit="fill">
                  {session.tool === "blur" ? (
                    <Blur blur={Math.max(1, session.intensity * 32)} mode="clamp" />
                  ) : pixelateSource ? (
                    <RuntimeShader source={pixelateSource} uniforms={{ pixelSize: 7 + (1 - session.intensity) * 14 }} />
                  ) : (
                    <Blur blur={Math.max(1, session.intensity * 32)} mode="clamp" />
                  )}
                </SkiaImage>
              </Mask>
            )}
          </Group>
          <Circle c={cursor} r={Math.max(8, session.brushSize * Math.min(frame.width, frame.height) / 2)} color="#FF8973" opacity={cursorOpacity} style="stroke" strokeWidth={2} />
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
