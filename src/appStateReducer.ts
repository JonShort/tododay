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

    case "REMOVE": {
      const { [action.id]: pluck, ...otherState } = state;
      return otherState;
    }

    default: {
      return { ...state };
    }
  }
};
