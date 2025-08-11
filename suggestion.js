// suggestion.js - FINAL, FULLY FUNCTIONAL VERSION

window.DocEditor.SuggestionConfig = {
  // 1. The list of command items.
  items: ({ query }) => {
    // THE FIX IS HERE: The array of objects was missing before the `.filter()` call.
    // This is the correct structure.
    return.filter(item => 
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
      items:,
      command: () => {},

      onStart: (props) => {
        component = document.createElement('div');
        // Use the class name from your correct CSS
        component.className = 'suggestion-items'; 
        
        popup = tippy(document.body, {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
        
        renderer.onUpdate(props);
      },

      onUpdate: (props) => {
        // Update the renderer's state with the latest items and command handler.
        renderer.items = props.items;
        renderer.command = props.command;
        selectedIndex = 0;

        renderer.renderItems();
        renderer.updateSelection();
      },

      onKeyDown: (props) => {
        if (props.event.key === 'ArrowUp') {
          selectedIndex = (selectedIndex + renderer.items.length - 1) % renderer.items.length;
          renderer.updateSelection();
          return true; // Prevent editor from handling the key press
        }
        if (props.event.key === 'ArrowDown') {
          selectedIndex = (selectedIndex + 1) % renderer.items.length;
          renderer.updateSelection();
          return true;
        }
        if (props.event.key === 'Enter') {
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
          child.classList.toggle('is-selected', index === selectedIndex);
        });
        const selected = component.children[selectedIndex];
        if (selected) {
          selected.scrollIntoView({ block: 'nearest' });
        }
      },

      selectItem(index) {
        const item = renderer.items[index];
        if (item) {
          // This now correctly calls the stored command function
          renderer.command(item);
        }
      },

      renderItems() {
        component.innerHTML = '';

        if (renderer.items.length === 0) {
          popup.hide();
          return;
        }

        popup.show();

        renderer.items.forEach((item, index) => {
          const button = document.createElement('button');
          button.className = 'suggestion-item';
          button.textContent = item.title;

          button.addEventListener('click', (e) => {
            e.preventDefault();
            renderer.selectItem(index);
          });

          component.appendChild(button);
        });
      },
    };

    return renderer;
  },
};