// Vercel serverless proxy — forwards /api/* requests to the Render backend.
// Uses plain types to avoid needing @vercel/node as a dependency.

import type { IncomingMessage, ServerResponse } from "node:http";

const BACKEND_URL = process.env.VITE_API_URL || "https://ggx-quepon.onrender.com";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // Extract the path from the URL
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;

    const headers: Record<string, string> = {
      "content-type": req.headers["content-type"] || "application/json",
    };

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

    // Read body for non-GET requests
    if (req.method !== "GET" && req.method !== "HEAD") {
      const body = await new Promise<string>((resolve) => {
        let data = "";
        req.on("data", (chunk: Buffer) => { data += chunk.toString(); });
        req.on("end", () => resolve(data));
      });
      if (body) fetchOptions.body = body;
    }

    const upstream = await fetch(targetUrl, fetchOptions);
    const data = await upstream.text();

    const contentType = upstream.headers.get("content-type");
    res.writeHead(upstream.status, {
      "content-type": contentType || "application/json",
      "access-control-allow-origin": "*",
    });
    res.end(data);
  } catch (err: any) {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Backend proxy error", details: err.message }));
  }
}
