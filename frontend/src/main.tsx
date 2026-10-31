import React from "react";
import ReactDOM from "react-dom/client";
import "./registry.css";
import "@fontsource/geist-mono/latin-400.css";
import "@fontsource/geist/latin-400.css";
import "@fontsource/geist/latin-500.css";
import "@fontsource/geist/latin-600.css";
import Site from "./Site";
import "./styles.css";
import "./studio.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Site />
  </React.StrictMode>,
);
