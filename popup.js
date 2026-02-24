const tabList = document.getElementById("tabList");
const searchInput = document.getElementById("search");
const saveSessionBtn = document.getElementById("saveSession");
const restoreSessionBtn = document.getElementById("restoreSession");


function loadTabs() {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        tabList.innerHTML = "";
        const seenUrls = new Set();

        tabs.forEach(tab => {
            // Skip duplicate URLs
            if(seenUrls.has(tab.url)) return;
            seenUrls.add(tab.url);

            const li = document.createElement("li");
            li.textContent = tab.title.length > 35 ? tab.title.slice(0,35) + "..." : tab.title;

            const closeBtn = document.createElement("button");
            closeBtn.textContent = "✖";
            closeBtn.addEventListener("click", () => {
                chrome.tabs.remove(tab.id, loadTabs);
            });

            li.appendChild(closeBtn);
            tabList.appendChild(li);
        });
    });
}

searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    Array.from(tabList.children).forEach(li => {
        if(li.firstChild.textContent.toLowerCase().includes(filter)){
            li.style.display = "flex";
        } else {
            li.style.display = "none";
        }
    });
});


saveSessionBtn.addEventListener("click", () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const urls = tabs.map(t => t.url);
        chrome.storage.local.set({ savedSession: urls }, () => {
            alert("Session saved! ✅");
        });
    });
});


restoreSessionBtn.addEventListener("click", () => {
    chrome.storage.local.get("savedSession", (data) => {
        if(data.savedSession && data.savedSession.length > 0) {
            data.savedSession.forEach(url => chrome.tabs.create({ url }));
        } else {
            alert("No session saved!");
        }
    });
});


loadTabs();