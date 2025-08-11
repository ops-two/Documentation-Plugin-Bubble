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
  /**
   * Triggers the save process.
   * @param {object} properties - The plugin's properties from Bubble.
   */
  async save(properties) {
    if (!this.editor) {
      console.error("Save failed: Editor not initialized.");
      return;
    }

    console.log("EditorCore: Initiating save...");

    try {
      // Get the latest content from the editor.
      const contentJson = this.editor.getJSON();

      // Call the ApiBridge to send the data to the backend.
      const result = await window.DocEditor.ApiBridge.saveDocument(
        properties.save_api_endpoint_text,
        properties.document_id_text,
        contentJson,
        properties.api_auth_token_text
      );

      console.log("Save successful!", result);
      // Optional: Add a visual confirmation, like a toast notification.
      // We could also trigger a 'document_saved' event back to Bubble here.
    } catch (error) {
      console.error("Save failed:", error);
      // Optional: Show an error message to the user.
    }
  },
};
