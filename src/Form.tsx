import { useCallback, useEffect, useReducer, useRef } from "react";
import { appWindow } from "@tauri-apps/api/window";

import { appStateReducer } from "./appStateReducer";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { Syncer } from "./Syncer";
import type { AppState } from "./types";
import "./Form.css";

type Props = {
  initialTodos: AppState;
};

export const Form = ({ initialTodos = {} }: Props) => {
  const [state, dispatch] = useReducer(appStateReducer, initialTodos);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useKeyboardNavigation();

  useEffect(() => {
    const unlisten = appWindow.onFocusChanged(({ payload: focused }) => {
      if (focused) {
        inputRef.current?.focus();
      }
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const handleSubmit = useCallback((ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const data = new FormData(ev.currentTarget);
    const content = data.get("todo");

    if (typeof content !== "string" || !content.trim()) {
      return;
    }

    dispatch({
      type: "ADD",
      content: content.trim(),
    });
    formRef.current?.reset();
  }, []);

  const handleCheck = useCallback((id: string, isComplete: boolean) => {
    const type = isComplete ? "UNCOMPLETE" : "COMPLETE";
    dispatch({
      type,
      id,
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    dispatch({
      type: "REMOVE",
      id,
    });
  }, []);

  return (
    <div className="container">
      <div className="row">
        <form onSubmit={handleSubmit} method="POST" ref={formRef}>
          <input name="todo" placeholder="Enter your todo..." ref={inputRef} />
          <button type="submit">Add</button>
        </form>
      </div>

      <div className="todos-container">
        {Object.keys(state).map((todoId, idx) => {
          const { content, isComplete } = state[todoId];
          return (
            <label className="todo" key={todoId}>
              <input
                checked={isComplete}
                id={todoId}
                data-n={idx}
                onChange={() => handleCheck(todoId, isComplete)}
                type="checkbox"
              />
              <span className="todo__content">{content}</span>
              <button
                className="button__del"
                onClick={() => handleRemove(todoId)}
              >
                x
              </button>
            </label>
          );
        })}
      </div>

      <div className="sync-container">
        <Syncer appState={state} />
      </div>
    </div>
  );
};
