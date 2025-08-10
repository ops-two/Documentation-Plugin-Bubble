// Ensure the global namespace exists
window.NotionStyleEditor = window.NotionStyleEditor || {};

class EditorRenderer {
  constructor(containerId, dataStore, eventBridge) {
    this.containerId = containerId;
    this.dataStore = dataStore;
    this.eventBridge = eventBridge;
    this.editor = null;
    this.root = null; // To hold the React root
  }

  init(initialContent, isReadOnly) {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(
        "[EditorRenderer] FATAL: Editor container element was not found!"
      );
      return;
    }

    container.innerHTML = "";

    // **NEW API:** Create the editor instance using BlockNote.core
    this.editor = BlockNote.core.createEditor({
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

    // **NEW API:** Create a React root for rendering
    this.root = ReactDOM.createRoot(container);

    // **NEW API:** Create the view component using BlockNote.react
    const editorComponent = React.createElement(BlockNote.react.BlockNoteView, {
      editor: this.editor,
      editable: !isReadOnly,
      theme: "light",
    });

    // **NEW API:** Render using the new root.render method
    this.root.render(editorComponent);

    // Attach onChange listener
    this.editor.onChange(() => {
      const currentContent = this.editor.document;
      this.dataStore.setContent(currentContent);
      this.eventBridge.publishDocumentContent(currentContent);
    });
  }

  destroy() {
    if (this.root) {
      // **NEW API:** Unmount using the root
      this.root.unmount();
    }
    this.editor = null;
    this.root = null;
  }
}

window.NotionStyleEditor.EditorRenderer = EditorRenderer;
