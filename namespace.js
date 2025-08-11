// namespace.js - Global namespace for DocEditor plugin

window.DocEditor = {
  // Core editor instance will be set here
  EditorCore: null,
  
  // API Bridge for backend communication - will be set by api-bridge.js
  ApiBridge: null,
  
  // Bubble Bridge for Bubble.io communication - will be set by bubble-bridge.js  
  BubbleBridge: null,
  
  // Extensions will be registered here
  EmbedExtension: null,
  ImageUploadExtension: null,
  BubbleMenuExtension: null,
  
  // Version info
  version: '1.0.0',
  
  // Debug flag
  debug: true
};
