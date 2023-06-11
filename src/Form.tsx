import { useCallback, useEffect, useReducer, useRef } from "react";
import { appWindow } from "@tauri-apps/api/window";

import { appStateReducer } from "./appStateReducer";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { Syncer } from "./Syncer";
import type { AppState } from "./types";
import "./Form.css";
import UndoHolder from "./undo";

type Props = {
  initialTodos: AppState;
};

const undoHolder = new UndoHolder();

export const Form = ({ initialTodos = {} }: Props) => {
  const [state, dispatch] = useReducer(appStateReducer, initialTodos);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useKeyboardNavigation(dispatch);

  useEffect(() => {
    const unlisten = appWindow.onFocusChanged(({ payload: focused }) => {
      if (focused) {
        inputRef.current?.focus();
      }
    });

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      unlisten.then((f) => f());
      document.removeEventListener("keydown", handleKeyDown);
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
    undoHolder.add(state[id]);
    dispatch({
      type: "REMOVE",
      id,
    });
  }, [state]);

  const handleKeyDown = useCallback((e) => {
    const evtobj = window.event ? event : e;
    if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
      handleUndo();
    }
  }, []);

  const handleUndo = useCallback(() => {
    const result = undoHolder.undo();
      if (result) {
      dispatch({
        type: "ADD",
        content: result?.content.trim(),
      });
    }
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
            <label
              className="todo"
              draggable
              onDragOver={(ev) => ev.preventDefault()}
              onDragStart={(ev) => {
                ev.dataTransfer.setData("id", todoId);
                ev.dataTransfer.effectAllowed = "move";
              }}
              onDrop={(ev) => {
                ev.preventDefault();
                const dropId = ev.dataTransfer.getData("id");

                if (!dropId) {
                  return;
                }

                dispatch({
                  destinationIndex: idx,
                  id: dropId,
                  type: "MOVE",
                });
              }}
              key={todoId}
            >
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
