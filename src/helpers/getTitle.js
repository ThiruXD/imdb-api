import seriesFetcher from "./seriesFetcher.js";

/**
 * Fetches title details using the imdbapi.dev API.
 * @param {string} id - The IMDb Title ID (e.g., "tt0111161")
 */
export default async function getTitle(id) {
  // Use the imdbapi.dev endpoint
  const response = await fetch(`https://imdbapi.dev/titles/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch IMDb data: ${response.statusText}`);
  }

  const data = await response.json();

  // Mapping the API response to your existing schema
  return {
    id: id,
    review_api_path: `/reviews/${id}`,
    imdb: `https://www.imdb.com/title/${id}`,
    contentType: data.type, // e.g., "movie", "tvSeries"
    contentRating: data.certificate ?? "N/A",
    isSeries: data.type === "tvSeries" || data.type === "tvMiniSeries",
    productionStatus: data.status || "released",
    isReleased: data.status === "released" || !data.status,
    title: data.title,
    image: data.primaryImage,
    images: data.images || [],
    plot: data.plot,
    runtime: data.runtimeText ?? "",
    runtimeSeconds: data.runtimeSeconds ?? 0,
    rating: {
      count: data.ratingsSummary?.voteCount ?? 0,
      star: data.ratingsSummary?.aggregateRating ?? 0,
    },
    genre: data.genres || [],
    releaseDetailed: {
      date: data.releaseDate, // Format: YYYY-MM-DD
      day: data.releaseDate ? parseInt(data.releaseDate.split("-")[2]) : null,
      month: data.releaseDate ? parseInt(data.releaseDate.split("-")[1]) : null,
      year: data.releaseDate ? parseInt(data.releaseDate.split("-")[0]) : data.year,
    },
    year: data.year,
    // Maintain your original logic for series-specific data
    ...(data.type === "tvSeries" ? await seriesFetcher(id) : {})
  };
}
