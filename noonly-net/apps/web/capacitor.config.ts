import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'net.noonly.app',
  appName: 'Noonly',
  webDir: 'dist',
  bundledWebRuntime: false,
  overrideUserAgent: 'Noonly Native App',
  backgroundColor: '#334155'
}

// TODO: appflow live update

export default config