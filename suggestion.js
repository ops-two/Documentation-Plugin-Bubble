// suggestion.js - FINAL, CORRECTED, AND TESTED VERSION

window.DocEditor.SuggestionConfig = {
  // The `items` function is correct and remains unchanged.
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

  // --- THIS IS THE CORRECTED RENDER FUNCTION ---
  render: () => {
    let component;
    let popup;
    let selectedIndex = 0;

    // This object will be the context (`this`) for all methods below.
    const renderer = {
      onStart: (props) => {
        component = document.createElement("div");
        component.className = "suggestion-items";

        popup = tippy(document.body, {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });

        renderer.onUpdate(props); // Use the renderer's context
      },

      onUpdate: (props) => {
        renderer.renderItems(props.items, props.command); // Use the renderer's context
        selectedIndex = 0;
        renderer.updateSelection(selectedIndex);
      },

      onKeyDown: (props) => {
        if (props.event.key === "ArrowUp") {
          selectedIndex =
            (selectedIndex + component.items.length - 1) %
            component.items.length;
          renderer.updateSelection(selectedIndex);
          return true;
        }
        if (props.event.key === "ArrowDown") {
          selectedIndex = (selectedIndex + 1) % component.items.length;
          renderer.updateSelection(selectedIndex);
          return true;
        }
        if (props.event.key === "Enter") {
          renderer.selectItem(selectedIndex);
          return true;
        }
        return false;
      },

      onExit: () => {
        if (popup) popup.destroy();
        if (component) component.remove();
      },

      // Helper functions are now methods of the renderer object
      updateSelection(index) {
        const allItems = component.querySelectorAll(".suggestion-item");
        allItems.forEach((item, i) => {
          item.classList.toggle("is-selected", i === index);
        });
        const selected = component.children[index];
        if (selected) {
          selected.scrollIntoView({ block: "nearest" });
        }
      },

      selectItem(index) {
        const item = component.items[index];
        if (item) {
          this.command(item); // this.command comes from onUpdate
        }
      },

      renderItems(items, command) {
        component.innerHTML = "";
        component.items = items; // Store for keydown handlers
        this.command = command; // Store for selectItem

        if (items.length === 0) {
          component.style.display = "none";
          return;
        }

        component.style.display = "";

        items.forEach((item, index) => {
          const button = document.createElement("button");
          button.className = "suggestion-item";
          button.textContent = item.title;

          button.addEventListener("click", (e) => {
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
