// api-bridge.js - CORRECTED

window.DocEditor.ApiBridge = {
  /**
   * Fetches document data from the backend.
   * @param {string} endpoint - The full URL to the load API.
   * @param {string} docId - The ID of the document to fetch.
   * @param {string} token - The authentication token.
   * @returns {Promise<object>} - A promise that resolves with the document data.
   */
  async fetchDocument(endpoint, docId, token) {
    const url = `${endpoint}/${docId}`;
    console.log(`ApiBridge: Fetching from ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        // 'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch document. Status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Saves document data to the backend.
   * @param {string} endpoint - The full URL to the save API.
   * @param {string} docId - The ID of the document to save.
   * @param {object} contentJson - The editor content as a JSON object.
   * @param {string} token - The authentication token.
   * @returns {Promise<object>} - A promise that resolves with the server's response.
   */
  async saveDocument(endpoint, docId, contentJson, token) {
    console.log(`ApiBridge: Saving to ${endpoint}`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        document_id: docId,
        content_json: contentJson,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Failed to save document. Status: ${response.status}`
      );
    }

    return response.json();
  },
};
