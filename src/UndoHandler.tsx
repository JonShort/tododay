import { useUndo } from "./hooks/useUndo";
import type { OptimisticDispatch, UNREMOVE } from "./types";

import "./UndoHandler.css";

type Props = {
  dispatch: OptimisticDispatch<UNREMOVE>;
};

export const UndoHandler = ({ dispatch }: Props) => {
  const showUndoUI = useUndo(dispatch);

  return (
    <div className={`undo-handler ${showUndoUI ? "shown" : "hidden"}`}>
      <span className="undo-message">Todo deleted - undo with cmd + z</span>
    </div>
  );
};
