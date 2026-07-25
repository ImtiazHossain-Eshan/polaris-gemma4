"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { RoadmapResponse } from "@/lib/llm/gemma";
import type {
  Degree,
  ECCategory,
  GradeLevel,
  StudentProfile,
  Tier,
} from "@/lib/profile";

type DemoResult = {
  roadmap: RoadmapResponse;
  retrieved: Array<{ id: string; title: string; source: string; score: number }>;
  trace: {
    source: "gemma4" | "gemma4-hybrid" | "deterministic-fallback";
    model: string;
    modelPolicy: string;
    retrieval: string;
    thinking: string;
    generatedMilestones: number;
    deterministicMilestones: number;
  };
};
const EC_OPTIONS: ECCategory[] = [
  "Olympiads",
  "Research",
  "Leadership",
  "Community",
  "Sports/Arts",
  "Internships",
];

const initialProfile: StudentProfile = {
  grade: "late-hs",
  country: "Bangladesh",
  degree: "undergrad",
  gpa: 3.72,
  ecs: ["Community"],
  targetTier: "top50",
  testPercentile: 78,
  ecCount: 2,
  research: 0,
};

export default function DemoPage() {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Roadmap generation failed");
      setResult(data as DemoResult);
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 80);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Roadmap generation failed");
    } finally {
      setLoading(false);
    }
  }

  function toggleEc(value: ECCategory) {
    setProfile((current) => ({
      ...current,
      ecs: current.ecs.includes(value)
        ? current.ecs.filter((item) => item !== value)
        : [...current.ecs, value],
    }));
  }

  return (
    <main className="min-h-screen bg-[#180e0b] text-paper">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_5%,rgba(196,125,78,.20),transparent_32%),radial-gradient(circle_at_90%_35%,rgba(91,140,109,.14),transparent_26%)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-bold tracking-tight">Polaris</Link>
          <div className="flex items-center gap-2 rounded-full border border-aurora-400/30 bg-aurora-500/10 px-3 py-1.5 text-[11px] font-semibold text-aurora-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-aurora-400" />
            Live Gemma 4 prototype
          </div>
        </header>

        <section className="pb-10 pt-16 text-center sm:pt-20">
          <div className="mx-auto mb-5 w-fit rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-paper/60">
            Bangladesh to the world
          </div>
          <h1 className="mx-auto max-w-4xl font-serif text-4xl font-bold leading-tight sm:text-6xl">
            Turn an ambition into a plan a student can start <span className="text-nova-300">Monday.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-paper/65 sm:text-base">
            Give Polaris a six-field snapshot. Gemma 4 reasons over locally retrieved admissions evidence and returns a measurable 6-18 month roadmap.
          </p>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[420px_1fr]">
          <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-nova-300">Student snapshot</div>
              <h2 className="mt-2 font-serif text-2xl font-bold">What are you working with?</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Field label="Current stage">
                <select value={profile.grade} onChange={(e) => setProfile({ ...profile, grade: e.target.value as GradeLevel })} className="input">
                  <option value="middle">Middle school</option>
                  <option value="early-hs">Class 8-10</option>
                  <option value="late-hs">Class 11-12</option>
                  <option value="undergrad">Undergraduate</option>
                  <option value="recent-grad">Recent graduate</option>
                </select>
              </Field>
              <Field label="Target degree">
                <select value={profile.degree} onChange={(e) => setProfile({ ...profile, degree: e.target.value as Degree })} className="input">
                  <option value="undergrad">Bachelor&apos;s</option>
                  <option value="masters">Master&apos;s</option>
                  <option value="phd">PhD</option>
                  <option value="undecided">Still deciding</option>
                </select>
              </Field>
              <Field label={`Academic standing - ${profile.gpa.toFixed(2)} / 4.0`}>
                <input type="range" min="2" max="4" step="0.05" value={profile.gpa} onChange={(e) => setProfile({ ...profile, gpa: Number(e.target.value) })} className="w-full accent-[#c47d4e]" />
              </Field>
              <Field label="Target tier">
                <select value={profile.targetTier} onChange={(e) => setProfile({ ...profile, targetTier: e.target.value as Tier })} className="input">
                  <option value="elite">Global elite</option>
                  <option value="top50">Global top 50</option>
                  <option value="top200">Global top 200</option>
                  <option value="regional">Strong regional</option>
                </select>
              </Field>
            </div>

            <Field label="Current strengths" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {EC_OPTIONS.map((item) => (
                  <button key={item} type="button" onClick={() => toggleEc(item)} className={`rounded-full border px-3 py-1.5 text-[11px] transition ${profile.ecs.includes(item) ? "border-nova-300 bg-nova-400/20 text-nova-200" : "border-white/12 bg-white/[0.04] text-paper/55 hover:text-paper"}`}>
                    {item}
                  </button>
                ))}
              </div>
            </Field>

            <button type="submit" disabled={loading} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-paper px-5 py-3.5 text-sm font-bold text-ink transition hover:bg-paper-soft disabled:cursor-wait disabled:opacity-70">
              {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/25 border-t-ink" /> Gemma 4 is reasoning...</> : <>Generate my roadmap <span aria-hidden>-&gt;</span></>}
            </button>
            {error && <p className="mt-3 rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-xs text-red-200">{error}</p>}
            <p className="mt-4 text-center text-[10px] leading-relaxed text-paper/35">No sign-in / server-side API key / rate-limited public endpoint</p>
          </form>

          <section id="results" className="min-h-[600px] rounded-3xl border border-white/10 bg-[#20130f]/75 p-5 shadow-2xl backdrop-blur-xl sm:p-8">
            {!result ? <EmptyResult loading={loading} /> : <RoadmapResult result={result} />}
          </section>
        </div>

        <section className="grid gap-3 py-12 sm:grid-cols-3">
          <ArchitectureStep n="01" title="Retrieve" body="Deterministic BM25 ranks a curated, inspectable admissions knowledge base." />
          <ArchitectureStep n="02" title="Reason" body="Gemma 4 turns the diagnosis into typed, parallel milestone stages." />
          <ArchitectureStep n="03" title="Structure" body="A JSON schema turns the answer into reliable, measurable roadmap cards." />
        </section>
      </div>
      <style jsx>{`.input{width:100%;border-radius:.75rem;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);padding:.7rem .8rem;color:#faf6f0;font-size:.8rem}.input option{color:#2c1810}`}</style>
    </main>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-[11px] font-medium text-paper/55">{label}</span>{children}</label>;
}

