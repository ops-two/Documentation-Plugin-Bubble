// editor-core.js - Upgraded for Dynamic Content

window.DocEditor.EditorCore = {
  editor: null,

  initialize(containerElement, properties) {
    if (!window.Tiptap || !window.Tiptap.Editor) {
      console.error("Tiptap not loaded.");
      return;
    }

    const { Editor, StarterKit, Placeholder, Link, Image } = window.Tiptap;

    this.editor = new Editor({
      element: containerElement,
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: "Loading document...",
        }),
        Image, // We keep this here for the next step.
      ],
      // REMOVED: No more static content. It will be loaded from the API.
      content: "",

      // ADDED: This function runs every time the user types or makes a change.
      onUpdate: ({ editor }) => {
        // Get the latest content as a JSON object.
        const contentJson = editor.getJSON();
        // Send the stringified version to the Bubble Bridge to publish as a state.
        window.DocEditor.BubbleBridge.publishContent(
          JSON.stringify(contentJson)
        );
      },
    });

    console.log("Tiptap editor instance created and waiting for content.");
  },

  /**
   * Loads content into the Tiptap editor.
   * @param {object} contentJson - The Tiptap-compatible JSON object.
   */
  setContent(contentJson) {
    if (this.editor && contentJson) {
      this.editor.commands.setContent(contentJson);
      console.log("EditorCore: Content has been set.");
    }
  },
};
