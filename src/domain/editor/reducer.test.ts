import { emptyEditorSession } from "./types";
import { createHistory } from "./history";
import { editorReducer } from "./reducer";

const stroke = {
  id: "stroke-1",
  points: [{ x: 0.2, y: 0.3 }],
  size: 0.15,
  feather: 0.4,
  intensity: 0.8,
};

describe("editor reducer", () => {
  it("adds a stroke, undoes it, and redoes it", () => {
    let state = createHistory(emptyEditorSession);
    state = editorReducer(state, { type: "addStroke", stroke });
    expect(state.present.strokes).toEqual([stroke]);

    state = editorReducer(state, { type: "undo" });
    expect(state.present.strokes).toEqual([]);

    state = editorReducer(state, { type: "redo" });
    expect(state.present.strokes).toEqual([stroke]);
  });

  it("clears the redo branch after a new stroke", () => {
    let state = createHistory(emptyEditorSession);
    state = editorReducer(state, { type: "addStroke", stroke });
    state = editorReducer(state, { type: "undo" });
    state = editorReducer(state, {
      type: "addStroke",
      stroke: { ...stroke, id: "stroke-2" },
    });

    expect(state.future).toEqual([]);
    expect(state.present.strokes[0].id).toBe("stroke-2");
  });

  it("changes intensity immutably", () => {
    const state = createHistory(emptyEditorSession);
    const changed = editorReducer(state, { type: "setIntensity", intensity: 0.2 });

    expect(changed.present.intensity).toBe(0.2);
    expect(state.present.intensity).toBe(emptyEditorSession.intensity);
    expect(changed.present).not.toBe(state.present);
  });
});
