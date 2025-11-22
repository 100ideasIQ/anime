import type { Express } from "express";
import { createServer, type Server } from "http";

const ANIMEBITE_BASE_URL = "https://animebite.onrender.com";

async function fetchFromAnimeBite(endpoint: string) {
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

function proxyImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;
  return `/api/proxy/image?url=${encodeURIComponent(url)}`;
}

function proxyPosterUrls(obj: any): any {
  if (!obj) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => proxyPosterUrls(item));
  }
  
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (key === 'poster' && typeof obj[key] === 'string') {
        newObj[key] = proxyImageUrl(obj[key]);
      } else {
        newObj[key] = proxyPosterUrls(obj[key]);
      }
    }
    return newObj;
  }
  
  return obj;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Home endpoint
  app.get("/api/home", async (req, res) => {
    try {
      const data = await fetchFromAnimeBite("/api/v2/hianime/home");
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch home data" });
    }
  });

  // Anime detail
  app.get("/api/anime/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await fetchFromAnimeBite(`/api/v2/hianime/anime/${id}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch anime details" });
    }
  });

  // Anime episodes
  app.get("/api/anime/:id/episodes", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await fetchFromAnimeBite(`/api/v2/hianime/anime/${id}/episodes`);
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch episodes" });
    }
  });

  // Episode servers
  app.get("/api/episode/servers", async (req, res) => {
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

  // Episode streaming sources
  app.get("/api/episode/sources", async (req, res) => {
    try {
      const { animeEpisodeId, server, category } = req.query;
      if (!animeEpisodeId) {
        return res.status(400).json({ success: false, error: "animeEpisodeId is required" });
      }
      
      // Build the endpoint URL correctly
      const params = new URLSearchParams();
      params.set('animeEpisodeId', animeEpisodeId as string);
      if (server) params.set('server', server as string);
      if (category) params.set('category', category as string);
      
      const endpoint = `/api/v2/hianime/episode/sources?${params.toString()}`;
      console.log('Fetching sources from:', endpoint);
      
      const data = await fetchFromAnimeBite(endpoint);
      
      // Check if we have valid sources
      if (!data.data || !data.data.sources || data.data.sources.length === 0) {
        console.error('No sources available in response:', data);
        return res.status(404).json({ 
          success: false, 
          error: "No streaming sources available for this server/category combination" 
        });
      }
      
      console.log(`Found ${data.data.sources.length} source(s)`);
      
      // Modify the sources to use our proxy
      data.data.sources = data.data.sources.map((source: any) => ({
        ...source,
        url: `/api/proxy/stream?url=${encodeURIComponent(source.url)}`
      }));
      
      // Also proxy subtitle tracks
      if (data.data.tracks && data.data.tracks.length > 0) {
        data.data.tracks = data.data.tracks.map((track: any) => ({
          ...track,
          file: `/api/proxy/stream?url=${encodeURIComponent(track.file)}`
        }));
      }
      
      res.json(data);
    } catch (error) {
      console.error('Episode sources error:', error);
      res.status(500).json({ success: false, error: "Failed to fetch streaming sources" });
    }
  });

  // Handle OPTIONS for CORS
  app.options("/api/proxy/stream", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.status(200).end();
  });

  // Video stream proxy
  app.get("/api/proxy/stream", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ success: false, error: "url parameter is required" });
      }

      // Fetch the video stream with required headers
      const response = await fetch(url, {
        headers: {
          'Referer': 'https://rapid-cloud.co/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://rapid-cloud.co'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch stream: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch video stream: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const isM3U8 = url.includes('.m3u8') || contentType.includes('application/vnd.apple.mpegurl') || contentType.includes('application/x-mpegURL');

      // Enable CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Expose-Headers', '*');

      // If it's an m3u8 playlist, we need to rewrite URLs inside it
      if (isM3U8) {
        const text = await response.text();
        const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
        
        // Rewrite URLs in the playlist to go through our proxy
        const modifiedPlaylist = text.split('\n').map(line => {
          // Skip comments and empty lines
          if (line.startsWith('#') || line.trim() === '') {
            return line;
          }
          
          // If it's a URL line
          if (line.trim().length > 0) {
            let targetUrl = line.trim();
            
            // Handle relative URLs
            if (!targetUrl.startsWith('http')) {
              targetUrl = baseUrl + targetUrl;
            }
            
            // Proxy the URL
            return `/api/proxy/stream?url=${encodeURIComponent(targetUrl)}`;
          }
          
          return line;
        }).join('\n');

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(modifiedPlaylist);
      } else {
        // For non-playlist files (video segments), stream them directly
        response.headers.forEach((value, key) => {
          if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
            res.setHeader(key, value);
          }
        });

        // Enable range requests
        if (req.headers.range) {
          res.setHeader('Accept-Ranges', 'bytes');
        }

        // Stream the response
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
              console.error('Stream error:', streamError);
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
      console.error('Proxy stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: "Failed to proxy video stream" });
      }
    }
  });

  // Serve robots.txt
  app.get("/robots.txt", (req, res) => {
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

  // Generate sitemap.xml
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = "https://animebite.cc";
      const currentDate = new Date().toISOString().split('T')[0];
      
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

      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Image proxy to handle CORS issues with external CDNs
  app.get("/api/proxy/image", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ success: false, error: "url parameter is required" });
      }

      // Fetch the image with required headers
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://hianime.to/',
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        return res.status(response.status).send();
      }

      // Enable CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');

      // Set content type from the response
      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }

      // Cache the images for better performance
      res.setHeader('Cache-Control', 'public, max-age=86400');

      // Stream the image
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
            console.error('Image stream error:', streamError);
            res.end();
          }
        };
        await pump();
      } else {
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    } catch (error) {
      console.error('Proxy image error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: "Failed to proxy image" });
      }
    }
  });

  // Search
  app.get("/api/search", async (req, res) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add all query parameters
      Object.entries(req.query).forEach(([key, value]) => {
        if (value) queryParams.set(key, value as string);
      });
      
      const endpoint = `/api/v2/hianime/search?${queryParams.toString()}`;
      const data = await fetchFromAnimeBite(endpoint);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to search anime" });
    }
  });

  // Search suggestions
  app.get("/api/search/suggestions", async (req, res) => {
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

  // Schedule
  app.get("/api/schedule/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const data = await fetchFromAnimeBite(`/api/v2/hianime/schedule?date=${date}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch schedule" });
    }
  });

  // Category/Genre/Producer
  app.get("/api/category/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const { page = '1' } = req.query;
      
      // Map frontend category names to API endpoints
      const categoryMap: Record<string, string> = {
        'trending': 'most-popular',
        'recently-updated': 'recently-updated',
        'top-airing': 'top-airing',
        'top-upcoming': 'top-upcoming'
      };
      
      const apiCategory = categoryMap[name] || name;
      console.log(`Fetching category: ${name} (mapped to ${apiCategory}), page: ${page}`);
      const data = await fetchFromAnimeBite(`/api/v2/hianime/category/${apiCategory}?page=${page}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      console.error('Category error:', error);
      res.status(500).json({ success: false, error: "Failed to fetch category anime" });
    }
  });

  app.get("/api/genre/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const { page = '1' } = req.query;
      console.log(`Fetching genre: ${name}, page: ${page}`);
      const data = await fetchFromAnimeBite(`/api/v2/hianime/genre/${name}?page=${page}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      console.error('Genre error:', error);
      res.status(500).json({ success: false, error: "Failed to fetch genre anime" });
    }
  });

  app.get("/api/producer/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const { page = '1' } = req.query;
      console.log(`Fetching producer: ${name}, page: ${page}`);
      const data = await fetchFromAnimeBite(`/api/v2/hianime/producer/${name}?page=${page}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      console.error('Producer error:', error);
      res.status(500).json({ success: false, error: "Failed to fetch producer anime" });
    }
  });

  // Next episode schedule
  app.get("/api/anime/:id/next-episode-schedule", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Fetching next episode schedule for: ${id}`);
      const data = await fetchFromAnimeBite(`/api/v2/hianime/anime/${id}/next-episode-schedule`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      console.error('Next episode schedule error:', error);
      res.status(500).json({ success: false, error: "Failed to fetch next episode schedule" });
    }
  });

  // A-Z List
  app.get("/api/azlist/:sortOption", async (req, res) => {
    try {
      const { sortOption } = req.params;
      const { page = '1' } = req.query;
      
      // Map sort options to API endpoints
      // The API expects: /azlist/{letter|0-9|all|other}
      // For recently-added, recently-updated, score, we need different endpoints
      let endpoint;
      
      if (sortOption === 'recently-added') {
        endpoint = '/api/v2/hianime/azlist/all'; // Use 'all' and rely on sort
      } else if (sortOption === 'recently-updated') {
        endpoint = '/api/v2/hianime/azlist/all'; // Use 'all' and rely on sort
      } else if (sortOption === 'score') {
        endpoint = '/api/v2/hianime/azlist/all'; // Use 'all' and rely on sort
      } else if (sortOption === 'a-z') {
        endpoint = '/api/v2/hianime/azlist/all'; // Show all anime
      } else {
        endpoint = `/api/v2/hianime/azlist/${sortOption}`; // Letter filter
      }
      
      console.log(`Fetching A-Z list: ${endpoint}?page=${page}`);
      const data = await fetchFromAnimeBite(`${endpoint}?page=${page}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      console.error('A-Z list error:', error);
      res.status(500).json({ success: false, error: "Failed to fetch A-Z list" });
    }
  });

  // Search
  app.get("/api/search", async (req, res) => {
    try {
      const queryParams = new URLSearchParams(req.query as any).toString();
      console.log(`Searching with params: ${queryParams}`);
      const data = await fetchFromAnimeBite(`/api/v2/hianime/search?${queryParams}`);
      const proxiedData = proxyPosterUrls(data);
      res.json(proxiedData);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ success: false, error: "Failed to search anime" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
