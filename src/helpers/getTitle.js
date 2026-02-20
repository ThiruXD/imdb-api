import apiRequestRawHtml from "./apiRequest.js";
import { parse } from "node-html-parser";
import seriesFetcher from "./seriesFetcher.js";

export default async function getTitle(id) {
  export default async function getTitle(id) {
  const html = await apiRequestRawHtml(`https://www.imdb.com/title/${id}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });

  const dom = parse(html);
  const nextData = dom.querySelector("#__NEXT_DATA__");

  if (!nextData) {
    throw new Error("IMDb page structure changed or blocked.");
  }

  const json = JSON.parse(nextData.text);
  const props = json?.props?.pageProps;

  if (!props?.aboveTheFoldData) {
    throw new Error("Invalid IMDb data format.");
  }

  const data = props.aboveTheFoldData;


  return {
    id: id,
    review_api_path: `/reviews/${id}`,
    imdb: `https://www.imdb.com/title/${id}`,
    contentType: props.aboveTheFoldData.titleType.id,
    contentRating: props.aboveTheFoldData?.certificate?.rating ?? "N/A",
    isSeries: props.aboveTheFoldData.titleType.isSeries,
    productionStatus: props.aboveTheFoldData.productionStatus.currentProductionStage.id,
    isReleased: props.aboveTheFoldData.productionStatus.currentProductionStage.id === "released",
    title: props.aboveTheFoldData.titleText.text,
    image: props.aboveTheFoldData.primaryImage.url,
    images: props.mainColumnData.titleMainImages.edges
      .filter((e) => e.__typename === "ImageEdge")
      .map((e) => e.node.url),
    plot: props.aboveTheFoldData.plot.plotText.plainText,
    runtime: props.aboveTheFoldData.runtime?.displayableProperty?.value?.plainText ?? "",
    runtimeSeconds: props.aboveTheFoldData.runtime?.seconds ?? 0,
    rating: {
      count: props.aboveTheFoldData.ratingsSummary?.voteCount ?? 0,
      star: props.aboveTheFoldData.ratingsSummary?.aggregateRating ?? 0,
    },
    genre: props.aboveTheFoldData.genres.genres.map((e) => e.id),
    releaseDetailed: {
      date: new Date(
        props.aboveTheFoldData.releaseDate.year,
        props.aboveTheFoldData.releaseDate.month - 1,
        props.aboveTheFoldData.releaseDate.day
      ).toISOString(),
      day: props.aboveTheFoldData.releaseDate.day,
      month: props.aboveTheFoldData.releaseDate.month,
      year: props.aboveTheFoldData.releaseDate.year,
    },
    year: props.aboveTheFoldData.releaseDate.year,
    ...(props.aboveTheFoldData.titleType.isSeries ? await seriesFetcher(id) : {})
  };
}
