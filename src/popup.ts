import { getApiKey, saveApiKey, getApiChoice, saveApiChoice, ApiChoice, dumpStorageContents } from './utils/storage';

// Debug function to check what's stored
async function debugStorage(): Promise<Record<string, any>> {
  console.log('Debugging storage contents:');
  const allStorage = await dumpStorageContents();
  
  const gptKey = await getApiKey('gpt');
  console.log('GPT API Key:', gptKey ? '*'.repeat(gptKey.length) : 'not set');
  
  const grokKey = await getApiKey('grok');
  console.log('Grok API Key:', grokKey ? '*'.repeat(grokKey.length) : 'not set');
  
  const choice = await getApiChoice();
  console.log('API Choice:', choice);
  
  return allStorage;
}

document.addEventListener('DOMContentLoaded', async () => {
  // DOM elements
  const apiChoiceSelect = document.getElementById('api-choice') as HTMLSelectElement;
  const gptApiKeyInput = document.getElementById('gpt-api-key') as HTMLInputElement;
  const grokApiKeyInput = document.getElementById('grok-api-key') as HTMLInputElement;
  const gptSection = document.getElementById('gpt-section') as HTMLDivElement;
  const grokSection = document.getElementById('grok-section') as HTMLDivElement;
  const saveButton = document.getElementById('save-btn') as HTMLButtonElement;
  const testButton = document.getElementById('test-btn') as HTMLButtonElement;
  const statusElement = document.getElementById('status') as HTMLDivElement;
  const debugInfoElement = document.getElementById('debug-info') as HTMLDivElement;

  // Show initial status message to verify the status element is working
  showStatus('Extension loaded. Ready to save API keys.', 'info');
  
  // Debug storage on load
  await debugStorage();
  
  // Load API choice and key if available
  const apiChoice = await getApiChoice();
  apiChoiceSelect.value = apiChoice;
  updateApiSections(apiChoice);

  // Load existing API keys if available
  const gptApiKey = await getApiKey('gpt');
  if (gptApiKey) {
    // Show masked API key for privacy
    gptApiKeyInput.value = '*'.repeat(gptApiKey.length);
    gptApiKeyInput.dataset.hasStoredKey = 'true';
    showStatus(`Found existing GPT API key: ${gptApiKey.substring(0, 4)}...${gptApiKey.substring(gptApiKey.length - 4)}`, 'success');
  } else {
    gptApiKeyInput.dataset.hasStoredKey = 'false';
  }

  const grokApiKey = await getApiKey('grok');
  if (grokApiKey) {
    // Show masked API key for privacy
    grokApiKeyInput.value = '*'.repeat(grokApiKey.length);
    grokApiKeyInput.dataset.hasStoredKey = 'true';
    if (apiChoice === 'grok') {
      showStatus(`Found existing Grok API key: ${grokApiKey.substring(0, 4)}...${grokApiKey.substring(grokApiKey.length - 4)}`, 'success');
    }
  } else {
    grokApiKeyInput.dataset.hasStoredKey = 'false';
  }

  // Handle API choice change
  apiChoiceSelect.addEventListener('change', () => {
    const selectedApiChoice = apiChoiceSelect.value as ApiChoice;
    updateApiSections(selectedApiChoice);
    
    // Show relevant API key status when switching
    if (selectedApiChoice === 'gpt' && gptApiKey) {
      showStatus(`Using GPT API key: ${gptApiKey.substring(0, 4)}...${gptApiKey.substring(gptApiKey.length - 4)}`, 'info');
    } else if (selectedApiChoice === 'grok' && grokApiKey) {
      showStatus(`Using Grok API key: ${grokApiKey.substring(0, 4)}...${grokApiKey.substring(grokApiKey.length - 4)}`, 'info');
    } else {
      showStatus(`Please enter a ${selectedApiChoice.toUpperCase()} API key`, 'info');
    }
  });

  // Function to show/hide API sections based on selection
  function updateApiSections(selectedApiChoice: ApiChoice): void {
    if (selectedApiChoice === 'gpt') {
      gptSection.style.display = 'flex';
      grokSection.style.display = 'none';
    } else {
      gptSection.style.display = 'none';
      grokSection.style.display = 'flex';
    }
  }

  // Handle input changes for GPT
  gptApiKeyInput.addEventListener('input', () => {
    // If the input had a stored key but is now modified, assume the user wants to enter a new key
    if (gptApiKeyInput.dataset.hasStoredKey === 'true' && gptApiKey && gptApiKeyInput.value !== '*'.repeat(gptApiKey.length)) {
      // Clear the input to allow fresh key entry
      gptApiKeyInput.value = '';
      gptApiKeyInput.dataset.hasStoredKey = 'false';
      showStatus('Enter new GPT API key', 'info');
    }
  });

  // Handle input changes for Grok
  grokApiKeyInput.addEventListener('input', () => {
    // If the input had a stored key but is now modified, assume the user wants to enter a new key
    if (grokApiKeyInput.dataset.hasStoredKey === 'true' && grokApiKey && grokApiKeyInput.value !== '*'.repeat(grokApiKey.length)) {
      // Clear the input to allow fresh key entry
      grokApiKeyInput.value = '';
      grokApiKeyInput.dataset.hasStoredKey = 'false';
      showStatus('Enter new Grok API key', 'info');
    }
  });

  // Handle save button click
  saveButton.addEventListener('click', async () => {
    try {
      // Show saving status
      showStatus('Saving settings...', 'info');
      
      debugInfoElement.style.display = 'none';
      const selectedApiChoice = apiChoiceSelect.value as ApiChoice;
      console.log('Saving API choice:', selectedApiChoice);
      await saveApiChoice(selectedApiChoice);
      
      if (selectedApiChoice === 'gpt') {
        await handleApiKeySave(gptApiKeyInput, gptApiKey, 'gpt');
      } else {
        await handleApiKeySave(grokApiKeyInput, grokApiKey, 'grok');
      }
      
      // Debug storage after save
      await debugStorage();
      
      // Force refreshing the keys from storage for verification
      const newGptKey = await getApiKey('gpt');
      const newGrokKey = await getApiKey('grok');
      
      // Display the correct key based on the current selection
      if (selectedApiChoice === 'gpt' && newGptKey) {
        showStatus(`GPT API key saved: ${newGptKey.substring(0, 4)}...${newGptKey.substring(newGptKey.length - 4)}`, 'success');
      } else if (selectedApiChoice === 'grok' && newGrokKey) {
        showStatus(`Grok API key saved: ${newGrokKey.substring(0, 4)}...${newGrokKey.substring(newGrokKey.length - 4)}`, 'success');
      } else {
        showStatus('API key saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showStatus(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  });

  // Handle test button click
  testButton.addEventListener('click', async () => {
    try {
      showStatus('Testing storage...', 'info');
      
      const allStorage = await debugStorage();
      const formattedData = JSON.stringify(allStorage, null, 2);
      
      debugInfoElement.textContent = formattedData;
      debugInfoElement.style.display = 'block';
      
      const selectedApiChoice = apiChoiceSelect.value as ApiChoice;
      const apiKey = await getApiKey(selectedApiChoice);
      
      if (apiKey) {
        showStatus(`Found ${selectedApiChoice.toUpperCase()} API key: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`, 'success');
      } else {
        showStatus(`No ${selectedApiChoice.toUpperCase()} API key found in storage`, 'error');
      }
    } catch (error) {
      console.error('Storage test error:', error);
      showStatus(`Error testing storage: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  });

  // Helper function to handle API key save
  async function handleApiKeySave(inputElement: HTMLInputElement, storedKey: string | undefined, apiType: ApiChoice): Promise<void> {
    const newKey = inputElement.value.trim();
    console.log(`Attempting to save ${apiType} API key:`, newKey ? '*'.repeat(newKey.length) : 'empty');
    
    // If the input still shows masked key, don't save anything
    if (inputElement.dataset.hasStoredKey === 'true' && storedKey && newKey === '*'.repeat(storedKey.length)) {
      console.log(`${apiType} key unchanged, not saving`);
      showStatus(`${apiType.toUpperCase()} API key unchanged`, 'info');
      return;
    }
    
    // Validate key
    if (!newKey) {
      console.log(`Empty ${apiType} key, not saving`);
      showStatus(`Please enter a ${apiType.toUpperCase()} API key`, 'error');
      throw new Error(`Empty ${apiType} API key`);
    }
    
    console.log(`Saving ${apiType} key to storage...`);
    await saveApiKey(newKey, apiType);
    
    // Update the input to show masked API key
    inputElement.value = '*'.repeat(newKey.length);
    inputElement.dataset.hasStoredKey = 'true';
  }

  // Function to show status messages
  function showStatus(message: string, type: 'success' | 'error' | 'info'): void {
    console.log(`Status message (${type}):`, message);
    
    // Make sure the status element exists before trying to use it
    if (!statusElement) {
      console.error('Status element not found in DOM');
      return;
    }
    
    // Update status message and class
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    
    // Make sure the status element is visible
    statusElement.style.display = 'block';
    
    // Clear success or info messages after 30 seconds (longer for debugging)
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        if (statusElement && statusElement.textContent === message) {
          // Don't clear error messages automatically
          statusElement.textContent = '';
          statusElement.className = 'status';
          statusElement.style.display = 'none';
        }
      }, 30000);
    }
  }
}); 