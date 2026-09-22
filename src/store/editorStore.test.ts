import { emptyEditorSession } from "../domain/editor/types";
import { useEditorStore } from "./editorStore";

const operation = {
  id: "store-operation",
  blurType: "gaussian" as const,
  shape: { kind: "circle" as const, center: { x: 0.5, y: 0.5 }, radius: 0.2 },
  feather: 0.3,
  intensity: 0.7,
};

describe("editor store", () => {
  beforeEach(() => {
    useEditorStore.getState().clearSession();
  });

  it("starts a local photo session with source metadata", () => {
    useEditorStore.getState().startSession({ uri: "file:///photo.jpg", width: 1200, height: 900 });

    expect(useEditorStore.getState().history.present).toMatchObject({
      sourceUri: "file:///photo.jpg",
      sourceWidth: 1200,
      sourceHeight: 900,
    });
  });

  it("adds an operation and delegates undo/redo to the domain reducer", () => {
    useEditorStore.getState().startSession({ uri: "file:///photo.jpg", width: 1200, height: 900 });
    useEditorStore.getState().addOperation(operation);
    expect(useEditorStore.getState().history.present.operations).toHaveLength(1);

    useEditorStore.getState().undo();
    expect(useEditorStore.getState().history.present.operations).toHaveLength(0);

    useEditorStore.getState().redo();
    expect(useEditorStore.getState().history.present.operations).toHaveLength(1);
  });

  it("clears source references when a session ends", () => {
    useEditorStore.getState().startSession({ uri: "file:///photo.jpg", width: 1200, height: 900 });
    useEditorStore.getState().clearSession();

    expect(useEditorStore.getState().history.present).toEqual(emptyEditorSession);
  });
});
