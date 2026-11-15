import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { ColorModeToggle } from "@/components/color-mode-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { orpc } from "@/lib/orpc";

export default function HomeScreen() {
  const greeting = useQuery(orpc.greeting.queryOptions({ input: { name: "supastarter" } }));
  const message = greeting.isError
    ? "Could not reach the API."
    : (greeting.data?.message ?? "Loading…");

  return (
    <View className="bg-background flex-1 items-center justify-center gap-6 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>supastarter</CardTitle>
          <CardDescription>Edit apps/mobile/src/app/index.tsx to get started.</CardDescription>
        </CardHeader>
        <CardContent className="flex-row items-center justify-between gap-4">
          <Animated.View key={message} entering={FadeIn}>
            <Text className={greeting.isError ? "text-destructive" : undefined}>{message}</Text>
          </Animated.View>
          <Button
            variant="outline"
            size="sm"
            disabled={greeting.isFetching}
            onPress={() => void greeting.refetch()}
          >
            <Text>Refetch</Text>
          </Button>
        </CardContent>
      </Card>
      <ColorModeToggle />
    </View>
  );
}
