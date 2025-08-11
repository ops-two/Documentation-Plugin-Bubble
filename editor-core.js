// Create a global namespace for our editor plugin to avoid polluting the window object.
window.DocEditor = {
  EditorCore: {
    // This is the editor instance, which will be stored here.
    editor: null,

    /**
     * Initializes the Tiptap editor instance.
     * @param {HTMLElement} containerElement - The DOM element to mount the editor in.
     */
    initialize(containerElement) {
      // Failsafe: Check if Tiptap has been loaded.
      if (!window.Tiptap) {
        console.error("Tiptap is not loaded. Cannot initialize editor.");
        return;
      }

      // Get the necessary classes from the global Tiptap object.
      const { Editor, StarterKit } = window.Tiptap;

      // Create the Tiptap editor instance.
      this.editor = new Editor({
        element: containerElement, // Mount it in the div from our initialize.js
        extensions: [
          StarterKit, // Provides basic text editing features (bold, italic, headings, etc.)
        ],
        // This is the static content that will be displayed.
        content: `
          <h2>Hello, World! 👋</h2>
          <p>This is the <strong>Tiptap editor</strong> running statically inside a Bubble.io plugin.</p>
          <p>The next step is to load dynamic content based on the <code>document_id_text</code> property.</p>
        `,
        // Basic styling for the editor content area.
        editorProps: {
          attributes: {
            class:
              "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
          },
        },
      });

      console.log("Tiptap editor instance created successfully.", this.editor);
    },
  },
};
