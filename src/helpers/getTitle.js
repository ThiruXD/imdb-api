import seriesFetcher from "./seriesFetcher.js";

export default async function getTitle(id) {
  const response = await fetch(`https://api.imdbapi.dev/title/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch IMDb data: ${response.statusText}`);
  }

  const data = await response.json();

  // Mapping the API response to your specific schema requirements
  const result = {
    id: data.id,
    review_api_path: `/reviews/${data.id}`,
    imdb: `https://www.imdb.com/title/${data.id}`,
    contentType: data.type, // e.g., "movie"
    contentRating: "N/A", // This API response doesn't seem to include certificate/rating
    isSeries: data.type === "tvSeries" || data.type === "tvMiniSeries",
    productionStatus: "released", 
    isReleased: true,
    title: data.primaryTitle,
    image: data.primaryImage?.url,
    images: [], // This endpoint returns one primary image; use a fallback or different endpoint if you need the full gallery
    plot: data.plot,
    runtime: `${Math.floor(data.runtimeSeconds / 60)} min`,
    runtimeSeconds: data.runtimeSeconds,
    rating: {
      count: data.rating?.voteCount ?? 0,
      star: data.rating?.aggregateRating ?? 0,
    },
    genre: data.genres || [],
    releaseDetailed: {
      date: data.startYear ? new Date(data.startYear, 0, 1).toISOString() : null,
      day: null,
      month: null,
      year: data.startYear,
    },
    year: data.startYear,
  };

  // Add series data if applicable
  if (result.isSeries) {
    const seriesData = await seriesFetcher(id);
    Object.assign(result, seriesData);
  }

  return result;
}
