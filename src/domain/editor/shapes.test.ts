import { createBlurShape, getShapePoints, blurShapeKinds } from "./shapes";

describe("blur shapes", () => {
  it("creates every supported geometric shape from normalized coordinates", () => {
    const center = { x: 0.5, y: 0.5 };

    expect(blurShapeKinds).toEqual(["circle", "square", "rectangle", "triangle", "polygon", "lasso"]);
    expect(createBlurShape("circle", center, 0.2)).toEqual({ kind: "circle", center, radius: 0.2 });
    expect(createBlurShape("square", center, 0.2)).toMatchObject({ kind: "square", center, size: 0.2 });
    const rectangle = createBlurShape("rectangle", center, 0.2);
    expect(rectangle).toMatchObject({ kind: "rectangle", center, height: 0.2 });
    expect(rectangle?.kind === "rectangle" && rectangle.width).toBeCloseTo(0.3);
    expect(createBlurShape("triangle", center, 0.2)).toMatchObject({ kind: "triangle", center, size: 0.2 });
  });

  it("keeps custom polygon and lasso points in source coordinates", () => {
    const points = [
      { x: 0.1, y: 0.2 },
      { x: 0.8, y: 0.2 },
      { x: 0.7, y: 0.9 },
    ];

    expect(createBlurShape("polygon", { x: 0, y: 0 }, 0.2, points)).toEqual({ kind: "polygon", points });
    expect(createBlurShape("lasso", { x: 0, y: 0 }, 0.2, points)).toEqual({ kind: "lasso", points });
    expect(getShapePoints({ kind: "polygon", points })).toEqual(points);
    expect(createBlurShape("polygon", { x: 0, y: 0 }, 0.2, points.slice(0, 2))).toBeNull();
  });
});
