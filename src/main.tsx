import React from "react";
import ReactDOM, { hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { staticRoutePaths } from "./seo/staticRoutes";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const normalizedPath = window.location.pathname.replace(/\/$/, "") || "/";
const canHydrateStaticRoute =
  rootElement.hasChildNodes() && staticRoutePaths.includes(normalizedPath);

if (canHydrateStaticRoute) {
  hydrateRoot(rootElement, app);
} else {
  ReactDOM.createRoot(rootElement).render(app);
}
