import { useEffect, useRef } from "react";

import { OptimisticDispatch, UNREMOVE } from "../types";

const isValidCustomEvent = (ev: Event): ev is CustomEvent<string> => {
  return "detail" in ev && typeof ev.detail === "string";
};

export const useUndo = (dispatch: OptimisticDispatch<UNREMOVE>) => {
  const stack = useRef<string[]>([]);

  useEffect(() => {
    const handleEvent = (ev: Event) => {
      if (!isValidCustomEvent(ev)) {
        return;
      }

      stack.current.push(ev.detail);
    };

    document.addEventListener("TODO_REMOVED", handleEvent);

    return () => {
      document.removeEventListener("TODO_REMOVED", handleEvent);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      const isCmdOrCtrlDepressed =
        ev.getModifierState("Meta") || ev.getModifierState("Control");

      if (ev.key !== "z" || !isCmdOrCtrlDepressed) {
        return;
      }

      const itemToUndo = stack.current.pop();

      if (!itemToUndo) {
        // nothing to undo
        return;
      }

      dispatch({
        id: itemToUndo,
        type: "UNREMOVE",
      });
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch]);
};
