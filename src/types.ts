export type ADD = {
  content: string;
  id: string;
  type: "ADD";
};

export type COMPLETE = {
  id: string;
  type: "COMPLETE";
};

export type UNCOMPLETE = {
  id: string;
  type: "UNCOMPLETE";
};

export type REMOVE = {
  id: string;
  type: "REMOVE";
};

export type UNREMOVE = {
  id: string;
  type: "UNREMOVE";
};

export type MOVE = {
  destinationIndex: number;
  id: string;
  type: "MOVE";
};

export type Action = ADD | COMPLETE | UNCOMPLETE | REMOVE | UNREMOVE | MOVE;

export type StateItem = {
  addedAt: number;
  content: string;
  isComplete: boolean;
  isRemoved?: boolean;
};

export type AppState = {
  [key: string]: StateItem;
};

export type FormValues = {
  todo: string;
};

export type OptimisticDispatch<A> = (value: A) => void;
