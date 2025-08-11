// suggestion.js - FULLY FUNCTIONAL VERSION

window.DocEditor.SuggestionConfig = {
  // 1. The list of items to suggest, now with the actual command logic.
  items: ({ query }) => {
    const allCommands = [
      {
        title: "Heading 1",
        command: ({ editor, range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode("heading", { level: 1 })
            .run();
        },
      },
      {
        title: "Heading 2",
        command: ({ editor, range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode("heading", { level: 2 })
            .run();
        },
      },
      {
        title: "Bulleted List",
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
      },
      {
        title: "Numbered List",
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
      },
      {
        title: "Image",
        command: ({ editor, range }) => {
          // This is a placeholder for now. The full image upload logic will replace this.
          const url = window.prompt("Enter image URL");
          if (url) {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setImage({ src: url })
              .run();
          }
        },
      },
    ];

    // Simple filter logic to match items based on the user's query
    return allCommands.filter((item) =>
      item.title.toLowerCase().startsWith(query.toLowerCase())
    );
  },

  // 2. The renderer, now with full keyboard and mouse interactivity.
  render: () => {
    let component;
    let popup;
    let selectedIndex = 0;

    // Helper function to scroll the selected item into the visible area of the popup
    const scrollIntoView = () => {
      if (component && component.children[selectedIndex]) {
        component.children[selectedIndex].scrollIntoView({ block: "nearest" });
      }
    };

    // Helper function to update which item is visually marked as "selected"
    const updateSelection = (index) => {
      const allItems = component.querySelectorAll(".suggestion-item");
      allItems.forEach((item, i) => {
        item.classList.toggle("is-selected", i === index);
      });
    };

    // Helper function to execute the command of the selected item
    const selectItem = (index) => {
      const item = component.items[index];
      if (item) {
        // 'this.command' is a function provided by Tiptap's suggestion utility
        // that we execute, passing our item object to it.
        this.command(item);
      }
    };

    return {
      // onStart is called when the suggestion should appear
      onStart: (props) => {
        component = document.createElement("div");
        component.className = "suggestion-items";
        component.items = props.items; // Store the items array for later access

        popup = tippy(document.body, {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });

        // Render the initial list of items
        this.renderItems(props.items);
        // Set the first item as selected
        updateSelection(selectedIndex);
      },

      // onUpdate is called when the query changes (e.g., user types more letters)
      onUpdate: (props) => {
        component.items = props.items;
        this.command = props.command;
        this.renderItems(props.items);
        selectedIndex = 0;
        updateSelection(selectedIndex);
        scrollIntoView();
      },

      // onKeyDown is called when the user presses a key while the popup is open
      onKeyDown: (props) => {
        if (props.event.key === "ArrowUp") {
          selectedIndex =
            (selectedIndex + component.items.length - 1) %
            component.items.length;
          updateSelection(selectedIndex);
          scrollIntoView();
          return true; // Prevents the editor from handling this key press
        }
        if (props.event.key === "ArrowDown") {
          selectedIndex = (selectedIndex + 1) % component.items.length;
          updateSelection(selectedIndex);
          scrollIntoView();
          return true;
        }
        if (props.event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        if (props.event.key === "Escape") {
          popup.hide();
          return true;
        }
        return false; // Let the editor handle other keys
      },

      // onExit is called when the suggestion should disappear
      onExit: () => {
        if (popup) popup.destroy();
        if (component) component.remove();
      },

      // renderItems is our internal helper to draw the list of buttons
      renderItems(items) {
        component.innerHTML = ""; // Clear previous items

        if (items.length === 0) {
          component.innerHTML = "No results";
          return;
        }

        items.forEach((item, index) => {
          const button = document.createElement("button");
          button.className = "suggestion-item";
          button.textContent = item.title;

          button.addEventListener("click", (e) => {
            e.preventDefault();
            selectItem(index);
          });

          component.appendChild(button);
        });
      },
    };
  },
};
