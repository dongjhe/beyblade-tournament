import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dongjhe.beybladetournament',
  appName: 'Beyblade Tournament',
  webDir: 'dist/beyblade-tournament/browser',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile'
  }
};

export default config;
