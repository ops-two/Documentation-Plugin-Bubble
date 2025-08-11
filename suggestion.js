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
