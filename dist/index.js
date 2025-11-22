// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
var ANIMEBITE_BASE_URL = "https://animebite.onrender.com";
async function fetchFromAnimeBite(endpoint) {
  try {
    const response = await fetch(`${ANIMEBITE_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`AnimeBite API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from AnimeBite: ${endpoint}`, error);
    throw error;
  }
}
function proxyImageUrl(url) {
  if (!url || typeof url !== "string") return url;
  return `/api/proxy/image?url=${encodeURIComponent(url)}`;
}
function proxyPosterUrls(obj) {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => proxyPosterUrls(item));
  }
  if (typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      if (key === "poster" && typeof obj[key] === "string") {
        newObj[key] = proxyImageUrl(obj[key]);
      } else {
        newObj[key] = proxyPosterUrls(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}
async function registerRoutes(app2) {
  app2.get("/api/home", async (req, res) => {
    try {
      const data = await fetchFromAnimeBite("/api/v2/hianime/home");
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch home data" });
    }
  });
  app2.get("/api/anime/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await fetchFromAnimeBite(`/api/v2/hianime/anime/${id}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch anime details" });
    }
  });
  app2.get("/api/anime/:id/episodes", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await fetchFromAnimeBite(`/api/v2/hianime/anime/${id}/episodes`);
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch episodes" });
    }
  });
  app2.get("/api/episode/servers", async (req, res) => {
    try {
      const { animeEpisodeId } = req.query;
      if (!animeEpisodeId) {
        return res.status(400).json({ success: false, error: "animeEpisodeId is required" });
      }
      const data = await fetchFromAnimeBite(`/api/v2/hianime/episode/servers?animeEpisodeId=${animeEpisodeId}`);
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch episode servers" });
    }
  });
  app2.get("/api/episode/sources", async (req, res) => {
    try {
      const { animeEpisodeId, server, category } = req.query;
      if (!animeEpisodeId) {
        return res.status(400).json({ success: false, error: "animeEpisodeId is required" });
      }
      const params = new URLSearchParams();
      params.set("animeEpisodeId", animeEpisodeId);
      if (server) params.set("server", server);
      if (category) params.set("category", category);
      const endpoint = `/api/v2/hianime/episode/sources?${params.toString()}`;
      console.log("Fetching sources from:", endpoint);
      const data = await fetchFromAnimeBite(endpoint);
      if (!data.data || !data.data.sources || data.data.sources.length === 0) {
        console.error("No sources available in response:", data);
        return res.status(404).json({
          success: false,
          error: "No streaming sources available for this server/category combination"
        });
      }
      console.log(`Found ${data.data.sources.length} source(s)`);
      data.data.sources = data.data.sources.map((source) => ({
        ...source,
        url: `/api/proxy/stream?url=${encodeURIComponent(source.url)}`
      }));
      if (data.data.tracks && data.data.tracks.length > 0) {
        data.data.tracks = data.data.tracks.map((track) => ({
          ...track,
          file: `/api/proxy/stream?url=${encodeURIComponent(track.file)}`
        }));
      }
      res.json(data);
    } catch (error) {
      console.error("Episode sources error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch streaming sources" });
    }
  });
  app2.options("/api/proxy/stream", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.status(200).end();
  });
  app2.get("/api/proxy/stream", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ success: false, error: "url parameter is required" });
      }
      const response = await fetch(url, {
        headers: {
          "Referer": "https://rapid-cloud.co/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "Origin": "https://rapid-cloud.co"
        }
      });
      if (!response.ok) {
        console.error(`Failed to fetch stream: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch video stream: ${response.status}`);
      }
      const contentType = response.headers.get("content-type") || "";
      const isM3U8 = url.includes(".m3u8") || contentType.includes("application/vnd.apple.mpegurl") || contentType.includes("application/x-mpegURL");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("Access-Control-Expose-Headers", "*");
      if (isM3U8) {
        const text = await response.text();
        const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
        const modifiedPlaylist = text.split("\n").map((line) => {
          if (line.startsWith("#") || line.trim() === "") {
            return line;
          }
          if (line.trim().length > 0) {
            let targetUrl = line.trim();
            if (!targetUrl.startsWith("http")) {
              targetUrl = baseUrl + targetUrl;
            }
            return `/api/proxy/stream?url=${encodeURIComponent(targetUrl)}`;
          }
          return line;
        }).join("\n");
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.send(modifiedPlaylist);
      } else {
        response.headers.forEach((value, key) => {
          if (!["content-encoding", "transfer-encoding", "connection"].includes(key.toLowerCase())) {
            res.setHeader(key, value);
          }
        });
        if (req.headers.range) {
          res.setHeader("Accept-Ranges", "bytes");
        }
        if (response.body) {
          const reader = response.body.getReader();
          const pump = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
              }
              res.end();
            } catch (streamError) {
              console.error("Stream error:", streamError);
              res.end();
            }
          };
          await pump();
        } else {
          const buffer = await response.arrayBuffer();
          res.send(Buffer.from(buffer));
        }
      }
    } catch (error) {
      console.error("Proxy stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: "Failed to proxy video stream" });
      }
    }
  });
  app2.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`# AnimeBite Robots.txt
User-agent: *
Allow: /
Disallow: /watch/
Disallow: /profile/
Disallow: /forum/post/
Disallow: /auth/

# Sitemap
Sitemap: https://animebite.cc/sitemap.xml`);
  });
  app2.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = "https://animebite.cc";
      const currentDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Main Pages -->
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/azlist</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/movies</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/tv-series</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/forum</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Categories -->
  <url>
    <loc>${baseUrl}/category/trending</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/category/recently-updated</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/category/top-airing</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/category/top-upcoming</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/category/movie</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/category/tv</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Info Pages -->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/faq</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/dmca</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/disclaimer</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;
      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });
  app2.get("/api/proxy/image", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ success: false, error: "url parameter is required" });
      }
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://hianime.to/"
        }
      });
      if (!response.ok) {
        console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        return res.status(response.status).send();
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "*");
      const contentType = response.headers.get("content-type");
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      res.setHeader("Cache-Control", "public, max-age=86400");
      if (response.body) {
        const reader = response.body.getReader();
        const pump = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(value);
            }
            res.end();
          } catch (streamError) {
            console.error("Image stream error:", streamError);
            res.end();
          }
        };
        await pump();
      } else {
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    } catch (error) {
      console.error("Proxy image error:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: "Failed to proxy image" });
      }
    }
  });
  app2.get("/api/search", async (req, res) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(req.query).forEach(([key, value]) => {
        if (value) queryParams.set(key, value);
      });
      const endpoint = `/api/v2/hianime/search?${queryParams.toString()}`;
      const data = await fetchFromAnimeBite(endpoint);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to search anime" });
    }
  });
  app2.get("/api/search/suggestions", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, error: "q parameter is required" });
      }
      const data = await fetchFromAnimeBite(`/api/v2/hianime/search/suggestion?q=${q}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch suggestions" });
    }
  });
  app2.get("/api/schedule/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const data = await fetchFromAnimeBite(`/api/v2/hianime/schedule?date=${date}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch schedule" });
    }
  });
  app2.get("/api/category/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const { page = "1" } = req.query;
      const categoryMap = {
        "trending": "most-popular",
        "recently-updated": "recently-updated",
        "top-airing": "top-airing",
        "top-upcoming": "top-upcoming"
      };
      const apiCategory = categoryMap[name] || name;
      console.log(`Fetching category: ${name} (mapped to ${apiCategory}), page: ${page}`);
      const data = await fetchFromAnimeBite(`/api/v2/hianime/category/${apiCategory}?page=${page}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      console.error("Category error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch category anime" });
    }
  });
  app2.get("/api/genre/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const { page = "1" } = req.query;
      console.log(`Fetching genre: ${name}, page: ${page}`);
      const data = await fetchFromAnimeBite(`/api/v2/hianime/genre/${name}?page=${page}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      console.error("Genre error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch genre anime" });
    }
  });
  app2.get("/api/producer/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const { page = "1" } = req.query;
      console.log(`Fetching producer: ${name}, page: ${page}`);
      const data = await fetchFromAnimeBite(`/api/v2/hianime/producer/${name}?page=${page}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      console.error("Producer error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch producer anime" });
    }
  });
  app2.get("/api/anime/:id/next-episode-schedule", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Fetching next episode schedule for: ${id}`);
      const data = await fetchFromAnimeBite(`/api/v2/hianime/anime/${id}/next-episode-schedule`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      console.error("Next episode schedule error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch next episode schedule" });
    }
  });
  app2.get("/api/azlist/:sortOption", async (req, res) => {
    try {
      const { sortOption } = req.params;
      const { page = "1" } = req.query;
      let endpoint;
      if (sortOption === "recently-added") {
        endpoint = "/api/v2/hianime/azlist/all";
      } else if (sortOption === "recently-updated") {
        endpoint = "/api/v2/hianime/azlist/all";
      } else if (sortOption === "score") {
        endpoint = "/api/v2/hianime/azlist/all";
      } else if (sortOption === "a-z") {
        endpoint = "/api/v2/hianime/azlist/all";
      } else {
        endpoint = `/api/v2/hianime/azlist/${sortOption}`;
      }
      console.log(`Fetching A-Z list: ${endpoint}?page=${page}`);
      const data = await fetchFromAnimeBite(`${endpoint}?page=${page}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      console.error("A-Z list error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch A-Z list" });
    }
  });
  app2.get("/api/search", async (req, res) => {
    try {
      const queryParams = new URLSearchParams(req.query).toString();
      console.log(`Searching with params: ${queryParams}`);
      const data = await fetchFromAnimeBite(`/api/v2/hianime/search?${queryParams}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ success: false, error: "Failed to search anime" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5800", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
