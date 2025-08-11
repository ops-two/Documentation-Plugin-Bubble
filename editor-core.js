// editor-core.js

window.DocEditor = {
  EditorCore: {
    editor: null,

    /**
     * Initializes the Tiptap editor instance.
     * @param {HTMLElement} containerElement - The DOM element from initialize.js
     */
    initialize(containerElement) {
      // Failsafe: Check if the global Tiptap object exists.
      if (!window.Tiptap ||!window.Tiptap.Editor) {
        console.error("Tiptap or its Editor class is not available. Cannot initialize.");
        containerElement.innerHTML = "Error: Tiptap libraries failed to load.";
        return;
      }

      // Destructure the classes from the global window.Tiptap object.
      const { Editor, StarterKit, Placeholder, Link, Image } = window.Tiptap;

      // Create the Tiptap editor instance.
      this.editor = new Editor({
        element: containerElement,
        extensions:,
        // Static content for testing purposes.
        content: `
          <h2>Success! ✅</h2>
          <p>The editor is now loading Tiptap and its extensions correctly using <strong>ES Modules</strong> from <code>esm.sh</code>.</p>
          <p>The placeholder text should be visible if you clear this content.</p>
        `,
        editorProps: {
          attributes: {
            // Add some basic styling classes.
            class: "prose focus:outline-none",
          },
        },
      });

      console.log(
        "Tiptap editor instance created successfully.",
        this.editor
      );
    },
  },
};