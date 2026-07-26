import type { Lang } from "./strings";

export function requestLanguage(request: Request): Lang {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)polaris\.lang=(en|bn)(?:;|$)/);
  return match?.[1] === "bn" ? "bn" : "en";
}

export function generationLanguageInstruction(lang: Lang): string {
  if (lang !== "bn") {
    return "Respond in clear English.";
  }

  return [
    "Respond entirely in natural, fluent Bengali (বাংলা).",
    "Keep official names, university names, URLs, citation tags, exam abbreviations such as SAT/IELTS/GPA, code, and mathematical notation unchanged.",
    "Translate every ordinary heading, explanation, label, table heading, and action step into Bengali. Use Bengali numerals in prose, but keep JSON numeric values as numbers.",
    "Do not write bilingual headings, parenthetical English glosses, or mixed Bengali-English sentences when a natural Bengali expression is available.",
    "Translate ordinary terms such as Steps, Impact, Leadership, Action Plan, Focus Area, and Next Steps; preserve only genuine proper names, established acronyms, code, URLs, and mathematical notation.",
    "Before sending the answer, silently review every sentence and replace any unnecessary English word with natural Bengali.",
  ].join(" ");
}

export const BN_ERRORS = {
  rateLimit: "অনুরোধের সীমা পূর্ণ হয়েছে। কয়েক মিনিট পর আবার চেষ্টা করুন।",
  completeIntake: "প্রথমে ইনটেক সম্পন্ন করুন।",
  invalidRequest: "অনুরোধের তথ্য সঠিক নয়।",
  generic: "কিছু সমস্যা হয়েছে। একটু পর আবার চেষ্টা করুন।",
  capacity: "স্ট্র্যাটেজিস্ট এখন অতিরিক্ত ব্যস্ত। কিছুক্ষণ পর আবার চেষ্টা করুন।",
  stream: "স্ট্র্যাটেজিস্ট উত্তর দিতে পারেনি। অনুগ্রহ করে আবার চেষ্টা করুন।",
  demoLimit: "পাবলিক ডেমোর সীমা পূর্ণ হয়েছে। কয়েক মিনিট পর আবার চেষ্টা করুন।",
} as const;
