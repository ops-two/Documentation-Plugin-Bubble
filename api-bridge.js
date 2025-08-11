// api-bridge.js - CORRECTED

window.DocEditor.ApiBridge = {
  /**
   * Fetches document data from PostgreSQL backend.
   * @param {string} docId - The ID of the document to fetch.
   * @param {string} token - Optional authentication token.
   * @returns {Promise<object>} - A promise that resolves with the document data.
   */
  async fetchDocument(docId, token = null) {
    const url = `http://localhost:3000/api/documents/${docId}`;
    console.log(`📄 ApiBridge: Fetching document from ${url}`);

    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch document. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ ApiBridge: Document fetched successfully`, data);
      return data;
    } catch (error) {
      console.error('❌ ApiBridge: Document fetch error:', error);
      throw error;
    }
  },

  /**
   * Saves document data to PostgreSQL backend.
   * @param {string} docId - The ID of the document to save.
   * @param {object} contentJson - The editor content as a JSON object.
   * @param {string} title - Optional document title.
   * @param {object} metadata - Optional document metadata.
   * @param {string} token - Optional authentication token.
   * @returns {Promise<object>} - A promise that resolves with the server's response.
   */
  async saveDocument(docId, contentJson, title = null, metadata = null, token = null) {
    const url = `http://localhost:3000/api/documents/${docId}`;
    console.log(`💾 ApiBridge: Saving document to ${url}`);

    try {
      const headers = {
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = {
        content: contentJson
      };
      
      if (title) {
        payload.title = title;
      }
      
      if (metadata) {
        payload.metadata = metadata;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to save document. Status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log(`✅ ApiBridge: Document saved successfully`, data);
      return data;
    } catch (error) {
      console.error('❌ ApiBridge: Document save error:', error);
      throw error;
    }
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

// Debug logging to confirm ApiBridge is loaded
console.log('✅ ApiBridge loaded and available in window.DocEditor.ApiBridge');
console.log('🔧 ApiBridge methods:', Object.keys(window.DocEditor.ApiBridge));

// Also expose ApiBridge directly on window for backward compatibility
window.ApiBridge = window.DocEditor.ApiBridge;
