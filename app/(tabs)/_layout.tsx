import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(main)",
};

export default function TabsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
    </Stack>
  );
}
