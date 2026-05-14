// Vercel serverless function that proxies API requests to the Render backend.
// Since the frontend uses VITE_API_URL to call Render directly, this handler
// only exists as a fallback for any /api/* requests that hit Vercel.

import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND_URL = process.env.VITE_API_URL || "https://ggx-quepon.onrender.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const path = (req.query.path as string[])?.join("/") ?? "";
    const targetUrl = `${BACKEND_URL}/api/${path}`;

    const headers: Record<string, string> = {
      "content-type": req.headers["content-type"] || "application/json",
    };

    // Forward auth headers
    if (req.headers["x-session-token"]) {
      headers["x-session-token"] = req.headers["x-session-token"] as string;
    }
    if (req.headers["authorization"]) {
      headers["authorization"] = req.headers["authorization"] as string;
    }

    const fetchOptions: RequestInit = {
      method: req.method || "GET",
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const upstream = await fetch(targetUrl, fetchOptions);
    const data = await upstream.text();

    // Forward response headers
    const contentType = upstream.headers.get("content-type");
    if (contentType) res.setHeader("content-type", contentType);

    res.status(upstream.status).send(data);
  } catch (err: any) {
    console.error("[vercel-api] Proxy error:", err);
    res.status(502).json({ error: "Backend proxy error", details: err.message });
  }
}
