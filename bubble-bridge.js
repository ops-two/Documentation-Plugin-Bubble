window.DocEditor.BubbleBridge = {
  instance: null,

  init(instance) {
    this.instance = instance;
  },

  /**
   * Publishes the latest editor content to a Bubble state.
   * @param {string} jsonString - The editor content as a stringified JSON.
   */
  publishContent(jsonString) {
    if (!this.instance) return;
    // This state name 'current_document_json' must match the one you defined in the plugin editor.
    this.instance.publishState("current_document_json", jsonString);
  },
};
