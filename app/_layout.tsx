import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import 'react-native-reanimated';

import SplashAnimation from '@/components/SplashAnimation';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SmartHomeProvider } from '@/lib/smart-home-context';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [splashDone, setSplashDone] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function finishSplash() {
    setSplashDone(true);

    if (pathname === '/') {
      router.replace('/welcome');
    }
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SmartHomeProvider>
        <Stack>
          <Stack.Screen
            name="welcome"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="register"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="forgot-password"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="otp-verification"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="new-password"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>

        {!splashDone && <SplashAnimation onFinish={finishSplash} />}
      </SmartHomeProvider>

      <StatusBar style={splashDone ? 'auto' : 'light'} />
    </ThemeProvider>
  );
}
