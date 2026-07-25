"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { RoadmapResponse } from "@/lib/llm/gemma";
import type { Degree, ECCategory, GradeLevel, StudentProfile, Tier } from "@/lib/profile";
import { DEMO_PROFILE, DEMO_ROADMAP, DEMO_STORAGE } from "@/lib/demo/workspace";

type DemoResult = {
  roadmap: RoadmapResponse;
  retrieved: Array<{ id: string; title: string; source: string; score: number }>;
  trace: {
    source: "starter" | "gemma4" | "gemma4-hybrid" | "deterministic-fallback";
    model: string;
    thinking: string;
    generatedMilestones: number;
    deterministicMilestones: number;
  };
};

const STARTER: DemoResult = {
  roadmap: DEMO_ROADMAP,
  retrieved: [
    { id: "starter-1", title: "Bangladesh-focused admit patterns", source: "case-study", score: 1 },
    { id: "starter-2", title: "Global scholarship requirements", source: "scholarship", score: 0.9 },
  ],
  trace: { source: "starter", model: "Ready for live generation", thinking: "not-started", generatedMilestones: 0, deterministicMilestones: 8 },
};

const EC_OPTIONS: ECCategory[] = ["Olympiads", "Research", "Leadership", "Community", "Sports/Arts", "Internships"];
const CATEGORY_TONE: Record<string, string> = {
  Academics: "from-nova-400/25 to-nova-400/[.04] border-nova-300/25",
  Testing: "from-[#5E8CA8]/25 to-[#5E8CA8]/[.04] border-[#7fa5bb]/25",
  Extracurriculars: "from-rose-400/20 to-rose-400/[.04] border-rose-300/25",
  Skills: "from-aurora-400/20 to-aurora-400/[.04] border-aurora-300/25",
  Applications: "from-polaris-400/25 to-polaris-400/[.04] border-polaris-300/25",
};

