import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ai.oceancore.app",
  appName: "OceanCore AI",
  webDir: "www",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
    iosScheme: "https"
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#040813",
      androidScaleType: "CENTER_CROP",
      showSpinner: false
    }
  }
};

export default config;
