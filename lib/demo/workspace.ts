import type { RoadmapResponse } from "@/lib/llm/gemma";
import type { StudentProfile } from "@/lib/profile";

export const DEMO_PROFILE: StudentProfile = {
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

export const DEMO_ROADMAP: RoadmapResponse = {
  summary:
    "Build one unmistakable academic signal, one shipped project with real users, and a balanced application list while protecting grades and testing fundamentals.",
  gaps: [
    "No original research or independently evaluated academic work yet.",
    "Community involvement needs a measurable leadership outcome.",
    "Testing evidence is below the typical range for the current target tier.",
  ],
  milestones: [
    {
      quarter: "Months 1-3",
      category: "Academics",
      title: "Lock the academic ceiling",
      description: "Build weekly subject diagnostics and close the two largest grade gaps.",
      priority: "high",
      rationale: "The target tier rewards sustained top-decile academic performance.",
      metric: "Term GPA at or above 3.90",
    },
    {
      quarter: "Months 1-3",
      category: "Testing",
      title: "Establish the testing baseline",
      description: "Complete timed SAT and IELTS diagnostics, then assign a twelve-week study plan.",
      priority: "high",
      rationale: "A baseline prevents wasted preparation and makes progress measurable.",
      metric: "SAT diagnostic and IELTS mock recorded",
    },
    {
      quarter: "Months 3-6",
      category: "Extracurriculars",
      title: "Turn service into leadership",
      description: "Own one community initiative with a defined beneficiary and outcome.",
      priority: "high",
      rationale: "Depth and measurable responsibility are stronger than activity count.",
      metric: "One initiative serving at least 100 people",
    },
    {
      quarter: "Months 3-6",
      category: "Skills",
      title: "Ship a public proof of work",
      description: "Build and document a tool that solves a real student problem.",
      priority: "high",
      rationale: "A used product is concrete evidence of initiative and technical depth.",
      metric: "Public release with 100 active users",
    },
    {
      quarter: "Months 6-9",
      category: "Extracurriculars",
      title: "Earn external validation",
      description: "Enter one national competition aligned with the strongest academic interest.",
      priority: "medium",
      rationale: "External evaluation makes the profile easier to trust.",
      metric: "One national shortlist or placement",
    },
    {
      quarter: "Months 6-12",
      category: "Testing",
      title: "Reach the competitive score band",
      description: "Sit the official exams with a protected retake window.",
      priority: "high",
      rationale: "Competitive scores reduce uncertainty for international applications.",
      metric: "SAT 1500+ and IELTS 7.5+",
    },
    {
      quarter: "Months 9-15",
      category: "Applications",
      title: "Build the application narrative",
      description: "Draft the main essay, activity descriptions, and recommender evidence pack.",
      priority: "medium",
      rationale: "Strong evidence needs a coherent narrative to become persuasive.",
      metric: "Three reviewed essay drafts and recommender pack",
    },
    {
      quarter: "Months 12-18",
      category: "Applications",
      title: "Submit a funded, balanced portfolio",
      description: "Apply across reach, target, and financial-safety options with scholarships in parallel.",
      priority: "high",
      rationale: "A balanced list protects both admission and affordability outcomes.",
      metric: "Eight applications and four funding applications submitted",
    },
  ],
};

export const DEMO_DEADLINES = [
  { id: "sat-1", title: "SAT registration", date: "2026-08-14", type: "Testing", priority: "high" },
  { id: "essay-1", title: "Personal statement draft", date: "2026-09-05", type: "Applications", priority: "high" },
  { id: "project-1", title: "Project public beta", date: "2026-09-28", type: "Portfolio", priority: "medium" },
  { id: "scholarship-1", title: "Scholarship shortlist", date: "2026-10-12", type: "Funding", priority: "high" },
  { id: "recommendation-1", title: "Recommender evidence pack", date: "2026-10-25", type: "Applications", priority: "medium" },
];

export const DEMO_COMMUNITY_MESSAGES = [
  { id: "m1", name: "Nadia", role: "Student", text: "I made a scholarship tracker for the UK and Canada. Happy to share the structure.", time: "8 min" },
  { id: "m2", name: "Arif", role: "Mentor", text: "For recommendation letters, give teachers evidence and stories, not a template to sign.", time: "14 min" },
  { id: "m3", name: "Tasnim", role: "Student", text: "Does anyone want to run a peer review session for activity descriptions this Friday?", time: "22 min" },
];

export const DEMO_TRANSACTIONS = [
  { id: "DEMO-001", date: "Today", description: "Judge workspace access", amount: "BDT 0", status: "Unlocked" },
  { id: "DEMO-002", date: "Today", description: "Gemma 4 Strategist", amount: "BDT 0", status: "Included" },
  { id: "DEMO-003", date: "Today", description: "All integrations preview", amount: "BDT 0", status: "Included" },
];

export const DEMO_STORAGE = {
  profile: "polaris.demo.profile",
  roadmap: "polaris.demo.roadmap",
  completed: "polaris.demo.completed",
  deadlines: "polaris.demo.deadlines",
  bookings: "polaris.demo.bookings",
} as const;