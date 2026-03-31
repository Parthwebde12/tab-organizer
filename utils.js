export function detectCategory(tab) {
  const url = tab.url || "";
  const title = (tab.title || "").toLowerCase();

  if (url.includes("github.com")) return "Code";
  if (url.includes("stackoverflow.com")) return "Debug";
  if (url.includes("localhost") || url.includes("127.0.0.1")) return "Local";
  if (title.includes("docs") || url.includes("developer")) return "Docs";
  if (url.includes("youtube.com")) return "Learning";

  return "Other";
}

export function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
}

export function groupTabsByCategory(tabs) {
  const groups = {};

  tabs.forEach(tab => {
    const category = detectCategory(tab);
    if (!groups[category]) groups[category] = [];
    groups[category].push(tab);
  });

  return groups;
}

export function formatTabTitle(title) {
  if (!title) return "Untitled";
  return title.length > 60 ? title.slice(0, 57) + "..." : title;
}

export function isDevTab(tab) {
  const url = tab.url || "";
  return (
    url.includes("github") ||
    url.includes("localhost") ||
    url.includes("vercel") ||
    url.includes("netlify") ||
    url.includes("stackoverflow")
  );
}

export function fuzzyMatch(text, query) {
  return text.toLowerCase().includes(query.toLowerCase());
}