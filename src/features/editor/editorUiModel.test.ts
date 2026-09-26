import { createHistory } from "../../domain/editor/history";
import { emptyEditorSession } from "../../domain/editor/types";
import { getEditorUiModel, getRemovalConfirmation } from "./editorUiModel";

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

  it("allows removing a selected geometric operation but not the automatic mask", () => {
    const shapeOperation = {
      id: "operation-1",
      blurType: "gaussian" as const,
      mask: {
        kind: "shape" as const,
        mode: "inside" as const,
        shape: { kind: "circle" as const, center: { x: 0.5, y: 0.5 }, radius: 0.2 },
      },
      feather: 0.3,
      intensity: 0.8,
    };
    const shapeSession = { ...emptyEditorSession, sourceUri: "file:///photo.jpg", operations: [shapeOperation], selectedOperationId: shapeOperation.id };

    expect(getEditorUiModel({ past: [], present: shapeSession, future: [] }).canRemoveSelectedOperation).toBe(true);

    const segmentationSession = {
      ...shapeSession,
      operations: [{ ...shapeOperation, mask: { kind: "segmentation" as const, uri: "file:///mask.png", width: 512, height: 384, confidence: 0.8, foregroundCoverage: 0.3 } }],
    };
    expect(getEditorUiModel({ past: [], present: segmentationSession, future: [] }).canRemoveSelectedOperation).toBe(false);
  });

  it("provides destructive confirmation copy for each removable mask", () => {
    expect(getRemovalConfirmation("shape")).toEqual({
      title: "Remover marcação?",
      message: "A marcação selecionada será removida da foto.",
      confirmLabel: "Remover",
    });
    expect(getRemovalConfirmation("segmentation")).toEqual({
      title: "Remover blur automático?",
      message: "O blur automático do fundo será removido da foto.",
      confirmLabel: "Remover",
    });
  });
});
