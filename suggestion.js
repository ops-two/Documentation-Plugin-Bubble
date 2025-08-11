// suggestion.js - RESET & SIMPLIFIED

window.DocEditor.SuggestionConfig = {
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
    ].filter((item) =>
      item.title.toLowerCase().startsWith(query.toLowerCase())
    );
  },

  render: () => {
    let component, popup, renderer;

    const selectItem = (index) => {
      const item = renderer.items[index];
      if (item) {
        renderer.command(item);
      }
    };

    renderer = {
      items: [],
      command: null,

      onStart: (props) => {
        component = document.createElement("div");
        component.className = "suggestion-menu";
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
        renderer.items = props.items;
        renderer.command = props.command;
        component.innerHTML = "";

        if (!renderer.items.length) {
          popup.hide();
          return;
        }

        renderer.items.forEach((item, index) => {
          const button = document.createElement("button");
          button.className = "suggestion-menu-item";
          button.textContent = item.title;
          button.addEventListener("click", () => selectItem(index));
          component.appendChild(button);
        });
        popup.show();
      },

      onKeyDown: ({ event }) => {
        // We will add keyboard navigation back in the next step.
        // For now, we only care about the 'Enter' key.
        if (event.key === "Enter") {
          event.preventDefault();
          selectItem(0); // For this test, always select the first item.
          return true;
        }
        return false;
      },

      onExit: () => {
        if (popup) popup.destroy();
        if (component) component.remove();
      },
    };
    return renderer;
  },
};
