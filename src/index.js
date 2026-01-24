import React from "react";
import { createRoot } from "react-dom/client";
import "./tailwind.css";
import "./styles/index.scss";
import GameView from "./components/GameView.js";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GameView />
  </React.StrictMode>,
);
