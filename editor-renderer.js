class EditorRenderer {
  constructor(containerId, dataStore, eventBridge) {
    this.containerId = containerId;
    this.dataStore = dataStore;
    this.eventBridge = eventBridge;
    this.editor = null;
  }

  init(initialContent, isReadOnly) {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error("Editor container not found!");
      return;
    }

    // Clear previous render if any
    container.innerHTML = "";

    // Creates a new editor instance.
    this.editor = BlockNote.BlockNoteEditor.create({
      initialContent: initialContent,
      // Placeholder for image uploads - we will implement this in a later phase
      uploadFile: (file) => {
        console.log("File upload triggered, but not yet implemented.", file);
        // In the future, this will call our image-upload-handler
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve("https://via.placeholder.com/150?text=UploadFailed");
          }, 2000);
        });
      },
    });

    // Creates a React component to render the editor
    const editorComponent = React.createElement(BlockNote.BlockNoteView, {
      editor: this.editor,
      editable: !isReadOnly,
      theme: "light", // or "dark"
    });

    // Renders the editor into the container
    ReactDOM.render(editorComponent, container);

    // --- Event Listener ---
    // On every editor change, update the data store and publish the new content to Bubble
    this.editor.onChange(() => {
      const currentContent = this.editor.document;
      this.dataStore.setContent(currentContent);
      this.eventBridge.publishDocumentContent(currentContent);
    });
  }

  destroy() {
    if (this.editor) {
      const container = document.getElementById(this.containerId);
      if (container) {
        ReactDOM.unmountComponentAtNode(container);
      }
      this.editor = null;
    }
  }
}

window.NotionStyleEditor.EditorRenderer = EditorRenderer;
