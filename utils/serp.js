
export const serpResult = async (query, serpApiKey) => {

  let params = {
    q: query,
    "engine": "google",
    "google_domain": "google.com",
    "gl": "us",
    "hl": "en",
  };

  if(serpApiKey) 
    params.api_key = serpApiKey;

  console.log(`SerpAPI params: ${JSON.stringify(params)}`);

  const url = `https://serpapi.com/search.json?${new URLSearchParams(params)}`;
  const response = await fetch(url);
  const res = await response.json();

  console.log(`SerpAPI response: ${JSON.stringify(res)}`);
  if (res.error) {
    throw new ValueError(`Got error from SerpAPI: ${res.error}`);
  }
  let toret;
  if (res.answer_box && res.answer_box.answer) {
    toret = res.answer_box.answer;
  } else if (res.answer_box && res.answer_box.snippet) {
    toret = res.answer_box.snippet;
  } else if (res.answer_box && res.answer_box.snippet_highlighted_words && res.answer_box.snippet_highlighted_words[0]) {
    toret = res.answer_box.snippet_highlighted_words[0];
  } else if (res.sports_results && res.sports_results.game_spotlight) {
    toret = res.sports_results.game_spotlight;
  } else if (res.knowledge_graph && res.knowledge_graph.description) {
    toret = res.knowledge_graph.description;
  } else if (res.organic_results && res.organic_results[0] && res.organic_results[0].snippet) {
    toret = res.organic_results[0].snippet;
  } else {
    toret = "No good search result found, try improve your question";
  }
  return toret;
}