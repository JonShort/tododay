import { useEffect } from "react";

import { MOVE, OptimisticDispatch } from "../types";

const getFocusedN = (): { idx: number | null; id: string | null } => {
  const focused = document.querySelector("input[data-n]:focus");

  if (!focused) {
    return {
      idx: null,
      id: null,
    };
  }

  const attrVal = focused.getAttribute("data-n");
  const id = focused.getAttribute("id");

  return {
    id: id ?? null,
    idx: attrVal ? parseInt(attrVal) : null,
  };
};

const getAllCheckboxes = (): NodeListOf<HTMLInputElement> =>
  document.querySelectorAll("input[data-n]");

export const useKeyboardNavigation = (
  dispatch: React.Dispatch<MOVE> | OptimisticDispatch<MOVE>
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      if (key === "Escape") {
        (document.activeElement as HTMLElement)?.blur?.();
        return;
      }

      if (key !== "ArrowUp" && key !== "ArrowDown") {
        return;
      }

      const checkboxes = getAllCheckboxes();
      const numberOfCheckboxes = checkboxes.length;

      if (!numberOfCheckboxes) {
        return;
      }

      const isOptionDepressed = event.getModifierState("Alt");
      const { id, idx } = getFocusedN();

      if (isOptionDepressed) {
        // No checkbox focused - skip
        if (idx === null || !id) {
          return;
        }

        if (key === "ArrowUp") {
          // first checkbox should overflow to bottom of list
          if (idx === 0) {
            dispatch({
              destinationIndex: checkboxes.length - 1,
              id: id,
              type: "MOVE",
            });
          } else {
            dispatch({
              destinationIndex: idx - 1,
              id: id,
              type: "MOVE",
            });
          }

          return;
        }

        if (key === "ArrowDown") {
          // last checkbox should overflow to top of list
          if (idx === checkboxes.length - 1) {
            dispatch({
              destinationIndex: 0,
              id: id,
              type: "MOVE",
            });
          } else {
            dispatch({
              destinationIndex: idx + 1,
              id: id,
              type: "MOVE",
            });
          }

          return;
        }
      }

      if (key === "ArrowUp") {
        // null or 0
        if (!idx) {
          checkboxes[checkboxes.length - 1].focus();
        } else {
          // 1 prior
          checkboxes[idx - 1].focus();
        }

        return;
      }

      if (key === "ArrowDown") {
        // not focused or last item focused
        if (idx === null || idx === checkboxes.length - 1) {
          // first checkbox
          checkboxes[0].focus();
        } else {
          // 1 after
          checkboxes[idx + 1].focus();
        }

        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch]);
};
