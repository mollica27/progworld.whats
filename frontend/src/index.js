import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container);

// Corrigido: Removido o CssBaseline que estava "engolindo" o App
root.render(
	<App />
);
