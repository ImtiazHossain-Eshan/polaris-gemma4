# Polaris: A Gemma 4 North Star for Global Education

**Team:** Arcane

**Members:** Imtiaz Hossain & Mofftasim Hossain Sayem

## A Bengali-first Gemma 4 strategist that helps students start early, prove progress, and turn global education goals into weekly action.

### The moment the roadmap arrives too late

A Bangladeshi student completes HSC, opens a scholarship page, and discovers that the strongest application was supposed to begin years earlier. The test score needs months of preparation. The application asks for sustained projects, leadership, and proof of impact. Important deadlines are already close. The ambition was always there; the roadmap arrived too late.

That gap begins long before university applications. A student in Class 5, 7, or 8 may have curiosity and potential but no connected view of Olympiads, hackathons, community projects, English preparation, scholarships, or future deadlines. Search results provide fragments. Families with experienced counselors can turn those fragments into a sequence; many students cannot.

The result is often misallocated effort: collecting certificates instead of building depth, preparing for IELTS or SAT too late, missing funding windows, or targeting universities without understanding the evidence their profile still needs.

We asked: **Can an open model become a strategic reasoning layer that helps a student start earlier, adapt honestly, and turn a distant goal into the next measurable week?**

### What we built

Polaris is a bilingual academic strategist powered exclusively by Gemma 4. A student provides their stage, intended degree, academic standing, goals, constraints, and current activities. Polaris retrieves relevant evidence and asks Gemma 4 to create a structured diagnosis and an 8 to 12 step roadmap across the next 6 to 18 months. Every milestone includes a priority, rationale, deadline, and measurable success criterion.

The result is not an unbounded chat transcript. It is a living roadmap that can be tracked, replanned, and discussed with a synchronized Strategist. Judges can open the public workspace without an account, card, or payment. English and Bengali are supported across navigation, roadmap content, forms, errors, and generated guidance, while official names and established acronyms remain unchanged.

Polaris follows the student after planning:

- **Decision Twin** stress-tests a changed score, deadline, budget, country, or weekly study time and explains what should move.
- **Evidence-to-Action Graph** separates a claim from proof, identifies missing verification, and proposes the next evidence action.
- **Mock Exams** uses Gemma 4 to generate fresh IELTS or Digital SAT questions by section and difficulty. Scoring is deterministic; Gemma 4 diagnoses the answer pattern and recommends the next practice block.
- **Smart Routine** converts a request such as “add mathematics practice from 9 to 10 pm” into a validated, editable weekly schedule.
- **Video Learning** starts with verified section-specific playlists. Gemma 4 refreshes relevant lessons and the selected video plays inside Polaris.
- **Knowledge Notes** turns feedback into reusable memory shared by the full-page and side-panel Strategists.
- **Essay Studio** supports multiple named drafts, ethical improvement, and voice-preserving feedback. Gemma 4 can transcribe Bengali, English, or mixed handwritten essays from an uploaded image, preserve Bengali first, and create an English translation only when requested.
- **Discovery refresh** helps students explore universities, resources, offers, and case-study patterns under contracts that prohibit invented rankings, costs, admission rates, offers, or outcomes.
- **Family workspace** creates revocable, browser-local read-only invitation links so a student can share progress without surrendering control.

### Why Gemma 4 is essential

A template can say “improve your GPA.” The hard problem is deciding whether this student should prioritize a test, a flagship project, research evidence, or a scholarship deadline, then revising that decision when a constraint changes. Gemma 4 performs that central reasoning and synthesis.

Polaris uses the hosted `gemma-4-26b-a4b-it` model through Google's official `@google/genai` SDK. `gemma-4-31b-it` is also allowlisted. Fast requests use minimal thinking; deeper Strategist analysis uses a higher reasoning setting. Internal thoughts are never shown.

