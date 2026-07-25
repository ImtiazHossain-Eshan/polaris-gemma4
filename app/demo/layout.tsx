import type { Metadata } from "next";
import { DemoShell } from "@/components/demo/DemoShell";

export const metadata: Metadata = {
  title: "Public Judge Workspace | Polaris",
  description: "Explore every Polaris feature without an account or payment.",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoShell>{children}</DemoShell>;
}