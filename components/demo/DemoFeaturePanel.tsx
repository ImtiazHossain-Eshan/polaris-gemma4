"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { CHANNELS } from "@/lib/community/registry";
import { CONSULTANT_SEED, SERVICE_META } from "@/lib/consultants/registry";
import { CATEGORY_LABEL, INTEGRATIONS } from "@/lib/integrations/registry";
import { DEMO_COMMUNITY_MESSAGES, DEMO_DEADLINES, DEMO_STORAGE, DEMO_TRANSACTIONS } from "@/lib/demo/workspace";

const SECTION_META: Record<string, { eyebrow: string; title: string; description: string }> = {
  strategist: { eyebrow: "Decision engine", title: "Your path, interrogated", description: "Ask a grounded question in the right rail. The response uses the active roadmap and locally retrieved evidence." },
  deadlines: { eyebrow: "Application calendar", title: "Nothing important slips", description: "Track tests, essays, project launches, recommendations, and funding windows in one place." },
  connections: { eyebrow: "Evidence layer", title: "Bring progress into the plan", description: "Preview every integration and safely simulate connections without granting access to a real account." },
  consultants: { eyebrow: "Human expertise", title: "Book the right specialist", description: "Explore the original consultant marketplace and add a no-cost judge booking to the workspace." },
  community: { eyebrow: "Student network", title: "Learn with people on the same path", description: "Browse focused channels and try the conversation flow with local-only demo messages." },
  family: { eyebrow: "Support circle", title: "Progress without surveillance", description: "Invite supporters, control what they see, and share useful progress rather than private drafts." },
  bookings: { eyebrow: "Session desk", title: "Manage every guidance session", description: "Upcoming consultations, document reviews, preparation notes, and cancellation controls live together." },
  billing: { eyebrow: "Judge access", title: "Every implemented feature is unlocked", description: "The public workspace has no sign-in, payment, subscription, or external account requirement." },
  transactions: { eyebrow: "Access ledger", title: "Transparent by design", description: "This isolated demo records only zero-cost workspace actions and never creates a real charge." },
  settings: { eyebrow: "Workspace controls", title: "Make the plan feel personal", description: "Change local demo preferences, export state, or reset the workspace without affecting any account." },
};

