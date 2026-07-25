"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { DemoStrategist } from "./DemoStrategist";

const NAV = [
  ["roadmap", "Roadmap", "Map"],
  ["strategist", "Strategist", "AI"],
  ["deadlines", "Deadlines", "Cal"],
  ["universities", "Universities", "Uni"],
  ["resources", "Resources", "Lib"],
  ["connections", "Connections", "Link"],
  ["partners", "Partners", "Offer"],
  ["consultants", "Consultants", "Help"],
  ["community", "Community", "Chat"],
  ["family", "Family", "View"],
] as const;

const FOOTER_NAV = [
  ["bookings", "Bookings", "Meet"],
  ["billing", "Billing", "Free"],
  ["transactions", "Transactions", "Log"],
  ["settings", "Settings", "Set"],
] as const;

const DARK_VARS = {
  "--c-paper": "16 12 10",
  "--c-paper-soft": "28 22 18",
  "--c-paper-deep": "44 34 28",
  "--c-paper-card": "38 30 24",
  "--c-ink": "246 240 230",
  "--c-ink-dim": "206 196 184",
  "--c-ink-muted": "160 148 132",
  "--c-ink-faint": "108 98 86",
  "--bg": "16 12 10",
  "--bg-soft": "28 22 18",
  "--bg-card": "38 30 24",
  "--ink": "246 240 230",
  "--ink-dim": "206 196 184",
  "--ink-muted": "160 148 132",
} as CSSProperties;

function hrefFor(id: string) {
  return id === "roadmap" ? "/demo" : `/demo/${id}`;
}

