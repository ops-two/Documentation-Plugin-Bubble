class EventBridge {
  constructor(instance) {
    this.instance = instance;
  }

  publishDocumentContent(jsonContent) {
    const jsonString = JSON.stringify(jsonContent, null, 2);
    this.instance.publishState("current_document_json", jsonString);
  }

  publishLoadedDocumentId(docId) {
    this.instance.publishState("loaded_document_id", docId);
    this.instance.triggerEvent("document_loaded");
  }

  triggerDocumentSaved() {
    this.instance.triggerEvent("document_saved");
  }
}

window.NotionStyleEditor.EventBridge = EventBridge;
