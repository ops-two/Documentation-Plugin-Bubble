// editor-core.js - FINAL VERSION with Image Upload Integration
console.log('editor-core.js v1.2 loaded');

// Version beacon for debugging
window.DocEditor = window.DocEditor || {};
window.DocEditor._editorCoreVersion = '1.2';

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

    // Wait for extensions to be available
    await this.waitForExtensions();

    // All necessary modules are correctly loaded on window.Tiptap
    const {
      Editor,
      Extension,
      PluginKey,
      StarterKit,
      Placeholder,
      Image,
      Suggestion,
      Underline,
    } = window.Tiptap;

    const suggestionPluginKey = new PluginKey("slashCommand");

    const SlashCommandExtension = Extension.create({
      name: "slashCommand",

      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            key: suggestionPluginKey,
            char: "/",
            ...window.DocEditor.SuggestionConfig,
          }),
        ];
      },
    });

    // Debug: Check if extensions are available
    console.log('Checking extensions availability:', {
      embedExtension: !!window.DocEditor.EmbedExtension,
      docEditor: !!window.DocEditor,
      embedVersion: window.DocEditor._embedExtensionVersion
    });
    
    // Prepare extensions array
    const extensions = [
      StarterKit,
      Placeholder.configure({ placeholder: "Type `/` for commands or drag & drop images to upload…" }),
      Image,
      Underline, // Required for bubble menu underline functionality
      SlashCommandExtension,
    ];
    
    // Add embed extension if available
    if (window.DocEditor.EmbedExtension) {
      extensions.push(window.DocEditor.EmbedExtension);
      console.log('✅ Embed extension added to editor');
    } else {
      console.warn('❌ Embed extension not available during editor initialization');
    }
    
    // Add image upload extension if available
    if (window.DocEditor.ImageUploadExtension) {
      extensions.push(window.DocEditor.ImageUploadExtension);
      console.log('✅ Image upload extension added to editor');
    } else {
      console.warn('❌ Image upload extension not available during editor initialization');
    }
    
    // Add bubble menu extension if available
    if (window.DocEditor.BubbleMenuExtension) {
      extensions.push(window.DocEditor.BubbleMenuExtension);
      console.log('✅ Bubble menu extension added to editor');
    } else {
      console.warn('❌ Bubble menu extension not available during editor initialization');
    }
    
    console.log('Editor extensions:', extensions.map(ext => ext.name || ext.constructor.name));
    
    this.editor = new Editor({
      element: containerElement,
      extensions: extensions,
      onUpdate: ({ editor }) => {
        const contentJson = editor.getJSON();
        window.DocEditor.BubbleBridge.publishContent(
          JSON.stringify(contentJson)
        );
      },
    });

    console.log("Tiptap editor initialized with extensions.");
  },

  // Wait for all extensions to be available before initializing editor
  async waitForExtensions() {
    console.log('🔄 Waiting for all extensions to be available...');
    
    // Wait for all extensions in parallel
    await Promise.all([
      this.waitForEmbedExtension(),
      this.waitForImageUploadExtension(),
      this.waitForBubbleMenuExtension()
    ]);
    
    console.log('✅ All extensions are now available');
  },

  // Wait for embed extension to be available before initializing editor
  async waitForEmbedExtension() {
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
  },
  
  async waitForImageUploadExtension() {
    return new Promise((resolve) => {
      // Check if image upload extension is already available
      if (window.DocEditor.ImageUploadExtension) {
        console.log('✅ Image upload extension already available');
        resolve();
        return;
      }
      
      // If not available, wait for it with a timeout
      console.log('⏳ Waiting for image upload extension to be available...');
      let attempts = 0;
      const maxAttempts = 60; // 6 seconds max wait
      
      const checkInterval = setInterval(() => {
        attempts++;
        
        if (window.DocEditor.ImageUploadExtension) {
          clearInterval(checkInterval);
          console.log(`✅ Image upload extension found after ${attempts * 100}ms`);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.warn('⚠️ Timeout waiting for image upload extension, proceeding without it');
          resolve();
        }
      }, 100);
    });
  },

  async waitForBubbleMenuExtension() {
    return new Promise((resolve) => {
      // Check if bubble menu extension is already available
      if (window.DocEditor.BubbleMenuExtension) {
        console.log('✅ Bubble menu extension already available');
        resolve();
        return;
      }
      
      // If not available, wait for it with a timeout
      console.log('⏳ Waiting for bubble menu extension to be available...');
      let attempts = 0;
      const maxAttempts = 60; // 6 seconds max wait
      
      const checkInterval = setInterval(() => {
        attempts++;
        
        if (window.DocEditor.BubbleMenuExtension) {
          clearInterval(checkInterval);
          console.log(`✅ Bubble menu extension found after ${attempts * 100}ms`);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.warn('⚠️ Timeout waiting for bubble menu extension, proceeding without it');
          resolve();
        }
      }, 100);
    });
  },

  async waitForExtensions() {
    console.log("⏳ Waiting for embed extension to be available...");
    await this.waitForEmbedExtension();
    
    console.log("⏳ Waiting for image upload extension to be available...");
    await this.waitForImageUploadExtension();
    
    console.log("⏳ Waiting for bubble menu extension to be available...");
    await this.waitForBubbleMenuExtension();
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
    if (!this.editor) {
      console.error("Save failed: Editor not initialized.");
      return;
    }

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
