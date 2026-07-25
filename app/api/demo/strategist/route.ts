import type { NextRequest } from "next/server";
import { generateGemmaText, getGemmaModelId, hasGemmaKey } from "@/lib/llm/gemma";
import { searchDocs } from "@/lib/rag/search";
import { rateLimit, rateLimitHeaders } from "@/lib/ratelimit";
import { fail, parseJson, withErrorHandling } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DemoStrategistBody = {
  message?: unknown;
  section?: unknown;
  profile?: unknown;
  roadmapSummary?: unknown;
};

function clientId(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "public-demo";
}

function fallbackReply(message: string, section: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("week") || lower.includes("next")) {
    return "This week, protect one 90-minute block for a timed academic diagnostic, choose one flagship project outcome, and email one potential mentor. Finish with evidence: a score, a public artifact, or a confirmed meeting.";
  }
  if (lower.includes("research")) {
    return "Start with a question small enough to test in six weeks. Read five recent papers, write a one-page proposal, and approach local faculty with the exact dataset, method, and output you can own.";
  }
  if (lower.includes("scholar") || lower.includes("fund")) {
    return "Build funding into the university list now. Track eligibility, required essays, typical windows, and full cost after aid. Prioritize awards open to Bangladeshi applicants and keep financial-safety options beside reach schools.";
  }
  return `For the ${section} area, turn the goal into one action, one deadline, and one measurable finish line. Start with the highest-leverage gap, then collect evidence before adding another activity.`;
}

export const POST = withErrorHandling(async (req) => {
  const limit = await rateLimit(clientId(req), "free", "public-gemma4-strategist");
  if (!limit.allowed) {
    const response = fail(429, "Public Strategist limit reached. Please retry in a few minutes.");
    for (const [key, value] of Object.entries(rateLimitHeaders(limit))) response.headers.set(key, value);
    return response;
  }

  const body = (await parseJson(req)) as DemoStrategistBody;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const section = typeof body.section === "string" ? body.section.slice(0, 40) : "roadmap";
  const roadmapSummary = typeof body.roadmapSummary === "string" ? body.roadmapSummary.slice(0, 900) : "";
  if (message.length < 2 || message.length > 1200) return fail(400, "Message must be between 2 and 1200 characters.");

  const hits = await searchDocs(`${section} ${message}`, null, 4);
  const evidence = hits.map((hit, index) => `[${index + 1}] ${hit.title}: ${hit.text.slice(0, 650)}`).join("\n\n");
  let text: string | null = null;

  if (hasGemmaKey()) {
    text = await generateGemmaText({
      system: `You are Polaris, an academic strategist for ambitious students in Bangladesh. Give a direct, realistic answer grounded in the supplied evidence. Use 2-4 short paragraphs or bullets. Be specific, budget-aware, and measurable. Never promise admission. Gemma 4 is the only generative model in this application.`,
      contents: `CURRENT WORKSPACE: ${section}\nROADMAP CONTEXT: ${roadmapSummary || "Starter demo roadmap"}\n\nEVIDENCE\n${evidence}\n\nSTUDENT QUESTION\n${message}`,
      temperature: 0.35,
      maxOutputTokens: 850,
      thinkingLevel: "minimal",
    });
  }

  const response = Response.json({
    text: text || fallbackReply(message, section),
    sources: hits.map(({ id, title, source }) => ({ id, title, source })),
    trace: {
      source: text ? "gemma4" : "deterministic-fallback",
      model: text ? getGemmaModelId() : "none",
      thinking: text ? "minimal" : "not-applicable",
    },
  });
  for (const [key, value] of Object.entries(rateLimitHeaders(limit))) response.headers.set(key, value);
  return response;
});