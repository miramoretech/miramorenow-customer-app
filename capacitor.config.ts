import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.miramoretech.app',
  appName: 'Miramore',
  webDir: 'dist',
  server: {
    url: undefined,
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      '*.flutterwave.com',
      '*.flw-co-za.com',
      '*.googleapis.com',
      '*.gstatic.com',
    ],
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false, // Keep false for release builds
    initialFocus: true,
    windowSoftInputMode: 'adjustResize',
    // ─── ADD THESE ───
    overrideUserAgent: true,
    appendUserAgent: 'MiramoreApp/1.0',
  },
};

export default config;