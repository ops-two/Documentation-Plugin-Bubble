// suggestion.js - DEBUG VERSION 2

window.DocEditor.SuggestionConfig = {
  items: ({ query }) => {
    // This part is likely fine, but we'll log it for good measure.
    console.log(`[Suggestion Items] Querying for: "${query}"`);
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
    ];
    return allCommands.filter((item) =>
      item.title.toLowerCase().startsWith(query.toLowerCase())
    );
  },

  render: () => {
    let component;
    let popup;

    const renderer = {
      // --- THIS IS THE CRITICAL DEBUGGING LOG ---
      onStart: (props) => {
        console.log(
          "%c[Suggestion onStart] TRIGGERED!",
          "color: #fff; background: #0088ff; padding: 4px; border-radius: 4px;"
        );
        console.log("[Suggestion onStart] Props:", props);

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
        console.log("[Suggestion onUpdate] Updating with items:", props.items);
        renderer.renderItems(props.items, props.command);
      },

      onKeyDown: (props) => {
        console.log("[Suggestion onKeyDown] Key pressed:", props.event.key);
        // ... rest of onKeyDown is unchanged
        return false;
      },

      onExit: () => {
        console.log("[Suggestion onExit] Exiting.");
        if (popup) popup.destroy();
        if (component) component.remove();
      },

      // The rest of the helper functions are unchanged
      renderItems(items, command) {
        /* ... unchanged ... */
      },
    };

    return renderer;
  },
};
