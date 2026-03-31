async function autoGroupTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const groups = {};

  for (const tab of tabs) {
    const url = tab.url || "";
    const title = (tab.title || "").toLowerCase();

    let category = "Other";
    if (url.includes("github.com")) category = "Code";
    else if (url.includes("stackoverflow.com")) category = "Debug";
    else if (url.includes("localhost") || url.includes("127.0.0.1")) category = "Local";
    else if (title.includes("docs")) category = "Docs";
    else if (url.includes("youtube.com")) category = "Learning";

    if (!groups[category]) groups[category] = [];
    groups[category].push(tab.id);
  }

  for (const category in groups) {
    const groupId = await chrome.tabs.group({ tabIds: groups[category] });
    await chrome.tabGroups.update(groupId, {
      title: category,
      color: "blue"
    });
  }
}

async function suspendInactiveTabs() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.active && !tab.pinned) {
      chrome.tabs.discard(tab.id);
    }
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "GROUP_TABS") autoGroupTabs();
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "group-tabs") autoGroupTabs();
});

setInterval(suspendInactiveTabs, 300000);