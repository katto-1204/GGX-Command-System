import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Initialize auth token getter from localStorage on app startup
setAuthTokenGetter(() => localStorage.getItem("quepon_token"));

createRoot(document.getElementById("root")!).render(<App />);
