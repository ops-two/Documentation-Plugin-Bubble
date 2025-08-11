// embed-extension.js - Universal Embed Extension for Tiptap
console.log('embed-extension.js v1.1 loaded');

// Version beacon for debugging
window.DocEditor = window.DocEditor || {};
window.DocEditor._embedExtensionVersion = '1.1';

// Helper functions for URL parsing
const EmbedHelpers = {
  detectEmbedType(url) {
    if (!url) return 'generic';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      return 'twitter';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    } else if (url.includes('codepen.io')) {
      return 'codepen';
    }
    
    return 'generic';
  },

  extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  },

  extractVimeoId(url) {
    const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    const match = url.match(regExp);
    return match ? match[3] : null;
  },

  extractCodePenId(url) {
    const regExp = /codepen\.io\/[^\/]+\/pen\/([^\/]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  },

  getEmbedSrc(url, type) {
    switch (type) {
      case 'youtube':
        const youtubeId = this.extractYouTubeId(url);
        return youtubeId ? `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&showinfo=0` : url;
      case 'twitter':
        return `https://twitframe.com/show?url=${encodeURIComponent(url)}`;
      case 'vimeo':
        const vimeoId = this.extractVimeoId(url);
        return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : url;
      case 'codepen':
        const codepenId = this.extractCodePenId(url);
        return codepenId ? `https://codepen.io/pen/${codepenId}` : url;
      default:
        return url;
    }
  }
};

/**
 * Function to create the embed extension once Tiptap is available
 */
function createEmbedExtension() {
  if (!window.Tiptap || !window.Tiptap.Node) {
    console.log('⏳ Waiting for Tiptap.Node to be available...');
    return false;
  }
  
  console.log('✅ Creating embed extension with Tiptap.Node');
  
  window.DocEditor.EmbedExtension = window.Tiptap.Node.create({
  name: 'embed',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('data-src'),
        renderHTML: attributes => {
          if (!attributes.src) {
            return {};
          }
          return {
            'data-src': attributes.src,
          };
        },
      },
      type: {
        default: 'generic',
        parseHTML: element => element.getAttribute('data-type'),
        renderHTML: attributes => {
          if (!attributes.type) {
            return {};
          }
          return {
            'data-type': attributes.type,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-embed]',
        getAttrs: element => ({
          src: element.getAttribute('data-src'),
          type: element.getAttribute('data-type'),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, type } = HTMLAttributes;
    
    if (!src) {
      return ['div', { class: 'embed-wrapper' }, 'No embed URL provided'];
    }

    // Get the proper iframe source
    const iframeSrc = EmbedHelpers.getEmbedSrc(src, type);
    const height = type === 'twitter' ? '500' : '400';

    return [
      'div',
      {
        'data-embed': '',
        'data-src': src,
        'data-type': type,
        class: 'embed-wrapper',
      },
      [
        'iframe',
        {
          src: iframeSrc,
          width: '100%',
          height: height,
          title: `${type} embed`,
          frameborder: '0',
          allowfullscreen: type === 'youtube' || type === 'vimeo' || type === 'codepen' ? 'allowfullscreen' : null,
          allow: type === 'youtube' ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' : 
                 type === 'vimeo' ? 'autoplay; fullscreen; picture-in-picture' : null,
          loading: 'lazy',
          style: 'border: none; display: block;'
        },
      ],
    ];
  },

  addCommands() {
    return {
      setEmbed: (options) => ({ commands }) => {
        const { url, type = null } = options;
        
        if (!url) {
          console.warn('setEmbed: No URL provided');
          return false;
        }
        
        // Auto-detect embed type if not specified
        const detectedType = type || EmbedHelpers.detectEmbedType(url);
        
        console.log('setEmbed command executing:', { url, detectedType });
        
        return commands.insertContent({
          type: this.name,
          attrs: {
            src: url,
            type: detectedType,
          },
        });
      },
    };
  },


  });
  
  // Verify the extension was created successfully
  if (window.DocEditor.EmbedExtension) {
    console.log('✅ Embed extension created successfully');
    console.log('Extension details:', {
      name: window.DocEditor.EmbedExtension.name,
      type: typeof window.DocEditor.EmbedExtension,
      config: !!window.DocEditor.EmbedExtension.config
    });
    return true;
  } else {
    console.error('❌ Failed to create embed extension');
    return false;
  }
}

/**
 * Wait for Tiptap to be available and then create the extension
 */
function waitForTiptapAndCreateExtension() {
  // Try to create the extension immediately
  if (createEmbedExtension()) {
    return; // Success!
  }
  
  // If not available, poll every 100ms for up to 5 seconds
  let attempts = 0;
  const maxAttempts = 50; // 5 seconds
  
  const checkInterval = setInterval(() => {
    attempts++;
    
    if (createEmbedExtension()) {
      clearInterval(checkInterval);
      console.log(`✅ Embed extension created after ${attempts * 100}ms`);
    } else if (attempts >= maxAttempts) {
      clearInterval(checkInterval);
      console.error('❌ Timeout: Tiptap.Node not available after 5 seconds');
    }
  }, 100);
}

// Start the process
waitForTiptapAndCreateExtension();
