const INACTIVE_TIME = 30 * 60 * 1000;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    checkInactiveTabs();
  }
});

chrome.tabs.onActivated.addListener(() => {
  checkInactiveTabs();
});

async function checkInactiveTabs() {
  try {
    const tabs = await chrome.tabs.query({});

    const now = Date.now();

    for (const tab of tabs) {
      if (!tab.id) continue;

      if (tab.active) continue;

      if (!tab.lastAccessed) continue;

      const inactiveTime = now - tab.lastAccessed;

      if (inactiveTime > INACTIVE_TIME) {
        try {
          await chrome.tabs.discard(tab.id);
        } catch (error) {
          console.log("Could not discard tab:", tab.id);
        }
      }
    }
  } catch (error) {
    console.error("Tab check failed:", error);
  }
}