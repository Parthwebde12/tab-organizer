// Modern Background Service Worker
// ====================================

// Auto-group tabs on startup
chrome.runtime.onInstalled.addListener(() => {
    console.log('DevFlow Tab Organizer installed!');
    chrome.storage.local.set({ version: '3.0.0' });
});

// Message listener for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'GROUP_TABS') {
        autoGroupTabs().then(() => sendResponse({ success: true }));
        return true; // Keep channel open for async response
    } else if (request.action === 'CLEAR_CACHE') {
        chrome.storage.local.clear();
        sendResponse({ success: true });
    }
});

// Advanced tab grouping function
async function autoGroupTabs() {
    try {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        const groups = categorizeAndGroup(tabs);
        for (const [category, config] of Object.entries(groups)) {
            if (config.tabIds.length > 1) {
                const groupId = await chrome.tabs.group({ tabIds: config.tabIds });
                await chrome.tabGroups.update(groupId, { title: category, color: config.color });
            }
        }
        console.log('Tabs grouped successfully');
    } catch (error) {
        console.error('Error grouping tabs:', error);
    }
}

// Categorize tabs by domain
function categorizeAndGroup(tabs) {
    const groups = {};
    const categoryConfig = {
        'Development': { color: 'blue', keywords: ['github', 'gitlab', 'localhost', 'bitbucket', 'vscode', 'replit'] },
        'Docs': { color: 'orange', keywords: ['docs', 'mdn', 'stackoverflow', 'devdocs', 'notion', 'confluence'] },
        'Communication': { color: 'purple', keywords: ['slack', 'discord', 'telegram', 'mail', 'teams', 'zoom'] },
        'Media': { color: 'red', keywords: ['youtube', 'spotify', 'netflix', 'twitch', 'vimeo'] },
        'Shopping': { color: 'green', keywords: ['amazon', 'ebay', 'aliexpress', 'etsy', 'shopify'] },
        'Social': { color: 'pink', keywords: ['twitter', 'facebook', 'linkedin', 'instagram', 'tiktok', 'reddit'] },
        'Research': { color: 'cyan', keywords: ['wikipedia', 'arxiv', 'scholar', 'researchgate', 'medium'] }
    };

    tabs.forEach(tab => {
        try {
            const url = new URL(tab.url).hostname.toLowerCase();
            let category = 'Other';
            for (const [cat, config] of Object.entries(categoryConfig)) {
                if (config.keywords.some(keyword => url.includes(keyword))) {
                    category = cat;
                    break;
                }
            }
            if (!groups[category]) {
                groups[category] = { tabIds: [], color: categoryConfig[category]?.color || 'grey' };
            }
            groups[category].tabIds.push(tab.id);
        } catch (error) {
            if (!groups['Other']) groups['Other'] = { tabIds: [], color: 'grey' };
            groups['Other'].tabIds.push(tab.id);
        }
    });
    return groups;
}

// Suspend inactive tabs to save memory
async function suspendInactiveTabs() {
    try {
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            if (!tab.active && !tab.pinned && tab.url && !tab.url.startsWith('chrome://')) {
                try {
                    await chrome.tabs.discard(tab.id);
                } catch (error) {
                    // Tab might already be discarded or system tab
                }
            }
        }
        console.log('Inactive tabs suspended');
    } catch (error) {
        console.error('Error suspending tabs:', error);
    }
}

// Run suspension every 5 minutes
setInterval(suspendInactiveTabs, 300000);

// Listen for keyboard commands
chrome.commands.onCommand.addListener((command) => {
    if (command === 'group-tabs') {
        autoGroupTabs();
    }
});