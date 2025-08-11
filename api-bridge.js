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

  /**
   * Uploads an image file to the backend MinIO storage.
   * @param {File} file - The image file to upload.
   * @param {string} endpoint - The full URL to the image upload API (optional, defaults to localhost).
   * @param {string} token - The authentication token (optional).
   * @returns {Promise<object>} - A promise that resolves with the upload response including the image URL.
   */
  async uploadImage(file, endpoint = 'http://localhost:3000/api/images/upload', token = null) {
    console.log(`ApiBridge: Uploading image to ${endpoint}`);
    
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Invalid file: Please provide a valid image file');
    }

    const formData = new FormData();
    formData.append('image', file);

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Image upload failed. Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`ApiBridge: Image uploaded successfully - ${result.url}`);
    return result;
  },

  /**
   * Deletes an image from the backend MinIO storage.
   * @param {string} filename - The filename of the image to delete.
   * @param {string} endpoint - The base URL to the image delete API (optional, defaults to localhost).
   * @param {string} token - The authentication token (optional).
   * @returns {Promise<object>} - A promise that resolves with the delete response.
   */
  async deleteImage(filename, endpoint = 'http://localhost:3000/api/images', token = null) {
    const url = `${endpoint}/${filename}`;
    console.log(`ApiBridge: Deleting image from ${url}`);

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers: headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Image delete failed. Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`ApiBridge: Image deleted successfully - ${filename}`);
    return result;
  }
};
