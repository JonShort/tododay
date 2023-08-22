import { useContext } from "react";
import { FormContext } from "./FormProvider";

export type Props = {
  todoId: string;
  idx: number
};

const TodoItem = ({ todoId, idx }: Props) => {
  const { dispatch, handleCheck, handleRemove, state } =
    useContext(FormContext);
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
      <button className="button__del" onClick={() => handleRemove(todoId)}>
        x
      </button>
    </label>
  );
};

export default TodoItem;
