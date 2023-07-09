import { useCallback, useMemo, useReducer } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import type { Action, AppState, OptimisticDispatch } from "../types";

export const appStateReducer = (state: AppState, action: Action) => {
  switch (action.type) {
    case "ADD": {
      return {
        ...state,
        [action.id]: {
          addedAt: Date.now(),
          isComplete: false,
          content: action.content,
        },
      };
    }

    case "COMPLETE": {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          isComplete: true,
        },
      };
    }

    case "UNCOMPLETE": {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          isComplete: false,
        },
      };
    }

    case "MOVE": {
      const { [action.id]: todoToMove, ...otherState } = state;

      const listOfTodos = Object.entries(otherState);
      listOfTodos.splice(action.destinationIndex, 0, [action.id, todoToMove]);

      const reorderedTodos: AppState = {};
      for (const [id, value] of listOfTodos) {
        reorderedTodos[id] = value;
      }

      return reorderedTodos;
    }

    case "REMOVE": {
      const { [action.id]: _pluck, ...otherState } = state;
      return otherState;
    }

    default: {
      return { ...state };
    }
  }
};

const mirrorInDb = (action: Action) => {
  switch (action.type) {
    case "ADD": {
      invoke("add_todo", { id: action.id, content: action.content }).then(
        () => {
          // nothing
        }
      );
      break;
    }

    case "COMPLETE": {
      invoke("complete_todo", { id: action.id }).then(() => {
        // nothing
      });
      break;
    }

    case "UNCOMPLETE": {
      invoke("uncomplete_todo", { id: action.id }).then(() => {
        // nothing
      });
      break;
    }

    case "REMOVE": {
      invoke("remove_todo", { id: action.id }).then(() => {
        // nothing
      });
      break;
    }

    default: {
      break;
    }
  }
};

const useDB = (originalDispatch: React.Dispatch<Action>) => {
  const dispatch: OptimisticDispatch<Action> = useCallback(
    (action: Action) => {
      originalDispatch(action);
      mirrorInDb(action);
    },
    [originalDispatch]
  );

  return dispatch;
};

export const useOptimisticReducer = (initialTodos = {}) => {
  const [state, reactDispatch] = useReducer(appStateReducer, initialTodos);
  const dispatch = useDB(reactDispatch);

  const ret: [AppState, OptimisticDispatch<Action>] = useMemo(
    () => [state, dispatch],
    [state, dispatch]
  );

  return ret;
};
