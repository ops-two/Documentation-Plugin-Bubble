// suggestion.js - FINAL, FULLY FUNCTIONAL VERSION

window.DocEditor.SuggestionConfig = {
  // 1. The list of command items.
  items: ({ query }) => {
    return [
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
    ].filter((item) =>
      item.title.toLowerCase().startsWith(query.toLowerCase())
    );
  },

  // 2. The complete renderer with full interactivity.
  render: () => {
    let component;
    let popup;
    let selectedIndex = 0;

    // This object holds all the functions to ensure `this` context is correct.
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

        renderer.onUpdate(props);
      },

      onUpdate: (props) => {
        // Update the items and command handler, then re-render the list.
        renderer.renderItems(props.items, props.command);
        selectedIndex = 0;
        renderer.updateSelection();
      },

      onKeyDown: (props) => {
        if (props.event.key === "ArrowUp") {
          selectedIndex =
            (selectedIndex + component.children.length - 1) %
            component.children.length;
          renderer.updateSelection();
          return true; // Prevent editor from handling the key press
        }
        if (props.event.key === "ArrowDown") {
          selectedIndex = (selectedIndex + 1) % component.children.length;
          renderer.updateSelection();
          return true;
        }
        if (props.event.key === "Enter") {
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

      // Visually highlights the selected item
      updateSelection() {
        Array.from(component.children).forEach((child, index) => {
          child.classList.toggle("is-selected", index === selectedIndex);
        });
        const selected = component.children[selectedIndex];
        if (selected) {
          selected.scrollIntoView({ block: "nearest" });
        }
      },

      // Executes the command of the currently selected item
      selectItem(index) {
        const item = this.items[index];
        if (item) {
          this.command(item);
        }
      },

      // Renders the list of buttons into the component div
      renderItems(items, command) {
        component.innerHTML = "";
        this.items = items; // Store items for keydown handlers
        this.command = command; // Store command for selectItem

        if (items.length === 0) {
          popup.hide();
          return;
        }

        popup.show(); // Make sure the popup is visible if there are items

        items.forEach((item, index) => {
          const button = document.createElement("button");
          button.className = "suggestion-item"; // Style from editor-styles.css
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
