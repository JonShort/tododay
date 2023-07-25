import { useEffect, useMemo, useRef, useState } from "react";

import { OptimisticDispatch, UNREMOVE } from "../types";

const TWO_SECONDS_IN_MS = 2000;

const isValidCustomEvent = (ev: Event): ev is CustomEvent<string> => {
  return "detail" in ev && typeof ev.detail === "string";
};

export const useUndo = (dispatch: OptimisticDispatch<UNREMOVE>) => {
  const stack = useRef<string[]>([]);
  const [showUndoUI, setShowUndoUI] = useState(false);

  useEffect(() => {
    const handleEvent = (ev: Event) => {
      if (!isValidCustomEvent(ev)) {
        return;
      }

      stack.current.push(ev.detail);
      setShowUndoUI(true);
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
      setShowUndoUI(false);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!showUndoUI) {
      return;
    }

    const t = setTimeout(() => {
      setShowUndoUI(false);
    }, TWO_SECONDS_IN_MS);

    return () => {
      clearTimeout(t);
    };
  }, [showUndoUI]);

  return useMemo(() => showUndoUI, [showUndoUI]);
};
