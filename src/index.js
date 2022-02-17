import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.scss";
import GameView from "./components/GameView.js";

ReactDOM.render(
  <React.StrictMode>
    <GameView />
  </React.StrictMode>,
  document.getElementById("root")
);
