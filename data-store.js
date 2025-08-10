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
// Testing public
window.NotionStyleEditor.DataStore = DataStore;
