/**
 * Storage keys
 */
const STORAGE_KEYS = {
  API_KEY: 'openai_api_key',
  GROK_API_KEY: 'grok_api_key',
  API_CHOICE: 'api_choice',
};

export type ApiChoice = 'gpt' | 'grok';

/**
 * Get the stored API key
 */
export async function getApiKey(apiType?: ApiChoice): Promise<string | undefined> {
  try {
    if (!apiType) {
      const choice = await getApiChoice();
      apiType = choice;
    }
    
    const keyToUse = apiType === 'grok' ? STORAGE_KEYS.GROK_API_KEY : STORAGE_KEYS.API_KEY;
    const result = await chrome.storage.local.get(keyToUse);
    console.log(`Retrieved ${apiType} key from storage:`, result[keyToUse] ? '(key exists)' : '(no key found)');
    return result[keyToUse];
  } catch (error) {
    console.error('Error getting API key:', error);
    return undefined;
  }
}

/**
 * Save the API key to storage
 */
export async function saveApiKey(apiKey: string, apiType: ApiChoice): Promise<void> {
  try {
    if (!apiType) {
      throw new Error('API type is required when saving an API key');
    }
    
    const keyToUse = apiType === 'grok' ? STORAGE_KEYS.GROK_API_KEY : STORAGE_KEYS.API_KEY;
    console.log(`About to save ${apiType} key to storage...`);
    
    // Clear existing storage first
    await chrome.storage.local.remove(keyToUse);
    
    // Then set the new value
    const dataToStore = { [keyToUse]: apiKey };
    await chrome.storage.local.set(dataToStore);
    console.log(`Saved ${apiType} key:`, dataToStore);
    
    // Verify the key was saved
    const result = await chrome.storage.local.get(keyToUse);
    console.log(`Verification - ${apiType} key in storage:`, result[keyToUse] ? '(key exists)' : '(no key found)');
    
    if (!result[keyToUse]) {
      console.warn(`Failed to save ${apiType} API key: verification failed`);
      throw new Error(`Failed to save ${apiType} API key`);
    }
  } catch (error) {
    console.error(`Error saving ${apiType} API key:`, error);
    throw error; // Re-throw to allow the UI to show an error
  }
}

/**
 * Clear the API key from storage
 */
export async function clearApiKey(apiType: ApiChoice): Promise<void> {
  try {
    const keyToUse = apiType === 'grok' ? STORAGE_KEYS.GROK_API_KEY : STORAGE_KEYS.API_KEY;
    await chrome.storage.local.remove(keyToUse);
  } catch (error) {
    console.error(`Error clearing ${apiType} API key:`, error);
  }
}

/**
 * Get the selected API choice
 */
export async function getApiChoice(): Promise<ApiChoice> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.API_CHOICE);
    return (result[STORAGE_KEYS.API_CHOICE] as ApiChoice) || 'gpt';
  } catch (error) {
    console.error('Error getting API choice:', error);
    return 'gpt'; // Default to GPT if there's an error
  }
}

/**
 * Save the API choice to storage
 */
export async function saveApiChoice(choice: ApiChoice): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.API_CHOICE]: choice });
  } catch (error) {
    console.error('Error saving API choice:', error);
    throw error;
  }
}

/**
 * Dump all storage contents for debugging
 */
export async function dumpStorageContents(): Promise<Record<string, any>> {
  try {
    const allData = await chrome.storage.local.get(null);
    console.log('All storage contents:', allData);
    return allData;
  } catch (error) {
    console.error('Error dumping storage:', error);
    return {};
  }
} 