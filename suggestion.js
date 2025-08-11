// suggestion.js - FINAL VERSION with Interaction Fix

window.DocEditor.SuggestionConfig = {
  // The `items` array is correct and does not need to be changed.
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

  render: () => {
    let component;
    let popup;
    let selectedIndex = 0;

    // This renderer object will hold all the state and methods.
    const renderer = {
      // --- THIS IS THE FIX: Store command and items directly on the renderer object ---
      command: null,
      items: [],

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
        // --- THIS IS THE FIX: Update the renderer's properties ---
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
          return true;
        }
        if (props.event.key === "ArrowDown") {
          selectedIndex = (selectedIndex + 1) % renderer.items.length;
          renderer.updateSelection();
          return true;
        }
        if (props.event.key === "Enter") {
          props.event.preventDefault(); // Prevent new line from being added
          renderer.selectItem(selectedIndex);
          return true;
        }
        return false;
      },

      onExit: () => {
        if (popup) popup.destroy();
        if (component) component.remove();
      },

      // --- HELPER FUNCTIONS that now use the renderer's properties ---

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
        if (item && renderer.command) {
          // --- THIS IS THE FIX: Call the stored command ---
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
