// editor-core.js - FINAL Corrected Version for Suggestions

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

    // We still need all the modules from the global object
    const { Editor, StarterKit, Placeholder, Image, Suggestion } =
      window.Tiptap;

    // --- THIS IS THE FIX ---
    // We create a custom extension that USES the suggestion utility.
    // Tiptap's `Extension.create` is the standard way to do this.
    const SlashCommandExtension = window.Tiptap.Core.Extension.create({
      name: "slashCommand", // Give our custom extension a name

      // The key part: addProseMirrorPlugins
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor, // Pass the Tiptap editor instance
            char: "/", // The trigger character
            // The `suggestion` object comes from our suggestion.js file
            suggestion: window.DocEditor.SuggestionConfig,
          }),
        ];
      },
    });

    this.editor = new Editor({
      element: containerElement,
      extensions: [
        StarterKit,
        Placeholder.configure({ placeholder: "Type `/` for commands…" }),
        Image,

        // Now, we add our new custom extension to the list.
        SlashCommandExtension,
      ],
      // onUpdate is unchanged
      onUpdate: ({ editor }) => {
        const contentJson = editor.getJSON();
        window.DocEditor.BubbleBridge.publishContent(
          JSON.stringify(contentJson)
        );
      },
    });

    console.log(
      "Tiptap editor initialized with custom Slash Command extension."
    );
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
