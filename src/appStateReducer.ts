import { nanoid } from 'nanoid'

import type { Action, AppState } from "./types";

export const appStateReducer = (state: AppState, action: Action) => {
  switch (action.type) {
    case "ADD": {
      return {
        ...state,
        [nanoid()]: {
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
