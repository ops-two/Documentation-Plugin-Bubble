// suggestion.js - FINAL, FULLY FUNCTIONAL VERSION (from your research)

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

    // This object holds all the functions and state to ensure `this` context is correct.
    const renderer = {
      // These properties will be populated by onUpdate to hold the current state.
      items: [],
      command: () => {},

      onStart: (props) => {
        component = document.createElement("div");
        // This class name must match your final CSS
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
        // THE FIX: Explicitly store the latest items and command function on the renderer object.
        renderer.items = props.items;
        renderer.command = props.command;
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
        if (item) {
          // This now correctly calls the stored command function
          renderer.command(item);
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
