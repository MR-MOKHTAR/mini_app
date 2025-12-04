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
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Select AI Model" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>

      <Portal>
        <Select.Positioner>
          <Select.Content>
            {/* ۵. پیمایش روی items داخل collection */}
            {modelCollection.items.map((item) => (
              <Select.Item item={item} key={item.value}>
                {item.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
}
