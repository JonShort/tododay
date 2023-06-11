import { StateItem } from "./types";

export type UndoItem = StateItem & {
    id: string
}

class UndoHolder {
    private stack: UndoItem[] = [];
    private stackIds: string[] = [];

    constructor () {
        this.stack = [];
    }

    add(item: UndoItem): void {
        if (!this.stackIds.includes(item.id)) {
            this.stack.push(item);
            this.stackIds.push(item.id);
        }
    }

    undo(): UndoItem | null {
        const result = this.stack.pop() ?? null;
        this.stackIds.pop();
        return result;
    }
}

export default UndoHolder;