export function DemoFeaturePanel({ section }: { section: string }) {
  const meta = SECTION_META[section] ?? SECTION_META.strategist;
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <SectionHeader {...meta} />
      <div className="mt-6">
        {section === "strategist" && <StrategistLab />}
        {section === "deadlines" && <DeadlinesDemo />}
        {section === "connections" && <ConnectionsDemo />}
        {section === "consultants" && <ConsultantsDemo />}
        {section === "community" && <CommunityDemo />}
        {section === "family" && <FamilyDemo />}
        {section === "bookings" && <BookingsDemo />}
        {section === "billing" && <BillingDemo />}
        {section === "transactions" && <TransactionsDemo />}
        {section === "settings" && <SettingsDemo />}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-[9px] font-bold uppercase tracking-[.22em] text-nova-200">{eyebrow}</div><h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-[11px] leading-5 text-ink-dim sm:text-xs">{description}</p></div><span className="rounded-full border border-aurora-300/20 bg-aurora-400/10 px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider text-aurora-100">Public demo / all access</span></header>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-white/[.08] bg-white/[.035] ${className}`}>{children}</section>;
}

function StrategistLab() {
  const prompts = [
    ["This week", "What is the single highest-leverage action I can finish this week?"],
    ["Research", "Design a credible first research project using resources available in Bangladesh."],
    ["Funding", "Create a scholarship-first shortlist strategy and name the biggest trade-off."],
    ["Reality check", "Challenge my current target and tell me what evidence is still missing."],
  ];
  return <div className="grid gap-4 lg:grid-cols-[1fr_310px]"><Card className="p-5 sm:p-6"><div className="rounded-2xl border border-nova-300/15 bg-gradient-to-br from-nova-400/15 to-transparent p-5"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-nova-400 to-polaris-700 font-serif text-xl font-bold">*</div><h2 className="mt-5 font-serif text-2xl font-bold">A coach that can see the plan</h2><p className="mt-2 max-w-xl text-[11px] leading-5 text-ink-dim">The Strategist is not a generic chat box. It receives the current section, generated roadmap summary, and retrieved evidence before forming an answer.</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{prompts.map(([label, prompt]) => <button key={label} onClick={() => window.dispatchEvent(new CustomEvent("polaris:demoPrompt", { detail: { text: prompt } }))} className="rounded-xl border border-white/[.08] bg-black/10 p-3 text-left transition hover:-translate-y-0.5 hover:border-nova-300/25"><div className="text-[8px] font-bold uppercase tracking-wider text-nova-200">{label}</div><div className="mt-1.5 text-[10px] leading-4 text-ink-dim">{prompt}</div></button>)}</div></div></Card><Card className="p-5"><div className="text-[9px] font-bold uppercase tracking-wider text-aurora-200">Grounding packet</div>{["Demo student profile", "Current 18-month roadmap", "Curated admissions corpus", "Active workspace section"].map((item, index) => <div key={item} className="mt-3 flex items-center gap-3 rounded-xl bg-white/[.035] p-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-aurora-500/15 text-[9px] font-bold text-aurora-100">{index + 1}</span><span className="text-[10px] text-ink-dim">{item}</span></div>)}<p className="mt-4 text-[9px] leading-4 text-ink-muted">Open the Strategist rail on smaller screens with the button in the top bar.</p></Card></div>;
}

function DeadlinesDemo() {
  type Item = (typeof DEMO_DEADLINES)[number] & { done?: boolean };
  const [items, setItems] = useState<Item[]>(DEMO_DEADLINES);
  const [title, setTitle] = useState("");
  useEffect(() => { try { const stored = localStorage.getItem(DEMO_STORAGE.deadlines); if (stored) setItems(JSON.parse(stored)); } catch {} }, []);
  function save(next: Item[]) { setItems(next); try { localStorage.setItem(DEMO_STORAGE.deadlines, JSON.stringify(next)); } catch {} }
  function add(event: FormEvent) { event.preventDefault(); if (!title.trim()) return; save([...items, { id: crypto.randomUUID(), title: title.trim(), date: "2026-11-15", type: "Custom", priority: "medium" }]); setTitle(""); }
  return <div className="grid gap-4 lg:grid-cols-[1fr_290px]"><Card className="overflow-hidden"><div className="grid grid-cols-[1fr_90px_76px] border-b border-white/[.07] px-4 py-3 text-[8px] font-bold uppercase tracking-wider text-ink-muted sm:grid-cols-[1fr_130px_100px]"><span>Milestone</span><span>Date</span><span>Status</span></div>{items.map((item) => <button key={item.id} onClick={() => save(items.map((entry) => entry.id === item.id ? { ...entry, done: !entry.done } : entry))} className="grid w-full grid-cols-[1fr_90px_76px] items-center border-b border-white/[.05] px-4 py-3 text-left hover:bg-white/[.025] sm:grid-cols-[1fr_130px_100px]"><div><div className={`text-[11px] font-semibold ${item.done ? "text-ink-muted line-through" : "text-ink"}`}>{item.title}</div><div className="mt-1 text-[8px] uppercase text-ink-muted">{item.type} / {item.priority}</div></div><span className="text-[9px] text-ink-dim">{item.date.slice(5)}</span><span className={`w-fit rounded-full px-2 py-1 text-[8px] ${item.done ? "bg-aurora-400/15 text-aurora-100" : "bg-nova-400/15 text-nova-100"}`}>{item.done ? "Done" : "Upcoming"}</span></button>)}</Card><Card className="p-5"><div className="text-[9px] font-bold uppercase tracking-wider text-nova-200">Quick add</div><form onSubmit={add} className="mt-3"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="New deadline" className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-[10px] outline-none placeholder:text-ink-muted focus:border-nova-300/30" /><button className="mt-2 w-full rounded-xl bg-ink px-3 py-2.5 text-[9px] font-bold text-paper">Add to demo calendar</button></form><div className="mt-5 text-[9px] leading-4 text-ink-muted">Click a row to complete it. Changes stay in this browser and never touch a real account.</div></Card></div>;
}

function ConnectionsDemo() {
  const [connected, setConnected] = useState<Set<string>>(new Set(["github"]));
  const [filter, setFilter] = useState("all");
  const categories = ["all", ...new Set(INTEGRATIONS.map((item) => item.category))];
  const visible = filter === "all" ? INTEGRATIONS : INTEGRATIONS.filter((item) => item.category === filter);
  return <><div className="mb-4 flex flex-wrap gap-2">{categories.map((category) => <button key={category} onClick={() => setFilter(category)} className={`rounded-full border px-3 py-1.5 text-[8px] uppercase ${filter === category ? "border-nova-300/40 bg-nova-400/15 text-nova-100" : "border-white/10 text-ink-muted"}`}>{category === "all" ? "All" : CATEGORY_LABEL[category as keyof typeof CATEGORY_LABEL]}</button>)}</div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visible.map((item) => { const active = connected.has(item.id); return <Card key={item.id} className="flex flex-col p-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold text-white" style={{ backgroundColor: item.color }}>{item.name.slice(0, 2)}</span><div><h2 className="text-[12px] font-bold">{item.name}</h2><div className="mt-1 text-[8px] uppercase text-ink-muted">{item.syncDirection.replace("_", " ")} / {item.connectionMethod.replace("_", " ")}</div></div><span className={`ml-auto h-2 w-2 rounded-full ${active ? "bg-aurora-400" : "bg-white/20"}`} /></div><p className="mt-3 line-clamp-3 text-[9px] leading-4 text-ink-dim">{item.description}</p><div className="mt-3 flex flex-wrap gap-1">{item.features.slice(0, 3).map((feature) => <span key={feature} className="rounded-full bg-white/[.05] px-2 py-1 text-[7px] text-ink-muted">{feature}</span>)}</div><button onClick={() => setConnected((current) => { const next = new Set(current); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next; })} className={`mt-4 rounded-xl px-3 py-2 text-[9px] font-bold ${active ? "border border-white/10 text-ink-dim" : "bg-ink text-paper"}`}>{active ? "Disconnect preview" : "Simulate connection"}</button></Card>; })}</div></>;
}

function ConsultantsDemo() {
  const available = useMemo(() => CONSULTANT_SEED.filter((person) => person.verification !== "pending").slice(0, 6), []);
  const [booked, setBooked] = useState<string | null>(null);
  function book(id: string) { setBooked(id); try { localStorage.setItem(DEMO_STORAGE.bookings, JSON.stringify([{ id, date: "Saturday / 16:00", status: "confirmed" }])); } catch {} }
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{available.map((person) => <Card key={person.id} className="flex flex-col p-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-nova-400/60 to-polaris-700 font-serif text-sm font-bold">{person.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><h2 className="text-[12px] font-bold">{person.name}</h2><div className="text-[8px] text-aurora-200">{person.verification === "featured" ? "Featured specialist" : "Verified specialist"}</div></div></div><h3 className="mt-4 font-serif text-[16px] font-bold leading-tight">{person.headline}</h3><p className="mt-2 line-clamp-3 text-[9px] leading-4 text-ink-dim">{person.bio}</p><div className="mt-3 flex flex-wrap gap-1">{person.services.slice(0, 3).map((service) => <span key={service} className="rounded-full bg-white/[.05] px-2 py-1 text-[7px] text-ink-muted">{SERVICE_META[service].label}</span>)}</div><div className="mt-auto flex items-end justify-between pt-4"><div><div className="text-[11px] font-bold">${(person.priceMinor / 100).toFixed(0)} / {person.sessionMinutes} min</div><div className="text-[8px] text-ink-muted">{person.freeFirstSession ? "First session available free" : `Replies in about ${person.responseHours}h`}</div></div><button onClick={() => book(person.id)} className={`rounded-xl px-3 py-2 text-[8px] font-bold ${booked === person.id ? "bg-aurora-400/15 text-aurora-100" : "bg-ink text-paper"}`}>{booked === person.id ? "Added" : "Book demo"}</button></div></Card>)}</div>;
}

function CommunityDemo() {
  const [channelId, setChannelId] = useState("general");
  const [messages, setMessages] = useState(DEMO_COMMUNITY_MESSAGES);
  const [text, setText] = useState("");
  const channel = CHANNELS.find((item) => item.id === channelId) ?? CHANNELS[0];
  function post(event: FormEvent) { event.preventDefault(); if (!text.trim()) return; setMessages([...messages, { id: crypto.randomUUID(), name: "Demo student", role: "Student", text: text.trim(), time: "now" }]); setText(""); }
  return <div className="grid min-h-[520px] overflow-hidden rounded-2xl border border-white/[.08] bg-white/[.025] lg:grid-cols-[220px_1fr]"><aside className="border-b border-white/[.07] p-3 lg:border-b-0 lg:border-r"><div className="px-2 pb-2 text-[8px] font-bold uppercase tracking-wider text-ink-muted">Channels</div><div className="grid grid-cols-2 gap-1 lg:grid-cols-1">{CHANNELS.map((item) => <button key={item.id} onClick={() => setChannelId(item.id)} className={`rounded-lg px-2.5 py-2 text-left ${channelId === item.id ? "bg-white/[.1]" : "hover:bg-white/[.04]"}`}><div className="text-[10px] font-semibold"># {item.name}</div><div className="mt-0.5 hidden truncate text-[7px] text-ink-muted lg:block">{item.blurb}</div></button>)}</div></aside><section className="flex min-h-[420px] flex-col"><header className="border-b border-white/[.07] px-4 py-3"><div className="text-[11px] font-bold"># {channel.name}</div><div className="text-[8px] text-ink-muted">{channel.blurb} / local demo conversation</div></header><div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.map((message) => <div key={message.id} className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-nova-400/15 text-[9px] font-bold text-nova-100">{message.name[0]}</span><div><div className="text-[10px] font-bold">{message.name} <span className="ml-1 text-[7px] font-normal text-ink-muted">{message.role} / {message.time}</span></div><p className="mt-1 text-[10px] leading-4 text-ink-dim">{message.text}</p></div></div>)}</div><form onSubmit={post} className="border-t border-white/[.07] p-3"><div className="flex rounded-xl border border-white/10 bg-white/[.04] p-2"><input value={text} onChange={(event) => setText(event.target.value)} placeholder={`Message #${channel.name}`} className="min-w-0 flex-1 bg-transparent px-1 text-[10px] outline-none placeholder:text-ink-muted" /><button className="rounded-lg bg-ink px-3 py-2 text-[8px] font-bold text-paper">Post locally</button></div></form></section></div>;
}

