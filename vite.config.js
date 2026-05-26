import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
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

const prerenderedMarketingPaths = [
  "/pricing",
  "/how-it-works",
  "/about",
  "/founder",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/refund-cancellation",
  "/features/verified-booking",
  "/features/link-in-bio-storefront",
  "/features/whatsapp-handoff",
  "/features/order-organization",
  "/features/product-links",
  "/features/customer-leads",
  "/for/instagram-sellers",
  "/for/whatsapp-sellers",
  "/for/thrift-sellers",
  "/for/boutiques",
  "/for/handmade-sellers",
  "/for/student-sellers",
  "/compare",
  "/compare/paypertap-vs-linktree",
  "/compare/paypertap-vs-whatsapp-catalog",
  "/compare/paypertap-vs-google-forms",
  "/compare/paypertap-vs-shopify-starter",
];

function servePrerenderedPreviewRoutes() {
  return {
    name: "paypertap-prerendered-preview-routes",
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        const requestPath = request.url?.split("?")[0] ?? "/";
        const normalizedPath =
          requestPath !== "/" ? requestPath.replace(/\/$/, "") : requestPath;

        if (!prerenderedMarketingPaths.includes(normalizedPath)) {
          next();
          return;
        }

        const htmlPath = path.join(
          projectRoot,
          "dist",
          normalizedPath.slice(1),
          "index.html",
        );

        if (!fs.existsSync(htmlPath)) {
          next();
          return;
        }

        response.statusCode = 200;
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end(fs.readFileSync(htmlPath, "utf8"));
      });
    },
  };
}

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
    plugins: [servePrerenderedPreviewRoutes(), react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "react-vendor",
                test: /node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
                priority: 40,
              },
              {
                name: "firebase-vendor",
                test: /node_modules[\\/](@firebase|firebase)[\\/]/,
                priority: 35,
                maxSize: 260 * 1024,
              },
              {
                name: "ui-vendor",
                test: /node_modules[\\/](lucide-react|framer-motion|@studio-freight|clsx|tailwind-merge)[\\/]/,
                priority: 30,
              },
              {
                name: "aws-vendor",
                test: /node_modules[\\/](@aws-sdk|@smithy)[\\/]/,
                priority: 25,
                maxSize: 260 * 1024,
              },
              {
                name: "vendor",
                test: /node_modules[\\/]/,
                priority: 10,
                maxSize: 280 * 1024,
              },
            ],
          },
        },
      },
    },
  };
});
