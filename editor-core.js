// editor-core.js - FINAL VERSION with Spread Syntax Fix
console.log('editor-core.js v1.1 loaded');

// Version beacon for debugging
window.DocEditor = window.DocEditor || {};
window.DocEditor._editorCoreVersion = '1.1';

window.DocEditor.EditorCore = {
  editor: null,
  currentProperties: {},

  updateProperties(properties) {
    this.currentProperties = properties;
  },

  async initialize(containerElement, properties) {
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
    // Wait for embed extension to be available before initializing editor
    const waitForEmbedExtension = () => {
      return new Promise((resolve) => {
        // Check if embed extension is already available
        if (window.DocEditor.EmbedExtension) {
          console.log('✅ Embed extension already available');
          resolve();
          return;
        }
        
        // If not available, wait for it with a timeout
        console.log('⏳ Waiting for embed extension to be available...');
        let attempts = 0;
        const maxAttempts = 60; // 6 seconds max wait
        
        const checkInterval = setInterval(() => {
          attempts++;
          
          if (window.DocEditor.EmbedExtension) {
            clearInterval(checkInterval);
            console.log(`✅ Embed extension found after ${attempts * 100}ms`);
            resolve();
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.warn('⚠️ Timeout waiting for embed extension, proceeding without it');
            resolve();
          }
        }, 100);
      });
    };
    
    // Wait for embed extension, then initialize editor
    await waitForEmbedExtension();
    
    // Debug: Check if embed extension is available
    console.log('Checking embed extension availability:', {
      embedExtension: !!window.DocEditor.EmbedExtension,
      docEditor: !!window.DocEditor,
      embedVersion: window.DocEditor._embedExtensionVersion
    });
    
    // Prepare extensions array
    const extensions = [
      StarterKit,
      Placeholder.configure({ placeholder: "Type `/` for commands…" }),
      Image,
      SlashCommandExtension,
    ];
    
    // Add embed extension if available
    if (window.DocEditor.EmbedExtension) {
      extensions.push(window.DocEditor.EmbedExtension);
      console.log('✅ Embed extension added to editor');
    } else {
      console.warn('❌ Embed extension not available during editor initialization');
    }
    
    console.log('Editor extensions:', extensions.map(ext => ext.name || ext.constructor.name));
    
    this.editor = new Editor({
      element: containerElement,
      extensions: extensions,
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