function FamilyDemo() {
  const [supporters, setSupporters] = useState([{ name: "Amma", relation: "Parent", access: "Progress + deadlines" }, { name: "Rafiq Sir", relation: "Teacher", access: "Academics only" }]);
  const [name, setName] = useState("");
  function invite(event: FormEvent) { event.preventDefault(); if (!name.trim()) return; setSupporters([...supporters, { name: name.trim(), relation: "Supporter", access: "Progress summary" }]); setName(""); }
  return <div className="grid gap-4 lg:grid-cols-[1fr_320px]"><Card className="p-5"><div className="grid gap-3 sm:grid-cols-3">{[["38%", "Plan complete"], ["3", "Missions done"], ["5", "Deadlines ahead"]].map(([value, label]) => <div key={label} className="rounded-xl bg-white/[.035] p-4"><div className="font-serif text-2xl font-bold">{value}</div><div className="mt-1 text-[8px] uppercase text-ink-muted">{label}</div></div>)}</div><h2 className="mt-5 text-[10px] font-bold uppercase tracking-wider text-nova-200">Shared progress</h2>{supporters.map((person) => <div key={person.name} className="mt-3 flex items-center gap-3 rounded-xl border border-white/[.06] p-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-aurora-400/15 text-[10px] font-bold text-aurora-100">{person.name[0]}</span><div><div className="text-[11px] font-bold">{person.name}</div><div className="text-[8px] text-ink-muted">{person.relation}</div></div><span className="ml-auto rounded-full bg-white/[.05] px-2 py-1 text-[8px] text-ink-dim">{person.access}</span></div>)}</Card><Card className="p-5"><div className="text-[9px] font-bold uppercase tracking-wider text-aurora-200">Invite a supporter</div><p className="mt-2 text-[9px] leading-4 text-ink-muted">Demo invitations stay local. Private essays, conversations, and account data are never shared.</p><form onSubmit={invite} className="mt-4"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Supporter name" className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-[10px] outline-none" /><button className="mt-2 w-full rounded-xl bg-ink px-3 py-2.5 text-[9px] font-bold text-paper">Add demo supporter</button></form></Card></div>;
}

