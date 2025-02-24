import { MovieService } from "../services/movie_service.ts";
import { Movie } from "../interfaces/movie.ts";

export class MovieController {
  private movieService: MovieService;

  constructor(movieService: MovieService) {
    this.movieService = movieService;
  }

  async searchMovies(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const movieTitle = url.searchParams.get("movieTitle");

    if (!movieTitle) {
      return new Response(
        JSON.stringify({ error: "Missing 'movieTitle' query parameter" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    try {
      const movies = await this.movieService.search(movieTitle);
      return Response.json(movies);
    } catch (error) {
      if (error instanceof Error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({ error: "An unknown error occurred." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  async startTournament(req: Request): Promise<Response> {
    try {
      const requestBody = await req.json();
      const movieList: Movie[] = requestBody.movieList;
      const result = await this.movieService.startTournament(movieList);

      return Response.json(result);
    } catch (error) {
      if (error instanceof Error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({ error: "An unknown error occurred." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }
}
