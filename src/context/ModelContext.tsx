import { createContext, useContext, useState, type ReactNode } from "react";

export type ModelOption = {
  label: string;
  value: string;
};

export const AI_MODELS: ModelOption[] = [
  { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro" },
  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
  { label: "Gemini 2.5 Flash Lite", value: "gemini-2.5-flash-lite" },
  { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
];

const DEFAULT_MODEL_VALUE = AI_MODELS[1].value; // gemini-2.5-flash

const getModelOption = (value: string | null): ModelOption => {
  const modelValue = value ?? DEFAULT_MODEL_VALUE;
  return AI_MODELS.find((m) => m.value === modelValue) ?? AI_MODELS[0];
};

type ModelContextValue = {
  model: ModelOption;
  changeModel: (m: ModelOption) => void;
};

const ModelContext = createContext<ModelContextValue | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  // مقداردهی اولیه با آبجکت کامل مدل
  const [model, setModel] = useState<ModelOption>(
    getModelOption(localStorage.getItem("AI_MODEL"))
  );

  function changeModel(m: ModelOption) {
    setModel(m);
    localStorage.setItem("AI_MODEL", m.value);
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
