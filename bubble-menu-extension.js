// Bubble Menu Extension for Tiptap Editor
// Creates a floating toolbar that appears when text is selected

// Version beacon for debugging
console.log('🎯 Bubble Menu Extension v1.0.4 - Loading...');

// Polling function to wait for Tiptap to be available
function waitForTiptap() {
  return new Promise((resolve) => {
    const checkTiptap = () => {
      if (window.Tiptap && window.Tiptap.BubbleMenu) {
        console.log('✅ Tiptap and BubbleMenu available for bubble menu extension');
        resolve();
      } else {
        console.log('⏳ Waiting for Tiptap and BubbleMenu...');
        setTimeout(checkTiptap, 100);
      }
    };
    checkTiptap();
  });
}

// Bubble Menu Extension
waitForTiptap().then(() => {
  console.log('✅ Creating floating bubble menu extension');
  
  // Create the bubble menu DOM element
  const bubbleMenuElement = document.createElement('div');
  bubbleMenuElement.className = 'bubble-menu';
  bubbleMenuElement.innerHTML = `
    <div class="bubble-menu-content">
      <button class="bubble-menu-btn" data-action="bold" title="Bold (Ctrl+B)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
      </button>
      <button class="bubble-menu-btn" data-action="italic" title="Italic (Ctrl+I)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="4" x2="10" y2="4"></line>
          <line x1="14" y1="20" x2="5" y2="20"></line>
          <line x1="15" y1="4" x2="9" y2="20"></line>
        </svg>
      </button>
      <button class="bubble-menu-btn" data-action="underline" title="Underline (Ctrl+U)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
          <line x1="4" y1="21" x2="20" y2="21"></line>
        </svg>
      </button>
      <div class="bubble-menu-separator"></div>
      <button class="bubble-menu-btn" data-action="link" title="Add Link (Ctrl+K)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </button>
      <button class="bubble-menu-btn" data-action="code" title="Inline Code">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16,18 22,12 16,6"></polyline>
          <polyline points="8,6 2,12 8,18"></polyline>
        </svg>
      </button>
      <div class="bubble-menu-separator"></div>
      <button class="bubble-menu-btn" data-action="heading1" title="Heading 1">H1</button>
      <button class="bubble-menu-btn" data-action="heading2" title="Heading 2">H2</button>
      <button class="bubble-menu-btn" data-action="paragraph" title="Paragraph">P</button>
    </div>
  `;
  
  // Add event listeners to the bubble menu
  bubbleMenuElement.addEventListener('click', (e) => {
    const button = e.target.closest('[data-action]');
    if (!button) return;
    
    e.preventDefault();
    const action = button.getAttribute('data-action');
    
    // Get the current editor instance
    const editor = window.DocEditor?.EditorCore?.editor;
    if (!editor) return;
    
    switch (action) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'underline':
        editor.chain().focus().toggleUnderline().run();
        break;
      case 'code':
        editor.chain().focus().toggleCode().run();
        break;
      case 'link':
        const url = prompt('Enter URL:', 'https://');
        if (url && url !== 'https://') {
          editor.chain().focus().setLink({ href: url }).run();
        }
        break;
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'paragraph':
        editor.chain().focus().setParagraph().run();
        break;
    }
    
    // Update button states
    updateBubbleMenuButtonStates(editor, bubbleMenuElement);
  });
  
  // Function to update button states
  function updateBubbleMenuButtonStates(editor, menuElement) {
    const buttons = menuElement.querySelectorAll('[data-action]');
    buttons.forEach(button => {
      const action = button.getAttribute('data-action');
      let isActive = false;
      
      switch (action) {
        case 'bold':
          isActive = editor.isActive('bold');
          break;
        case 'italic':
          isActive = editor.isActive('italic');
          break;
        case 'underline':
          isActive = editor.isActive('underline');
          break;
        case 'code':
          isActive = editor.isActive('code');
          break;
        case 'link':
          isActive = editor.isActive('link');
          break;
        case 'heading1':
          isActive = editor.isActive('heading', { level: 1 });
          break;
        case 'heading2':
          isActive = editor.isActive('heading', { level: 2 });
          break;
        case 'paragraph':
          isActive = editor.isActive('paragraph');
          break;
      }
      
      button.classList.toggle('is-active', isActive);
    });
  }
  
  // Configure BubbleMenu extension
  const { BubbleMenu } = window.Tiptap;
  
  const BubbleMenuExtension = BubbleMenu.configure({
    element: bubbleMenuElement,
    shouldShow: ({ editor, view, state, oldState, from, to }) => {
      // Only show when there's a text selection
      const { selection } = state;
      const { empty } = selection;
      
      // Don't show if selection is empty
      if (empty) return false;
      
      // Don't show in code blocks or other special nodes
      const { $from } = selection;
      if ($from.parent.type.name === 'codeBlock') return false;
      
      // Update button states when showing
      setTimeout(() => updateBubbleMenuButtonStates(editor, bubbleMenuElement), 10);
      
      return true;
    },
  });

  // Make the extension globally available
  window.DocEditor = window.DocEditor || {};
  window.DocEditor.BubbleMenuExtension = BubbleMenuExtension;
  window.BubbleMenuExtension = BubbleMenuExtension; // Also make it available directly
  console.log('✅ Bubble Menu Extension created and available globally');
  
}).catch(error => {
  console.error('❌ Error creating bubble menu extension:', error);
});
