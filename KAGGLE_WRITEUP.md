# Polaris: A Gemma 4 North Star for Global Education

## Turning a Bangladeshi student's ambition into an evidence-grounded plan they can start this week

### The problem

A motivated student can search for "how to get into a top university" and receive thousands of results. That abundance is part of the problem. Requirements, scholarships, deadlines, case studies, and generic advice are scattered across sources. Students with access to experienced counselors can turn those fragments into a strategy; many students in Bangladesh cannot.

The result is not a lack of ambition. It is misallocated effort: collecting certificates instead of developing depth, preparing for tests too late, overlooking scholarship timelines, or targeting universities without understanding profile gaps.

We asked a practical question: **Can an open model act as a strategic reasoning layer, not merely a chatbot, and turn a small student snapshot into a measurable, locally realistic roadmap?**

### Our solution

Polaris is an AI academic strategist powered exclusively by Gemma 4. A student provides their current stage, intended degree, academic standing, target university tier, and existing extracurricular strengths. Polaris retrieves relevant evidence from a curated knowledge base and asks Gemma 4 to produce:

- a concise strategic diagnosis;
- 3-5 honest profile gaps;
- an 8-12 step roadmap across the next 6-18 months;
- a priority, rationale, and measurable success criterion for every step.

This output is structured data, not an unbounded chat response. Polaris renders it as an interactive plan that can later be tracked, adapted, and discussed with the streaming Strategist.

Judges can use the public `/demo` workspace without creating an account or entering payment details. It begins with a complete, realistic Bangladesh-student roadmap, supports live replanning, and exposes model traces and retrieved sources. Every user-facing area is available from the same workspace: the roadmap, Strategist, deadlines, university fit, resources, connections, partners, consultants, community, family, bookings, access ledger, and settings.

### Why Gemma 4 is core

Templates can say "improve your GPA" or "join an extracurricular." The difficult part is deciding what matters most for this student, resolving trade-offs across several admissions dimensions, and grounding recommendations in relevant evidence. Gemma 4 performs that central reasoning and synthesis.

We use the hosted `gemma-4-26b-a4b-it` model through Google's official `@google/genai` SDK. The optional `gemma-4-31b-it` configuration is also allowlisted. Minimal thinking keeps the public roadmap responsive; high thinking is reserved for Deep Strategist requests. Internal thoughts are never exposed.

Gemma 4 powers every generative feature:

1. structured roadmap generation;
2. the streaming academic Strategist;
3. research synthesis over retrieved evidence;
4. durable student-memory extraction.

There is one model registry entry and one provider adapter. Model IDs are selected from a server-side constant; client values and old saved preferences cannot override it. No other LLM or generative foundation model is used. Optional Tavily search only retrieves public snippets. BM25 retrieval, probability scoring, and the clearly labeled offline planner are deterministic algorithms.

### Technical architecture

The request path is:

`Student form -> Zod validation -> BM25 retrieval -> prompt + flat JSON schemas -> parallel Gemma 4 stages -> structured roadmap -> interactive UI`

Our knowledge base contains curated documents covering universities, scholarships, admissions principles, and accepted-student patterns. A deterministic BM25 implementation ranks the most relevant documents and places the top evidence in Gemma 4's context. This design makes retrieval inspectable, fast, and independent of another generative model.

Gemma 4 receives a Bangladesh-context system instruction, the normalized profile, retrieved evidence, and flat response schemas. A compact diagnosis runs first, then eight one-milestone flat-schema stages run in parallel. Only malformed stages receive a small targeted retry. This avoids nested-output truncation and stays within the hosted free-tier input-token budget while producing one typed eight-step roadmap.

The public API is server-side, schema-validated, rate-limited, and keeps credentials out of the browser. If the model API is temporarily unavailable, a deterministic heuristic roadmap preserves the demo flow and is visibly labeled "Offline fallback"; it is never represented as Gemma output.

The same repository also contains the account-backed product. The public workspace safely isolates judge interactions in browser-local state while reusing real university data, the transparent probability engine, resource hub, partner matching logic, and public Gemma 4 endpoints.

### What is innovative

**From conversation to commitment.** The primary artifact is not a chat transcript; it is an operational roadmap with dates, priorities, and success metrics.

**Auditable model policy.** The UI says which model ran, the API returns a trace, and the server has a single-model allowlist. Judges can verify meaningful Gemma 4 integration directly in code.

**Local realism.** Prompts explicitly require actions a student in Dhaka can begin on Monday, accounting for resource and access constraints instead of assuming a US counseling ecosystem.

**Evidence plus judgment.** Retrieval supplies facts and patterns; Gemma 4 converts them into a coherent strategy. Neither component alone solves the problem.

### Technical challenges

**Meeting the one-model rule in an existing product foundation.** Polaris previously had a flexible provider abstraction. For this sprint, we removed every alternate adapter and local-model endpoint, replaced the registry with Gemma 4 only, and made the router ignore stale client preferences. This created a simple, auditable compliance boundary.

**Reliable UI output from a reasoning model.** Natural language varied too much for roadmap cards. We moved generation behind a strict JSON schema and validate at the API boundary. The interface can now depend on milestone categories, priorities, and metrics.

**Retrieval without another foundation model.** To avoid a separate embedding model and improve reproducibility, we implemented BM25 with length normalization and title weighting. It produces useful, inspectable source rankings with no extra AI dependency.

**A demo that survives hackathon conditions.** The all-access workspace avoids database and checkout setup, starts with a complete plan, persists interactions locally, rate-limits model requests, and has an honest deterministic fallback. The prototype remains useful even if network capacity fluctuates.

### Potential impact

Polaris can help students spend scarce time on higher-leverage work and recognize gaps earlier, particularly where professional counseling is inaccessible. It can also give parents and teachers a shared, concrete plan instead of disconnected recommendations.

The architecture is adaptable beyond elite admissions. A localized knowledge base could support scholarship discovery, public-university preparation, vocational pathways, or university-to-career transitions. The same structured roadmap pattern can make expert guidance more accessible while keeping human mentors in control.

### Limitations and responsible use

Polaris does not guarantee admission and says so explicitly. Retrieved material can become outdated, so source freshness and human verification remain important. Probability estimates are directional and use transparent academic/activity inputs rather than demographic attributes. High-stakes decisions should be reviewed with teachers, counselors, and official university sources.

### What comes next

We would add source freshness checks, university-specific evidence packs, Bangla voice input, calendar exports, mentor review, and outcome-based evaluation with consenting students. We also want to compare generated plans against counselor rubrics and measure whether recommendations remain feasible over time.

### Links

- **Live app and demo:** https://polaris-zcq9.vercel.app/demo
- **Public repository:** https://github.com/ImtiazHossain-Eshan/polaris-gemma4
- **Model:** Gemma 4 via the official Google Gen AI SDK

Polaris turns open-model intelligence into something a student can use: a north star, a sequence of next steps, and a reason to begin now.
