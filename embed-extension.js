// embed-extension.js - Universal Embed Extension for Tiptap
console.log('embed-extension.js v1.0 loaded');

// Version beacon for debugging
window.DocEditor = window.DocEditor || {};
window.DocEditor._embedExtensionVersion = '1.0';

// Helper functions for URL parsing (defined outside the extension)
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
  }
};

/**
 * Universal Embed Extension for Tiptap
 * Supports: YouTube, Twitter, Vimeo, CodePen, and generic iframes
 */
window.DocEditor.EmbedExtension = window.Tiptap.Node.create({
  name: 'embed',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      type: {
        default: 'generic', // youtube, twitter, vimeo, codepen, generic
      },
      width: {
        default: '100%',
      },
      height: {
        default: 400,
      },
      title: {
        default: 'Embedded content',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-embed]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, type, width, height, title } = HTMLAttributes;
    
    // Generate the appropriate embed HTML based on type
    let iframeSrc = '';
    
    switch (type) {
      case 'youtube':
        const youtubeId = EmbedHelpers.extractYouTubeId(src);
        if (youtubeId) {
          iframeSrc = `https://www.youtube.com/embed/${youtubeId}`;
        }
        break;
        
      case 'twitter':
        iframeSrc = `https://twitframe.com/show?url=${encodeURIComponent(src)}`;
        break;
        
      case 'vimeo':
        const vimeoId = EmbedHelpers.extractVimeoId(src);
        if (vimeoId) {
          iframeSrc = `https://player.vimeo.com/video/${vimeoId}`;
        }
        break;
        
      case 'codepen':
        const codepenId = EmbedHelpers.extractCodePenId(src);
        if (codepenId) {
          iframeSrc = `https://codepen.io/pen/${codepenId}`;
        }
        break;
        
      default: // generic iframe
        iframeSrc = src;
    }

    // If we couldn't extract a proper URL, fallback to original
    if (!iframeSrc) {
      iframeSrc = src;
    }

    return [
      'div',
      {
        'data-embed': '',
        'data-type': type,
        class: 'embed-wrapper',
      },
      [
        'iframe',
        {
          src: iframeSrc,
          width: width,
          height: height,
          title: title,
          frameborder: '0',
          allowfullscreen: type === 'youtube' || type === 'vimeo' || type === 'codepen' ? 'true' : null,
          allow: type === 'youtube' ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' : 
                 type === 'vimeo' ? 'autoplay; fullscreen; picture-in-picture' : null,
        },
      ],
    ];
  },

  addCommands() {
    return {
      setEmbed: (options) => ({ commands }) => {
        const { url, type = null } = options;
        
        // Auto-detect embed type if not specified
        const detectedType = type || EmbedHelpers.detectEmbedType(url);
        
        return commands.insertContent({
          type: this.name,
          attrs: {
            src: url,
            type: detectedType,
            width: '100%',
            height: detectedType === 'twitter' ? 500 : 400,
            title: `${detectedType} embed`,
          },
        });
      },
    };
  },


});

console.log('Embed extension created successfully');