Gemma 4 powers 17 generative responsibilities across the product: roadmap planning, both synchronized Strategists, research, Decision Twin, Evidence Graph, mock generation and review, video learning, knowledge notes, essay coaching, handwriting extraction, essay translation, university and resource discovery, case studies, Smart Routine, Offer Radar, and student memory.

Each surface has a distinct validated contract. The server returns schema-checked data or safely rendered Markdown. Retrieval, scoring, validation, and storage remain deterministic and inspectable. There is one provider adapter and one model allowlist. No other LLM or generative foundation model is used.

### Technical architecture

The roadmap request path is:

`Student profile -> Zod validation -> BM25 retrieval -> Gemma 4 structured reasoning -> schema validation -> interactive roadmap`

Action Lab follows the same boundary:

`Student action or evidence -> validation -> compact Gemma 4 contract -> deterministic normalization -> bilingual editable UI`

A curated knowledge base covers universities, scholarships, admissions principles, and student patterns. A deterministic BM25 implementation ranks the most relevant documents and places the strongest evidence into Gemma 4's context. This keeps retrieval fast, reproducible, and independent of another foundation model.

Roadmap generation uses a compact diagnosis followed by flat milestone stages that can run in parallel. Only malformed stages receive a targeted retry. This reduces truncation, controls token use, and produces typed milestones instead of brittle free-form text.

The API is server-side, rate-limited, and keeps credentials out of the browser. An optional personal Gemma key stays only in session storage and is never persisted or logged. When the hosted model is temporarily unavailable, an explicitly labeled deterministic fallback preserves the interface flow without pretending to be Gemma output.

### What is different

**From information to timing.** Polaris is designed to reach students before the final application year and connect long-term opportunities to work they can begin now.

**From conversation to commitment.** The main artifact is an operational roadmap with dates, priorities, evidence, and success metrics.

**From advice to an execution loop.** A student can decide, prove, practise, schedule, learn, write, remember, and adapt inside one system.

**Local realism.** Prompts require actions a student in Bangladesh can realistically begin, rather than assuming access to an expensive counseling ecosystem.

**Auditable model policy.** The interface exposes the active Gemma 4 model and sources; the repository and executed notebook show the single-model boundary and response contracts.

### Challenges and what we learned

Reliable roadmap cards required more discipline than ordinary chat. We replaced variable prose with strict schemas and boundary validation. To avoid another model for embeddings, we implemented inspectable BM25 retrieval with length normalization and title weighting. To satisfy the one-model rule, we removed alternate model adapters and reject unsupported routing choices. To keep the public workspace resilient, interactions persist locally, model requests are bounded, and fallbacks are honest.

The biggest lesson was that useful guidance needs memory and proof. A recommendation becomes more valuable when the system remembers why it was made, what evidence would verify it, and how the next decision should change after new progress.

### Impact, limits, and next steps

Polaris can help students recognize gaps earlier and spend scarce time on higher-leverage work. It can give parents and teachers a shared plan instead of disconnected advice. The same architecture could support scholarship discovery, public-university preparation, vocational pathways, and university-to-career transitions.

Polaris does not guarantee admission. Fit estimates are directional, source freshness matters, and high-stakes choices should be checked with teachers, counselors, and official sources. The scoring system excludes demographic proxies.

Next, we would add automated source-freshness checks, richer Bangladesh-specific opportunity packs, Bangla voice input, calendar synchronization, verified family accounts, mentor review, and longitudinal evaluation with consenting students.

### Links

- **Live product workspace:** https://polaris-gemma4.vercel.app/demo
- **Action Lab:** https://polaris-gemma4.vercel.app/demo/action-lab
- **Public repository:** https://github.com/ImtiazHossain-Eshan/polaris-gemma4
- **Executed notebook:** `notebooks/polaris_gemma4_decision_lab.ipynb`
- **Model:** Gemma 4 via the official Google Gen AI SDK

Polaris gives an ambitious student something more useful than another list of links: a north star, a sequence of evidence-backed actions, and a reason to begin years earlier.
