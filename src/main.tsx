import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  rootElement.textContent = "";
}

ReactDOM.createRoot(rootElement).render(app);
