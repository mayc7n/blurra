import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS, useDerivedValue, useSharedValue, DerivedValue } from "react-native-reanimated";
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
  Skia,
  useImage,
  vec,
} from "@shopify/react-native-skia";
import { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { clampNormalizedPoint, Dimensions, getContainFrame } from "../../domain/editor/coordinates";
import { createBlurShape, getShapePoints, getShapeSize } from "../../domain/editor/shapes";
import { BlurOperation, BlurShape, EditorSession } from "../../domain/editor/types";

type EditorCanvasProps = {
  session: EditorSession;
  onAddOperation: (operation: BlurOperation) => void;
  showGuides?: boolean;
};

function toCanvasPoint(point: { x: number; y: number }, frame: ReturnType<typeof getContainFrame>) {
  return { x: frame.x + point.x * frame.width, y: frame.y + point.y * frame.height };
}

function makeShapePath(shape: Exclude<BlurShape, { kind: "circle" }>, frame: ReturnType<typeof getContainFrame>) {
  const points = getShapePoints(shape).map((point) => toCanvasPoint(point, frame));
  const builder = Skia.PathBuilder.Make();
  if (points.length === 0) return builder.build();
  builder.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => builder.lineTo(point.x, point.y));
  return builder.close().build();
}

function getOperationMask(shape: BlurShape, frame: ReturnType<typeof getContainFrame>, feather: number) {
  if (shape.kind === "circle") {
    const center = toCanvasPoint(shape.center, frame);
    return (
      <Circle c={vec(center.x, center.y)} r={shape.radius * Math.min(frame.width, frame.height)} color="white">
        <BlurMask blur={feather * 28} style="normal" />
      </Circle>
    );
  }

  return (
    <Path path={makeShapePath(shape, frame)} color="white" fillType="winding">
      <BlurMask blur={feather * 28} style="normal" />
    </Path>
  );
}

function OperationLayer({ operation, image, frame, opacity }: { operation: BlurOperation; image: ReturnType<typeof useImage>; frame: ReturnType<typeof getContainFrame>; opacity: number | DerivedValue<number> }) {
  return (
    <Group opacity={opacity}>
      <Mask mode="alpha" mask={getOperationMask(operation.shape, frame, operation.feather)}>
        <SkiaImage image={image} x={frame.x} y={frame.y} width={frame.width} height={frame.height} fit="fill">
          <Blur blur={Math.max(1, operation.intensity * 32)} mode="clamp" />
        </SkiaImage>
      </Mask>
    </Group>
  );
}

function ShapeGuide({ shape, frame }: { shape: BlurShape; frame: ReturnType<typeof getContainFrame> }) {
  if (shape.kind === "circle") {
    const center = toCanvasPoint(shape.center, frame);
    return <Circle c={vec(center.x, center.y)} r={shape.radius * Math.min(frame.width, frame.height)} color="#FFFFFF" opacity={0.7} style="stroke" strokeWidth={1} />;
  }

  return <Path path={makeShapePath(shape, frame)} color="#FFFFFF" opacity={0.7} style="stroke" strokeWidth={1} />;
}

