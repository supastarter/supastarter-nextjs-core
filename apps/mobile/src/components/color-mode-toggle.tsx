import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { ToggleGroup, ToggleGroupIcon, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type ColorMode, setColorMode, useColorMode } from "@/lib/color-mode";
import { cn } from "@/lib/utils";

const colorModes = [
  { value: "system", label: "System", icon: MonitorIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
] satisfies { value: ColorMode; label: string; icon: typeof MonitorIcon }[];

export function ColorModeToggle() {
  const colorMode = useColorMode();

  return (
    <ToggleGroup
      type="single"
      value={colorMode}
      onValueChange={(value) => {
        const selected = colorModes.find((mode) => mode.value === value);
        if (selected) {
          setColorMode(selected.value);
        }
      }}
      aria-label="Color mode"
      size="sm"
      className="bg-muted gap-0.5 rounded-lg p-0.5"
    >
      {colorModes.map(({ value, label, icon }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          className={cn(
            "rounded-md",
            colorMode === value && "bg-background dark:bg-input/30 shadow-sm shadow-black/5",
          )}
        >
          <ToggleGroupIcon as={icon} />
          <Text>{label}</Text>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
