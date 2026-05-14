// Vercel serverless proxy — forwards /api/* requests to the Render backend.
const BACKEND_URL = process.env.VITE_API_URL || "https://ggx-quepon.onrender.com";

module.exports = async function handler(req, res) {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;

    const headers = {
      "content-type": req.headers["content-type"] || "application/json",
    };

    if (req.headers["x-session-token"]) {
      headers["x-session-token"] = req.headers["x-session-token"];
    }
    if (req.headers["authorization"]) {
      headers["authorization"] = req.headers["authorization"];
    }

    const fetchOptions = {
      method: req.method || "GET",
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      const body = await new Promise((resolve) => {
        let data = "";
        req.on("data", (chunk) => { data += chunk.toString(); });
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
  } catch (err) {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Backend proxy error", details: err.message }));
  }
};
