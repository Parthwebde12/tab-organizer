const tabList = document.getElementById("tabList");
const searchInput = document.getElementById("search");


function loadTabs() {
    chrome.tabs.query({currentWindow: true}, function(tabs) {
        tabList.innerHTML = "";
        tabs.forEach(tab => {
            const li = document.createElement("li");
            li.textContent = tab.title.length > 30 ? tab.title.slice(0,30)+"..." : tab.title;

            const closeBtn = document.createElement("button");
            closeBtn.textContent = "✖";
            closeBtn.addEventListener("click", () => {
                chrome.tabs.remove(tab.id, () => loadTabs());
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

loadTabs();