export function DemoRoadmap() {
  const [profile, setProfile] = useState<StudentProfile>(DEMO_PROFILE);
  const [result, setResult] = useState<DemoResult>(STARTER);
  const [completed, setCompleted] = useState<Set<number>>(new Set([0, 1, 2]));
  const [setupOpen, setSetupOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(DEMO_STORAGE.profile);
      const storedRoadmap = localStorage.getItem(DEMO_STORAGE.roadmap);
      const storedCompleted = localStorage.getItem(DEMO_STORAGE.completed);
      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (storedRoadmap) setResult(JSON.parse(storedRoadmap));
      if (storedCompleted) setCompleted(new Set(JSON.parse(storedCompleted)));
    } catch { /* keep starter state */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(DEMO_STORAGE.profile, JSON.stringify(profile)); } catch { /* ignore */ }
  }, [profile]);
  useEffect(() => {
    try { localStorage.setItem(DEMO_STORAGE.roadmap, JSON.stringify(result)); } catch { /* ignore */ }
  }, [result]);
  useEffect(() => {
    try { localStorage.setItem(DEMO_STORAGE.completed, JSON.stringify([...completed])); } catch { /* ignore */ }
  }, [completed]);

  const progress = Math.round((completed.size / Math.max(result.roadmap.milestones.length, 1)) * 100);
  const months = useMemo(() => {
    const values = result.roadmap.milestones.map((item) => Number(item.quarter.match(/(\d+)(?!.*\d)/)?.[1] || 18));
    return Math.max(18, ...values);
  }, [result]);

  async function generate(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Roadmap generation failed");
      setResult(data as DemoResult);
      setCompleted(new Set());
      setSetupOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Roadmap generation failed");
    } finally {
      setLoading(false);
    }
  }

  function toggleComplete(index: number) {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  }

  const selectedMilestone = selected === null ? null : result.roadmap.milestones[selected];

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[9px] font-medium uppercase tracking-[.22em] text-ink-muted">{months * 30}-day plan / {result.roadmap.milestones.length} missions / {completed.size} complete</div>
          <h1 className="mt-1 font-serif text-[30px] font-bold leading-none tracking-tight text-ink sm:text-[38px]">Global CS - {months}-month plan</h1>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-ink-dim"><span className="h-2 w-2 rounded-full bg-nova-400" />Now growing: {result.roadmap.milestones.find((_, index) => !completed.has(index))?.title || "Application ready"}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.dispatchEvent(new CustomEvent("polaris:demoPrompt", { detail: { text: "Review my roadmap and identify the highest-leverage next action." } }))} className="rounded-xl border border-white/10 bg-white/[.05] px-3 py-2 text-[10px] font-semibold text-ink-dim hover:text-ink">Ask Strategist</button>
          <button onClick={() => setSetupOpen((open) => !open)} className="rounded-xl bg-ink px-4 py-2.5 text-[10px] font-bold text-paper hover:bg-paper-soft">{setupOpen ? "Close setup" : "New setup / replan"}</button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[170px_1fr_220px]">
        <div className="rounded-2xl border border-white/[.07] bg-white/[.035] p-4"><div className="text-[8px] uppercase tracking-wider text-ink-muted">Progress</div><div className="mt-2 font-serif text-3xl font-bold">{progress}%</div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-nova-400 to-aurora-400 transition-all" style={{ width: `${progress}%` }} /></div></div>
        <div className="rounded-2xl border border-white/[.07] bg-white/[.035] p-4"><div className="text-[8px] uppercase tracking-wider text-ink-muted">Strategic readout</div><p className="mt-2 text-[11px] leading-5 text-ink-dim">{result.roadmap.summary}</p></div>
        <div className="rounded-2xl border border-white/[.07] bg-white/[.035] p-4"><div className="text-[8px] uppercase tracking-wider text-ink-muted">Generation trace</div><div className="mt-2 text-[10px] font-semibold text-aurora-200">{result.trace.source === "starter" ? "Starter preview" : result.trace.source === "gemma4" ? "Generated by Gemma 4" : result.trace.source === "gemma4-hybrid" ? "Gemma 4 with resilient fills" : "Offline resilience"}</div><div className="mt-1 truncate font-mono text-[8px] text-ink-muted">{result.trace.model} / {result.trace.thinking}</div></div>
      </div>

      {setupOpen && <form onSubmit={generate} className="mt-5 rounded-2xl border border-nova-300/20 bg-[#241914] p-4 shadow-2xl sm:p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-[9px] uppercase tracking-[.2em] text-nova-200">Live roadmap generator</div><h2 className="mt-1 font-serif text-xl font-bold">Change the student, change the strategy.</h2></div><div className="rounded-full bg-aurora-500/10 px-3 py-1 text-[8px] font-bold uppercase text-aurora-200">No account / no payment</div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Field label="Current stage"><select value={profile.grade} onChange={(event) => setProfile({ ...profile, grade: event.target.value as GradeLevel })} className="demo-input"><option value="middle">Middle school</option><option value="early-hs">Class 8-10</option><option value="late-hs">Class 11-12</option><option value="undergrad">Undergraduate</option><option value="recent-grad">Recent graduate</option></select></Field><Field label="Target degree"><select value={profile.degree} onChange={(event) => setProfile({ ...profile, degree: event.target.value as Degree })} className="demo-input"><option value="undergrad">Bachelor&apos;s</option><option value="masters">Master&apos;s</option><option value="phd">PhD</option><option value="undecided">Still deciding</option></select></Field><Field label={`GPA ${profile.gpa.toFixed(2)} / 4.0`}><input type="range" min="2" max="4" step="0.05" value={profile.gpa} onChange={(event) => setProfile({ ...profile, gpa: Number(event.target.value) })} className="mt-3 w-full" /></Field><Field label="Target tier"><select value={profile.targetTier} onChange={(event) => setProfile({ ...profile, targetTier: event.target.value as Tier })} className="demo-input"><option value="elite">Global elite</option><option value="top50">Global top 50</option><option value="top200">Global top 200</option><option value="regional">Strong regional</option></select></Field></div><Field label="Current strengths" className="mt-4"><div className="flex flex-wrap gap-1.5">{EC_OPTIONS.map((item) => <button key={item} type="button" onClick={() => setProfile((current) => ({ ...current, ecs: current.ecs.includes(item) ? current.ecs.filter((entry) => entry !== item) : [...current.ecs, item] }))} className={`rounded-full border px-2.5 py-1 text-[9px] ${profile.ecs.includes(item) ? "border-nova-300/50 bg-nova-400/15 text-nova-100" : "border-white/10 text-ink-muted"}`}>{item}</button>)}</div></Field><div className="mt-4 flex items-center justify-end gap-3">{error && <div className="mr-auto text-[10px] text-rose-200">{error}</div>}<button disabled={loading} className="flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-[10px] font-bold text-paper disabled:opacity-60">{loading && <span className="h-3 w-3 animate-spin rounded-full border border-[#2c1810]/20 border-t-[#2c1810]" />}{loading ? "Gemma 4 is building the plan..." : "Generate with Gemma 4"}</button></div></form>}

      <div className="mt-6 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="space-y-3"><div className="rounded-2xl border border-white/[.07] bg-white/[.03] p-4"><div className="text-[9px] font-bold uppercase tracking-wider text-nova-200">Honest gaps</div><ul className="mt-3 space-y-2">{result.roadmap.gaps.map((gap) => <li key={gap} className="text-[10px] leading-4 text-ink-dim"><span className="mr-1 text-rose-300">-</span>{gap}</li>)}</ul></div><div className="rounded-2xl border border-white/[.07] bg-white/[.03] p-4"><div className="text-[9px] font-bold uppercase tracking-wider text-aurora-200">Retrieved evidence</div><div className="mt-3 flex flex-wrap gap-1.5">{result.retrieved.slice(0, 6).map((source) => <span key={source.id} className="rounded-lg bg-aurora-500/10 px-2 py-1 text-[8px] leading-3 text-aurora-100">{source.title}</span>)}</div></div></aside>

        <section className="relative pb-10"><div className="absolute bottom-5 left-5 top-0 w-px bg-gradient-to-b from-nova-400/60 via-polaris-400/30 to-aurora-400/50 sm:left-1/2" /><div className="relative space-y-4">{result.roadmap.milestones.map((item, index) => { const done = completed.has(index); const right = index % 2 === 1; return <div key={`${item.quarter}-${item.title}-${index}`} className={`relative flex sm:w-1/2 ${right ? "sm:ml-auto sm:pl-6" : "sm:pr-6"}`}><span className={`absolute left-[13px] top-6 z-10 h-4 w-4 rounded-full border-4 border-[#0e0a08] sm:left-auto ${right ? "sm:-left-2" : "sm:-right-2"} ${done ? "bg-aurora-400" : "bg-nova-400"}`} /><article className={`ml-10 w-full rounded-2xl border bg-gradient-to-br p-4 transition hover:-translate-y-0.5 hover:shadow-xl sm:ml-0 ${CATEGORY_TONE[item.category] || CATEGORY_TONE.Skills} ${done ? "opacity-65" : ""}`}><div className="flex items-start gap-2"><button onClick={() => toggleComplete(index)} className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[9px] ${done ? "border-aurora-300/50 bg-aurora-400/20 text-aurora-100" : "border-white/15 text-transparent"}`} aria-label={done ? "Mark incomplete" : "Mark complete"}>x</button><button onClick={() => setSelected(index)} className="min-w-0 flex-1 text-left"><div className="flex flex-wrap items-center gap-1.5"><span className="text-[8px] font-bold uppercase tracking-wider text-ink-muted">{item.quarter}</span><span className="rounded-full bg-white/[.06] px-2 py-0.5 text-[7px] uppercase text-ink-muted">{item.category}</span><span className={`ml-auto rounded-full px-2 py-0.5 text-[7px] uppercase ${item.priority === "high" ? "bg-rose-400/15 text-rose-200" : "bg-white/[.06] text-ink-muted"}`}>{item.priority}</span></div><h3 className={`mt-2 font-serif text-[16px] font-bold leading-tight ${done ? "line-through" : ""}`}>{item.title}</h3><p className="mt-1.5 line-clamp-2 text-[9px] leading-4 text-ink-dim">{item.description}</p><div className="mt-3 rounded-lg bg-aurora-500/10 px-2.5 py-2 text-[8px] text-aurora-100">Success: {item.metric}</div></button></div></article></div>; })}</div></section>
      </div>

      {selectedMilestone && <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4" onClick={() => setSelected(null)}><article className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#241914] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center gap-2"><span className="rounded-full bg-nova-400/15 px-2.5 py-1 text-[8px] uppercase text-nova-100">{selectedMilestone.quarter}</span><span className="rounded-full bg-white/[.06] px-2.5 py-1 text-[8px] uppercase text-ink-muted">{selectedMilestone.category}</span><button className="ml-auto text-[10px] text-ink-muted" onClick={() => setSelected(null)}>Close</button></div><h2 className="mt-4 font-serif text-2xl font-bold">{selectedMilestone.title}</h2><p className="mt-3 text-[12px] leading-6 text-ink-dim">{selectedMilestone.description}</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-white/[.04] p-3"><div className="text-[8px] uppercase text-ink-muted">Why this matters</div><p className="mt-1 text-[10px] leading-4 text-ink-dim">{selectedMilestone.rationale}</p></div><div className="rounded-xl bg-aurora-500/10 p-3"><div className="text-[8px] uppercase text-aurora-200">Measurable finish</div><p className="mt-1 text-[10px] leading-4 text-aurora-100">{selectedMilestone.metric}</p></div></div></article></div>}
      <style jsx>{`.demo-input{width:100%;border-radius:.7rem;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);padding:.58rem .7rem;color:#f6f0e6;font-size:10px}.demo-input option{color:#2c1810}`}</style>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-[9px] text-ink-muted">{label}</span>{children}</label>;
}