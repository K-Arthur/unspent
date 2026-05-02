import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import { useAuthStore } from '../src/hooks/useAuthStore';
import '../src/globals.css';

/** Shared header style matching the app's warm cream palette */
const headerStyle = {
  backgroundColor: '#FEFBF9',
  borderBottomWidth: 0,
  elevation: 0,
  shadowOpacity: 0,
} as const;

const headerTintColor = '#2D2D2D';

export default function RootLayout() {
  const router = useRouter();
  const initializeAuth = useAuthStore((state) => state.initialize);
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setSession(null);
      return;
    }

    initializeAuth(supabaseUrl, supabaseAnonKey);
  }, [initializeAuth, setSession]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle,
          headerTintColor,
          headerTitleStyle: {
            fontWeight: '600' as const,
            color: '#2D2D2D',
          },
          headerBackTitle: 'Back',
          contentStyle: { backgroundColor: '#FEFBF9' },
        }}
      >
        {/* Tab navigator — no header (has its own bottom nav) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Modal screens — close button via headerLeft on iOS */}
        <Stack.Screen
          name="onboarding/index"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
            title: 'Welcome to Unspent',
          }}
        />
        <Stack.Screen
          name="add-item/index"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            title: 'Add New Item',
            headerLeft: () => (
              <Pressable
                onPress={() => router.back()}
                accessibilityLabel="Close"
                accessibilityHint="Close this screen and go back"
                accessibilityRole="button"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{ marginLeft: 4 }}
              >
                <Text style={{ fontSize: 22, color: '#2D2D2D' }}>✕</Text>
              </Pressable>
            ),
          }}
        />

        {/* Detail screens — card presentation with back button */}
        <Stack.Screen
          name="item/[id]"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
            title: 'Item Details',
          }}
        />
        <Stack.Screen
          name="court/[id]"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
            title: 'Court Details',
          }}
        />
        <Stack.Screen
          name="profile/[username]"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
            title: 'Profile',
          }}
        />

        {/* Secondary stack screens — back button + title */}
        <Stack.Screen
          name="settings"
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{ title: 'Edit Profile' }}
        />
        <Stack.Screen
          name="friends"
          options={{ title: 'Friends' }}
        />
        <Stack.Screen
          name="invites"
          options={{ title: 'Invites' }}
        />
        <Stack.Screen
          name="receipts"
          options={{ title: 'Receipts' }}
        />
        <Stack.Screen
          name="upgrade"
          options={{
            title: 'Upgrade',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  );
}
