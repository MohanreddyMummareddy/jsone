import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      onwarn(warning, warn) {
        // Suppress rollupOptions.external warning
        if (warning.code === 'UNRESOLVED_EXTERNAL') {
          return;
        }
        warn(warning);
      },
    },
  },
});
