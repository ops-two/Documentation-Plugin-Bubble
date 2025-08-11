// suggestion.js - FINAL, FULLY FUNCTIONAL VERSION
console.log('suggestion.js v1.1 loaded');

// Version beacon for debugging
window.DocEditor = window.DocEditor || {};
window.DocEditor._suggestionVersion = '1.1';

window.DocEditor.SuggestionConfig = {
  // 1. The list of command items.
  items: ({ query }) => {
    const commands = [
      {
        title: "Bold",
        command: ({ editor }) => editor.chain().focus().toggleBold().run(),
      },
      {
        title: "Italic",
        command: ({ editor }) => editor.chain().focus().toggleItalic().run(),
      },
      {
        title: "Underline",
        command: ({ editor }) => editor.chain().focus().toggleUnderline().run(),
      },
      {
        title: "Strike",
        command: ({ editor }) => editor.chain().focus().toggleStrike().run(),
      },
      {
        title: "Code",
        command: ({ editor }) => editor.chain().focus().toggleCode().run(),
      },
      {
        title: "Heading 1",
        command: ({ editor }) =>
          editor.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        title: "Heading 2",
        command: ({ editor }) =>
          editor.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        title: "Heading 3",
        command: ({ editor }) =>
          editor.chain().focus().toggleHeading({ level: 3 }).run(),
      },
      {
        title: "Bullet List",
        command: ({ editor }) =>
          editor.chain().focus().toggleBulletList().run(),
      },
      {
        title: "Ordered List",
        command: ({ editor }) =>
          editor.chain().focus().toggleOrderedList().run(),
      },
      {
        title: "Blockquote",
        command: ({ editor }) =>
          editor.chain().focus().toggleBlockquote().run(),
      },
      {
        title: "Code Block",
        command: ({ editor }) => editor.chain().focus().toggleCodeBlock().run(),
      },
      {
        title: "Upload Image",
        command: ({ editor }) => {
          try {
            console.log('📸 Upload Image command triggered');
            
            // Create a file input element to trigger file selection
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            
            input.onchange = async (e) => {
              try {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                  console.log(`📸 Starting image upload from slash command: ${file.name}`);
                  
                  // Get cursor position
                  const { state } = editor;
                  const { selection } = state;
                  const pos = selection.from;
                  
                  // Insert loading placeholder
                  const loadingNode = state.schema.nodes.paragraph.create({}, [
                    state.schema.text('🔄 Uploading image...')
                  ]);
                  
                  const tr = state.tr.insert(pos, loadingNode);
                  editor.view.dispatch(tr);
                  
                  // Upload to backend
                  const uploadEndpoint = 'http://localhost:3000/api/images/upload';
                  
                  if (window.ApiBridge && window.ApiBridge.uploadImage) {
                    try {
                      const result = await window.ApiBridge.uploadImage(file, uploadEndpoint);
                      console.log(`✅ Image uploaded successfully: ${result.url}`);
                      
                      // Replace placeholder with actual image
                      const currentState = editor.state;
                      const imageNode = currentState.schema.nodes.image.create({
                        src: result.url,
                        alt: result.originalName || file.name,
                        title: result.originalName || file.name
                      });
                      
                      // Find and replace the loading placeholder
                      const newTr = currentState.tr.replaceWith(pos, pos + loadingNode.nodeSize, imageNode);
                      editor.view.dispatch(newTr);
                      
                      console.log('✅ Image placeholder replaced with uploaded image');
                    } catch (error) {
                      console.error('❌ Image upload failed:', error);
                      
                      // Replace placeholder with error message
                      const currentState = editor.state;
                      const errorNode = currentState.schema.nodes.paragraph.create({}, [
                        currentState.schema.text(`❌ Upload failed: ${error.message}`)
                      ]);
                      
                      const newTr = currentState.tr.replaceWith(pos, pos + loadingNode.nodeSize, errorNode);
                      editor.view.dispatch(newTr);
                    }
                  } else {
                    console.error('❌ ApiBridge not available for image upload');
                    
                    // Replace placeholder with error message
                    const currentState = editor.state;
                    const errorNode = currentState.schema.nodes.paragraph.create({}, [
                      currentState.schema.text('❌ ApiBridge not available')
                    ]);
                    
                    const newTr = currentState.tr.replaceWith(pos, pos + loadingNode.nodeSize, errorNode);
                    editor.view.dispatch(newTr);
                  }
                } else {
                  console.log('❌ No valid image file selected');
                }
                
                // Clean up
                if (document.body.contains(input)) {
                  document.body.removeChild(input);
                }
              } catch (error) {
                console.error('❌ Error in file selection handler:', error);
                
                // Clean up
                if (document.body.contains(input)) {
                  document.body.removeChild(input);
                }
              }
            };
            
            // Trigger file selection
            document.body.appendChild(input);
            input.click();
            
          } catch (error) {
            console.error('❌ Error in Upload Image command:', error);
          }
        },
      },
      {
        title: "YouTube Embed",
        command: ({ editor }) => {
          const url = prompt('Enter YouTube URL:');
          if (url) {
            editor.chain().focus().setEmbed({ url, type: 'youtube' }).run();
          }
        },
      },
      {
        title: "Twitter Embed",
        command: ({ editor }) => {
          const url = prompt('Enter Twitter/X URL:');
          if (url) {
            editor.chain().focus().setEmbed({ url, type: 'twitter' }).run();
          }
        },
      },
      {
        title: "Generic Embed",
        command: ({ editor }) => {
          const url = prompt('Enter URL to embed:');
          if (url) {
            editor.chain().focus().setEmbed({ url, type: 'generic' }).run();
          }
        },
      },
    ];

    return commands.filter((item) =>
      item.title.toLowerCase().startsWith(query.toLowerCase())
    );
  },

  // 2. The complete renderer with full interactivity.
  render: () => {
    let component;
    let popup;
    let selectedIndex = 0;

    // This object holds all the functions and state to ensure `this` context is correct.
    const renderer = {
      // These properties will be populated by onUpdate to hold the current state.
      items: [],
      command: () => {},

      onStart: (props) => {
        component = document.createElement("div");
        // Use the class name from your correct CSS
        component.className = "suggestion-items";
        
        // Critical: Set tabindex to make it focusable
        component.setAttribute('tabindex', '-1');
        
        // Store the editor reference for focus management
        renderer.editor = props.editor;

        popup = tippy(document.body, {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
          // Critical fixes for interactivity
          hideOnClick: false,
          allowHTML: true,
          arrow: false,
          offset: [0, 8],
          // Ensure proper z-index
          zIndex: 9999,
          // Prevent auto-hiding when clicking inside
          onShow(instance) {
            // Prevent the popup from hiding when clicking inside
            instance.popper.addEventListener('mousedown', (e) => {
              e.preventDefault();
              e.stopPropagation();
            });
          }
        });

        renderer.onUpdate(props);
      },

      onUpdate: (props) => {
        // Update the renderer's state with the latest items and command handler.
        renderer.items = props.items;
        renderer.command = props.command;
        renderer.range = props.range; // Store the range for text replacement
        renderer.editor = props.editor; // Store the editor instance
        selectedIndex = 0;

        renderer.renderItems();
        renderer.updateSelection();
      },

      onKeyDown: (props) => {
        if (props.event.key === "ArrowUp") {
          selectedIndex =
            (selectedIndex + renderer.items.length - 1) % renderer.items.length;
          renderer.updateSelection();
          return true; // Prevent editor from handling the key press
        }
        if (props.event.key === "ArrowDown") {
          selectedIndex = (selectedIndex + 1) % renderer.items.length;
          renderer.updateSelection();
          return true;
        }
        if (props.event.key === "Enter") {
          props.event.preventDefault();
          renderer.selectItem(selectedIndex);
          return true;
        }
        return false; // Let the editor handle other keys
      },

      onExit: () => {
        if (popup) popup.destroy();
        if (component) component.remove();
      },

      // --- HELPER FUNCTIONS ---

      updateSelection() {
        Array.from(component.children).forEach((child, index) => {
          child.classList.toggle("is-selected", index === selectedIndex);
        });
        const selected = component.children[selectedIndex];
        if (selected) {
          selected.scrollIntoView({ block: "nearest" });
        }
      },

      selectItem(index) {
        const item = renderer.items[index];
        if (item && renderer.editor && renderer.range) {
          console.log(`Executing command: ${item.title}`);
          
          // Hide popup first
          if (popup) {
            popup.hide();
          }
          
          // Execute the command with proper context - this is the key fix!
          try {
            // First, delete the trigger character ("/") using the range
            // Then apply the formatting command
            renderer.editor
              .chain()
              .focus()
              .deleteRange(renderer.range)
              .run();
            
            // Now execute the actual formatting command
            item.command({ editor: renderer.editor });
            
            console.log(`Command executed successfully: ${item.title}`);
          } catch (error) {
            console.error(`Error executing command ${item.title}:`, error);
          }
        } else {
          console.error('Missing required data for command execution', { 
            item, 
            editor: renderer.editor, 
            range: renderer.range 
          });
        }
      },

      renderItems() {
        component.innerHTML = "";

        if (renderer.items.length === 0) {
          popup.hide();
          return;
        }

        popup.show();

        renderer.items.forEach((item, index) => {
          const button = document.createElement("button");
          button.className = "suggestion-item";
          button.textContent = item.title;
          button.type = "button"; // Explicit button type
          button.setAttribute('data-index', index);
          
          // Multiple event handlers for better compatibility
          button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Suggestion clicked: ${item.title}`);
            renderer.selectItem(index);
          });
          
          button.addEventListener("mousedown", (e) => {
            e.preventDefault();
            e.stopPropagation();
          });
          
          // Add hover effect
          button.addEventListener("mouseenter", () => {
            selectedIndex = index;
            renderer.updateSelection();
          });

          component.appendChild(button);
        });
        
        // Ensure initial selection is visible
        renderer.updateSelection();
      },
    };

    return renderer;
  },
};