export function DemoShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = pathname.split("/")[2] || "roadmap";
  const [navOpen, setNavOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [query, setQuery] = useState("");

  const title = useMemo(
    () => [...NAV, ...FOOTER_NAV].find(([id]) => id === active)?.[1] || "Roadmap",
    [active],
  );

  useEffect(() => {
    setNavOpen(false);
    setAgentOpen(false);
  }, [pathname]);

  function search() {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return;
    const match = [...NAV, ...FOOTER_NAV].find(([, label]) => label.toLowerCase().includes(normalized));
    if (match) router.push(hrefFor(match[0]));
    else window.dispatchEvent(new CustomEvent("polaris:demoPrompt", { detail: { text: query } }));
    setQuery("");
  }

  function resetDemo() {
    for (const key of Object.keys(localStorage)) if (key.startsWith("polaris.demo.")) localStorage.removeItem(key);
    window.location.href = "/demo";
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0d0908] text-ink" style={DARK_VARS} data-demo-workspace="true">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_35%_-10%,rgba(196,125,78,.13),transparent_35%),radial-gradient(circle_at_88%_70%,rgba(91,140,109,.08),transparent_30%)]" />
      <div className="relative grid h-full min-w-0 grid-cols-1 lg:grid-cols-[232px_minmax(0,1fr)] xl:grid-cols-[232px_minmax(0,1fr)_350px]">
        <button onClick={() => setNavOpen(true)} className="fixed left-2 top-2 z-30 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[#241914] text-[9px] font-bold text-paper shadow-2xl lg:hidden" aria-label="Open demo navigation">Menu</button>
        {navOpen && <button className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setNavOpen(false)} aria-label="Close navigation" />}

        <aside className={`${navOpen ? "translate-x-0" : "-translate-x-full"} app-glass-dark fixed inset-y-0 left-0 z-50 flex w-[232px] flex-col border-r border-white/[.07] bg-[#17100d]/95 text-paper transition-transform lg:static lg:translate-x-0`}>
          <div className="flex items-center gap-2.5 px-4 pb-3 pt-5">
            <Link href="/demo" className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-paper font-serif text-sm font-bold text-ink">P</span>
              <span className="font-serif text-[17px] font-bold">Polaris</span>
            </Link>
            <span className="ml-auto rounded-full bg-aurora-500/20 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-aurora-200">All access</span>
            <button onClick={() => setNavOpen(false)} className="rounded-md px-1.5 py-1 text-[9px] text-paper/45 hover:bg-white/10 hover:text-paper lg:hidden" aria-label="Close demo navigation">x</button>
          </div>

          <div className="mx-3 mb-4 rounded-xl border border-white/[.08] bg-white/[.045] p-3">
            <div className="text-[9px] uppercase tracking-[.2em] text-paper/40">Active path</div>
            <div className="mt-1 truncate font-serif text-[14px] font-bold">Global CS admission</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[38%] rounded-full bg-gradient-to-r from-nova-400 to-aurora-400" /></div>
            <div className="mt-1.5 flex justify-between text-[9px] text-paper/45"><span>18-month plan</span><span>38%</span></div>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4">
            <NavSection label="Workspace" rows={NAV} active={active} />
            <NavSection label="Account" rows={FOOTER_NAV} active={active} className="mt-5" />
          </nav>

          <div className="m-3 rounded-xl border border-nova-300/15 bg-nova-400/[.07] p-3 text-[10px] leading-4 text-paper/55">
            <div className="font-bold uppercase tracking-wider text-nova-200">Judge workspace</div>
            No sign-in. No checkout. Every product surface is available and safely isolated from real accounts.
          </div>
          <div className="flex items-center gap-2.5 border-t border-white/[.07] px-3 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-polaris-500 font-serif text-xs font-bold text-white">PS</span>
            <div className="min-w-0 flex-1"><div className="truncate text-[12px] font-semibold">Demo student</div><div className="text-[10px] text-paper/45">Bangladesh / Class 11-12</div></div>
            <button onClick={resetDemo} className="rounded-md px-2 py-1 text-[9px] text-paper/45 hover:bg-white/10 hover:text-paper">Reset</button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col overflow-hidden">
          <header className="app-glass-dark flex h-14 shrink-0 items-center gap-3 border-b border-white/[.07] bg-[#17100d]/90 px-4 text-paper sm:px-5">
            <div className="min-w-0 shrink-0 pl-10 lg:pl-0"><div className="text-[8px] uppercase tracking-[.2em] text-paper/40">Public demo</div><div className="truncate font-serif text-[14px] font-bold">{title}</div></div>
            <form onSubmit={(event) => { event.preventDefault(); search(); }} className="ml-2 hidden h-9 max-w-[430px] flex-1 items-center rounded-xl border border-white/[.08] bg-white/[.05] px-3 sm:flex">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search features or ask the Strategist" className="min-w-0 flex-1 bg-transparent text-[11px] text-paper outline-none placeholder:text-paper/30" />
              <span className="text-[9px] text-paper/35">Enter</span>
            </form>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden rounded-full border border-aurora-400/20 bg-aurora-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-aurora-200 md:inline-flex">Gemma 4 only</span>
              <button onClick={() => setAgentOpen(true)} className="rounded-lg border border-nova-300/20 bg-nova-400/10 px-3 py-2 text-[10px] font-semibold text-nova-100 xl:hidden">Strategist</button>
              <Link href="/" className="rounded-lg border border-white/10 px-3 py-2 text-[10px] text-paper/55 hover:text-paper">Exit</Link>
            </div>
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto bg-[#0e0a08]">{children}</main>
        </section>

        <aside className="hidden min-h-0 border-l border-white/[.07] bg-[#17100d] xl:block"><DemoStrategist section={active} /></aside>
        {agentOpen && <div className="fixed inset-0 z-[60] bg-black/65 xl:hidden" onClick={() => setAgentOpen(false)}><aside className="ml-auto h-full w-[min(390px,94vw)] border-l border-white/10 bg-[#17100d]" onClick={(event) => event.stopPropagation()}><div className="flex justify-end p-2"><button onClick={() => setAgentOpen(false)} className="rounded-lg px-3 py-1 text-xs text-paper/60">Close</button></div><div className="h-[calc(100%-44px)]"><DemoStrategist section={active} /></div></aside></div>}
      </div>
    </div>
  );
}

function NavSection({ label, rows, active, className = "" }: { label: string; rows: ReadonlyArray<readonly [string, string, string]>; active: string; className?: string }) {
  return <div className={className}><div className="px-2 pb-1.5 text-[9px] uppercase tracking-[.22em] text-paper/35">{label}</div><ul className="space-y-0.5">{rows.map(([id, title, glyph]) => <li key={id}><Link href={hrefFor(id)} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition ${active === id ? "bg-white/[.13] text-paper" : "text-paper/60 hover:bg-white/[.06] hover:text-paper"}`}><span className={`grid h-5 min-w-7 place-items-center rounded text-[8px] uppercase ${active === id ? "bg-nova-400/15 text-nova-200" : "bg-white/[.04] text-paper/35"}`}>{glyph}</span><span>{title}</span></Link></li>)}</ul></div>;
}