import { notFound, redirect } from "next/navigation";
import universitiesJson from "@/data/universities.json";
import scholarshipsJson from "@/data/scholarships.json";
import caseStudiesJson from "@/data/case-studies.json";
import { UniversitiesClient } from "@/components/app/UniversitiesClient";
import { ResourcesClient, type HubCaseStudy, type HubScholarship } from "@/components/app/ResourcesClient";
import { PartnersClient } from "@/components/app/PartnersClient";
import { DemoFeaturePanel } from "@/components/demo/DemoFeaturePanel";
import { toUniProfile } from "@/lib/admissions";
import type { UniversityForModel } from "@/lib/ml/probability";

const SECTIONS = new Set([
  "strategist", "deadlines", "universities", "resources", "connections",
  "partners", "consultants", "community", "family", "bookings", "billing",
  "transactions", "settings",
]);
const VALID_TIERS: UniversityForModel["tier"][] = ["elite", "top10", "top50", "top100", "top200"];

export function generateStaticParams() {
  return [...SECTIONS].map((section) => ({ section }));
}

export default async function DemoSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (section === "roadmap") redirect("/demo");
  if (!SECTIONS.has(section)) notFound();

  const rawUniversities = universitiesJson as Array<Record<string, unknown>>;
  const universities = rawUniversities.map(toUniProfile);

  if (section === "universities") {
    return (
      <UniversitiesClient
        universities={universities.filter((university) => university.id && VALID_TIERS.includes(university.tier))}
        initialInputs={{ gpa: 3.72, testPercentile: 78, ecCount: 2, research: 0 }}
      />
    );
  }

  if (section === "resources") {
    return (
      <ResourcesClient
        caseStudies={caseStudiesJson as HubCaseStudy[]}
        scholarships={scholarshipsJson as HubScholarship[]}
        universities={universities.filter((university) => university.admissions !== null)}
        level="hsc"
      />
    );
  }

  if (section === "partners") {
    return (
      <PartnersClient
        level="hsc"
        roadmapTopics={["SAT", "IELTS", "research", "portfolio", "essays", "scholarships"]}
        weakScores={[
          { key: "research", label: "Research evidence", ratio: 0.2 },
          { key: "testing", label: "Testing", ratio: 0.48 },
          { key: "leadership", label: "Leadership impact", ratio: 0.52 },
        ]}
        deadlineTypesSoon={["test", "scholarship", "essay"]}
        eliteUniIds={universities.filter((university) => university.tier === "elite" || university.tier === "top10").map((university) => university.id)}
      />
    );
  }

  return <DemoFeaturePanel section={section} />;
}