const tabList = document.getElementById("tabList");
const searchInput = document.getElementById("search");
const saveSessionBtn = document.getElementById("saveSession");
const restoreSessionBtn = document.getElementById("restoreSession");


// ✅ Load and Display Tabs
async function loadTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true });

    tabList.innerHTML = "";
    const seenUrls = new Set();

    tabs.forEach(tab => {
        if (!tab.url || seenUrls.has(tab.url)) return;
        seenUrls.add(tab.url);

        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";

        const titleSpan = document.createElement("span");
        const title = tab.title || "Untitled";

        titleSpan.textContent =
            title.length > 35 ? title.slice(0, 35) + "..." : title;

        // Close button
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "✖";
        closeBtn.style.cursor = "pointer";

        closeBtn.addEventListener("click", async () => {
            await chrome.tabs.remove(tab.id);
            loadTabs();
        });

        li.appendChild(titleSpan);
        li.appendChild(closeBtn);
        tabList.appendChild(li);
    });
}


// ✅ Search Tabs
searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();

    Array.from(tabList.children).forEach(li => {
        const title = li.querySelector("span").textContent.toLowerCase();
        li.style.display = title.includes(filter) ? "flex" : "none";
    });
});


// ✅ Save Session
saveSessionBtn.addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const urls = tabs
        .map(t => t.url)
        .filter(url => url && !url.startsWith("chrome://"));

    await chrome.storage.local.set({ savedSession: urls });

    alert("Session saved successfully ✅");
});


// ✅ Restore Session (Smooth Open)
restoreSessionBtn.addEventListener("click", async () => {
    const data = await chrome.storage.local.get("savedSession");

    if (data.savedSession && data.savedSession.length > 0) {
        data.savedSession.forEach((url, index) => {
            setTimeout(() => {
                chrome.tabs.create({ url });
            }, index * 200); // prevents spam opening
        });
    } else {
        alert("No session saved!");
    }
});


// Initial Load
loadTabs();