export function EditorCanvas({ session, onAddOperation, showGuides = true }: EditorCanvasProps) {
  const image = useImage(session.sourceUri ?? "");
  const [viewport, setViewport] = useState<Dimensions>({ width: 0, height: 0 });
  const frame = useMemo(
    () => getContainFrame({ width: session.sourceWidth || 1, height: session.sourceHeight || 1 }, viewport),
    [session.sourceHeight, session.sourceWidth, viewport],
  );
  const selectedOperation = session.operations.find((operation) => operation.id === session.selectedOperationId);
  const operationSize = selectedOperation ? getShapeSize(selectedOperation.shape) : session.brushSize;
  const operationIntensity = selectedOperation?.intensity ?? session.intensity;
  const operationFeather = selectedOperation?.feather ?? session.feather;
  const previewX = useSharedValue(viewport.width / 2);
  const previewY = useSharedValue(viewport.height / 2);
  const previewRadius = useSharedValue(0);
  const previewVisible = useSharedValue(0);
  const previewCenter = useSharedValue({ x: 0.5, y: 0.5 });
  const previewPoints = useSharedValue<{ x: number; y: number }[]>([]);
  const previewPathBuilder = useSharedValue(Skia.PathBuilder.Make());
  const pinchStart = useSharedValue(1);
  const panStart = useSharedValue({ x: 0, y: 0 });
  const zoom = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const previewPath = useDerivedValue(() => previewPathBuilder.value.build());
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
    return {
      x: Math.max(0, Math.min(1, (unscaledX - frame.x) / frame.width)),
      y: Math.max(0, Math.min(1, (unscaledY - frame.y) / frame.height)),
    };
  };

  const rebuildPreviewPath = (points: { x: number; y: number }[], center: { x: number; y: number }) => {
    "worklet";
    const size = operationSize;
    const half = size / 2;
    const pathPoints = (() => {
      switch (session.activeShapeKind) {
        case "square":
          return [
            { x: center.x - half, y: center.y - half },
            { x: center.x + half, y: center.y - half },
            { x: center.x + half, y: center.y + half },
            { x: center.x - half, y: center.y + half },
          ];
        case "rectangle":
          return [
            { x: center.x - half * 1.5, y: center.y - half },
            { x: center.x + half * 1.5, y: center.y - half },
            { x: center.x + half * 1.5, y: center.y + half },
            { x: center.x - half * 1.5, y: center.y + half },
          ];
        case "triangle":
          return [0, 1, 2].map((index) => {
            const angle = -Math.PI / 2 + (index * Math.PI * 2) / 3;
            return { x: center.x + Math.cos(angle) * half, y: center.y + Math.sin(angle) * half };
          });
        case "polygon":
        case "lasso":
          return points;
        case "circle":
          return [];
      }
    })();

    previewPathBuilder.value.reset();
    if (pathPoints.length > 0) {
      previewPathBuilder.value.moveTo(frame.x + pathPoints[0].x * frame.width, frame.y + pathPoints[0].y * frame.height);
      pathPoints.slice(1).forEach((point) => {
        previewPathBuilder.value.lineTo(frame.x + point.x * frame.width, frame.y + point.y * frame.height);
      });
      previewPathBuilder.value.close();
    }
  };

  const updatePreview = (x: number, y: number, reset = false) => {
    "worklet";
    const normalizedPoint = toNormalized(x, y);
    const nextPoints = reset || (session.activeShapeKind !== "polygon" && session.activeShapeKind !== "lasso")
      ? [normalizedPoint]
      : [...previewPoints.value, normalizedPoint];
    previewPoints.value = nextPoints;
    previewCenter.value = normalizedPoint;
    previewX.value = frame.x + normalizedPoint.x * frame.width;
    previewY.value = frame.y + normalizedPoint.y * frame.height;
    previewRadius.value = Math.max(24, operationSize * Math.min(frame.width, frame.height));
    rebuildPreviewPath(nextPoints, normalizedPoint);
    previewVisible.value = 1;
  };

  const commitOperation = useCallback(
    (center: { x: number; y: number }, points: { x: number; y: number }[]) => {
      const shape = createBlurShape(session.activeShapeKind, clampNormalizedPoint(center), operationSize, points);
      if (!shape) return;
      onAddOperation({
        id: `operation-${Date.now()}`,
        blurType: "gaussian",
        shape,
        feather: operationFeather,
        intensity: operationIntensity,
      });
    },
    [onAddOperation, operationFeather, operationIntensity, operationSize, session.activeShapeKind],
  );

  const shapeGesture = Gesture.Pan()
    .maxPointers(1)
    .minDistance(0)
    .onStart((event) => {
      if (session.isBeforeAfter || viewport.width === 0) return;
      updatePreview(event.x, event.y, true);
    })
    .onUpdate((event) => {
      if (session.isBeforeAfter || viewport.width === 0) return;
      updatePreview(event.x, event.y);
    })
    .onEnd(() => {
      if (session.isBeforeAfter) return;
      runOnJS(commitOperation)(previewCenter.value, previewPoints.value);
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

  const gesture = Gesture.Simultaneous(shapeGesture, pinchGesture, viewportPanGesture);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewport({ width, height });
  };

  if (!session.sourceUri || !image || viewport.width === 0) {
    return <View style={styles.empty} onLayout={onLayout} />;
  }

  const previewMask = session.activeShapeKind === "circle" ? (
    <Circle c={previewCircleCenter} r={previewCircleRadius} color="white">
      <BlurMask blur={operationFeather * 28} style="normal" />
    </Circle>
  ) : (
    <Path path={previewPath} color="white" fillType="winding">
      <BlurMask blur={operationFeather * 28} style="normal" />
    </Path>
  );

  return (
    <View style={styles.root} onLayout={onLayout}>
      <GestureDetector gesture={gesture}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Fill color="#111217" />
          <Group origin={vec(viewport.width / 2, viewport.height / 2)} transform={transform}>
            <SkiaImage image={image} x={frame.x} y={frame.y} width={frame.width} height={frame.height} fit="fill" />
            {session.operations.map((operation) => (
              <OperationLayer key={operation.id} operation={operation} image={image} frame={frame} opacity={persistedOpacity} />
            ))}
            <Group opacity={previewOpacity}>
              <Mask mode="alpha" mask={previewMask}>
                <SkiaImage image={image} x={frame.x} y={frame.y} width={frame.width} height={frame.height} fit="fill">
                  <Blur blur={Math.max(1, operationIntensity * 32)} mode="clamp" />
                </SkiaImage>
              </Mask>
            </Group>
            {showGuides && (
              <Group opacity={previewOpacity}>
                {session.activeShapeKind === "circle" ? (
                  <Circle c={previewCircleCenter} r={previewCircleRadius} color="#FF8973" style="stroke" strokeWidth={2} />
                ) : (
                  <Path path={previewPath} color="#FF8973" style="stroke" strokeWidth={2} />
                )}
              </Group>
            )}
            {showGuides && selectedOperation && !session.isBeforeAfter && <ShapeGuide shape={selectedOperation.shape} frame={frame} />}
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
