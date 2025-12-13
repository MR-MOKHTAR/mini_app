import { useModel, AI_MODELS } from "@/context/ModelContext";

import { Portal, Select } from "@chakra-ui/react";
import { createListCollection } from "@ark-ui/react";

const modelCollection = createListCollection({
  items: AI_MODELS,
});

export function ModelSelector() {
  const { model, changeModel } = useModel();

  const handleValueChange = (details: { value: string[] }) => {
    const selectedValue = details.value[0];
    const selectedModel = AI_MODELS.find((m) => m.value === selectedValue);

    if (selectedModel) {
      changeModel(selectedModel);
    }
  };

  return (
    <Select.Root
      collection={modelCollection}
      value={[model.value]}
      onValueChange={handleValueChange}
      size="sm"
      minWidth={{ base: "140px", md: "180px" }}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger className="bg-background border-border border rounded-lg px-2 h-9 md:h-10">
          <Select.ValueText
            placeholder="Select AI Model"
            className="text-foreground"
          />
        </Select.Trigger>
      </Select.Control>

      <Portal>
        <Select.Positioner>
          <Select.Content className="bg-white dark:bg-gray-800 border border-border rounded-xl shadow-xl overflow-hidden min-w-[180px] p-1 z-50">
            {modelCollection.items.map((item) => (
              <Select.Item
                item={item}
                key={item.value}
                className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between text-foreground"
              >
                {item.label}
                <Select.ItemIndicator className="text-primary" />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
}
