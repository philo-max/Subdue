import { SymbolView } from 'expo-symbols';
import { Link, Tabs } from 'expo-router';
import { Platform, Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#F5A623', // Gold/Bronze accent
        tabBarInactiveTintColor: '#54596A',
        tabBarStyle: {
          backgroundColor: '#0D1018',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        headerStyle: {
          backgroundColor: '#07090F',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.08)',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: '#E2E6EF',
          fontSize: 18,
          fontWeight: 'bold',
        },
        headerTintColor: '#E2E6EF',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '订阅看板',
          headerTitle: '💸 Subdue 订阅看板',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name="creditcard.fill"
              tintColor={color}
              size={24}
            />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable style={{ marginRight: 15 }}>
                {({ pressed }) => (
                  <SymbolView
                    name="info.circle"
                    size={22}
                    tintColor="#8B93A1"
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: '同步与助手',
          headerTitle: '📡 局域网同步与助手',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name="qrcode.viewfinder"
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
