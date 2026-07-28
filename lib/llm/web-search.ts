/**
 * Optional non-generative web retrieval for the Strategist. Tavily retrieves
 * evidence; Gemma 4 remains the only model that synthesizes an answer.
 */

export type WebSearchResult = {
  title: string;
  url: string;
  snippet: string;
};

/**
 * Best-effort Tavily search. Returns [] when the key is missing or the
 * request fails - callers should treat web search as additive context, not
 * a hard dependency.
 */
export async function tavilySearch(
  query: string,
  opts: { maxResults?: number; depth?: "basic" | "advanced" } = {},
): Promise<WebSearchResult[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        query,
        search_depth: opts.depth ?? "basic",
        max_results: opts.maxResults ?? 5,
        include_answer: false,
      }),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      results?: Array<{ title: string; url: string; content: string }>;
    };
    return (data.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
    }));
  } catch {
    return [];
  }
}

/** Returns a short, citation-friendly label for a URL (just the bare host). */
export function shortDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 32);
  }
}

/** True when at least one web-search backend is configured. */
export function hasWebSearchKey(): boolean {
  return !!process.env.TAVILY_API_KEY;
}
