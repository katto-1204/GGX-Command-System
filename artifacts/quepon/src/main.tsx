import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import { API_BASE_URL } from "@/lib/api-url";

// Initialize auth token getter from localStorage on app startup
setBaseUrl(API_BASE_URL || null);
setAuthTokenGetter(() => localStorage.getItem("quepon_token"));

createRoot(document.getElementById("root")!).render(<App />);
