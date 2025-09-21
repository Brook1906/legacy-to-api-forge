import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'a651d2be-fc9e-4704-81f9-d4759e3e9d56-00-215snatbtf75k.riker.replit.dev'
    ]
  }
});
