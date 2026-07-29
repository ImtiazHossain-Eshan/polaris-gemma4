"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Btn, Card, Icon, Pill, Progress, RingMini, Tag } from "@/components/app/ui";
import { MarkdownMessage } from "@/components/app/MarkdownMessage";
import { LEARNING_VIDEOS } from "@/lib/action-lab/data";
import type { LearningVideo, PracticeQuestion } from "@/lib/action-lab/types";
import { gemmaHeaders, getBrowserGemmaKey, setBrowserGemmaKey } from "@/lib/gemma/browser-key";
import { cn } from "@/lib/cn";

type Lang = "en" | "bn";
type Trace = { source: "gemma4" | "deterministic-fallback"; model: string };

async function studioPost<T>(body: Record<string, unknown>, lang: Lang): Promise<T> {
  const response = await fetch("/api/gemma-studio", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-polaris-language": lang,
      ...gemmaHeaders(),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Gemma Studio could not complete the request.");
  return data;
}

const IELTS_SECTIONS = ["Listening", "Reading", "Writing", "Speaking"] as const;
const SAT_SECTIONS = ["Reading and Writing", "Math"] as const;
const DIFFICULTIES = ["Foundation", "Medium", "Advanced"] as const;

export function GemmaExamStudio({ lang }: { lang: Lang }) {
  const bn = lang === "bn";
  const [exam, setExam] = useState<"IELTS" | "SAT">("IELTS");
  const sections = exam === "IELTS" ? IELTS_SECTIONS : SAT_SECTIONS;
  const [section, setSection] = useState<string>("Reading");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("Medium");
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [trace, setTrace] = useState<Trace | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const question = questions[index];
  const score = questions.filter((item) => answers[item.id] === item.answer).length;

  const changeExam = (next: "IELTS" | "SAT") => {
    setExam(next);
    setSection(next === "IELTS" ? "Reading" : "Reading and Writing");
    setQuestions([]);
    setAnswers({});
    setFinished(false);
    setFeedback("");
    setTrace(null);
  };

  const generate = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await studioPost<{ questions: PracticeQuestion[] } & Trace>({
        kind: "exam-generate",
        exam,
        section,
        difficulty,
        count: 3,
      }, lang);
      setQuestions(result.questions);
      setTrace(result);
      setIndex(0);
      setAnswers({});
      setFinished(false);
      setFeedback("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (bn ? "প্রশ্ন তৈরি করা যায়নি।" : "Questions could not be generated."));
    } finally {
      setBusy(false);
    }
  };

  const grade = async () => {
    setFinished(true);
    setBusy(true);
    setError("");
    try {
      const result = await studioPost<{ score: number; feedback: string } & Trace>({
        kind: "exam-grade",
        exam,
        questions,
        answers,
      }, lang);
      setFeedback(result.feedback);
      setTrace(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (bn ? "উত্তর যাচাই করা যায়নি।" : "Answers could not be graded."));
    } finally {
      setBusy(false);
    }
  };

  if (finished) {
    return (
      <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <Card className="border border-aurora-500/20 bg-aurora-500/[0.05] p-6 text-center">
          <RingMini value={Math.round((score / questions.length) * 100)} size={94} stroke={7} tone="aurora" label={<span className="text-[17px] font-bold">{score}/{questions.length}</span>} />
          <h2 className="mt-4 font-serif text-[24px] font-bold text-ink">{bn ? "Gemma মূল্যায়ন সম্পন্ন" : "Gemma review complete"}</h2>
          <p className="mt-2 text-[11.5px] text-ink-muted">{exam} · {section} · {difficulty}</p>
          <Btn className="mt-5" variant="outline" onClick={() => { setFinished(false); setAnswers({}); setIndex(0); }}>{bn ? "আরেকবার চেষ্টা করুন" : "Try this set again"}</Btn>
          <Btn className="mt-2" variant="accent" onClick={() => void generate()} disabled={busy}>{bn ? "নতুন সেট তৈরি করুন" : "Generate a new set"}</Btn>
        </Card>
        <div className="space-y-3">
          <Card className="border border-ink-faint/15 p-5">
            <div className="flex items-center justify-between gap-3">
              <Pill tone="polaris">Gemma 4 feedback</Pill>
              <ModelTrace trace={trace} />
            </div>
            {busy ? <p className="mt-4 text-[12.5px] text-ink-dim">{bn ? "Gemma আপনার ভুলের ধরন বিশ্লেষণ করছে…" : "Gemma is diagnosing your answer pattern…"}</p> : <MarkdownMessage className="mt-4 text-[12.5px]" text={feedback || error} theme="light" />}
          </Card>
          {questions.map((item, itemIndex) => {
            const correct = answers[item.id] === item.answer;
            return (
              <details key={item.id} className="rounded-xl border border-ink-faint/15 bg-paper-card p-3.5">
                <summary className="cursor-pointer list-none text-[12.5px] font-semibold text-ink">
                  <span className={cn("mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white", correct ? "bg-aurora-500" : "bg-signal-rose")}>{correct ? "✓" : "×"}</span>
                  {bn ? "প্রশ্ন" : "Question"} {itemIndex + 1}: {item.skill}
                </summary>
                <p className="mt-3 pl-7 text-[11.5px] leading-relaxed text-ink-dim">{item.explanation}</p>
              </details>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
      <Card className="relative overflow-hidden border border-ink-faint/15 p-5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-polaris-500/15 blur-3xl" />
        <Pill tone="polaris"><Icon.spark size={11} /> {bn ? "চাহিদামতো প্রশ্ন" : "On-demand questions"}</Pill>
        <h2 className="mt-3 font-serif text-[24px] font-bold text-ink">{bn ? "Gemma মক পরীক্ষার নির্মাতা" : "Gemma Mock Generator"}</h2>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-dim">{bn ? "পরীক্ষা, বিভাগ ও কঠিনতার মাত্রা বেছে নিন। প্রতিবার নতুন মৌলিক অনুশীলন সেট তৈরি হবে।" : "Choose an exam, section, and difficulty. Gemma creates a fresh original practice set every time."}</p>
        <Segmented value={exam} options={["IELTS", "SAT"]} onChange={(value) => changeExam(value as "IELTS" | "SAT")} />
        <label className="mt-4 block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
          {bn ? "বিভাগ" : "Section"}
          <select value={section} onChange={(event) => setSection(event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-ink-faint/20 bg-bg px-3 text-[12.5px] normal-case tracking-normal text-ink outline-none">
            {sections.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
          {bn ? "কঠিনতার মাত্রা" : "Difficulty"}
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as (typeof DIFFICULTIES)[number])} className="mt-1.5 h-10 w-full rounded-xl border border-ink-faint/20 bg-bg px-3 text-[12.5px] normal-case tracking-normal text-ink outline-none">
            {DIFFICULTIES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <Btn className="mt-5 w-full" variant="accent" size="lg" disabled={busy} onClick={() => void generate()} icon={<Icon.spark size={13} />}>
          {busy ? (bn ? "Gemma প্রশ্ন তৈরি করছে…" : "Gemma is generating…") : (bn ? "নতুন মক তৈরি করুন" : "Generate fresh mock")}
        </Btn>
        {error && <p className="mt-3 text-[11px] text-signal-rose">{error}</p>}
        <div className="mt-5 rounded-xl border border-aurora-500/20 bg-aurora-500/[0.06] p-3 text-[11px] leading-relaxed text-ink-dim">
          {bn ? "এগুলো মৌলিক অনানুষ্ঠানিক অনুশীলন প্রশ্ন। এগুলো IELTS ব্যান্ড বা SAT স্কোরের আনুষ্ঠানিক পূর্বাভাস নয়।" : "These are original unofficial practice questions. They do not predict an official IELTS band or SAT score."}
        </div>
      </Card>

      <Card className="min-h-[520px] overflow-hidden border border-ink-faint/15">
        {!question ? (
          <div className="grid min-h-[520px] place-items-center p-8 text-center">
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-polaris-500/20 bg-polaris-500/[0.07] text-polaris-500"><Icon.spark size={25} /></div>
              <h3 className="mt-4 font-serif text-[22px] font-bold text-ink">{bn ? "একটি নতুন মক তৈরি করুন" : "Create a fresh mock"}</h3>
              <p className="mx-auto mt-2 max-w-sm text-[12px] leading-relaxed text-ink-dim">{bn ? "Gemma নির্বাচিত বিভাগের দক্ষতা, কঠিনতার মাত্রা ও মৌলিক বিভ্রান্তিকর উত্তর পরিকল্পনা করবে।" : "Gemma plans skill coverage, difficulty, and original distractors for the selected section."}</p>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Pill tone="polaris">{question.section}</Pill><Tag tone="ink">{question.difficulty}</Tag></div>
              <span className="font-mono text-[11px] text-ink-muted">{index + 1} / {questions.length}</span>
            </div>
            <Progress value={((index + 1) / questions.length) * 100} tone="polaris" height="h-1 mt-4" />
            {question.passage && <div className="mt-6 rounded-2xl border border-nova-500/20 bg-nova-500/[0.06] p-4 text-[13px] leading-[1.75] text-ink-dim">{question.passage}</div>}
            <h3 className="mt-6 text-[17px] font-semibold leading-relaxed text-ink">{question.prompt}</h3>
            <div className="mt-4 grid gap-2.5">
              {question.options.map((option, optionIndex) => {
                const selected = answers[question.id] === optionIndex;
                return (
                  <button key={`${question.id}-${optionIndex}`} onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} className={cn("group flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition", selected ? "border-polaris-500 bg-polaris-500/[0.09]" : "border-ink-faint/20 bg-bg/40 hover:border-polaris-500/40")}>
                    <span className={cn("inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold", selected ? "border-polaris-500 bg-polaris-500 text-white" : "border-ink-faint/30 text-ink-muted")}>{String.fromCharCode(65 + optionIndex)}</span>
                    <span className="pt-0.5 text-[12.5px] leading-relaxed text-ink">{option}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <Btn variant="ghost" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>{bn ? "আগের প্রশ্ন" : "Previous"}</Btn>
              {index < questions.length - 1
                ? <Btn variant="accent" disabled={answers[question.id] === undefined} onClick={() => setIndex((value) => value + 1)}>{bn ? "পরের প্রশ্ন" : "Next question"} <Icon.arrow size={13} /></Btn>
                : <Btn variant="accent" disabled={answers[question.id] === undefined || busy} onClick={() => void grade()}>{bn ? "Gemma দিয়ে মূল্যায়ন করুন" : "Grade with Gemma"} <Icon.check size={13} /></Btn>}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

type VideoRecommendation = {
  title: string;
  channel: string;
  reason: string;
  searchQuery: string;
};

export function GemmaVideoLearning({ lang }: { lang: Lang }) {
  const bn = lang === "bn";
  const [exam, setExam] = useState<"IELTS" | "SAT">("IELTS");
  const sections = exam === "IELTS" ? IELTS_SECTIONS : SAT_SECTIONS;
  const [section, setSection] = useState<string>("Listening");
  const [selected, setSelected] = useState<LearningVideo>(() => LEARNING_VIDEOS.find((item) => item.exam === "IELTS")!);
  const [recommendations, setRecommendations] = useState<VideoRecommendation[]>([]);
  const [trace, setTrace] = useState<Trace | null>(null);
  const [busy, setBusy] = useState(false);

  const defaults = useMemo(() => LEARNING_VIDEOS.filter((item) => item.exam === exam), [exam]);

  const refresh = async () => {
    setBusy(true);
    try {
      const result = await studioPost<{ recommendations: VideoRecommendation[] } & Trace>({ kind: "videos", exam, section }, lang);
      setRecommendations(result.recommendations);
      setTrace(result);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
      <Card className="overflow-hidden border border-ink-faint/15">
        <div className="aspect-video bg-[#0b0908]">
          <iframe title={selected.title} src={`https://www.youtube-nocookie.com/embed/${selected.youtubeId}?rel=0`} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2"><Pill tone="rose">{selected.exam}</Pill><Tag tone="ink">{selected.topic}</Tag><span className="ml-auto text-[10.5px] text-ink-muted">{selected.duration}</span></div>
          <h2 className="mt-3 font-serif text-[22px] font-bold text-ink">{selected.title}</h2>
          <p className="mt-1 text-[11.5px] text-ink-muted">{selected.source}</p>
        </div>
      </Card>
      <div className="space-y-4">
        <Card className="border border-ink-faint/15 p-4">
          <div className="flex items-center justify-between gap-3"><div><div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">{bn ? "Gemma পাঠ অনুসন্ধান" : "Gemma lesson finder"}</div><h3 className="mt-1 font-serif text-[19px] font-bold text-ink">{bn ? "নতুন প্রাসঙ্গিক পাঠ খুঁজুন" : "Find fresh related content"}</h3></div><ModelTrace trace={trace} /></div>
          <Segmented value={exam} options={["IELTS", "SAT"]} onChange={(value) => { const next = value as "IELTS" | "SAT"; setExam(next); setSection(next === "IELTS" ? "Listening" : "Reading and Writing"); const first = LEARNING_VIDEOS.find((item) => item.exam === next); if (first) setSelected(first); setRecommendations([]); }} />
          <div className="mt-3 flex flex-wrap gap-1.5">{sections.map((item) => <button key={item} onClick={() => setSection(item)} className={cn("rounded-full border px-3 py-1.5 text-[10.5px] font-semibold transition", item === section ? "border-polaris-500 bg-polaris-500 text-white" : "border-ink-faint/20 text-ink-dim hover:border-polaris-500/40")}>{item}</button>)}</div>
          <Btn className="mt-4 w-full" variant="accent" disabled={busy} onClick={() => void refresh()} icon={<Icon.spark size={13} />}>{busy ? (bn ? "Gemma খুঁজছে…" : "Gemma is searching…") : (bn ? "Gemma দিয়ে হালনাগাদ করুন" : "Refresh with Gemma")}</Btn>
        </Card>
        <Card className="max-h-[390px] space-y-2 overflow-y-auto border border-ink-faint/15 p-3">
          {(recommendations.length ? recommendations : defaults.map((video) => ({ title: video.title, channel: video.source, reason: video.topic, searchQuery: `${video.exam} ${video.topic} ${video.source}` }))).map((item, index) => (
            <motion.a key={`${item.title}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.searchQuery)}`} target="_blank" rel="noreferrer" className="block rounded-xl border border-ink-faint/15 bg-bg/40 p-3 transition hover:border-polaris-500/40 hover:bg-polaris-500/[0.04]">
              <div className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-500/10 text-rose-500">▶</span><span><span className="block text-[12px] font-semibold leading-snug text-ink">{item.title}</span><span className="mt-1 block text-[10px] text-ink-muted">{item.channel}</span><span className="mt-1 block text-[10.5px] leading-relaxed text-ink-dim">{item.reason}</span></span></div>
            </motion.a>
          ))}
        </Card>
      </div>
    </div>
  );
}

type KnowledgeNote = {
  id: string;
  title: string;
  content: string;
  gemmaSummary: string;
  updatedAt: string;
};

const NOTES_KEY = "polaris.knowledge.notes.v1";

function loadNotes(): KnowledgeNote[] {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || "[]") as KnowledgeNote[]; } catch { return []; }
}

export function GemmaNotesStudio({ lang }: { lang: Lang }) {
  const bn = lang === "bn";
  const [notes, setNotes] = useState<KnowledgeNote[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setNotes(loadNotes()); }, []);
  useEffect(() => { try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch {} }, [notes]);

  const save = async () => {
    if (title.trim().length < 2 || content.trim().length < 5) return;
    setBusy(true);
    try {
      const result = await studioPost<{ text: string }>({ kind: "note", title, content, feedback }, lang);
      setNotes((current) => [{ id: crypto.randomUUID(), title: title.trim(), content: content.trim(), gemmaSummary: result.text, updatedAt: new Date().toISOString() }, ...current]);
      setTitle("");
      setContent("");
      setFeedback("");
    } finally { setBusy(false); }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
      <Card className="border border-ink-faint/15 p-5">
        <Pill tone="nova"><Icon.spark size={11} /> {bn ? "Gemma জ্ঞানভান্ডার" : "Gemma knowledge memory"}</Pill>
        <h2 className="mt-3 font-serif text-[23px] font-bold text-ink">{bn ? "প্রতিক্রিয়া থেকে নোট তৈরি করুন" : "Turn feedback into a reusable note"}</h2>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-dim">{bn ? "আপনার নোট এই ব্রাউজারে থাকে। Gemma এটিকে সারাংশ, মূল ধারণা ও পরবর্তী কাজে সাজায়।" : "Your notes stay in this browser. Gemma turns them into a summary, key concepts, and next actions."}</p>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={bn ? "নোটের শিরোনাম" : "Note title"} className="mt-4 h-10 w-full rounded-xl border border-ink-faint/20 bg-bg px-3 text-[12.5px] text-ink outline-none focus:border-polaris-500" />
        <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} placeholder={bn ? "যা শিখলেন বা মনে রাখতে চান…" : "What did you learn or want to remember?"} className="mt-2 w-full resize-y rounded-xl border border-ink-faint/20 bg-bg px-3 py-3 text-[12.5px] leading-relaxed text-ink outline-none focus:border-polaris-500" />
        <textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={3} placeholder={bn ? "Gemma-এর প্রতিক্রিয়া এখানে দিন (ঐচ্ছিক)" : "Paste Gemma feedback (optional)"} className="mt-2 w-full resize-y rounded-xl border border-ink-faint/20 bg-bg px-3 py-3 text-[12px] leading-relaxed text-ink outline-none focus:border-polaris-500" />
        <Btn className="mt-3 w-full" variant="accent" disabled={busy || title.trim().length < 2 || content.trim().length < 5} onClick={() => void save()}>{busy ? (bn ? "Gemma সাজাচ্ছে…" : "Gemma is structuring…") : (bn ? "নোট সংরক্ষণ ও বিশ্লেষণ করুন" : "Save and analyze note")}</Btn>
      </Card>
      <div className="grid content-start gap-3 md:grid-cols-2">
        {notes.length === 0 && <Card className="col-span-full grid min-h-[260px] place-items-center border border-dashed border-ink-faint/25 p-8 text-center"><div><h3 className="font-serif text-[21px] font-bold text-ink">{bn ? "জ্ঞানভান্ডার এখন খালি" : "Your knowledge vault is empty"}</h3><p className="mt-2 text-[12px] text-ink-dim">{bn ? "মক পরীক্ষার প্রতিক্রিয়া, রচনার অন্তর্দৃষ্টি বা রোডম্যাপ গবেষণা থেকে প্রথম নোট তৈরি করুন।" : "Create the first note from mock feedback, essay insight, or roadmap research."}</p></div></Card>}
        {notes.map((note) => (
          <Card key={note.id} className="border border-ink-faint/15 p-4">
            <div className="flex items-start justify-between gap-3"><h3 className="font-serif text-[17px] font-bold text-ink">{note.title}</h3><button onClick={() => setNotes((current) => current.filter((item) => item.id !== note.id))} className="text-ink-muted hover:text-signal-rose"><Icon.close size={12} /></button></div>
            <p className="mt-2 line-clamp-4 text-[11.5px] leading-relaxed text-ink-dim">{note.content}</p>
            <div className="mt-3 border-t border-ink-faint/10 pt-3"><MarkdownMessage className="text-[11.5px]" text={note.gemmaSummary} theme="light" /></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

const ESSAY_KEY = "polaris.essay.workspace.v1";

export function GemmaEssayStudio({ lang }: { lang: Lang }) {
  const bn = lang === "bn";
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState("");
  const [response, setResponse] = useState("");
  const [mode, setMode] = useState<"feedback" | "refine" | "outline">("feedback");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ESSAY_KEY) || "{}") as { prompt?: string; draft?: string };
      setPrompt(saved.prompt || "");
      setDraft(saved.draft || "");
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(ESSAY_KEY, JSON.stringify({ prompt, draft, updatedAt: new Date().toISOString() })); } catch {} }, [prompt, draft]);

  const run = async () => {
    setBusy(true);
    try {
      const notes = loadNotes().slice(0, 8).map((item) => `${item.title}: ${item.gemmaSummary || item.content}`);
      const result = await studioPost<{ text: string }>({ kind: "essay", prompt: prompt || "Personal statement", draft, mode, notes }, lang);
      setResponse(result.text);
    } finally { setBusy(false); }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="border border-ink-faint/15 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><Pill tone="rose">{bn ? "দিনে দিনে খসড়া" : "Day-by-day draft"}</Pill><h2 className="mt-3 font-serif text-[23px] font-bold text-ink">{bn ? "রচনা কর্মক্ষেত্র" : "Essay Workspace"}</h2></div><span className="text-[10.5px] text-ink-muted">{draft.trim() ? draft.trim().split(/\s+/).length : 0} {bn ? "শব্দ" : "words"}</span></div>
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={2} placeholder={bn ? "রচনার বিষয় বা প্রশ্ন" : "Essay prompt or question"} className="mt-4 w-full resize-y rounded-xl border border-ink-faint/20 bg-bg px-3 py-3 text-[12px] leading-relaxed text-ink outline-none focus:border-polaris-500" />
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={16} placeholder={bn ? "নিজের ভাষায় খসড়া লিখুন। Gemma আপনার কণ্ঠ ও তথ্য বজায় রেখে সাহায্য করবে।" : "Write in your own voice. Gemma will help while preserving your facts and authorship."} className="mt-2 w-full resize-y rounded-xl border border-ink-faint/20 bg-bg px-3 py-3 text-[13px] leading-[1.75] text-ink outline-none focus:border-polaris-500" />
        <p className="mt-2 text-[10.5px] leading-relaxed text-ink-muted">{bn ? "খসড়া এই ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়। Gemma কখনও কৃতিত্ব বানিয়ে দেবে না।" : "The draft autosaves in this browser. Gemma will never invent achievements."}</p>
      </Card>
      <Card className="border border-ink-faint/15 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">{bn ? "নৈতিক Gemma পরামর্শক" : "Ethical Gemma coach"}</div><h3 className="mt-1 font-serif text-[21px] font-bold text-ink">{bn ? "আপনার কণ্ঠ, আরও পরিষ্কার" : "Your voice, made clearer"}</h3></div></div>
        <Segmented value={mode} options={["feedback", "refine", "outline"]} labels={bn ? ["প্রতিক্রিয়া", "পরিমার্জন", "রূপরেখা"] : undefined} onChange={(value) => setMode(value as typeof mode)} />
        <Btn className="mt-4 w-full" variant="accent" disabled={busy || draft.trim().length < 20} onClick={() => void run()} icon={<Icon.spark size={13} />}>{busy ? (bn ? "Gemma বিশ্লেষণ করছে…" : "Gemma is reviewing…") : (bn ? "Gemma দিয়ে উন্নত করুন" : "Improve with Gemma")}</Btn>
        <div className="mt-4 min-h-[420px] rounded-2xl border border-ink-faint/15 bg-bg/35 p-4">
          {response ? <MarkdownMessage className="text-[12.5px]" text={response} theme="light" /> : <div className="grid min-h-[380px] place-items-center text-center"><div><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-polaris-500/[0.08] text-polaris-500"><Icon.spark size={22} /></div><p className="mt-4 max-w-sm text-[12px] leading-relaxed text-ink-dim">{bn ? "Gemma আপনার সংরক্ষিত নোটের সঙ্গে খসড়া মিলিয়ে নির্দিষ্টতা, আত্মবিশ্লেষণ, কাঠামো ও নিজস্ব কণ্ঠ উন্নত করবে।" : "Gemma can connect your saved knowledge notes with the draft to improve specificity, reflection, structure, and voice."}</p></div></div>}
        </div>
      </Card>
    </div>
  );
}

export function GemmaKeyCard({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  const bn = lang === "bn";
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { setSaved(Boolean(getBrowserGemmaKey())); }, []);
  const save = () => { setBrowserGemmaKey(value); setSaved(Boolean(value.trim())); setValue(""); };
  return (
    <Card className={cn("border border-aurora-500/20 bg-aurora-500/[0.045]", compact ? "p-3.5" : "p-5")}>
      <div className="flex items-start gap-3"><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-aurora-500/15 text-aurora-600">✦</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-[12.5px] font-semibold text-ink">{bn ? "নিজের Gemma API key" : "Use your Gemma API key"}</h3><Pill tone={saved ? "aurora" : "ink"}>{saved ? (bn ? "এই সেশনে সক্রিয়" : "Active this session") : (bn ? "ঐচ্ছিক" : "Optional")}</Pill></div><p className="mt-1 text-[10.5px] leading-relaxed text-ink-muted">{bn ? "শুধু এই ব্রাউজার ট্যাবের সেশন স্টোরেজে থাকে। সার্ভারে সংরক্ষণ বা লগ করা হয় না।" : "Stored only in this browser tab's session storage. It is never saved or logged by Polaris."}</p><div className="mt-3 flex gap-2"><input type="password" autoComplete="off" value={value} onChange={(event) => setValue(event.target.value)} placeholder={saved ? "••••••••••••••••" : "Gemma API key"} className="h-9 min-w-0 flex-1 rounded-lg border border-ink-faint/20 bg-bg px-3 text-[11.5px] text-ink outline-none focus:border-aurora-500" /><Btn size="sm" variant="outline" onClick={save}>{value.trim() ? (bn ? "ব্যবহার করুন" : "Use key") : (bn ? "মুছুন" : "Clear")}</Btn></div></div></div>
    </Card>
  );
}

function ModelTrace({ trace }: { trace: Trace | null }) {
  return <span className="rounded-full border border-ink-faint/15 bg-bg/50 px-2 py-1 text-[9px] font-semibold text-ink-muted">{trace?.source === "gemma4" ? `Gemma 4 · ${trace.model}` : "Gemma 4 ready"}</span>;
}

function Segmented({ value, options, labels, onChange }: { value: string; options: readonly string[]; labels?: readonly string[]; onChange: (value: string) => void }) {
  return (
    <div className="mt-4 flex rounded-xl border border-ink-faint/20 bg-bg p-1">
      {options.map((option, index) => <button key={option} onClick={() => onChange(option)} className={cn("flex-1 rounded-lg px-3 py-2 text-[11px] font-semibold capitalize transition", value === option ? "bg-ink text-paper shadow-sm" : "text-ink-dim hover:text-ink")}>{labels?.[index] || option}</button>)}
    </div>
  );
}
