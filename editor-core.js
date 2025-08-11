// editor-core.js - Corrected for the esm.sh module loader

window.DocEditor = {
  EditorCore: {
    editor: null,

    /**
     * Initializes the Tiptap editor instance.
     * @param {HTMLElement} containerElement - The DOM element from initialize.js
     */
    initialize(containerElement) {
      // Failsafe: Check if the global Tiptap object and its Editor exist.
      if (!window.Tiptap || !window.Tiptap.Editor) {
        console.error(
          "Tiptap or its Editor class is not loaded. Cannot initialize."
        );
        containerElement.innerHTML = "Error: Tiptap libraries failed to load.";
        return;
      }

      // CORRECTED: Destructure the classes directly from the flat window.Tiptap object.
      // This matches the structure you created in your HTML Header.
      const { Editor, StarterKit, Placeholder, Link, Image } = window.Tiptap;

      // Create the Tiptap editor instance with the new extensions.
      this.editor = new Editor({
        element: containerElement,
        extensions: [
          // The StarterKit provides headings, bold, italic, etc.
          StarterKit,

          // The Placeholder extension.
          Placeholder.configure({
            placeholder: "Start typing your document here...",
          }),

          // The Link extension.
          Link,

          // The Image extension.
          Image,
        ],
        // You can leave the content empty to see the placeholder text.
        content: `
          <h2>Success! ✅</h2>
          <p>The editor is now loading Tiptap and its extensions correctly using <strong>ES Modules</strong> from <code>esm.sh</code>.</p>
          <p>The placeholder text should be visible if you clear this content.</p>
        `,
        editorProps: {
          attributes: {
            // Add some basic styling classes for modern CSS frameworks (like Tailwind)
            class: "prose focus:outline-none",
          },
        },
      });

      console.log(
        "Tiptap editor instance created successfully with ES Modules.",
        this.editor
      );
    },
  },
};
