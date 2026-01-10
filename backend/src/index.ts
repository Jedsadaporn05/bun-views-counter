import { serve } from "bun";
import { ENV } from "./config/env";
import { connectDB } from "./config/database";
import { startScheduler } from "./utils/scheduler";
import { handleTrack } from "./controllers/trackController";
import { getPageViews } from "./services/statService";

await connectDB();
startScheduler();

console.log(`Bun Server running on port ${ENV.PORT}`);

serve({
  port: ENV.PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    try {
      const url = new URL(req.url);
      // CORS
      const corsHeaders = {
        "Access-Control-Allow-Origin": ENV.ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, HEAD",
        "Access-Control-Allow-Headers": "Content-Type",
      };

      // Middleware Response Helper
      const jsonResponse = (data: any) =>
        new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });

      if (req.method === "OPTIONS")
        return new Response(null, { headers: corsHeaders });

      if (req.method === "HEAD")
        return new Response("OK", { status: 200, headers: corsHeaders });

      // POST /track
      if (req.method === "POST" && url.pathname === "/track") {
        const response = await handleTrack(req);
        response.headers.set("Access-Control-Allow-Origin", ENV.ALLOWED_ORIGIN);
        return response;
      }

      // GET /stats
      if (req.method === "GET" && url.pathname === "/stats") {
        const slug = url.searchParams.get("slug");
        if (!slug)
          return new Response("Slug required", {
            status: 400,
            headers: corsHeaders,
          });
        const views = await getPageViews(slug);
        return jsonResponse({ views });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (err) {
      console.error("Critical Server Error:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});
