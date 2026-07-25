# Polaris - 3-minute pitch

## 0:00-0:25 - Hook

> A student in Bangladesh can find every university requirement online and still have no idea what to do on Monday.
>
> Information is abundant. Strategy is expensive. Polaris closes that gap with Gemma 4.

## 0:25-0:50 - Problem and solution

> Polaris is an AI academic strategist. Give it a six-field snapshot - stage, target degree, GPA, target tier, and current strengths - and it turns fragmented admissions evidence into a measurable 6-18 month roadmap.
>
> This is not another chatbot transcript. The output is a plan: honest gaps, prioritized actions, rationales, and success metrics.

## 0:50-1:45 - Live demo

Open `/demo`.

> Here is a realistic Class 11-12 student from Bangladesh with a 3.72 GPA, community work, no research signal, and a global top-50 goal.

Click **Generate my roadmap**.

> First, deterministic BM25 retrieves the most relevant evidence from our curated university, scholarship, admissions, and case-study knowledge base. Then a compact diagnosis and eight one-milestone Gemma 4 stages reason in parallel. Flat JSON schemas turn the result into reliable product data without nested-output truncation.

Point to the generation trace, gaps, retrieved evidence, and milestones.

> Notice the plan does not just say "do research." It gives a time window, a concrete starting point, why it matters, and a measurable finish line. Change the GPA, target tier, or strengths and the strategy changes with the student.

## 1:45-2:20 - Why Gemma 4

> Gemma 4 performs the core task templates cannot: contextual judgment. It interprets an incomplete profile, balances academics against extracurricular depth and deadlines, and synthesizes retrieved evidence into a coherent strategy.
>
> It is also the only generative model in the application. Our server has one adapter and a hard allowlist for the official Gemma 4 26B and 31B IDs. Client model values are ignored. Search and scoring are non-generative algorithms, and the offline fallback is visibly labeled.

## 2:20-2:45 - Impact

> Better strategy means less wasted time and earlier recognition of gaps. Polaris can give students, parents, and teachers a shared plan where professional counseling is difficult to access.
>
> The same architecture can expand to scholarships, public-university preparation, vocational pathways, and university-to-career transitions.

## 2:45-3:00 - Close

> Open models matter when they turn expertise into agency. Polaris gives a student a north star, the next measurable step, and a reason to begin now.

## Likely judge questions

**Is Gemma 4 really the only LLM?**

Yes. Show `lib/llm/gemma.ts`, `lib/llm/providers/registry.ts`, and `lib/llm/router.ts`.

**What happens without an API key?**

A deterministic planner keeps the demo usable and is explicitly labeled. It is not model-generated output.

**Why not use embeddings?**

BM25 is deterministic, fast, auditable, and avoids introducing another foundation-model dependency.

**What was built for the sprint?**

We rebuilt the intelligence layer around Gemma 4, enforced the single-model boundary, replaced embedding retrieval with BM25, added the public judge demo and trace, and prepared the competition documentation.
