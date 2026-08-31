import { defineConfig } from 'vite';
import bundleAudioWorkletPlugin from 'vite-plugin-bundle-audioworklet';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [bundleAudioWorkletPlugin()],
});
