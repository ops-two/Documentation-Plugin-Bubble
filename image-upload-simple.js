// Simplified Image Upload Extension for Tiptap Editor
// Handles drag & drop and paste image uploads with MinIO backend

// Version beacon for debugging
console.log('📸 Image Upload Simple Extension v1.0.4 - Loading...');

// Polling function to wait for Tiptap to be available
function waitForTiptap() {
  return new Promise((resolve) => {
    const checkTiptap = () => {
      if (window.Tiptap && window.Tiptap.Extension) {
        console.log('✅ Tiptap available for image upload extension');
        resolve();
      } else {
        console.log('⏳ Waiting for Tiptap...');
        setTimeout(checkTiptap, 100);
      }
    };
    checkTiptap();
  });
}

// Image Upload Extension
waitForTiptap().then(() => {
  console.log('✅ Creating image upload extension');
  
  const { Extension } = window.Tiptap;
  
  const ImageUploadExtension = Extension.create({
    name: 'imageUpload',
    
    addProseMirrorPlugins() {
      const { Plugin, PluginKey } = window.Tiptap;
      
      return [
        new Plugin({
          key: new PluginKey('imageUpload'),
          props: {
            handleDOMEvents: {
              drop(view, event) {
                const hasFiles = event.dataTransfer && 
                                event.dataTransfer.files && 
                                event.dataTransfer.files.length;

                if (!hasFiles) {
                  return false;
                }

                const images = Array.from(event.dataTransfer.files).filter(file => 
                  file.type.includes('image/')
                );

                if (images.length === 0) {
                  return false;
                }

                event.preventDefault();

                const { schema } = view.state;
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });

                images.forEach(async (image) => {
                  console.log(`📸 Processing dropped image: ${image.name}`);
                  
                  // Insert loading placeholder
                  const loadingNode = schema.nodes.paragraph.create({}, [
                    schema.text('🔄 Uploading image...')
                  ]);
                  
                  const transaction = view.state.tr.insert(coordinates.pos, loadingNode);
                  view.dispatch(transaction);
                  
                  try {
                    // Upload image using ApiBridge
                    if (window.ApiBridge && window.ApiBridge.uploadImage) {
                      const result = await window.ApiBridge.uploadImage(image, 'http://localhost:3000/api/images/upload');
                      console.log(`✅ Image uploaded successfully: ${result.url}`);
                      
                      // Replace placeholder with actual image
                      const imageNode = schema.nodes.image.create({
                        src: result.url,
                        alt: result.originalName || image.name,
                        title: result.originalName || image.name
                      });
                      
                      const currentState = view.state;
                      const newTransaction = currentState.tr.replaceWith(
                        coordinates.pos, 
                        coordinates.pos + loadingNode.nodeSize, 
                        imageNode
                      );
                      view.dispatch(newTransaction);
                      
                      console.log('✅ Image placeholder replaced with uploaded image');
                    } else {
                      throw new Error('ApiBridge not available');
                    }
                  } catch (error) {
                    console.error('❌ Image upload failed:', error);
                    
                    // Replace placeholder with error message
                    const errorNode = schema.nodes.paragraph.create({}, [
                      schema.text(`❌ Upload failed: ${error.message}`)
                    ]);
                    
                    const currentState = view.state;
                    const errorTransaction = currentState.tr.replaceWith(
                      coordinates.pos, 
                      coordinates.pos + loadingNode.nodeSize, 
                      errorNode
                    );
                    view.dispatch(errorTransaction);
                  }
                });

                return true;
              },
              
              paste(view, event) {
                const hasFiles = event.clipboardData && 
                                event.clipboardData.files && 
                                event.clipboardData.files.length;

                if (!hasFiles) {
                  return false;
                }

                const images = Array.from(event.clipboardData.files).filter(file => 
                  file.type.includes('image/')
                );

                if (images.length === 0) {
                  return false;
                }

                event.preventDefault();

                const { schema } = view.state;
                const { selection } = view.state;

                images.forEach(async (image) => {
                  console.log(`📸 Processing pasted image: ${image.name || 'clipboard-image'}`);
                  
                  // Insert loading placeholder
                  const loadingNode = schema.nodes.paragraph.create({}, [
                    schema.text('🔄 Uploading image...')
                  ]);
                  
                  const transaction = view.state.tr.insert(selection.from, loadingNode);
                  view.dispatch(transaction);
                  
                  try {
                    // Upload image using ApiBridge
                    if (window.ApiBridge && window.ApiBridge.uploadImage) {
                      const result = await window.ApiBridge.uploadImage(image, 'http://localhost:3000/api/images/upload');
                      console.log(`✅ Image uploaded successfully: ${result.url}`);
                      
                      // Replace placeholder with actual image
                      const imageNode = schema.nodes.image.create({
                        src: result.url,
                        alt: result.originalName || image.name || 'Pasted image',
                        title: result.originalName || image.name || 'Pasted image'
                      });
                      
                      const currentState = view.state;
                      const newTransaction = currentState.tr.replaceWith(
                        selection.from, 
                        selection.from + loadingNode.nodeSize, 
                        imageNode
                      );
                      view.dispatch(newTransaction);
                      
                      console.log('✅ Image placeholder replaced with uploaded image');
                    } else {
                      throw new Error('ApiBridge not available');
                    }
                  } catch (error) {
                    console.error('❌ Image upload failed:', error);
                    
                    // Replace placeholder with error message
                    const errorNode = schema.nodes.paragraph.create({}, [
                      schema.text(`❌ Upload failed: ${error.message}`)
                    ]);
                    
                    const currentState = view.state;
                    const errorTransaction = currentState.tr.replaceWith(
                      selection.from, 
                      selection.from + loadingNode.nodeSize, 
                      errorNode
                    );
                    view.dispatch(errorTransaction);
                  }
                });

                return true;
              }
            }
          }
        })
      ];
    }
  });

  // Make the extension globally available
  window.DocEditor = window.DocEditor || {};
  window.DocEditor.ImageUploadExtension = ImageUploadExtension;
  window.ImageUploadExtension = ImageUploadExtension; // Also make it available directly
  console.log('✅ Image Upload Extension created and available globally');
  
}).catch(error => {
  console.error('❌ Error creating image upload extension:', error);
});
