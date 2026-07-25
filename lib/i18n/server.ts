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
    "Use Bengali headings, explanations, labels, and action steps. Use Bengali numerals in prose, but keep JSON numeric values as numbers.",
    "Do not mix English sentences into the answer when a natural Bengali expression is available.",
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
