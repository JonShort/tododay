import { useCallback, useEffect, useReducer } from "react";
import { useForm } from "react-hook-form";
import { appWindow } from "@tauri-apps/api/window";

import { appStateReducer } from "./appStateReducer";
import { Syncer } from "./Syncer";
import type { AppState, FormValues } from "./types";
import "./Form.css";

type Props = {
  initialFormState: AppState;
};

export const Form = ({ initialFormState = {} }: Props) => {
  const [state, dispatch] = useReducer(appStateReducer, initialFormState);
  const { register, reset, handleSubmit, setFocus } = useForm<FormValues>();

  useEffect(() => {
    const unlisten = appWindow.onFocusChanged(({ payload: focused }) => {
      if (focused) {
        setFocus("todo");
      }
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const onSubmit = handleSubmit(({ todo }) => {
    const content = todo.trim();

    if (!content) {
      return;
    }

    dispatch({
      type: "ADD",
      content,
    });
    reset();
  });

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
        <form onSubmit={onSubmit} method="POST">
          <input {...register("todo")} placeholder="Enter your todo..." />
          <button type="submit">Add</button>
        </form>
      </div>

      <div className="todos-container">
        {Object.keys(state).map((todoId) => {
          const { content, isComplete } = state[todoId];
          return (
            <label className="todo" key={todoId}>
              <input
                onChange={() => handleCheck(todoId, isComplete)}
                checked={isComplete}
                id={todoId}
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
