import type { ReactNode } from "react";

// Types for note content blocks (backend returns {"type": "note", "content": [...]})
interface NoteContentBlock {
  type: string;
  content: string | string[];
}

interface NoteData {
  type?: string;
  content?: NoteContentBlock[];
}

interface NoteRendererProps {
  data: unknown;
}

/**
 * Parse inline markdown-like formatting: **bold**, *italic*, `code`
 */
function parseInlineMarkdown(text: string): ReactNode {
  if (!text) return null;

  const parts: ReactNode[] = [];
  // Parse **bold** and *italic* and `code` sequentially
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // **bold**
      parts.push(
        <strong key={match.index} className="font-semibold text-gray-900 dark:text-white">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={match.index} className="italic text-gray-600 dark:text-gray-400">
          {match[4]}
        </em>,
      );
    } else if (match[5]) {
      // `code`
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-dark-700 rounded text-gray-800 dark:text-gray-200">
          {match[6]}
        </code>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

function InlineContent({ text }: { text: string }): JSX.Element {
  return <>{parseInlineMarkdown(text)}</>;
}

function NoteBlock({ block }: { block: NoteContentBlock }): JSX.Element | null {
  const { type, content } = block;

  switch (type) {
    case "h1":
      return (
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-2">
          <InlineContent text={String(content)} />
        </h1>
      );

    case "h2":
      return (
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">
          <InlineContent text={String(content)} />
        </h2>
      );

    case "h3":
      return (
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 mt-4">
          <InlineContent text={String(content)} />
        </h3>
      );

    case "h4":
      return (
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-3">
          <InlineContent text={String(content)} />
        </h4>
      );

    case "h5":
      return (
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-2">
          <InlineContent text={String(content)} />
        </h5>
      );

    case "h6":
      return (
        <h6 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 mt-2">
          <InlineContent text={String(content)} />
        </h6>
      );

    case "p":
      return (
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          <InlineContent text={String(content)} />
        </p>
      );

    case "ul":
      return (
        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mb-3 space-y-1">
          {Array.isArray(content)
            ? content.map((item, idx) => (
                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                  <InlineContent text={String(item)} />
                </li>
              ))
            : (
                <li className="text-sm text-gray-700 dark:text-gray-300">
                  <InlineContent text={String(content)} />
                </li>
              )}
        </ul>
      );

    case "ol":
      return (
        <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 mb-3 space-y-1">
          {Array.isArray(content)
            ? content.map((item, idx) => (
                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                  <InlineContent text={String(item)} />
                </li>
              ))
            : (
                <li className="text-sm text-gray-700 dark:text-gray-300">
                  <InlineContent text={String(content)} />
                </li>
              )}
        </ol>
      );

    case "code":
      return (
        <pre className="p-3 rounded-lg bg-dark-900 dark:bg-dark-900 text-gray-100 overflow-x-auto mb-3 text-xs font-mono">
          <code>{String(content)}</code>
        </pre>
      );

    case "blockquote":
      return (
        <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <InlineContent text={String(content)} />
        </blockquote>
      );

    case "hr":
      return <hr className="my-6 border-gray-200 dark:border-dark-700" />;

    default:
      // Fallback: render unknown types as paragraph
      return (
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          <InlineContent text={String(content)} />
        </p>
      );
  }
}

/**
 * NoteRenderer renders structured note content from the backend.
 *
 * Expected data format:
 *   { "type": "note", "content": [ { "type": "h1", "content": "..." }, ... ] }
 * or
 *   { "content": [ ... ] }  (type field optional, or absent)
 *
 * Each content block has:
 *   - type: "h1"|"h2"|"h3"|"h4"|"h5"|"h6"|"p"|"ul"|"ol"|"code"|"blockquote"|"hr"
 *   - content: string (for simple blocks) or string[] (for ul/ol lists)
 */
export function NoteRenderer({ data }: NoteRendererProps): JSX.Element {
  // Extract the note content from various possible data shapes
  let noteData: NoteData | null = null;

  if (typeof data === "object" && data !== null) {
    const d = data as Record<string, unknown>;

    // Case 1: { type: "note", content: [...] }
    if (d.type === "note" && Array.isArray(d.content)) {
      noteData = { type: "note", content: d.content as NoteContentBlock[] };
    }
    // Case 2: { content: [...] } (type inferred)
    else if (Array.isArray(d.content)) {
      noteData = { content: d.content as NoteContentBlock[] };
    }
    // Case 3: data is directly the content array
    else if (Array.isArray(data)) {
      noteData = { content: data as unknown as NoteContentBlock[] };
    }
    // Case 4: { content: "plain text string" }
    else if (typeof d.content === "string") {
      noteData = {
        content: [{ type: "p", content: d.content }],
      };
    }
  }

  if (!noteData || !noteData.content || noteData.content.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4">
        No note content
      </div>
    );
  }

  return (
    <div className="p-4 overflow-auto h-full note-widget-content">
      {noteData.content.map((block, index) => (
        <NoteBlock key={index} block={block} />
      ))}
    </div>
  );
}
