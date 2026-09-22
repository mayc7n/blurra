import { emptyEditorSession } from "./types";
import { createHistory } from "./history";
import { editorReducer } from "./reducer";

const operation = {
  id: "operation-1",
  blurType: "gaussian" as const,
  shape: { kind: "circle" as const, center: { x: 0.52, y: 0.44 }, radius: 0.2 },
  feather: 0.35,
  intensity: 0.8,
};

describe("editor reducer", () => {
  it("adds an operation, undoes it, and redoes it", () => {
    let state = createHistory(emptyEditorSession);
    state = editorReducer(state, { type: "addOperation", operation });
    expect(state.present.operations).toEqual([operation]);

    state = editorReducer(state, { type: "undo" });
    expect(state.present.operations).toEqual([]);

    state = editorReducer(state, { type: "redo" });
    expect(state.present.operations).toEqual([operation]);
  });

  it("clears the redo branch after a new operation", () => {
    let state = createHistory(emptyEditorSession);
    state = editorReducer(state, { type: "addOperation", operation });
    state = editorReducer(state, { type: "undo" });
    state = editorReducer(state, {
      type: "addOperation",
      operation: { ...operation, id: "operation-2" },
    });

    expect(state.future).toEqual([]);
    expect(state.present.operations[0].id).toBe("operation-2");
  });

  it("changes intensity immutably", () => {
    const state = createHistory(emptyEditorSession);
    const changed = editorReducer(state, { type: "setIntensity", intensity: 0.2 });

    expect(changed.present.intensity).toBe(0.2);
    expect(state.present.intensity).toBe(emptyEditorSession.intensity);
    expect(changed.present).not.toBe(state.present);
  });

  it("stores and removes one normalized blur operation", () => {
    let state = createHistory(emptyEditorSession);
    state = editorReducer(state, { type: "addOperation", operation });

    expect(state.present.operations).toEqual([operation]);
    expect(state.present.selectedOperationId).toBe("operation-1");

    state = editorReducer(state, { type: "removeOperation", operationId: "operation-1" });

    expect(state.present.operations).toEqual([]);
    expect(state.present.selectedOperationId).toBeNull();
  });
});
