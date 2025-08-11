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
};
