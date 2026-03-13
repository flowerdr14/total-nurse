import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './',
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['total_nursing_icon.ico'],
        manifest: {
          name: 'TOTAL 간호 EMR',
          short_name: '간호EMR',
          description: '실시간 연동 간호 기록 시스템',
          theme_color: '#FF99FF',
          icons: [
            {
              src: 'total_nursing_icon.ico',
              sizes: '64x64 32x32 24x24 16x16',
              type: 'image/x-icon'
            },
            {
              src: 'total_nursing_icon.ico',
              sizes: '192x192',
              type: 'image/x-icon',
              purpose: 'any maskable'
            },
            {
              src: 'total_nursing_icon.ico',
              sizes: '512x512',
              type: 'image/x-icon',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
