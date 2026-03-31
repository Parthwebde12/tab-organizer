const tabList = document.getElementById("tabList");
const search = document.getElementById("search");

document.getElementById("groupBtn").onclick = () => {
  chrome.runtime.sendMessage({ action: "GROUP_TABS" });
};

document.getElementById("saveBtn").onclick = async () => {
  const name = prompt("Workspace name:");
  if (!name) return;

  const tabs = await chrome.tabs.query({ currentWindow: true });
  const workspace = tabs.map(tab => ({ title: tab.title, url: tab.url }));

  const data = await chrome.storage.local.get("workspaces");
  const workspaces = data.workspaces || {};
  workspaces[name] = workspace;

  await chrome.storage.local.set({ workspaces });
};

document.getElementById("loadBtn").onclick = async () => {
  const name = prompt("Workspace to load:");
  if (!name) return;

  const data = await chrome.storage.local.get("workspaces");
  const workspace = data.workspaces?.[name] || [];

  for (const tab of workspace) {
    chrome.tabs.create({ url: tab.url });
  }
};

async function loadTabs(filter = "") {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  tabList.innerHTML = "";

  tabs
    .filter(tab => (tab.title || "").toLowerCase().includes(filter.toLowerCase()))
    .forEach(tab => {
      const div = document.createElement("div");
      div.className = "tab-item";
      div.textContent = tab.title;
      div.onclick = () => chrome.tabs.update(tab.id, { active: true });
      tabList.appendChild(div);
    });
}

search.addEventListener("input", (e) => loadTabs(e.target.value));

loadTabs();