"use client";

import { useEffect, type ReactNode } from "react";
import { roadmapStore } from "@/lib/roadmap/store";
import { DEMO_ROADMAP_DOC } from "@/lib/demo/polaris";

export function DemoWorkspaceSeed({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.dataset.agentOpen = "true";
    try {
      localStorage.setItem("polaris.theme", "dark");
      localStorage.setItem("polaris.agentOpen", "true");
    } catch {}
    roadmapStore.setDoc(structuredClone(DEMO_ROADMAP_DOC));
  }, []);
  return children;
}