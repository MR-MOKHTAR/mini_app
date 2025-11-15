import { useModel } from "@/context/ModelContext";

export function ModelSelector() {
  const { model, changeModel } = useModel();

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg">
      <select
        className="border rounded-lg p-1.5 bg-white *:text-center"
        value={model}
        onChange={(e) => changeModel(e.target.value)}
      >
        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
        <option value="gemini-2.5-flash-lite">Gemini-2.5-flash-lite</option>
        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
      </select>
    </div>
  );
}
