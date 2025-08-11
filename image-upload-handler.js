// image-upload-handler.js - Tiptap Image Upload Extension with MinIO Integration
// Version: 1.0

console.log('image-upload-handler.js v1.1 loaded - with bubble menu support');

// Wait for Tiptap to be available
function waitForTiptap() {
  return new Promise((resolve) => {
    const checkTiptap = () => {
      if (window.Tiptap && window.Tiptap.Extension && window.ApiBridge) {
        resolve();
      } else {
        setTimeout(checkTiptap, 100);
      }
    };
    checkTiptap();
  });
}

// Image Upload Utilities
const ImageUploadUtils = {
  // Validate image file
  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxDimensions = 5000; // 5000px

    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
    }

    if (file.size > maxSize) {
      throw new Error('Image file size must be less than 10MB');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        if (img.width > maxDimensions || img.height > maxDimensions) {
          reject(new Error('Image dimensions must be less than 5000x5000 pixels'));
        } else {
          resolve({
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height
          });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Invalid image file'));
      };
      
      img.src = url;
    });
  },

  // Upload image to MinIO via backend
  async uploadImage(file) {
    try {
      console.log('📸 Starting image upload:', file.name);
      
      // Validate the file first
      const imageInfo = await this.validateImageFile(file);
      console.log('✅ Image validation passed:', imageInfo);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('image', file);

      // Upload to backend
      const response = await fetch('http://localhost:3000/api/images/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      console.log('✅ Image uploaded successfully:', result.url);
      
      return {
        url: result.url,
        filename: result.filename,
        originalName: result.originalName,
        size: result.size,
        mimeType: result.mimeType,
        ...imageInfo
      };

    } catch (error) {
      console.error('❌ Image upload failed:', error);
      throw error;
    }
  },

  // Create loading placeholder
  createLoadingPlaceholder() {
    return {
      type: 'image',
      attrs: {
        src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9IiM5Q0EzQUYiLz4KPGF0ZXh0IHg9IjIwMCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM3NDhGIiBmb250LWZhbWlseT0iSW50ZXIiIGZvbnQtc2l6ZT0iMTQiPkxvYWRpbmcuLi48L3RleHQ+Cjwvc3ZnPgo=',
        alt: 'Loading image...',
        title: 'Uploading image...',
        'data-loading': 'true'
      }
    };
  }
};

// Tiptap Image Upload Extension
async function createImageUploadExtension() {
  await waitForTiptap();
  
  console.log('🖼️ Creating Image Upload Extension');

  const ImageUploadExtension = window.Tiptap.Extension.create({
    name: 'imageUpload',
    
    addOptions() {
      return {
        types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 10 * 1024 * 1024, // 10MB
        maxDimensions: 5000,
        uploadFunction: ImageUploadUtils.uploadImage.bind(ImageUploadUtils)
      };
    },

    addCommands() {
      return {
        uploadImage: (file) => ({ commands, editor }) => {
          return this.uploadImageFile(file, commands, editor);
        }
      };
    },

    uploadImageFile(file, commands, editor) {
      return new Promise(async (resolve, reject) => {
        try {
          // Insert loading placeholder
          const loadingPlaceholder = ImageUploadUtils.createLoadingPlaceholder();
          const pos = editor.state.selection.from;
          
          commands.insertContent(loadingPlaceholder);
          console.log('📝 Loading placeholder inserted');

          // Upload the image
          const uploadResult = await this.options.uploadFunction(file);
          
          // Find and replace the loading placeholder with the actual image
          const { state } = editor;
          let placeholderPos = null;
          
          state.doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs['data-loading']) {
              placeholderPos = pos;
              return false; // Stop searching
            }
          });

          if (placeholderPos !== null) {
            // Replace placeholder with actual image
            const tr = state.tr.setNodeMarkup(placeholderPos, null, {
              src: uploadResult.url,
              alt: uploadResult.originalName,
              title: uploadResult.originalName,
              'data-filename': uploadResult.filename,
              'data-size': uploadResult.size
            });
            
            editor.view.dispatch(tr);
            console.log('✅ Image placeholder replaced with uploaded image');
          }

          resolve(uploadResult);
        } catch (error) {
          console.error('❌ Image upload failed:', error);
          
          // Remove loading placeholder on error
          const { state } = editor;
          state.doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs['data-loading']) {
              const tr = state.tr.delete(pos, pos + node.nodeSize);
              editor.view.dispatch(tr);
              return false;
            }
          });
          
          // Show error message
          alert(`Image upload failed: ${error.message}`);
          reject(error);
        }
      });
    },

    addProseMirrorPlugins() {
      const extension = this;
      
      return [
        new window.Tiptap.PluginKey('imageUploadDrop').plugin({
          props: {
            handleDrop(view, event, slice, moved) {
              // Only handle external file drops (not internal moves)
              if (moved || !event.dataTransfer || !event.dataTransfer.files || !event.dataTransfer.files[0]) {
                return false;
              }

              const files = Array.from(event.dataTransfer.files);
              const imageFiles = files.filter(file => file.type.startsWith('image/'));
              
              if (imageFiles.length === 0) {
                return false; // No image files, let default handler take over
              }

              // Prevent default drop behavior
              event.preventDefault();
              
              // Get drop position
              const coordinates = view.posAtCoords({ 
                left: event.clientX, 
                top: event.clientY 
              });
              
              if (!coordinates) return true;

              // Set cursor position to drop location
              const tr = view.state.tr.setSelection(
                window.Tiptap.TextSelection.create(view.state.doc, coordinates.pos)
              );
              view.dispatch(tr);

              // Upload each image file
              imageFiles.forEach(file => {
                extension.uploadImageFile(file, view.state.commands || {
                  insertContent: (content) => {
                    const insertTr = view.state.tr.insert(view.state.selection.from, 
                      view.state.schema.nodes.image.create(content.attrs));
                    view.dispatch(insertTr);
                  }
                }, { 
                  state: view.state, 
                  view: view 
                });
              });

              return true; // Handled
            },

            handlePaste(view, event, slice) {
              const items = Array.from(event.clipboardData?.items || []);
              const imageItems = items.filter(item => item.type.startsWith('image/'));
              
              if (imageItems.length === 0) {
                return false; // No images, use default paste
              }

              // Prevent default paste
              event.preventDefault();
              
              // Handle pasted images
              imageItems.forEach(item => {
                const file = item.getAsFile();
                if (file) {
                  extension.uploadImageFile(file, view.state.commands || {
                    insertContent: (content) => {
                      const tr = view.state.tr.insert(view.state.selection.from, 
                        view.state.schema.nodes.image.create(content.attrs));
                      view.dispatch(tr);
                    }
                  }, { 
                    state: view.state, 
                    view: view 
                  });
                }
              });

              return true; // Handled
            }
          }
        })
      ];
    }
  });

  // Store extension globally
  window.DocEditor = window.DocEditor || {};
  window.DocEditor.ImageUploadExtension = ImageUploadExtension;
  
  console.log('✅ Image Upload Extension created successfully');
  return ImageUploadExtension;
}

// Initialize the extension
createImageUploadExtension().catch(error => {
  console.error('❌ Failed to create Image Upload Extension:', error);
});

// Bubble Menu Extension - Added to existing file to avoid 404 errors
waitForTiptap().then(() => {
  if (!window.Tiptap.BubbleMenu) {
    console.warn('⚠️ BubbleMenu not available, skipping bubble menu creation');
    return;
  }
  
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