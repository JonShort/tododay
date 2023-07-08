import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import { Form } from "./Form";
import { AppState } from "./types";

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const formStateRef = useRef<AppState>({});

  useEffect(() => {
    Promise.all([invoke<string>("get_todos"), invoke<string>("get_ordering")])
      .then(([todos, ordering]) => {
        const stateObj = JSON.parse(todos) as AppState;
        const orderingArr = JSON.parse(ordering) as string[];

        const sortedKeys = Object.keys(stateObj).sort((a, b) => {
          const indexA = orderingArr.indexOf(a);
          const indexB = orderingArr.indexOf(b);

          // If both elements are present in the sorting order array,
          // compare their indices in the sorting order
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }

          // If only one of the elements is present in the sorting order,
          // prioritize the one that is present
          if (indexA !== -1) {
            return -1;
          }
          if (indexB !== -1) {
            return 1;
          }

          // If neither element is present in the sorting order,
          // maintain their original order
          return 0;
        });

        const newStateObj = sortedKeys.reduce<AppState>((acc, curr) => {
          acc[curr] = stateObj[curr];
          return acc;
        }, {});

        formStateRef.current = newStateObj;
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  if (!isLoaded) {
    return <div className="container">...Setting up tododay</div>;
  }

  return <Form initialTodos={formStateRef.current} />;
}

export default App;
