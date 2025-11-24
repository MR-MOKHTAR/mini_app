import { useModel } from "@/context/ModelContext";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
} from "./ui/select";

export function ModelSelector() {
  const { model, changeModel } = useModel();

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg">
      <Select value={model} onValueChange={changeModel}>
        <SelectTrigger className="border rounded-lg p-1.5 bg-white *:text-left">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border rounded-lg shadow-lg p-1 min-w-[180px]">
          <SelectGroup>
            <SelectLabel>Models</SelectLabel>
            <SelectItem
              className="text-muted-foreground hover:bg-accent hover:text-white hover:cursor-pointer"
              value="gemini-2.5-pro"
            >
              Gemini 2.5 Pro
            </SelectItem>
            <SelectItem
              className="text-muted-foreground hover:bg-accent hover:text-white hover:cursor-pointer"
              value="gemini-2.5-flash"
            >
              Gemini 2.5 Flash
            </SelectItem>
            <SelectItem
              className="text-muted-foreground hover:bg-accent hover:text-white hover:cursor-pointer"
              value="gemini-2.5-flash-lite"
            >
              Gemini-2.5-flash-lite
            </SelectItem>
            <SelectItem
              className="text-muted-foreground hover:bg-accent hover:text-white hover:cursor-pointer"
              value="gemini-2.0-flash"
            >
              Gemini 2.0 Flash
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
