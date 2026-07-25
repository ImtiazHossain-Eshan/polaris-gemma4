# Polaris

Polaris is a Gemma 4-powered academic strategy workspace for students planning international university applications. It turns a short student profile into a structured roadmap, deadline plan, and evidence-grounded guidance system.

[Live demo](https://polaris-gemma4.vercel.app/demo) | [Repository](https://github.com/ImtiazHossain-Eshan/polaris-gemma4) | [Kaggle writeup](./KAGGLE_WRITEUP.md)

## Overview

Many students can find university requirements online, but still struggle to decide what to do first. Admissions pages, scholarship rules, test timelines, and profile advice are scattered across too many sources. Polaris focuses on the planning gap: it converts a student's current stage, target degree, academic position, and constraints into a plan they can act on immediately.

The public demo is configured for judge review. It opens directly at `/demo`, requires no account, and exposes the product workspace without subscription or payment gates.

## Core Capabilities

- Personalized roadmap generation with milestones, priorities, success criteria, and honest profile gaps.
- Roadmap-aware Strategist chat for academic planning, research direction, scholarship preparation, and weekly prioritization.
- Deadline workspace with calendar views, urgency scoring, and task-level tracking.
- University, resource, partner, consultant, community, and family-support views drawn from the original Polaris product experience.
- Public model trace on Strategist responses showing the Gemma 4 model used and retrieved sources.

## Gemma 4 Integration

Gemma 4 is the only generative model used by this project. The application uses it for roadmap reasoning, Strategist responses, research synthesis, and durable student-memory extraction.

The model boundary is intentionally small and auditable:

```text
Student profile
  -> request validation
  -> deterministic BM25 retrieval
  -> Gemma 4 prompt and schema
  -> validated roadmap data
  -> interactive Polaris workspace
```

The server allowlists the Gemma 4 model IDs in `lib/llm/gemma.ts`, registers a single generative provider in `lib/llm/providers/gemma.ts`, and routes requests through `lib/llm/router.ts`. Client-supplied provider values are ignored. Retrieval, probability scoring, and offline fallback planning are deterministic support systems, not replacement language models.

## Repository Structure

```text
app/demo/                    Public all-access demo workspace
app/api/demo/                Public roadmap and Strategist endpoints
app/api/roadmap/             Authenticated roadmap endpoint
components/                  Product interface components
lib/llm/                     Gemma 4 integration and routing boundary
lib/rag/                     Deterministic BM25 retrieval
lib/ml/                      Transparent probability scoring
lib/roadmap/                 Roadmap schema, generation, and state logic
data/                        Curated admissions and scholarship evidence
docs/ARCHITECTURE.md         Technical architecture notes
KAGGLE_WRITEUP.md            Official project writeup
submission-assets/           Public Kaggle card and thumbnail assets
```

## Running Locally

Requirements:

- Node.js 20+
- pnpm 11+
- Google AI Studio API key with Gemma 4 access

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev
```

Set `GEMMA_API_KEY` in `.env.local`, then open `http://localhost:3000/demo`.

The authenticated workspace also uses MongoDB and NextAuth configuration. The public demo route is the recommended review path because it does not require account setup.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMMA_API_KEY` | Yes for live model output | Server-side Google AI Studio credential |
| `GEMMA_MODEL` | Optional | Gemma 4 model override from the server allowlist |
| `TAVILY_API_KEY` | Optional | Non-generative public web retrieval |
| `MONGODB_URI` | Authenticated workspace | Profile, roadmap, thread, and progress storage |
| `NEXTAUTH_SECRET` | Authenticated workspace | Session security |

## Validation

```bash
pnpm exec tsc --noEmit
pnpm build
```

The competition branch has been validated with both commands. The production deployment is available at `https://polaris-gemma4.vercel.app/demo`.

## Responsible Use

Polaris provides planning support, not admissions guarantees. Probability estimates are directional and based on transparent academic and activity factors. Recommendations should be checked against official university and scholarship sources before a student makes high-stakes decisions.

## Hackathon Context

Built by Imtiaz Hossain Eshan for the Build with Gemma: ML, AI, Deep Learning & NLP Community Hackathon in Bangladesh.