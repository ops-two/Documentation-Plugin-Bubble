// editor-core.js - CORRECTED AND STABILIZED

window.DocEditor.EditorCore = {
  editor: null,
  currentProperties: {},

  updateProperties(properties) {
    this.currentProperties = properties;
  },

  initialize(containerElement, properties) {
    this.updateProperties(properties);

    if (!window.Tiptap || !window.Tiptap.Editor || !window.Tiptap.lowlight) {
      console.error("Tiptap or Lowlight library not available.");
      containerElement.innerHTML =
        "Error: Core editor libraries failed to load.";
      return;
    }

    const {
      Editor,
      StarterKit,
      Placeholder,
      Image,
      CodeBlockLowlight,
      lowlight,
    } = window.Tiptap;

    try {
      this.editor = new Editor({
        element: containerElement,
        extensions: [
          // IMPORTANT: Configure StarterKit to disable its basic codeBlock.
          StarterKit.configure({
            codeBlock: false,
          }),

          Placeholder.configure({ placeholder: "Start writing..." }),
          Image,

          // Now, add our advanced CodeBlock extension without conflicts.
          CodeBlockLowlight.configure({
            lowlight,
          }),
        ],

        content: "", // Start empty, content will be loaded by update.js

        onUpdate: ({ editor }) => {
          const contentJson = editor.getJSON();
          window.DocEditor.BubbleBridge.publishContent(
            JSON.stringify(contentJson)
          );
        },
      });

      console.log(
        "Tiptap editor instance initialized successfully with Code Block."
      );
    } catch (e) {
      // This will catch any errors during initialization and display them.
      console.error(
        "A critical error occurred during Tiptap initialization:",
        e
      );
      containerElement.innerHTML = `Error initializing editor: ${e.message}`;
    }
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
  async save() {
    // REMOVED: No longer needs properties as an argument.
    if (!this.editor) {
      console.error("Save failed: Editor not initialized.");
      return;
    }

    // --- THIS IS THE FIX ---
    // It now reads the properties from its own stored copy.
    if (
      !this.currentProperties ||
      !this.currentProperties.save_api_endpoint_text
    ) {
      console.error(
        "Save failed: Save API endpoint is not defined in properties."
      );
      return;
    }

    console.log("EditorCore: Initiating save...");

    try {
      const contentJson = this.editor.getJSON();

      // Use the stored properties.
      const result = await window.DocEditor.ApiBridge.saveDocument(
        this.currentProperties.save_api_endpoint_text,
        this.currentProperties.document_id_text,
        contentJson,
        this.currentProperties.api_auth_token_text
      );

      console.log("Save successful!", result);
    } catch (error) {
      console.error("Save failed:", error);
    }
  },
};
