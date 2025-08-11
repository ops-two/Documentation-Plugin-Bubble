// suggestion.js - FULLY FUNCTIONAL VERSION

window.DocEditor.SuggestionConfig = {
  // 1. The list of items to suggest, now with command logic.
  items: ({ query }) => {
    const allCommands = [
      {
        title: "Heading 1",
        command: ({ editor, range }) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode("heading", { level: 1 })
            .run(),
      },
      {
        title: "Heading 2",
        command: ({ editor, range }) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode("heading", { level: 2 })
            .run(),
      },
      {
        title: "Bulleted List",
        command: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleBulletList().run(),
      },
      {
        title: "Numbered List",
        command: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
      },
      {
        title: "Image",
        command: ({ editor, range }) => {
          // This is a placeholder for now. We will implement the full image upload logic later.
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

    return allCommands.filter((item) =>
      item.title.toLowerCase().startsWith(query.toLowerCase())
    );
  },

  // 2. The renderer, now with full interactivity.
  render: () => {
    let component,
      popup,
      selectedIndex = 0;

    // Helper to scroll the selected item into view
    const scrollIntoView = () => {
      const item = component.children[selectedIndex];
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    };

    // Helper to update the selection
    const updateSelection = (index) => {
      const allItems = component.querySelectorAll(".suggestion-item");
      allItems.forEach((item, i) => {
        item.classList.toggle("is-selected", i === index);
      });
    };

    const selectItem = (index) => {
      const item = component.items[index];
      if (item) {
        this.command(item); // Execute the command!
      }
    };

    return {
      onStart: (props) => {
        component = document.createElement("div");
        component.className = "suggestion-items";
        component.items = props.items; // Store items for later access

        popup = tippy(document.body, {
          /* ... unchanged ... */
        });

        this.update(props);
        updateSelection(selectedIndex);
      },

      onUpdate: (props) => {
        component.items = props.items;
        this.command = props.command;
        this.renderItems(props.items);
        selectedIndex = 0;
        updateSelection(selectedIndex);
        scrollIntoView();
      },

      onKeyDown: (props) => {
        if (props.event.key === "ArrowUp") {
          selectedIndex =
            (selectedIndex + component.items.length - 1) %
            component.items.length;
          updateSelection(selectedIndex);
          scrollIntoView();
          return true; // Prevent editor from handling the key press
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
        return false;
      },

      onExit: () => {
        if (popup) popup.destroy();
        if (component) component.remove();
      },

      renderItems(items) {
        component.innerHTML = "";
        if (items.length === 0) {
          /* ... unchanged ... */
        }

        items.forEach((item, index) => {
          const button = document.createElement("button");
          button.className = "suggestion-item";
          button.textContent = item.title;

          button.addEventListener("click", () => {
            selectItem(index);
          });

          component.appendChild(button);
        });
      },
    };
  },
};
