import { installReadableStreamAsyncIterator } from "./lib/streamPolyfill";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./theme/theme.css";
import { registerFonts } from "./fonts/registry";

// macOS WKWebView lacks ReadableStream async iteration, which pdf.js needs for
// PDF import. Install the polyfill before anything touches pdf.js.
installReadableStreamAsyncIterator();

// Register bundled TTF families with react-pdf before anything renders.
registerFonts();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
