import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import { Form } from "./Form";
import { AppState } from "./types";

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const formStateRef = useRef<AppState>({});

  useEffect(() => {
    invoke<string>("get_todos").then((todos) => {
      const stateObj = JSON.parse(todos) as AppState;
  
      formStateRef.current = stateObj;
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded) {
    return (
      <div className="container">
        ...Setting up tododay
      </div>
    );
  }

  return (
    <Form initialFormState={formStateRef.current} />
  );
}

export default App;
