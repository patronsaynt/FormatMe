import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./theme/theme.css";
import { registerFonts } from "./fonts/registry";

// Register bundled TTF families with react-pdf before anything renders.
registerFonts();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
