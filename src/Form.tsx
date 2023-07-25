import { useCallback, useEffect, useRef } from "react";
import { appWindow } from "@tauri-apps/api/window";
import { nanoid } from "nanoid";

import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { Syncer } from "./Syncer";
import { UndoHandler } from "./UndoHandler";
import { useOptimisticReducer } from "./hooks/useOptimisticReducer";
import "./Form.css";

import type { AppState } from "./types";

type Props = {
  initialTodos: AppState;
};

export const Form = ({ initialTodos = {} }: Props) => {
  const [state, dispatch] = useOptimisticReducer(initialTodos);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useKeyboardNavigation(dispatch);

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

  const handleSubmit = useCallback(
    (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();

      const data = new FormData(ev.currentTarget);
      const content = data.get("todo");

      if (typeof content !== "string" || !content.trim()) {
        return;
      }

      dispatch({
        content: content.trim(),
        id: nanoid(),
        type: "ADD",
      });
      formRef.current?.reset();
    },
    [dispatch]
  );

  const handleCheck = useCallback(
    (id: string, isComplete: boolean) => {
      const type = isComplete ? "UNCOMPLETE" : "COMPLETE";
      dispatch({
        type,
        id,
      });
    },
    [dispatch]
  );

  const handleRemove = useCallback(
    (id: string) => {
      dispatch({
        type: "REMOVE",
        id,
      });
    },
    [dispatch]
  );

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
          const { content, isComplete, isRemoved = false } = state[todoId];

          if (isRemoved) {
            return null;
          }

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

      <UndoHandler dispatch={dispatch} />
    </div>
  );
};
