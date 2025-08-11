// editor-core.js - FINAL VERSION with Spread Syntax Fix

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

    // All necessary modules are correctly loaded on window.Tiptap
    const {
      Editor,
      Extension,
      PluginKey,
      StarterKit,
      Placeholder,
      Image,
      Suggestion,
    } = window.Tiptap;

    // --- THIS IS THE DEFINITIVE FIX BASED ON YOUR RESEARCH ---

    const suggestionPluginKey = new PluginKey("slashCommand");

    const SlashCommandExtension = Extension.create({
      name: "slashCommand",

      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            key: suggestionPluginKey,
            char: "/",

            // The spread syntax (...) unnests our config object, passing `items` and `render`
            // directly to the Suggestion utility, which is what it expects.
            ...window.DocEditor.SuggestionConfig,
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
