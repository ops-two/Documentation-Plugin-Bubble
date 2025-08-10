// Ensure the global namespace exists
window.NotionStyleEditor = window.NotionStyleEditor || {};

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

    container.innerHTML = "";

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

    ReactDOM.render(editorComponent, container);

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
