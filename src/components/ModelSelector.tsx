import { useModel, AI_MODELS } from "@/context/ModelContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export function ModelSelector() {
  const { model, changeModel } = useModel();

  return (
    <Select
      value={model.value}
      onValueChange={(value) => {
        const selectedModel = AI_MODELS.find((m) => m.value === value);
        if (selectedModel) {
          changeModel(selectedModel);
        }
      }}
    >
      <SelectTrigger className="min-w-[140px] md:min-w-[180px] max-w-[160px] md:max-w-[220px]">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>AI Models</SelectLabel>
          {AI_MODELS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
