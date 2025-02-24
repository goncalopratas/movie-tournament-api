import { movieRoutes } from "./src/routes/movie_routes.ts";

async function handler(req: Request): Promise<Response> {
  return await movieRoutes(req);
}

Deno.serve({ port: 8000 }, handler);
console.log("Server running on http://localhost:8000");
