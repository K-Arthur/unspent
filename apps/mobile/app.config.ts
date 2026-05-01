import type { ConfigContext, ExpoConfig } from 'expo/config';

const appScheme = process.env.APP_SCHEME ?? 'unspent';
const easProjectId = process.env.EAS_PROJECT_ID ?? process.env.EXPO_PROJECT_ID;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Unspent',
  slug: 'unspent',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: appScheme,
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FEFBF9',
  },
  ios: {
    bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER ?? 'app.unspent',
    supportsTablet: false,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSPhotoLibraryUsageDescription:
        'Allow Unspent to access your photos to add wishlist screenshots.',
      NSCameraUsageDescription:
        'Allow Unspent to use your camera to capture wishlist items.',
    },
  },
  android: {
    package: process.env.ANDROID_PACKAGE ?? 'app.unspent',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FEFBF9',
    },
    permissions: [
      'android.permission.CAMERA',
      'android.permission.READ_MEDIA_IMAGES',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'sentry-expo',
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow Unspent to access your photos to add wishlist items.',
        cameraPermission:
          'Allow Unspent to use your camera to capture wishlist items.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#E8B4B8',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    webUrl: process.env.EXPO_PUBLIC_WEB_URL ?? process.env.NEXT_PUBLIC_WEB_URL,
    eas: {
      projectId: easProjectId,
    },
  },
});
