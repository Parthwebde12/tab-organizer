// Fetch and display tabs
async function renderTabs(filter = "") {
  let query = {};
  chrome.tabs.query(query, function(tabs) {
    const tabList = document.getElementById("tab-list");
    tabList.innerHTML = "";
    tabs.filter(tab =>
      tab.title.toLowerCase().includes(filter.toLowerCase()) ||
      tab.url.toLowerCase().includes(filter.toLowerCase())
    ).forEach(tab => {
      let li = document.createElement("li");
      li.textContent = tab.title;
      li.onclick = () => chrome.tabs.update(tab.id, {active: true});
      tabList.appendChild(li);
    });
  });
}

document.getElementById("tab-search").addEventListener("input", (e) => {
  renderTabs(e.target.value);
});

document.getElementById("save-session").onclick = () => {
  chrome.tabs.query({}, tabs => {
    const session = tabs.map(tab => tab.url);
    chrome.storage.local.set({session});
    alert("Session saved!");
  });
};

document.getElementById("restore-session").onclick = () => {
  chrome.storage.local.get("session", ({session}) => {
    if (session)
      session.forEach(url => chrome.tabs.create({url}));
    else
      alert("No saved session.");
  });
};

renderTabs();