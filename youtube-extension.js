// youtube-extension.js

// This relies on Tiptap's core Node object. We ensure it's loaded first.
const Node = window.Tiptap.Core.Node;

const YoutubeExtension = Node.create({
  name: "youtube", // The unique name for this node
  group: "block",
  atom: true, // It's a single, indivisible block

  addAttributes() {
    return {
      src: { default: null },
      width: { default: 640 },
      height: { default: 480 },
    };
  },

  // Defines how to render the node in the editor and for saving.
  renderHTML({ HTMLAttributes }) {
    // The outer div helps Tiptap manage the node.
    return ["div", { "data-youtube-video": "" }, ["iframe", HTMLAttributes]];
  },

  // Defines how to recognize this node when pasting HTML.
  parseHTML() {
    return [{ tag: "div[data-youtube-video]" }];
  },

  // Adds a new command `setYoutubeVideo` to the editor.
  addCommands() {
    return {
      setYoutubeVideo:
        (options) =>
        ({ commands }) => {
          // A helper to extract the video ID from any YouTube URL
          const getYoutubeVideoId = (url) => {
            if (!url) return null;
            const regex =
              /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            const match = url.match(regex);
            return match ? match : null;
          };

          const videoId = getYoutubeVideoId(options.src);

          if (!videoId) {
            alert("Invalid YouTube URL");
            return false;
          }

          const embedUrl = `https://www.youtube.com/embed/${videoId}`;

          return commands.insertContent({
            type: this.name,
            attrs: { src: embedUrl },
          });
        },
    };
  },
});

// Attach the new class to our global namespace
window.DocEditor.YouTube = YoutubeExtension;
