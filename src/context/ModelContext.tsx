import { createContext, useContext, useState } from "react";

type ModelContextValue = {
  model: string;
  changeModel: (m: string) => void;
};

const ModelContext = createContext<ModelContextValue | undefined>(undefined);

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [model, setModel] = useState<string>(
    localStorage.getItem("AI_MODEL") ?? "gemini-2.5-flash"
  );

  function changeModel(m: string) {
    setModel(m);
    localStorage.setItem("AI_MODEL", m);
  }

  return (
    <ModelContext.Provider value={{ model, changeModel }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel(): ModelContextValue {
  const ctx = useContext(ModelContext);
  if (!ctx) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return ctx;
}
