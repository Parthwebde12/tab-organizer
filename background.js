const SUSPEND_AFTER = 1000 * 60 * 30; // 30 minutes

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.active) {
    chrome.tabs.update(tabId, {autoDiscardable: true});
  }
});

// Periodically discard unused tabs
setInterval(() => {
  chrome.tabs.query({}, tabs => {
    const now = Date.now();
    tabs.forEach(tab => {
      // Example: suspend if not active for 30 min
      if (!tab.active && (now - new Date(tab.lastAccessed)) > SUSPEND_AFTER) {
        chrome.tabs.discard(tab.id);
      }
    });
  });
}, 60000); // Every minute