import "https://deno.land/x/dotenv@v3.2.2/load.ts";
import { Movie } from "../interfaces/movie.ts";

interface ApiResponse {
  results: Movie[];
}

export class MovieService {
  private apiUrl = "https://api.themoviedb.org/3/search/movie";

  async search(movieTitle: string):Promise<Movie[]> {
    const API_KEY = Deno.env.get("API_KEY");

    if (!API_KEY) {
      throw new Error("API key is missing.");
    }

    const params = new URLSearchParams({
      include_adult: "false",
      language: "en-Us",
      year: "2024",
      page: "1",
      query: movieTitle,
    });

    const url = `${this.apiUrl}?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      return data.results.slice(0, 10);
    } catch (error) {
      throw error;
    }
  }

  startTournament(movieList: Movie[]): Record<number, Movie[]> {
    const isPowerOfTwo = this.isPowerOfTwo(movieList.length);
    const hasDuplicateTitle = this.hasDuplicateAttribute(
      movieList,
      "title",
    );

    if (!isPowerOfTwo || hasDuplicateTitle) {
      throw new Error("Invalid list");
    }

    const movieListOrdered = movieList.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
    );

    const results: Record<number, Movie[]> = {};
    results[0] = movieListOrdered;
    const phase = { value: 1 };

    this.getPhaseResults(movieListOrdered, results, phase);

    return results;
  }

  private getPhaseResults(
    list: Movie[],
    results: Record<number, Movie[]>,
    phase: { value: number },
  ) {
    if (list.length == 2) {
      results[phase.value] = [this.getMovieDuelWinner(list[0], list[1])];
      return;
    }
    let winnersList: Movie[] = [];

    if (phase.value === 1) {
      winnersList = this.firstPhase(list);
    } else {
      winnersList = this.eliminatoryPhase(list);
    }

    results[phase.value] = winnersList;
    phase.value++;
    this.getPhaseResults(winnersList, results, phase);
  }

  private firstPhase(list: Movie[]): Movie[] {
    const winnersList: Movie[] = [];
    let winner: Movie;

    for (let index = 0; index < list.length / 2; index++) {
      winner = this.getMovieDuelWinner(
        list[index],
        list[list.length - 1 - index],
      );
      winnersList.push(winner);
    }

    return winnersList;
  }

  private eliminatoryPhase(list: Movie[]): Movie[] {
    const winnersList: Movie[] = [];
    let winner: Movie;

    for (let i = 0; i < list.length - 1; i += 2) {
      winner = this.getMovieDuelWinner(list[i], list[i + 1]);
      winnersList.push(winner);
    }

    return winnersList;
  }

  private isPowerOfTwo(n: number) {
    if (n <= 0) return false;
    const logResult = Math.log2(n);
    return Number.isInteger(logResult);
  }

  private hasDuplicateAttribute<T>(arr: T[], attribute: keyof T): boolean {
    const seen = new Set();
    for (const obj of arr) {
      if (seen.has(obj[attribute])) {
        return true;
      }
      seen.add(obj[attribute]);
    }
    return false;
  }

  private getMovieDuelWinner(a: Movie, b: Movie): Movie {
    if (b.vote_average > a.vote_average) {
      return b;
    }
    if (a.vote_average === b.vote_average) {
      return this.getFirstAlphabetically(a, b);
    }
    return a;
  }

  private getFirstAlphabetically(a: Movie, b: Movie): Movie {
    const comparison = a.title.localeCompare(b.title);
    if (comparison < 0) {
      return a;
    }
    return b;
  }
}
