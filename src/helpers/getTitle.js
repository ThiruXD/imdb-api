import seriesFetcher from "./seriesFetcher.js";

export default async function getTitle(id) {
  // Using the confirmed endpoint structure
  const response = await fetch(`https://api.imdbapi.dev/titles/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch IMDb data: ${response.statusText}`);
  }

  const json = await response.json();
  // Based on your previous JSON snippet, the data is usually at the top level
  const data = json;

  return {
    id: data.id,
    review_api_path: `/reviews/${data.id}`,
    imdb: `https://www.imdb.com/title/${data.id}`,
    contentType: data.type,
    contentRating: "N/A", // This specific API structure lacks certificate info
    isSeries: data.type?.includes("series") || false,
    productionStatus: "released",
    isReleased: true,
    title: data.primaryTitle,
    image: data.primaryImage?.url,
    images: [], 
    plot: data.plot,
    runtime: data.runtimeSeconds ? `${Math.floor(data.runtimeSeconds / 60)} min` : "",
    runtimeSeconds: data.runtimeSeconds || 0,
    rating: {
      count: data.rating?.voteCount ?? 0,
      star: data.rating?.aggregateRating ?? 0,
    },
    genre: data.genres || [],
    releaseDetailed: {
      date: data.startYear ? `${data.startYear}-01-01` : null,
      year: data.startYear,
    },
    year: data.startYear,
    // Add staff details if your frontend expects them
    staff: {
      directors: data.directors || [],
      stars: data.stars || []
    },
    ...(data.type?.includes("series") ? await seriesFetcher(id) : {})
  };
}
