import { createHistory } from "../../domain/editor/history";
import { emptyEditorSession } from "../../domain/editor/types";
import { getEditorUiModel } from "./editorUiModel";

describe("editor UI model", () => {
  it("disables editor actions before a photo is loaded", () => {
    const model = getEditorUiModel(createHistory(emptyEditorSession));

    expect(model.hasPhoto).toBe(false);
    expect(model.canUndo).toBe(false);
    expect(model.canRedo).toBe(false);
    expect(model.toolbarLabels).toEqual(["Intensidade", "Raio do blur", "Suavidade"]);
    expect(model.hasOperations).toBe(false);
  });

  it("exposes before/after state and undo availability", () => {
    const photo = { ...emptyEditorSession, sourceUri: "file:///photo.jpg", isBeforeAfter: true };
    const history = { past: [emptyEditorSession], present: photo, future: [emptyEditorSession] };
    const model = getEditorUiModel(history);

    expect(model.hasPhoto).toBe(true);
    expect(model.canUndo).toBe(true);
    expect(model.canRedo).toBe(true);
    expect(model.beforeAfterLabel).toBe("Ver edição");
    expect(model.hasOperations).toBe(false);
  });

  it("reports when a blur operation exists", () => {
    const photo = {
      ...emptyEditorSession,
      sourceUri: "file:///photo.jpg",
      operations: [{
        id: "operation-1",
        blurType: "gaussian" as const,
        mask: {
          kind: "shape" as const,
          mode: "inside" as const,
          shape: { kind: "circle" as const, center: { x: 0.5, y: 0.5 }, radius: 0.2 },
        },
        feather: 0.3,
        intensity: 0.8,
      }],
    };

    const model = getEditorUiModel({ past: [], present: photo, future: [] });

    expect(model.hasOperations).toBe(true);
  });
});
