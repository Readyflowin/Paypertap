import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const requiredClientEnv = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

// Vite config stays intentionally lightweight.
// Alias support is included now so deeper feature folders can scale without brittle relative imports.
// Keep serverless/backend settings out of this file unless they directly affect the browser build.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "");
  const missingEnv = requiredClientEnv.filter((name) => !env[name]?.trim());

  if (missingEnv.length > 0) {
    throw new Error(`Missing required client environment variables: ${missingEnv.join(", ")}`);
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