function EmptyResult({ loading }: { loading: boolean }) {
  return <div className="flex min-h-[540px] flex-col items-center justify-center text-center"><div className="mb-5 grid h-20 w-20 place-items-center rounded-3xl border border-nova-300/20 bg-nova-400/10 text-3xl" aria-hidden>*</div><h2 className="font-serif text-2xl font-bold">{loading ? "Building your evidence-backed plan" : "Your roadmap will appear here"}</h2><p className="mt-3 max-w-md text-sm leading-6 text-paper/50">{loading ? "Retrieving relevant evidence, reasoning over gaps, and validating structured output." : "Use the prefilled Bangladesh student profile or adjust it to see how the plan changes."}</p></div>;
}

function RoadmapResult({ result }: { result: DemoResult }) {
  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
      <div><div className="text-[10px] uppercase tracking-[.18em] text-aurora-300">Generation trace</div><div className="mt-1 font-mono text-xs text-paper/65">{result.trace.model} / {result.trace.thinking} thinking</div></div>
      <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${result.trace.source !== "deterministic-fallback" ? "bg-aurora-500/15 text-aurora-300" : "bg-amber-500/15 text-amber-200"}`}>{result.trace.source === "gemma4" ? "Generated by Gemma 4" : result.trace.source === "gemma4-hybrid" ? `Gemma 4 - ${result.trace.generatedMilestones}/8 generated` : "Offline fallback"}</span>
    </div>
    <h2 className="mt-6 font-serif text-2xl font-bold">Strategic readout</h2><p className="mt-3 text-sm leading-7 text-paper/70">{result.roadmap.summary}</p>
    <div className="mt-6 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <div><h3 className="text-[11px] font-bold uppercase tracking-[.16em] text-nova-300">Honest gaps</h3><ul className="mt-3 space-y-2">{result.roadmap.gaps.map((gap) => <li key={gap} className="rounded-xl border border-white/8 bg-white/[.035] p-3 text-xs leading-5 text-paper/65">{gap}</li>)}</ul>
        <h3 className="mt-6 text-[11px] font-bold uppercase tracking-[.16em] text-aurora-300">Retrieved evidence</h3><div className="mt-3 flex flex-wrap gap-2">{result.retrieved.slice(0,4).map((source) => <span key={source.id} className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] text-paper/50">{source.title}</span>)}</div>
      </div>
      <div><h3 className="text-[11px] font-bold uppercase tracking-[.16em] text-nova-300">First high-leverage moves</h3><div className="mt-3 space-y-3">{result.roadmap.milestones.slice(0,5).map((item) => <article key={`${item.quarter}-${item.title}`} className="rounded-2xl border border-white/10 bg-white/[.045] p-4"><div className="flex items-center justify-between gap-2"><span className="text-[9px] font-bold uppercase tracking-wider text-nova-300">{item.quarter} / {item.category}</span><span className="rounded-full bg-white/[.06] px-2 py-1 text-[8px] uppercase text-paper/50">{item.priority}</span></div><h4 className="mt-2 text-sm font-bold">{item.title}</h4><p className="mt-1.5 text-[11px] leading-5 text-paper/55">{item.description}</p><div className="mt-3 rounded-lg bg-aurora-500/10 px-3 py-2 text-[10px] text-aurora-200">Success: {item.metric}</div></article>)}</div></div>
    </div>
  </div>;
}

function ArchitectureStep({ n, title, body }: { n: string; title: string; body: string }) {
  return <div className="rounded-2xl border border-white/8 bg-white/[.035] p-5"><div className="font-mono text-[10px] text-nova-300">{n}</div><h3 className="mt-2 font-serif text-lg font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-paper/50">{body}</p></div>;
}
