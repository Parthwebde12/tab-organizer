let allTabs = [];

async function getTabs() {
  return new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => {
      resolve(tabs);
    });
  });
}

function getDuplicateTabs(tabs) {
  const seen = new Map();
  const duplicates = [];

  tabs.forEach((tab) => {
    if (!tab.url) return;

    if (seen.has(tab.url)) {
      duplicates.push(tab);
    } else {
      seen.set(tab.url, tab.id);
    }
  });

  return duplicates;
}

async function renderTabs(filter = "") {
  allTabs = await getTabs();

  const tabList = document.getElementById("tab-list");
  const emptyState = document.getElementById("empty-state");
  const tabCount = document.getElementById("tab-count");
  const visibleCount = document.getElementById("visible-count");
  const duplicateAlert = document.getElementById("duplicate-alert");
  const duplicateCount = document.getElementById("duplicate-count");

  const search = filter.toLowerCase().trim();
  const duplicates = getDuplicateTabs(allTabs);

  const duplicateIds = new Set(
    duplicates.map((tab) => tab.id)
  );

  const filteredTabs = allTabs.filter((tab) => {
    const title = (tab.title || "").toLowerCase();
    const url = (tab.url || "").toLowerCase();

    return (
      title.includes(search) ||
      url.includes(search)
    );
  });

  tabList.innerHTML = "";

  tabCount.textContent =
    `${allTabs.length} ${
      allTabs.length === 1 ? "tab" : "tabs"
    } open`;

  visibleCount.textContent =
    `${filteredTabs.length} shown`;

  if (duplicates.length > 0) {
    duplicateAlert.classList.remove("hidden");

    duplicateCount.textContent =
      `${duplicates.length} ${
        duplicates.length === 1
          ? "duplicate"
          : "duplicates"
      }`;
  } else {
    duplicateAlert.classList.add("hidden");
  }

  if (filteredTabs.length === 0) {
    emptyState.classList.add("show");
    return;
  }

  emptyState.classList.remove("show");

  filteredTabs.forEach((tab) => {
    const li = document.createElement("li");

    li.className = "tab-item";

    if (tab.active) {
      li.classList.add("active");
    }

    if (duplicateIds.has(tab.id)) {
      li.classList.add("duplicate");
    }

    const favicon = document.createElement("img");

    favicon.className = "favicon";

    favicon.src =
      tab.favIconUrl ||
      "https://www.google.com/s2/favicons?domain=example.com&sz=32";

    favicon.onerror = () => {
      favicon.src =
        "https://www.google.com/s2/favicons?domain=example.com&sz=32";
    };

    const info = document.createElement("div");

    info.className = "tab-info";

    const title = document.createElement("div");

    title.className = "tab-title";
    title.textContent =
      tab.title || "Untitled tab";

    const url = document.createElement("div");

    url.className = "tab-url";
    url.textContent = tab.url || "";

    info.appendChild(title);
    info.appendChild(url);

    li.appendChild(favicon);
    li.appendChild(info);

    if (duplicateIds.has(tab.id)) {
      const badge = document.createElement("span");

      badge.className = "duplicate-badge";
      badge.textContent = "DUP";

      li.appendChild(badge);
    }

    if (tab.active) {
      const activeDot = document.createElement("div");

      activeDot.className = "active-dot";

      li.appendChild(activeDot);
    }

    const closeButton = document.createElement("button");

    closeButton.className = "close-tab";
    closeButton.textContent = "×";
    closeButton.title = "Close tab";

    closeButton.addEventListener("click", (event) => {
      event.stopPropagation();

      chrome.tabs.remove(tab.id, () => {
        renderTabs(
          document.getElementById("tab-search").value
        );
      });
    });

    li.appendChild(closeButton);

    li.addEventListener("click", () => {
      chrome.tabs.update(tab.id, {
        active: true
      });

      if (tab.windowId) {
        chrome.windows.update(tab.windowId, {
          focused: true
        });
      }

      window.close();
    });

    tabList.appendChild(li);
  });
}

async function closeDuplicates() {
  const tabs = await getTabs();

  const seen = new Set();
  const duplicateIds = [];

  tabs.forEach((tab) => {
    if (!tab.url || !tab.id) return;

    if (seen.has(tab.url)) {
      duplicateIds.push(tab.id);
    } else {
      seen.add(tab.url);
    }
  });

  if (duplicateIds.length === 0) {
    return;
  }

  chrome.tabs.remove(duplicateIds, () => {
    renderTabs(
      document.getElementById("tab-search").value
    );
  });
}

document
  .getElementById("tab-search")
  .addEventListener("input", (event) => {
    renderTabs(event.target.value);
  });

document
  .getElementById("refresh-tabs")
  .addEventListener("click", () => {
    renderTabs(
      document.getElementById("tab-search").value
    );
  });

document
  .getElementById("close-duplicates")
  .addEventListener("click", () => {
    closeDuplicates();
  });

document
  .getElementById("save-session")
  .addEventListener("click", async () => {
    const tabs = await getTabs();

    const session = tabs
      .filter((tab) => tab.url)
      .map((tab) => ({
        url: tab.url,
        title: tab.title
      }));

    chrome.storage.local.set(
      { session },
      () => {
        alert("Session saved!");
      }
    );
  });

document
  .getElementById("restore-session")
  .addEventListener("click", () => {
    chrome.storage.local.get(
      "session",
      ({ session }) => {
        if (!session || session.length === 0) {
          alert("No saved session.");
          return;
        }

        session.forEach((tab) => {
          chrome.tabs.create({
            url: tab.url
          });
        });
      }
    );
  });

renderTabs();