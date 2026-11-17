import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // The renderer is loaded only with the interactive scenes and cached separately.
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/three/")) return "three";
        },
      },
    },
  },
});
