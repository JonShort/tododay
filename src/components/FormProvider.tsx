import { ReactNode, createContext } from "react";
import type { Action, AppState, OptimisticDispatch } from "../types";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const FormContext = createContext<Omit<Props, "children">>({
  dispatch: noop,
  handleCheck: noop,
  handleRemove: noop,
  state: {}
});

type Props = {
  children: ReactNode;
  dispatch: OptimisticDispatch<Action>;
  handleCheck: (id: string, isComplete: boolean) => void;
  handleRemove: (id: string) => void;
  state: AppState;
};

const FormProvider = ({
  children,
  dispatch,
  handleCheck,
  handleRemove,
  state,
}: Props) => {
  const value = {
    dispatch,
    handleCheck,
    handleRemove,
    state,
  };
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export default FormProvider;
