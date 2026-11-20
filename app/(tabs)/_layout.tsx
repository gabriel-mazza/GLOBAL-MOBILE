import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSettings } from '../../src/settings';

export default function TabsLayout() {
  const { t, fs } = useSettings();
  const aba = (name: any, title: string, icon: any) => (
    <Tabs.Screen
      name={name}
      options={{
        title,
        tabBarAccessibilityLabel: title,
        tabBarIcon: ({ color, size }) => <Ionicons name={icon} size={size} color={color} />,
      }}
    />
  );
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: t.primary },
        headerTintColor: t.onPrimary,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: t.primary === '#FFD400' ? '#FFD400' : t.primary,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border, height: 64 + (fs(12) - 12) },
        tabBarLabelStyle: { fontSize: fs(12), fontWeight: '600', paddingBottom: 6 },
      }}
    >
      {aba('index', 'Linhas', 'subway')}
      {aba('relatar', 'Relatar', 'megaphone')}
      {aba('historico', 'Meus relatos', 'time')}
      {aba('ajustes', 'Ajustes', 'accessibility')}
    </Tabs>
  );
}
