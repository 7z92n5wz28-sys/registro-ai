import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { tavily } from "@tavily/core";
import FirecrawlApp from "@mendable/firecrawl-js";

export const maxDuration = 60; // Max duration for Vercel Hobby is 10s, but Pro is 60s. We set this for when deployed to Pro.

export async function POST(req: Request) {
  try {
    const { evaluationId, systemId, name, provider, websiteUrl } = await req.json();

    if (!evaluationId || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    // Use service role key if available for backend operations, otherwise anon key
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

    let crawlResults = [];

    // 1. TAVILY SEARCH
    if (TAVILY_API_KEY) {
      const tvly = tavily({ apiKey: TAVILY_API_KEY });
      const query = `AI Act compliance privacy policy terms of service security for ${name} ${provider || ""}`;
      
      try {
        const searchResponse = await tvly.search(query, {
          searchDepth: "advanced",
          includeRawContent: true as any,
          maxResults: 3,
        });

        if (searchResponse && searchResponse.results) {
          for (const res of searchResponse.results) {
            crawlResults.push({
              evaluation_id: evaluationId,
              url: res.url,
              content_markdown: res.rawContent || res.content,
              crawl_type: "tavily_search",
              raw_metadata: { score: res.score, title: res.title }
            });
          }
        }
      } catch (err) {
        console.error("Tavily search failed:", err);
      }
    } else {
      console.log("No TAVILY_API_KEY provided. Using mock data.");
      crawlResults.push({
        evaluation_id: evaluationId,
        url: "https://mock-tavily-result.com",
        content_markdown: `MOCK TAVILY DATA for ${name}: The system complies with GDPR and uses encryption. It does not sell user data.`,
        crawl_type: "tavily_search_mock",
        raw_metadata: { mock: true }
      });
    }

    // 2. FIRECRAWL
    if (websiteUrl) {
      if (FIRECRAWL_API_KEY) {
        const firecrawl = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });
        try {
          const scrapeResult: any = await firecrawl.scrapeUrl(websiteUrl, {
            formats: ["markdown"]
          });

          if (scrapeResult.success || scrapeResult.markdown) {
            crawlResults.push({
              evaluation_id: evaluationId,
              url: websiteUrl,
              content_markdown: scrapeResult.markdown || scrapeResult.data?.markdown,
              crawl_type: "firecrawl",
              raw_metadata: scrapeResult.metadata || scrapeResult.data?.metadata
            });
          }
        } catch (err) {
          console.error("Firecrawl scrape failed:", err);
        }
      } else {
        console.log("No FIRECRAWL_API_KEY provided. Using mock data.");
        crawlResults.push({
          evaluation_id: evaluationId,
          url: websiteUrl,
          content_markdown: `MOCK FIRECRAWL DATA for ${websiteUrl}: Welcome to ${name}. We build AI safely. Privacy is our priority.`,
          crawl_type: "firecrawl_mock",
          raw_metadata: { mock: true }
        });
      }
    }

    // Save to DB
    if (crawlResults.length > 0) {
      const { error } = await supabase.from("crawl_results").insert(crawlResults);
      if (error) {
        console.error("Error saving crawl results:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, count: crawlResults.length });
  } catch (error: any) {
    console.error("Error in evaluate/search:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
