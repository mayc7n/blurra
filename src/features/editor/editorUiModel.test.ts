import { createHistory } from "../../domain/editor/history";
import { emptyEditorSession } from "../../domain/editor/types";
import { getEditorUiModel } from "./editorUiModel";

describe("editor UI model", () => {
  it("disables editor actions before a photo is loaded", () => {
    const model = getEditorUiModel(createHistory(emptyEditorSession));

    expect(model.hasPhoto).toBe(false);
    expect(model.canUndo).toBe(false);
    expect(model.canRedo).toBe(false);
    expect(model.toolbarLabels).toEqual(["Desfocar", "Pixelar", "Intensidade", "Tamanho do pincel"]);
  });

  it("exposes before/after state and undo availability", () => {
    const photo = { ...emptyEditorSession, sourceUri: "file:///photo.jpg", isBeforeAfter: true };
    const history = { past: [emptyEditorSession], present: photo, future: [emptyEditorSession] };
    const model = getEditorUiModel(history);

    expect(model.hasPhoto).toBe(true);
    expect(model.canUndo).toBe(true);
    expect(model.canRedo).toBe(true);
    expect(model.beforeAfterLabel).toBe("Ver edição");
  });
});
