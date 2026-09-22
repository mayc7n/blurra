import { canvasToSource, getContainFrame, sourceToCanvas } from "./coordinates";

describe("editor coordinate transforms", () => {
  const source = { width: 4000, height: 3000 };
  const viewport = { width: 360, height: 360 };

  it("fits a wide image without cropping and maps its center", () => {
    const frame = getContainFrame(source, viewport);

    expect(frame).toEqual({
      x: 0,
      y: 45,
      width: 360,
      height: 270,
      scale: 0.09,
    });
    expect(sourceToCanvas({ x: 0.5, y: 0.5 }, frame)).toEqual({ x: 180, y: 180 });
  });

  it("round-trips a visible point and preserves an out-of-frame point", () => {
    const frame = getContainFrame(source, viewport);
    const point = { x: 0.27, y: 0.61 };
    const canvasPoint = sourceToCanvas(point, frame);
    const roundTrip = canvasToSource(canvasPoint, frame);

    expect(Math.abs(roundTrip.x - point.x)).toBeLessThan(0.001);
    expect(Math.abs(roundTrip.y - point.y)).toBeLessThan(0.001);
    expect(sourceToCanvas({ x: 0.5, y: 1.5 }, frame)).toEqual({ x: 180, y: 450 });
  });
});
