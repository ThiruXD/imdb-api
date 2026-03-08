export default async function seriesFetcher(id) {
  try {
    const response = await fetch(`https://api.imdbapi.dev/titles/${id}/seasons`);
    const data = await response.json();

    // Mapping the API response to your app's expected structure
    const allSeasons = data.seasons.map((s) => ({
      id: s.season,
      name: `Season ${s.season}`,
      api_path: `/title/${id}/season/${s.season}`
    }));

    // Fetch the first season by default
    const firstSeason = await getSeason({ id, seasonId: 1 });

    return {
      all_seasons: allSeasons,
      seasons: [firstSeason]
    };
  } catch (error) {
    console.error("Series Fetcher Error:", error);
    return { all_seasons: [], seasons: [] };
  }
}

/**
 * Fetches episodes for a specific season using the updated API structure.
 */
export async function getSeason({ id, seasonId }) {
  const response = await fetch(`https://api.imdbapi.dev/titles/${id}/episodes?season=${seasonId}`);
  const data = await response.json();

  return {
    name: `Season ${seasonId}`,
    episodes: data.episodes?.map((e, i) => ({
      idx: i + 1,
      no: e.episodeNumber,
      title: e.title,
      image: e.primaryImage?.url,
      image_large: e.primaryImage?.url,
      // Map the nested releaseDate object to an ISO string
      publishedDate: e.releaseDate 
        ? new Date(e.releaseDate.year, e.releaseDate.month - 1, e.releaseDate.day).toISOString()
        : null,
      rating: {
        count: e.rating?.voteCount ?? 0,
        star: e.rating?.aggregateRating ?? 0
      }
    })) ?? []
  };
}
