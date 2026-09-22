import { createHistory, redo, undo } from "./history";

describe("editor history", () => {
  it("undoes and redoes snapshots without losing the initial value", () => {
    const initial = { value: 0 };
    const first = { value: 1 };
    const second = { value: 2 };
    let history = createHistory(initial);

    history = { past: [initial], present: first, future: [] };
    history = { past: [...history.past, history.present], present: second, future: [] };
    expect(undo(history).present).toEqual(first);
    expect(redo(undo(history)).present).toEqual(second);
    expect(undo(undo(history)).present).toEqual(initial);
  });
});
