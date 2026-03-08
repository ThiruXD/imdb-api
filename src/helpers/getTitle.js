import seriesFetcher from "./seriesFetcher.js";

export default async function getTitle(id) {
  // Debug: Ensure ID is correct (should look like tt1234567)
  console.log(`Fetching data for: ${id}`);

  try {
    const response = await fetch(`https://imdbapi.dev/title/${id}`);

    if (response.status === 404) {
      throw new Error(`ID ${id} not found on IMDb API. Check if the ID is correct.`);
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Map the API's 'result' or 'data' object
    // Note: Some versions of this API wrap the response in a { "title": ... } object
    const titleData = data.title || data;

    return {
      id: id,
      review_api_path: `/reviews/${id}`,
      imdb: `https://www.imdb.com/title/${id}`,
      contentType: titleData.type || "movie",
      contentRating: titleData.certificate || "N/A",
      isSeries: titleData.type?.toLowerCase().includes("series") || false,
      title: titleData.title,
      image: titleData.poster || titleData.image,
      plot: titleData.plot,
      rating: {
        count: titleData.rating?.count || 0,
        star: titleData.rating?.star || 0,
      },
      year: titleData.year,
      // Only call seriesFetcher if the API confirms it's a show
      ...(titleData.type?.toLowerCase().includes("series") ? await seriesFetcher(id) : {})
    };
  } catch (error) {
    console.error("Scraper Error:", error.message);
    throw error;
  }
}
