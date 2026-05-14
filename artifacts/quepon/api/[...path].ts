// @ts-ignore - bypassing missing types for Vercel functions
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: any, res: any) {
  try {
    // Import the backend app from the built server output
    // @ts-ignore - bypassing missing declaration file for .mjs
    const mod = await import("../../api-server/dist/app.mjs");
    const app = mod.default || mod.app;

    if (!app) {
      return res.status(500).json({ error: "Backend app export not found" });
    }

    // Pass the request and response to the express app
    return app(req, res);
  } catch (error: any) {
    console.error("API handler failed:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error?.message || "Unknown error",
      stack: error?.stack
    });
  }
}
