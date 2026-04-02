// Modern Tab Organizer - Advanced Features
// ============================================
class TabOrganizer {
  constructor() {
    this.tabList = document.getElementById('tabList');
    this.searchInput = document.getElementById('search');
    this.tabCount = document.getElementById('tabCount');
    this.setupEventListeners();
    this.initializeApp();
  }

  setupEventListeners() {
    document.getElementById('groupBtn').addEventListener('click', () => this.groupTabs());
    document.getElementById('saveBtn').addEventListener('click', () => this.saveWorkspace());
    document.getElementById('loadBtn').addEventListener('click', () => this.loadWorkspace());
    this.searchInput.addEventListener('input', (e) => this.filterTabs(e.target.value));
  }

  async initializeApp() {
    try {
      await this.loadTabs();
    } catch (error) {
      this.showNotification('Failed to initialize app', 'error');
      console.error(error);
    }
  }

  async loadTabs(filter = '') {
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const filtered = tabs.filter(tab => (tab.title || '').toLowerCase().includes(filter.toLowerCase()) );
      this.renderTabs(filtered);
      this.updateTabCount(filtered.length);
    } catch (error) {
      console.error('Error loading tabs:', error);
      this.showNotification('Could not load tabs', 'error');
    }
  }

  renderTabs(tabs) {
    this.tabList.innerHTML = '';
    if (tabs.length === 0) {
      this.tabList.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">No tabs found</div>';
      return;
    }
    tabs.forEach((tab, index) => {
      const tabElement = document.createElement('div');
      tabElement.className = 'tab-item';
      tabElement.setAttribute('role', 'listitem');
      tabElement.innerHTML = `
        <div class="tab-item-title" title="${tab.title}">${tab.title || 'Untitled'}</div>
        <div class="tab-item-url">${new URL(tab.url).hostname}</div>
      `;
      tabElement.addEventListener('click', () => this.switchToTab(tab.id));
      this.tabList.appendChild(tabElement);
    });
  }

  async switchToTab(tabId) {
    try {
      await chrome.tabs.update(tabId, { active: true });
      this.showNotification('Tab switched!', 'success');
    } catch (error) {
      this.showNotification('Could not switch tab', 'error');
      console.error(error);
    }
  }

  async groupTabs() {
    try {
      this.showNotification('🔄 Grouping tabs...', 'info');
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const categories = this.categorizeByDomain(tabs);
      for (const [category, tabIds] of Object.entries(categories)) {
        if (tabIds.length > 1) {
          const groupId = await chrome.tabs.group({ tabIds });
          await chrome.tabGroups.update(groupId, { title: category, color: this.getColorForCategory(category) });
        }
      }
      this.showNotification('✅ Tabs grouped successfully!', 'success');
      await this.loadTabs();
    } catch (error) {
      this.showNotification('Failed to group tabs', 'error');
      console.error(error);
    }
  }

  categorizeByDomain(tabs) {
    const categories = {};
    tabs.forEach(tab => {
      try {
        const domain = new URL(tab.url).hostname.replace('www.', '');
        const category = this.getCategory(domain);
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(tab.id);
      } catch (error) {
        if (!categories['Other']) categories['Other'] = [];
        categories['Other'].push(tab.id);
      }
    });
    return categories;
  }

  getCategory(domain) {
    const patterns = {
      'Development': ['github', 'gitlab', 'localhost', 'bitbucket'],
      'Documentation': ['docs', 'mdn', 'stackoverflow', 'devdocs'],
      'Communication': ['slack', 'discord', 'mail', 'teams'],
      'Media': ['youtube', 'spotify', 'netflix', 'twitch'],
      'Shopping': ['amazon', 'ebay', 'shopify'],
      'Social': ['twitter', 'facebook', 'linkedin', 'instagram'],
      'Research': ['wikipedia', 'reddit', 'quora', 'medium']
    };
    for (const [category, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => domain.includes(keyword))) {
        return category;
      }
    }
    return 'Other';
  }

  getColorForCategory(category) {
    const colors = {
      'Development': 'blue',
      'Documentation': 'orange',
      'Communication': 'purple',
      'Media': 'red',
      'Shopping': 'green',
      'Social': 'pink',
      'Research': 'cyan',
      'Other': 'grey'
    };
    return colors[category] || 'grey';
  }

  async saveWorkspace() {
    try {
      const name = prompt('📝 Enter workspace name:');
      if (!name) return;
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const workspace = tabs.map(tab => ({ title: tab.title, url: tab.url, favicon: tab.favIconUrl }));
      const data = await chrome.storage.local.get('workspaces');
      const workspaces = data.workspaces || {};
      workspaces[name] = { workspace, timestamp: new Date().toISOString() };
      await chrome.storage.local.set({ workspaces });
      this.showNotification(`✅ Workspace "${name}" saved!`, 'success');
    } catch (error) {
      this.showNotification('Failed to save workspace', 'error');
      console.error(error);
    }
  }

  async loadWorkspace() {
    try {
      const data = await chrome.storage.local.get('workspaces');
      const workspaces = data.workspaces || {};
      if (Object.keys(workspaces).length === 0) {
        this.showNotification('No saved workspaces found', 'info');
        return;
      }
      const name = prompt(`Available workspaces:\n${Object.keys(workspaces).join(', ')}\n\nEnter workspace name to load:`);
      if (!name || !workspaces[name]) return;
      const savedWorkspace = workspaces[name].workspace;
      for (const tab of savedWorkspace) {
        await chrome.tabs.create({ url: tab.url });
      }
      this.showNotification(`✅ Workspace "${name}" restored!`, 'success');
      await this.loadTabs();
    } catch (error) {
      this.showNotification('Failed to load workspace', 'error');
      console.error(error);
    }
  }

  filterTabs(filter) {
    this.loadTabs(filter);
  }

  updateTabCount(count) {
    this.tabCount.textContent = `${count} tab${count !== 1 ? 's' : ''}`;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.setAttribute('role', 'alert');
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new TabOrganizer();
});
