// Ensure the global namespace exists
window.NotionStyleEditor = window.NotionStyleEditor || {};

class DataStore {
  constructor(initialData = {}) {
    this.documentId = initialData.documentId || null;
    this.content = initialData.content || [];
  }

  setContent(jsonContent) {
    this.content = jsonContent;
  }

  getContent() {
    return this.content;
  }

  setDocumentId(id) {
    this.documentId = id;
  }

  getDocumentId() {
    return this.documentId;
  }
}

window.NotionStyleEditor.DataStore = DataStore;
