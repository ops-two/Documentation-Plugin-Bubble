// editor-core.js - Upgraded for Dynamic Content

window.DocEditor.EditorCore = {
  editor: null,
  currentProperties: {},

  updateProperties(properties) {
    this.currentProperties = properties;
  },
  initialize(containerElement, properties) {
    this.updateProperties(properties);

    if (!window.Tiptap || !window.Tiptap.Editor) {
      console.error("Tiptap not loaded.");
      return;
    }

    const {
      Editor,
      StarterKit,
      Placeholder,
      Image,
      Suggestion,
      CodeBlockLowlight,
      YouTube,
      lowlight,
    } = window.Tiptap;

    this.editor = new Editor({
      element: containerElement,
      extensions: [
        StarterKit,
        Placeholder.configure({ placeholder: "Type / for commands…" }),
        Image,
        // ADDED: The Suggestion extension
        Suggestion.configure({
          char: "/", // The trigger character
          // The `suggestion` object here is our configuration from suggestion.js
          suggestion: window.DocEditor.SuggestionConfig,
        }),
        CodeBlockLowlight.configure({
          lowlight,
        }),

        // Configure the YouTube embed extension
        YouTube.configure({
          controls: true, // Show video controls
          modestBranding: true, // Use a less prominent YouTube logo
        }),
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
