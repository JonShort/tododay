import { useReducer } from "react";
import { appStateReducer } from "./appStateReducer";
import { Action, AppState } from "./types";

const useTodoReducer = (initialTodos = {}): [AppState, React.Dispatch<Action>] => {
    const [state, dispatch] = useReducer(appStateReducer, initialTodos);

    state.

    return [state, dispatch];
}

export default useTodoReducer;