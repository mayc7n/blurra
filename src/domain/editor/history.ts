export type History<T> = {
  past: T[];
  present: T;
  future: T[];
};

export const MAX_HISTORY = 1000;

export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [] };
}

export function commit<T>(history: History<T>, present: T): History<T> {
  return {
    past: [...history.past, history.present].slice(-MAX_HISTORY),
    present,
    future: [],
  };
}

export function undo<T>(history: History<T>): History<T> {
  if (history.past.length === 0) return history;

  const previous = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future].slice(0, MAX_HISTORY),
  };
}

export function redo<T>(history: History<T>): History<T> {
  if (history.future.length === 0) return history;

  const next = history.future[0];
  return {
    past: [...history.past, history.present].slice(-MAX_HISTORY),
    present: next,
    future: history.future.slice(1),
  };
}
