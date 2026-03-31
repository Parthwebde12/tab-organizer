function detectCategory(tab) {
  const url = tab.url || "";
  const title = (tab.title || "").toLowerCase();

  if (url.includes("github.com")) return "Code";
  if (url.includes("stackoverflow.com")) return "Debug";
  if (url.includes("localhost") || url.includes("127.0.0.1")) return "Local";
  if (title.includes("docs")) return "Docs";
  if (url.includes("youtube.com")) return "Learning";

  return "Other";
}