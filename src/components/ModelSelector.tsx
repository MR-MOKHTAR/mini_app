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
      <SelectTrigger className="min-w-[160px] md:min-w-[200px] max-w-[180px] md:max-w-[240px] font-medium">
        <SelectValue placeholder="انتخاب مدل" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="text-center font-semibold">
            مدل‌های هوش مصنوعی
          </SelectLabel>
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
