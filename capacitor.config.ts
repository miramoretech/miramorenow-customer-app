import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.miramoretech.app',
  appName: 'Miramore',
  webDir: 'dist',
  server: {
    // No 'url' = serve local files from the APK (best for production)
    androidScheme: 'https',
    cleartext: true, // Required for some third‑party assets (maps, Flutterwave)
    allowNavigation: [
      '*.flutterwave.com',
      '*.flw-co-za.com',
      '*.googleapis.com',
      '*.gstatic.com',
      '*.google.com',           // Additional Google domains
      '*.googleusercontent.com',
      '*.ggpht.com',
      'capacitor://localhost', // For development
      'http://localhost',
      'https://localhost',
    ],
  },
  android: {
    allowMixedContent: true,        // Mixed HTTPS/HTTP content
    webContentsDebuggingEnabled: false, // Keep false for release
    initialFocus: true,
    windowSoftInputMode: 'adjustResize', // Better keyboard handling
    overrideUserAgent: true,
    appendUserAgent: 'MiramoreApp/1.0',
  },
  ios: {
    // Optional but recommended for iOS
    allowsLinkPreview: false,
    allowNavigation: [
      '*.flutterwave.com',
      '*.googleapis.com',
    ],
  },
};

export default config;