function BookingsDemo() {
  const [cancelled, setCancelled] = useState(false);
  return <div className="grid gap-4 lg:grid-cols-[1fr_290px]"><Card className="p-5"><div className="flex flex-wrap items-start gap-4 rounded-2xl border border-nova-300/15 bg-nova-400/[.06] p-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-nova-400/20 text-[10px] font-bold text-nova-100">SAT</div><div className="min-w-0 flex-1"><div className="text-[8px] uppercase tracking-wider text-nova-200">Upcoming / Saturday 16:00</div><h2 className={`mt-1 font-serif text-lg font-bold ${cancelled ? "line-through opacity-50" : ""}`}>Testing strategy diagnostic</h2><p className="mt-1 text-[9px] text-ink-muted">45 minutes / preparation note attached / demo room</p></div><button onClick={() => setCancelled(!cancelled)} className="rounded-xl border border-white/10 px-3 py-2 text-[8px] text-ink-dim">{cancelled ? "Restore" : "Cancel demo"}</button></div><div className="mt-5 text-[9px] font-bold uppercase tracking-wider text-ink-muted">Preparation checklist</div>{["Upload the latest diagnostic", "List three timing failures", "Bring the next test date"].map((item, index) => <label key={item} className="mt-3 flex items-center gap-3 rounded-xl bg-white/[.03] p-3 text-[10px] text-ink-dim"><input type="checkbox" defaultChecked={index === 0} className="accent-[#c47d4e]" />{item}</label>)}</Card><Card className="p-5"><div className="text-[9px] font-bold uppercase tracking-wider text-aurora-200">Session policy</div><p className="mt-3 text-[9px] leading-4 text-ink-muted">The judge workspace never opens a payment page. In the signed-in product, consultant pricing and cancellation terms are shown before confirmation.</p><button onClick={() => window.location.href = "/demo/consultants"} className="mt-5 w-full rounded-xl bg-ink px-3 py-2.5 text-[9px] font-bold text-paper">Browse consultants</button></Card></div>;
}

