import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface NoteEditorProps {
  /** Initial HTML content to load into the editor */
  content?: string;
  /** Placeholder text shown when editor is empty (OpenBB: "Add your notes…") */
  placeholder?: string;
  /** Called on every change with the current HTML */
  onChange?: (html: string) => void;
  /** Called when the editor gains focus */
  onFocus?: () => void;
  /** Called when the editor loses focus */
  onBlur?: () => void;
  /** Whether the toolbar is visible (maps to OpenBB eye-toggle) */
  showToolbar?: boolean;
  /** Additional class names for the outer container */
  className?: string;
}

// ---------------------------------------------------------------------------
// Toolbar button icons — match OpenBB reference shapes
// ---------------------------------------------------------------------------

const IconBold = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <path d="M5.105 12C4.708 12 4.424 11.912 4.252 11.736 4.084 11.556 4 11.272 4 10.883V4.117C4 3.72 4.086 3.436 4.258 3.264 4.434 3.088 4.716 3 5.105 3c1.322 0 3.15 0 3.923 0 1.11 0 2.026.982 2.026 2.185 0 .9-.45 1.634-1.35 2.051 1.162.213 1.814 1.392 1.814 2.245 0 1.031-.528 2.519-2.24 2.519H5.104zm3.274-3.997H5.8v2.628h2.579c.52 0 1.25-.51 1.25-1.332s-.73-1.296-1.25-1.296zM5.8 4.37v2.327h2.38c.36 0 1.097-.337 1.097-1.196S8.48 4.37 8.18 4.37H5.8z" />
  </svg>
);

const IconItalic = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <path d="M5.675 3.5a.45.45 0 01.45-.45h4.5a.45.45 0 010 .9H9.006L7.23 11.05h1.644a.45.45 0 010 .9h-4.5a.45.45 0 010-.9h1.619L7.77 3.95H6.125a.45.45 0 01-.45-.45z" fillRule="evenodd" clipRule="evenodd" />
  </svg>
);

const IconStrike = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <path d="M5 3.25a.25.25 0 01.25-.25h4.5a.25.25 0 01.25.25v.5a.25.25 0 01-.25.25h-4.5a.25.25 0 01-.25-.25v-.5zm-2 4a.5.5 0 000 1h9a.5.5 0 000-1H3zm2.75 3.25a.25.25 0 00-.25.25v.5c0 .138.112.25.25.25h4.5a.25.25 0 00.25-.25v-.5a.25.25 0 00-.25-.25h-4.5z" />
  </svg>
);

const IconHeading = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <path d="M3 3.5a.5.5 0 011 0v3.5h7V3.5a.5.5 0 011 0v8a.5.5 0 01-1 0V8H4v3.5a.5.5 0 01-1 0v-8z" />
  </svg>
);

const IconBulletList = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <path d="M1.5 5.25a.75.75 0 110-1.5.75.75 0 010 1.5zM4 4.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm-2.5.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 3a.75.75 0 110-1.5.75.75 0 010 1.5z" fillRule="evenodd" clipRule="evenodd" />
  </svg>
);

const IconOrderedList = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6" />
    <line x1="10" y1="12" x2="21" y2="12" />
    <line x1="10" y1="18" x2="21" y2="18" />
    <path d="M4 6h1v4" />
    <path d="M4 10h2" />
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
  </svg>
);

const IconBlockquote = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <path d="M2 3.5a.5.5 0 01.5-.5h10a.5.5 0 010 1h-10a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h10a.5.5 0 010 1h-10a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h10a.5.5 0 010 1h-10a.5.5 0 01-.5-.5z" />
  </svg>
);

const IconCode = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <path d="M9.5 3l-4 9m1.354-8.354l3 3a.5.5 0 010 .708l-3 3m-4-6.708l-3 3a.5.5 0 000 .708l3 3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconHorizontalRule = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <path d="M2 7.5a.5.5 0 01.5-.5h10a.5.5 0 010 1h-10a.5.5 0 01-.5-.5z" fillRule="evenodd" clipRule="evenodd" />
  </svg>
);

const IconClearFormatting = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
    <path d="M4.5 2.5a.5.5 0 000 1h2v9a.5.5 0 001 0v-9h2a.5.5 0 000-1h-5zm-2 10a.5.5 0 000 1h10a.5.5 0 000-1h-10z" />
  </svg>
);

// ---------------------------------------------------------------------------
// TipTap extensions configuration — matches OpenBB editor features
// ---------------------------------------------------------------------------
function createExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      bulletList: { keepMarks: true, keepAttributes: false },
      orderedList: { keepMarks: true, keepAttributes: false },
    }),
    Underline,
    TextStyle,
    Color,
    Placeholder.configure({
      placeholder,
    }),
  ];
}

