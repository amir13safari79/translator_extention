import { translateText } from './utils/api';
import { getApiKey, getApiChoice } from './utils/storage';

// Keep service worker alive
const keepAlive = () => {
  setInterval(() => {
    console.log('Background service worker: heartbeat');
  }, 20000); // Heartbeat every 20 seconds
};

// Make sure service worker doesn't terminate
keepAlive();

// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'translate-to-persian',
    title: 'Translate to Persian',
    contexts: ['selection'],
  });
  console.log('Context menu created');
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'translate-to-persian' && tab?.id) {
    console.log('Translation requested');
    // Process translation in a separate function without awaiting directly
    handleTranslation(info, tab);
  }
});

// Process translation separately to avoid blocking the contextMenu handler
async function handleTranslation(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
  if (!tab.id) return;
  
  try {
    // Notify content script that translation is starting
    await chrome.tabs.sendMessage(tab.id, {
      action: 'translationStarted'
    });
    
    const apiChoice = await getApiChoice();
    const apiKey = await getApiKey(apiChoice);
    
    if (!apiKey) {
      console.log('API key not set');
      // Notify user to set API key
      await chrome.tabs.sendMessage(tab.id, {
        action: 'showError',
        error: `${apiChoice.toUpperCase()} API key not set. Please click the extension icon and set your API key.`
      });
      return;
    }

    // Get the selected text and translate it
    const selectedText = info.selectionText || '';
    console.log(`Translating text (${selectedText.length} chars) using ${apiChoice}`);
    
    const translation = await translateText(selectedText, apiKey, apiChoice);
    console.log('Translation received, sending to content script');

    // Send translation back to content script
    await chrome.tabs.sendMessage(tab.id, {
      action: 'showTranslation',
      translation
    });
  } catch (error) {
    console.error('Translation error:', error);
    
    // Send error to content script
    if (tab.id) {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'showError',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Message received in background script:', message);
  
  // Always respond to keep message channel alive
  sendResponse({ received: true });
  return false; // No async response
}); 