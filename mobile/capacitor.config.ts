import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aplusachiever.suibiji',
  appName: '随笔记智能机器',
  webDir: 'www',
  bundledWebRuntime: false,
  ios: { contentInset: 'automatic' },
  android: { allowMixedContent: false }
};

export default config;