// ---------------------------------------------------------------------------
// NoteEditor — implements the OpenBB Workspace note editor pattern
// ---------------------------------------------------------------------------
export function NoteEditor({
  content = "",
  placeholder = "Add your notes. Click here and start typing.",
  onChange,
  onFocus,
  onBlur,
  showToolbar = true,
  className = "",
}: NoteEditorProps): JSX.Element {
  const [currentColor, setCurrentColor] = useState("#374151");
  const colorInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: createExtensions(placeholder),
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    onFocus: () => onFocus?.(),
    onBlur: () => onBlur?.(),
    editorProps: {
      attributes: {
        class:
          "tiptap prose dark:prose-invert max-w-none prose-headings:my-1.5 prose-p:my-1 outline-none focus:outline-none min-h-full px-2 pt-2 pb-2",
      },
    },
  });

  // Sync content from prop when it changes externally (e.g. API data loads after editor init)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      const { from } = editor.state.selection;
      editor.commands.setContent(content, { emitUpdate: false });
      // Restore cursor position if possible
      try {
        editor.commands.setTextSelection(Math.min(from, editor.state.doc.content.size));
      } catch {
        // If position is invalid, place cursor at end
        editor.commands.setTextSelection(editor.state.doc.content.size);
      }
    }
  }, [content, editor]);

  const handleToolbarMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      // Focus the editor so commands operate on the right selection
      editor?.commands.focus();
    },
    [editor],
  );

  const setColor = useCallback(
    (color: string) => {
      setCurrentColor(color);
      editor?.chain().focus().setColor(color).run();
    },
    [editor],
  );

  if (!editor) {
    return (
      <div className={`flex items-center justify-center h-full text-gray-400 ${className}`}>
        Loading editor…
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col h-full ${className}`}>
      {/* -------------------------------------------------------------- */}
      {/* Editor content — matches OpenBB ".tiptap.ProseMirror" pattern  */}
      {/* -------------------------------------------------------------- */}
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>

      {/* -------------------------------------------------------------- */}
      {/* Floating toolbar — OpenBB: "absolute bottom-2.5 left-1/2 -translate-x-1/2" */}
      {/* -------------------------------------------------------------- */}
      {showToolbar && (
        <div className="flex flex-row items-center gap-1 absolute bottom-2.5 left-1/2 -translate-x-1/2 text-gray-500 dark:text-gray-400 z-10 bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 dark:border-dark-700 px-2 py-1">
          {/* Bold */}
          <button
            type="button"
            title="Bold"
            aria-label="Bold"
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors ${editor.isActive("bold") ? "text-blue-600 dark:text-blue-400" : ""}`}
            onMouseDown={handleToolbarMouseDown}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <IconBold />
          </button>

          {/* Italic */}
          <button
            type="button"
            title="Italic"
            aria-label="Italic"
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors ${editor.isActive("italic") ? "text-blue-600 dark:text-blue-400" : ""}`}
            onMouseDown={handleToolbarMouseDown}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <IconItalic />
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            title="Strikethrough"
            aria-label="Strikethrough"
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors ${editor.isActive("strike") ? "text-blue-600 dark:text-blue-400" : ""}`}
            onMouseDown={handleToolbarMouseDown}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <IconStrike />
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-200 dark:bg-dark-600 mx-1" />

          {/* Heading */}
          <button
            type="button"
            title="Heading"
            aria-label="Heading"
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors ${editor.isActive("heading") ? "text-blue-600 dark:text-blue-400" : ""}`}
            onMouseDown={handleToolbarMouseDown}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <IconHeading />
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-200 dark:bg-dark-600 mx-1" />

          {/* Bullet list */}
          <button
            type="button"
            title="Bullet list"
            aria-label="Bullet list"
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors ${editor.isActive("bulletList") ? "text-blue-600 dark:text-blue-400" : ""}`}
            onMouseDown={handleToolbarMouseDown}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <IconBulletList />
          </button>

          {/* Ordered list */}
          <button
            type="button"
            title="Numbered list"
            aria-label="Numbered list"
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors ${editor.isActive("orderedList") ? "text-blue-600 dark:text-blue-400" : ""}`}
            onMouseDown={handleToolbarMouseDown}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <IconOrderedList />
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-200 dark:bg-dark-600 mx-1" />

          {/* Blockquote */}
          <button
            type="button"
            title="Blockquote"
            aria-label="Blockquote"
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors ${editor.isActive("blockquote") ? "text-blue-600 dark:text-blue-400" : ""}`}
            onMouseDown={handleToolbarMouseDown}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <IconBlockquote />
          </button>

          {/* Code block */}
          <button
            type="button"
            title="Code block"
            aria-label="Code block"
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors ${editor.isActive("codeBlock") ? "text-blue-600 dark:text-blue-400" : ""}`}
            onMouseDown={handleToolbarMouseDown}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <IconCode />
          </button>

          {/* Horizontal rule */}
          <button
            type="button"
            title="Horizontal rule"
            aria-label="Horizontal rule"
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            onMouseDown={handleToolbarMouseDown}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <IconHorizontalRule />
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-200 dark:bg-dark-600 mx-1" />

          {/* Color picker — matches OpenBB input[type=color] pattern */}
          <div className="relative">
            <button
              type="button"
              title="Text color"
              aria-label="Text color"
              className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors ${editor.isActive("textStyle", { color: currentColor }) ? "text-blue-600 dark:text-blue-400" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                colorInputRef.current?.click();
              }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                <path d="M7.5 1L5.36 4.83 1.13 5.45l3.06 2.98L3.47 13 7.5 10.88 11.53 13l-.72-4.57L13.87 5.45 9.64 4.83 7.5 1z" />
              </svg>
            </button>
            <input
              ref={colorInputRef}
              type="color"
              value={currentColor}
              onChange={(e) => setColor(e.target.value)}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
              aria-label="Pick a color"
            />
          </div>

          {/* Clear formatting */}
          <button
            type="button"
            title="Clear formatting"
            aria-label="Clear formatting"
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            onMouseDown={handleToolbarMouseDown}
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          >
            <IconClearFormatting />
          </button>
        </div>
      )}
    </div>
  );
}

export default NoteEditor;
