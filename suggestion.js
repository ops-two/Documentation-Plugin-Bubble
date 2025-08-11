// suggestion.js

window.DocEditor.SuggestionConfig = {
  // 1. The list of items to suggest.
  // We'll add icons and descriptions later. For now, just titles.
  items: ({ query }) => {
    const allCommands = [
      { title: "Heading 1" },
      { title: "Heading 2" },
      { title: "Bulleted List" },
      { title: "Numbered List" },
      { title: "Image" },
    ];

    // Simple filter logic
    return allCommands.filter((item) =>
      item.title.toLowerCase().startsWith(query.toLowerCase())
    );
  },

  // 2. The renderer. This is pure vanilla JavaScript for creating the popup.
  render: () => {
    let component;
    let popup;

    return {
      // Called when the suggestion begins
      onStart: (props) => {
        // Create the main container for the list items
        component = document.createElement("div");
        component.className = "suggestion-items"; // Style from our CSS

        // Create the tippy.js popup instance to hold our list
        // Note: Tiptap includes a lightweight popup library internally.
        popup = tippy(document.body, {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });

        // Initial render of the items
        this.update(props);
      },

      // Called on every keystroke while the suggestion is active
      onUpdate(props) {
        // Pass the new items and command handler to the renderer
        this.command = props.command;
        this.renderItems(props.items);
      },

      // Called when a key is pressed
      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup.hide();
          return true;
        }
        // We will add arrow key navigation later. For now, this is enough.
        return false;
      },

      // Called when the suggestion ends
      onExit() {
        if (popup) popup.destroy();
        if (component) component.remove();
      },

      // Helper function to render the actual list items
      renderItems(items) {
        if (!component) return;

        // Clear previous items
        component.innerHTML = "";

        if (items.length === 0) {
          component.innerHTML = "No results";
          return;
        }

        items.forEach((item, index) => {
          const button = document.createElement("button");
          button.className = "suggestion-item"; // Style from our CSS
          button.textContent = item.title;

          // We will wire this up in the next step. For now, it does nothing.
          button.addEventListener("click", () => {
            console.log(`Clicked on: ${item.title}`);
          });

          component.appendChild(button);
        });
      },
    };
  },
};
