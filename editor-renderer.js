// Ensure the global namespace exists
window.NotionStyleEditor = window.NotionStyleEditor || {};

class EditorRenderer {
  constructor(containerId, dataStore, eventBridge) {
    // Log constructor arguments
    console.log(
      "[EditorRenderer] Constructor called with containerId:",
      containerId
    );
    this.containerId = containerId;
    this.dataStore = dataStore;
    this.eventBridge = eventBridge;
    this.editor = null;
  }

  init(initialContent, isReadOnly) {
    console.log("[EditorRenderer] init() called.");
    const container = document.getElementById(this.containerId);

    if (!container) {
      // This is a critical failure point
      console.error(
        "[EditorRenderer] FATAL: Editor container element was not found in the DOM! ID:",
        this.containerId
      );
      return;
    }
    console.log("[EditorRenderer] Found container element:", container);

    container.innerHTML = "";

    console.log("[EditorRenderer] Creating BlockNote editor instance...");
    this.editor = BlockNote.BlockNoteEditor.create({
      initialContent: initialContent,
      uploadFile: (file) => {
        console.log("File upload triggered, but not yet implemented.", file);
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve("https://via.placeholder.com/150?text=UploadFailed");
          }, 2000);
        });
      },
    });

    const editorComponent = React.createElement(BlockNote.BlockNoteView, {
      editor: this.editor,
      editable: !isReadOnly,
      theme: "light",
    });

    console.log("[EditorRenderer] Rendering React component into container...");
    ReactDOM.render(editorComponent, container);
    console.log("[EditorRenderer] React component rendered.");

    this.editor.onChange(() => {
      const currentContent = this.editor.document;
      this.dataStore.setContent(currentContent);
      this.eventBridge.publishDocumentContent(currentContent);
    });
  }

  destroy() {
    console.log("[EditorRenderer] destroy() called.");
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