function BillingDemo() {
  const plans = [{ name: "Explorer", price: "Free", features: ["Roadmap", "University fit", "Community"] }, { name: "Judge workspace", price: "BDT 0", features: ["Gemma 4 Strategist", "All implemented features", "Unlimited local exploration"] }, { name: "Full product", price: "Preview", features: ["Connections", "Partners", "Scenario lab"] }];
  return <><div className="rounded-2xl border border-aurora-300/20 bg-aurora-400/[.08] p-4 text-[10px] leading-5 text-aurora-100">Demo access is deliberately separate from commercial billing: no card, checkout, trial clock, or hidden usage fee.</div><div className="mt-4 grid gap-3 md:grid-cols-3">{plans.map((plan, index) => <Card key={plan.name} className={`p-5 ${index === 1 ? "border-nova-300/30 bg-nova-400/[.08]" : ""}`}><div className="text-[9px] font-bold uppercase tracking-wider text-ink-muted">{plan.name}</div><div className="mt-3 font-serif text-3xl font-bold">{plan.price}</div><div className="mt-5 space-y-2">{plan.features.map((feature) => <div key={feature} className="flex gap-2 text-[10px] text-ink-dim"><span className="text-aurora-200">+</span>{feature}</div>)}</div><button disabled className={`mt-6 w-full rounded-xl px-3 py-2.5 text-[9px] font-bold ${index === 1 ? "bg-aurora-400/15 text-aurora-100" : "border border-white/10 text-ink-muted"}`}>{index === 1 ? "Currently unlocked" : "No checkout in demo"}</button></Card>)}</div></>;
}

