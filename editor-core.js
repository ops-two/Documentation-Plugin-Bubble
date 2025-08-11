window.DocEditor = {
  EditorCore: {
    editor: null,

    initialize(containerElement) {
      // The failsafe check remains the same.
      if (!window.Tiptap || !window.Tiptap.Core) {
        console.error("Tiptap is not loaded. Cannot initialize editor.");
        return;
      }

      // CORRECTED: Access classes from the UMD build structure.
      const Editor = window.Tiptap.Core.Editor;
      // The starter kit is a default export, so we access it via `.default`.
      const StarterKit = window.Tiptap.StarterKit.default;

      this.editor = new Editor({
        element: containerElement,
        extensions: [StarterKit],
        content: `
          <h2>It Works! ✅</h2>
          <p>This is the <strong>Tiptap editor</strong> running correctly inside your Bubble.io plugin.</p>
          <p>The <code>appendChild</code> error is fixed, and Tiptap is now loading reliably using the UMD scripts.</p>
        `,
        editorProps: {
          attributes: {
            class: "prose", // Using a simpler class for now.
          },
        },
      });

      console.log("Tiptap editor instance created successfully.", this.editor);
    },
  },
};
