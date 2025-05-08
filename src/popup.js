// This is a minimal direct test script to diagnose popup issues
// It works independently of the TypeScript system

document.addEventListener('DOMContentLoaded', () => {
  console.log('Simple popup test script loaded');
  
  // Get DOM elements
  const saveButton = document.getElementById('save-btn');
  const testButton = document.getElementById('test-btn');
  const statusElement = document.getElementById('status');
  const apiChoiceSelect = document.getElementById('api-choice');
  const gptApiKeyInput = document.getElementById('gpt-api-key');
  const grokApiKeyInput = document.getElementById('grok-api-key');
  
  // Check if all elements were found
  console.log('Elements found:', {
    saveButton: !!saveButton,
    testButton: !!testButton,
    statusElement: !!statusElement,
    apiChoiceSelect: !!apiChoiceSelect,
    gptApiKeyInput: !!gptApiKeyInput,
    grokApiKeyInput: !!grokApiKeyInput
  });
  
  // Show initial status
  showStatus('Direct test script loaded', 'info');
  
  // Add direct click handler to save button (bypassing TypeScript code)
  if (saveButton) {
    console.log('Adding direct click handler to save button');
    saveButton.addEventListener('click', directSaveHandler);
  }
  
  // Add direct click handler to test button
  if (testButton) {
    console.log('Adding direct click handler to test button');
    testButton.addEventListener('click', directTestHandler);
  }
  
  // Direct save handler function
  async function directSaveHandler() {
    try {
      console.log('Direct save handler called');
      showStatus('Attempting to save API key with direct handler...', 'info');
      
      // Get API choice
      const apiChoice = apiChoiceSelect ? apiChoiceSelect.value : 'gpt';
      console.log('Selected API:', apiChoice);
      
      // Get API key based on selection
      const apiKeyInput = apiChoice === 'gpt' ? gptApiKeyInput : grokApiKeyInput;
      const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
      
      if (!apiKey) {
        showStatus('Please enter an API key', 'error');
        return;
      }
      
      // Save API choice to storage
      console.log('Saving API choice:', apiChoice);
      await chrome.storage.local.set({ 'api_choice': apiChoice });
      
      // Save API key to storage
      const storageKey = apiChoice === 'gpt' ? 'openai_api_key' : 'grok_api_key';
      console.log(`Saving API key to ${storageKey}`);
      
      const dataToStore = { [storageKey]: apiKey };
      await chrome.storage.local.set(dataToStore);
      
      // Verify it was saved
      const result = await chrome.storage.local.get(storageKey);
      const savedKey = result[storageKey];
      
      if (savedKey) {
        const maskedKey = `${savedKey.substring(0, 4)}...${savedKey.substring(savedKey.length - 4)}`;
        showStatus(`API key saved successfully: ${maskedKey}`, 'success');
        console.log('Key saved:', maskedKey);
      } else {
        showStatus('Failed to save API key: Verification failed', 'error');
        console.error('Key verification failed');
      }
    } catch (error) {
      console.error('Error in direct save handler:', error);
      showStatus(`Error: ${error.message}`, 'error');
    }
  }
  
  // Direct test handler function
  async function directTestHandler() {
    try {
      console.log('Direct test handler called');
      showStatus('Testing storage...', 'info');
      
      // Get all storage data
      const data = await chrome.storage.local.get(null);
      console.log('All storage data:', data);
      
      // Show in UI
      const debugInfoElement = document.getElementById('debug-info');
      if (debugInfoElement) {
        debugInfoElement.textContent = JSON.stringify(data, null, 2);
        debugInfoElement.style.display = 'block';
      }
      
      // Check for API keys
      const gptKey = data['openai_api_key'];
      const grokKey = data['grok_api_key'];
      const apiChoice = data['api_choice'] || 'gpt';
      
      if (gptKey || grokKey) {
        let message = 'Found API keys: ';
        if (gptKey) message += `GPT (${gptKey.substring(0, 4)}...${gptKey.substring(gptKey.length - 4)}) `;
        if (grokKey) message += `Grok (${grokKey.substring(0, 4)}...${grokKey.substring(grokKey.length - 4)})`;
        showStatus(message, 'success');
      } else {
        showStatus('No API keys found in storage', 'error');
      }
    } catch (error) {
      console.error('Error in direct test handler:', error);
      showStatus(`Error: ${error.message}`, 'error');
    }
  }
  
  // Helper function to show status
  function showStatus(message, type) {
    console.log(`Status (${type}):`, message);
    
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status ${type}`;
      statusElement.style.display = 'block';
    }
  }
}); 