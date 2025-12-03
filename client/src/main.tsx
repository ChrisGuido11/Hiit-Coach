import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeDeploy } from "./lib/deploy";

// Initialize Ionic Appflow Deploy for live updates
initializeDeploy().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
