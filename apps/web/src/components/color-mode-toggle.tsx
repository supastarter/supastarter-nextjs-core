"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const colorModes = [
  { value: "system", label: "System", icon: MonitorIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
] as const;

const subscribe = () => () => {};

export function ColorModeToggle() {
  const { theme, setTheme } = useTheme();
  // The saved color mode is only known in the browser. Show no selection until
  // after hydration so the server and client render the same markup.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <ToggleGroup
      aria-label="Color mode"
      size="sm"
      spacing={0.5}
      className="bg-muted p-0.5"
      value={hydrated && theme ? [theme] : []}
      onValueChange={([value]) => {
        if (value) {
          setTheme(value);
        }
      }}
    >
      {colorModes.map(({ value, label, icon: Icon }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          className="aria-pressed:bg-background dark:aria-pressed:bg-input/30 hover:bg-transparent aria-pressed:shadow-sm"
        >
          <Icon data-icon="inline-start" />
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
