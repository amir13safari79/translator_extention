// Track the current selection and modal
let currentSelection: Selection | null = null;
let translationModal: HTMLElement | null = null;
let isTranslating = false;

// Save selection when text is selected
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim().length > 0) {
    currentSelection = selection;
  }
});

// Create and show the translation modal
function showTranslationModal(text: string, isError = false): void {
  // Remove existing modal if any
  removeTranslationModal();

  // Create new modal
  translationModal = document.createElement('div');
  translationModal.className = 'persian-translator-modal';
  
  if (isError) {
    translationModal.classList.add('persian-translator-error');
  }

  // Add content to modal
  translationModal.textContent = text;

  // Position the modal near the selected text
  positionModal();

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'persian-translator-close';
  closeButton.textContent = '×';
  closeButton.onclick = removeTranslationModal;
  translationModal.appendChild(closeButton);

  // Add modal to the DOM
  document.body.appendChild(translationModal);

  // Add event to close modal when clicking outside
  document.addEventListener('mousedown', handleOutsideClick);
}

// Position the modal near the current selection
function positionModal(): void {
  if (!translationModal || !currentSelection) return;

  const range = currentSelection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // Calculate position (above the selection if there's room, below otherwise)
  const modalHeight = 150; // Approximate modal height
  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;
  
  if (spaceBelow >= modalHeight || spaceBelow > spaceAbove) {
    // Position below
    translationModal.style.top = `${rect.bottom + window.scrollY + 10}px`;
  } else {
    // Position above
    translationModal.style.top = `${rect.top + window.scrollY - modalHeight - 10}px`;
  }
  
  // Horizontal positioning (centered on selection)
  translationModal.style.left = `${rect.left + window.scrollX + (rect.width / 2)}px`;
  translationModal.style.transform = 'translateX(-50%)';
}

// Remove the translation modal
function removeTranslationModal(): void {
  if (translationModal) {
    document.removeEventListener('mousedown', handleOutsideClick);
    translationModal.remove();
    translationModal = null;
  }
}

// Handle clicks outside the modal
function handleOutsideClick(event: MouseEvent): void {
  if (translationModal && event.target instanceof Node && !translationModal.contains(event.target)) {
    removeTranslationModal();
  }
}

// Show loading indicator
function showLoadingIndicator(): void {
  isTranslating = true;
  showTranslationModal('در حال ترجمه متن...'); // "Translating text..." in Persian
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message) => {
  switch (message.action) {
    case 'translationStarted':
      showLoadingIndicator();
      break;
    case 'showTranslation':
      isTranslating = false;
      showTranslationModal(message.translation);
      break;
    case 'showError':
      isTranslating = false;
      showTranslationModal(message.error, true);
      break;
  }
  return true;
}); 