"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { DEMO_ROADMAP, DEMO_STORAGE } from "@/lib/demo/workspace";

type Message = {
  id: string;
  role: "student" | "strategist";
  text: string;
  trace?: string;
  sources?: string[];
};

const QUICK = [
  "What is the highest-leverage thing this week?",
  "What am I missing compared with strong admits?",
  "How should I start a research project locally?",
  "Build a scholarship-first university strategy.",
];

export function DemoStrategist({ section }: { section: string }) {
  const [mode, setMode] = useState("General");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "strategist",
      text: "I am grounded in the demo profile, current roadmap, and the curated admissions knowledge base. Ask for a decision, trade-off, or next action.",
      trace: "Ready / Gemma 4",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "student", text }]);
    try {
      let roadmapSummary = DEMO_ROADMAP.summary;
      try {
        const stored = localStorage.getItem(DEMO_STORAGE.roadmap);
        if (stored) roadmapSummary = JSON.parse(stored).roadmap?.summary || roadmapSummary;
      } catch { /* use starter context */ }
      const response = await fetch("/api/demo/strategist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: `${mode} mode: ${text}`, section, roadmapSummary }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The Strategist could not respond.");
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "strategist",
        text: data.text,
        trace: data.trace.source === "gemma4" ? `${data.trace.model} / ${data.trace.thinking}` : "Offline resilience",
        sources: data.sources?.map((source: { title: string }) => source.title).slice(0, 3),
      }]);
    } catch (error) {
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "strategist",
        text: error instanceof Error ? error.message : "The Strategist could not respond.",
        trace: "Request error",
      }]);
    } finally {
      setBusy(false);
    }
  }, [busy, mode, section]);

  useEffect(() => {
    function onPrompt(event: Event) {
      const text = (event as CustomEvent<{ text?: string }>).detail?.text;
      if (text) void send(text);
    }
    window.addEventListener("polaris:demoPrompt", onPrompt);
    return () => window.removeEventListener("polaris:demoPrompt", onPrompt);
  }, [send]);

  function submit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  return (
    <div className="app-glass-dark flex h-full min-h-0 flex-col text-paper">
      <div className="border-b border-white/[.07] px-4 pb-3 pt-4">
        <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-nova-400 to-polaris-700 text-sm font-bold">*</span><div><div className="text-[12px] font-bold">Strategist</div><div className="text-[9px] text-paper/40">Grounded in {section} / online</div></div><span className="ml-auto h-2 w-2 rounded-full bg-aurora-400 shadow-[0_0_10px_rgba(107,158,123,.8)]" /></div>
        <div className="mt-3 flex flex-wrap gap-1.5">{["General", "Research", "Study", "Funding"].map((item) => <button key={item} onClick={() => setMode(item)} className={`rounded-full border px-2.5 py-1 text-[9px] ${mode === item ? "border-nova-300/50 bg-nova-400/15 text-nova-100" : "border-white/10 text-paper/45 hover:text-paper"}`}>{item}</button>)}</div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {messages.map((message) => <div key={message.id} className={`${message.role === "student" ? "ml-7 border-nova-300/20 bg-nova-400/10" : "mr-2 border-white/[.08] bg-white/[.035]"} rounded-xl border p-3`}><div className="mb-1 text-[8px] font-bold uppercase tracking-[.16em] text-paper/35">{message.role === "student" ? "You" : "Strategist"}</div><div className="whitespace-pre-wrap text-[11px] leading-[1.65] text-paper/72">{message.text}</div>{message.sources?.length ? <div className="mt-2 flex flex-wrap gap-1">{message.sources.map((source) => <span key={source} className="max-w-full truncate rounded-full bg-aurora-500/10 px-2 py-1 text-[7px] text-aurora-200">{source}</span>)}</div> : null}{message.trace ? <div className="mt-2 font-mono text-[7px] uppercase tracking-wider text-paper/25">{message.trace}</div> : null}</div>)}
        {busy && <div className="mr-12 rounded-xl border border-white/[.08] bg-white/[.035] p-3"><div className="flex items-center gap-2 text-[10px] text-paper/50"><span className="h-3 w-3 animate-spin rounded-full border border-paper/20 border-t-paper/70" /> Gemma 4 is reasoning over your path...</div></div>}
        <div ref={endRef} />
      </div>

      <div className="border-t border-white/[.07] p-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">{QUICK.slice(0, 3).map((prompt) => <button key={prompt} onClick={() => void send(prompt)} className="shrink-0 rounded-full border border-white/[.08] px-2 py-1 text-[8px] text-paper/40 hover:text-paper">{prompt}</button>)}</div>
        <form onSubmit={submit} className="rounded-xl border border-white/10 bg-white/[.05] p-2 focus-within:border-nova-300/35"><textarea value={input} onChange={(event) => setInput(event.target.value)} rows={2} maxLength={1200} placeholder="Ask anything about this workspace..." className="w-full resize-none bg-transparent text-[10px] leading-4 text-paper outline-none placeholder:text-paper/25" /><div className="mt-1 flex items-center justify-between"><span className="text-[7px] text-paper/25">Gemma 4 / grounded retrieval</span><button disabled={busy || !input.trim()} className="rounded-lg bg-paper px-3 py-1.5 text-[9px] font-bold text-ink disabled:opacity-40">Send</button></div></form>
      </div>
    </div>
  );
}