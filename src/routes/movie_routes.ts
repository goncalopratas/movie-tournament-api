import { MovieController } from "../controllers/movie_controller.ts";
import { MovieService } from "../services/movie_service.ts";

const movieService = new MovieService();
const movieController = new MovieController(movieService);

export function movieRoutes(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/search") {
    return movieController.searchMovies(request);
  }

  if (url.pathname === "/startTournament") {
    return movieController.startTournament(request);
  }

  return Promise.resolve(new Response("Not Found", { status: 404 }));
}