function TransactionsDemo() {
  return <Card className="overflow-hidden"><div className="grid grid-cols-[80px_1fr_70px_80px] border-b border-white/[.07] px-4 py-3 text-[8px] font-bold uppercase tracking-wider text-ink-muted sm:grid-cols-[110px_1fr_100px_100px]"><span>Date</span><span>Description</span><span>Amount</span><span>Status</span></div>{DEMO_TRANSACTIONS.map((item) => <div key={item.id} className="grid grid-cols-[80px_1fr_70px_80px] items-center border-b border-white/[.05] px-4 py-4 sm:grid-cols-[110px_1fr_100px_100px]"><div className="text-[9px] text-ink-muted">{item.date}<div className="text-[7px]">{item.id}</div></div><div className="text-[10px] font-semibold">{item.description}</div><div className="text-[9px] text-ink-dim">{item.amount}</div><span className="w-fit rounded-full bg-aurora-400/15 px-2 py-1 text-[8px] text-aurora-100">{item.status}</span></div>)}</Card>;
}

function SettingsDemo() {
  const [compact, setCompact] = useState(false);
  const [reminders, setReminders] = useState(true);
  const [language, setLanguage] = useState("English");
  const [notice, setNotice] = useState("");
  function exportState() { const values: Record<string, unknown> = {}; for (const key of Object.keys(localStorage)) if (key.startsWith("polaris.demo.")) { try { values[key] = JSON.parse(localStorage.getItem(key) || "null"); } catch { values[key] = localStorage.getItem(key); } } const blob = new Blob([JSON.stringify(values, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "polaris-demo-workspace.json"; link.click(); URL.revokeObjectURL(url); setNotice("Demo workspace exported."); }
  return <div className="grid gap-4 lg:grid-cols-[1fr_310px]"><Card className="p-5"><SettingRow title="Compact roadmap cards" description="Show more missions on screen"><Toggle active={compact} setActive={setCompact} /></SettingRow><SettingRow title="Deadline reminders" description="Preview reminder preferences"><Toggle active={reminders} setActive={setReminders} /></SettingRow><SettingRow title="Workspace language" description="Local preference preview"><select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-lg border border-white/10 bg-[#241914] px-3 py-2 text-[9px]"><option>English</option><option>Bangla</option></select></SettingRow><SettingRow title="Profile visibility" description="Private by default"><span className="rounded-full bg-aurora-400/15 px-2.5 py-1 text-[8px] text-aurora-100">Private</span></SettingRow></Card><Card className="p-5"><div className="text-[9px] font-bold uppercase tracking-wider text-nova-200">Demo data controls</div><p className="mt-2 text-[9px] leading-4 text-ink-muted">Download the browser-local workspace or clear it with the Reset control in the navigation rail.</p><button onClick={exportState} className="mt-4 w-full rounded-xl bg-ink px-3 py-2.5 text-[9px] font-bold text-paper">Export demo state</button>{notice && <div className="mt-3 rounded-lg bg-aurora-400/10 p-2 text-[8px] text-aurora-100">{notice}</div>}</Card></div>;
}

function SettingRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="flex items-center gap-4 border-b border-white/[.06] py-4 first:pt-0 last:border-0 last:pb-0"><div className="min-w-0 flex-1"><div className="text-[11px] font-semibold">{title}</div><div className="mt-1 text-[8px] text-ink-muted">{description}</div></div>{children}</div>;
}
function Toggle({ active, setActive }: { active: boolean; setActive: (value: boolean) => void }) {
  return <button onClick={() => setActive(!active)} className={`relative h-6 w-11 rounded-full transition ${active ? "bg-aurora-500" : "bg-white/10"}`} aria-pressed={active}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${active ? "left-6" : "left-1"}`} /></button>;
}