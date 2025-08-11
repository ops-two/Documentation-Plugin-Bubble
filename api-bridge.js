// api-bridge.js

window.DocEditor.ApiBridge = {
  /**
   * Fetches document data from the backend.
   * @param {string} endpoint - The full URL to the load API.
   * @param {string} docId - The ID of the document to fetch.
   * @param {string} token - The authentication token.
   * @returns {Promise<object>} - A promise that resolves with the document data.
   */
  async fetchDocument(endpoint, docId, token) {
    // Construct the full URL, e.g., http://localhost:3000/api/documents/load/123
    const url = `${endpoint}/${docId}`;
    
    console.log(`ApiBridge: Fetching from ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // In a real app, you'd send an auth token like this:
        // 'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch document. Status: ${response.status}`);
    }

    return response.json();
  },
};```

#### **File 2: `bubble-bridge.js`**
This module talks back to Bubble. For now, it will just publish the editor's content.

```javascript
// bubble-bridge.js

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
    this.instance.publishState('current_document_json', jsonString);
  },
};