export type ADD = {
    content: string,
    type: "ADD",
};

export type COMPLETE = {
    id: string,
    type: "COMPLETE",
};

export type UNCOMPLETE = {
    id: string,
    type: "UNCOMPLETE",
};

export type REMOVE = {
    id: string,
    type: "REMOVE",
};

export type Action = ADD | COMPLETE | UNCOMPLETE | REMOVE;

export type AppState = {
    [key: string]: {
        addedAt: number,
        content: string,
        isComplete: boolean,
    },
};

export type FormValues = {
    todo: string,
};
