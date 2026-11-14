import "../global.css";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";
import { useUniwind } from "uniwind";

export { ErrorBoundary } from "expo-router";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { theme } = useUniwind();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style={theme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }} />
        <PortalHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
