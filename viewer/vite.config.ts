import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      onwarn(warning) {
        // Silently ignore unresolved external warnings
        if (warning.code === 'UNRESOLVED_EXTERNAL') {
          return;
        }
        // For other warnings, only log, don't fail the build
        if (warning.message) {
          console.warn(`Vite warning: ${warning.message}`);
        }
      },
    },
  },
});
