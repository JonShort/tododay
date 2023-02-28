import { useReducer } from "react";
import { useForm } from "react-hook-form";

import { appStateReducer } from "./appStateReducer";
import type { AppState, FormValues } from "./types";

type Props = {
  initialFormState: AppState,
};

export const Form = ({ initialFormState = {}}: Props) => {
  const [state, dispatch] = useReducer(appStateReducer, initialFormState);
  const { register, reset, handleSubmit } = useForm<FormValues>();

  const onSubmit = handleSubmit(({ todo }) => {
    dispatch({
      type: "ADD",
      content: todo,
    });
    reset();
  });

  return (
    <div className="container">
      <div className="row">
        <form id="todo-form" onSubmit={onSubmit}>
          <input {...register("todo")} placeholder="Enter your todo..." />
          <button type="submit">Add</button>
        </form>
      </div>

      <p id="todo-msg">{JSON.stringify(state)}</p>
    </div>
  );
}
