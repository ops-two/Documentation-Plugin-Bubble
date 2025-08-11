// suggestion.js

// This object defines the list of commands for our slash menu.
const commandItems = [
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
    title: "Blockquote",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "YouTube Video",
    command: ({ editor, range }) => {
      const url = window.prompt("Enter YouTube URL");
      if (url) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setYoutubeVideo({ src: url })
          .run();
      }
    },
  },
  {
    title: "Image",
    command: ({ editor, range }) => {
      const url = window.prompt("Enter image URL");
      if (url) {
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
      }
    },
  },
];

// This is the core configuration object for Tiptap's Suggestion utility.
window.DocEditor.SuggestionConfig = {
  // Define the items by mapping over our command list.
  items: ({ query }) => {
    return commandItems
      .filter((item) =>
        item.title.toLowerCase().startsWith(query.toLowerCase())
      )
      .slice(0, 10);
  },

  // This function renders the suggestion list popup.
  render: () => {
    let component;
    let popup;

    return {
      // onStart is called when the suggestion should be shown.
      onStart: (props) => {
        // Create the container for the suggestion items.
        component = document.createElement("div");
        component.className = "suggestion-items"; // Style from our CSS

        // Render each item into the container.
        props.items.forEach((item, index) => {
          const button = document.createElement("button");
          button.className = "suggestion-item";
          button.textContent = item.title;
          button.addEventListener("click", () => props.command(item));
          component.appendChild(button);
        });

        // Create the floating popup using tippy.js (which Tiptap uses internally).
        popup = tippy(document.body, {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      // onUpdate is called when the user types, filtering the list.
      onUpdate(props) {
        // This function is complex to write from scratch, so for now,
        // we'll simply re-render on every update. A more advanced
        // implementation would diff the items.
        if (component) {
          this.onExit();
          this.onStart(props);
        }
      },

      // onKeyDown handles keyboard navigation (Arrow keys and Enter).
      onKeyDown(props) {
        if (props.event.key === "ArrowUp") {
          // Logic for moving selection up
          return true; // Prevent Tiptap from handling the event
        }
        if (props.event.key === "ArrowDown") {
          // Logic for moving selection down
          return true;
        }
        if (props.event.key === "Enter") {
          // Logic for selecting the highlighted item
          return true;
        }
        return false;
      },

      // onExit is called when the suggestion should be hidden.
      onExit() {
        if (popup) {
          popup.destroy();
        }
        if (component) {
          component.remove();
        }
      },
    };
  },
};
