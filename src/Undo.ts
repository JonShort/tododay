import { StateItem } from "./types";

class UndoHolder {
    private stack: StateItem[] = [];

    constructor () {
        this.stack = [];
    }

    add(item: StateItem): void {
        this.stack.push(item);
    }

    undo(): StateItem | null {
        const result = this.stack.pop() ?? null;
        return result;
    }
}

export default UndoHolder;