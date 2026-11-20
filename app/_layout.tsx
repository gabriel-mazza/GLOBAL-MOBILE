import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider, useSettings } from '../src/settings';

function Navegacao() {
  const { t, altoContraste } = useSettings();
  return (
    <>
      <StatusBar style={altoContraste ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: t.text,
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="linha/[id]" options={{ title: 'Detalhes da linha' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <Navegacao />
    </SettingsProvider>
  );
}
