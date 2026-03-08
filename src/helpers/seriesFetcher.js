/**
 * Fetches series metadata and episode data using the API.
 */
export default async function seriesFetcher(id) {
  try {
    // 1. Fetch seasons list
    const response = await fetch(`https://api.imdbapi.dev/titles/${id}/seasons`);
    const seasonsData = await response.json();
    
    // 2. Fetch first season episodes by default
    const firstSeason = await getSeason({ id, seasonId: 1 });

    return {
      all_seasons: seasonsData.seasons.map((s) => ({
        id: s,
        name: `Season ${s}`,
        api_path: `/title/${id}/season/${s}`
      })),
      seasons: [firstSeason]
    };
  } catch (error) {
    console.error("Series Fetcher Error:", error);
    return { all_seasons: [], seasons: [] };
  }
}

/**
 * Fetches episodes for a specific season.
 */
export async function getSeason({ id, seasonId }) {
  const response = await fetch(`https://api.imdbapi.dev/titles/${id}/episodes/${seasonId}`);
  const data = await response.json();

  return {
    name: `Season ${seasonId}`,
    episodes: data.episodes.map((e, i) => ({
      idx: i + 1,
      no: e.episodeNumber,
      title: e.title,
      image: e.image?.url,
      image_large: e.image?.url,
      plot: e.plot,
      publishedDate: e.releaseDate, // API usually returns YYYY-MM-DD
      rating: {
        count: e.rating?.voteCount ?? 0,
        star: e.rating?.aggregateRating ?? 0
      }
    }))
  };
}
