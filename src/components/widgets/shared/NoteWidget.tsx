import { useMemo, useRef, useState } from "react";
import { useWidgetData } from "../../../hooks/useWidgetData";
import type { WidgetInstanceProps } from "../../../types/widgets";
import type { WidgetInstance } from "../../../types/widgets";
import { WidgetWrapper } from "../WidgetWrapper";
import { ErrorDisplay } from "./ErrorDisplay";
import { NoteEditor } from "./NoteEditor";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface NoteWidgetExtraProps {
  showControls?: boolean;
}

interface NoteBlock {
  type: string;
  content: unknown;
}

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

/**
 * Determine what data to display, similar to BaseWidget's displayData logic.
 */
function getDisplayData(
  fetchedData: unknown,
  widget: WidgetInstance,
): unknown {
  if (fetchedData !== undefined && fetchedData !== null) return fetchedData;
  if (widget.data !== undefined && widget.data !== null) return widget.data;
  return null;
}

/**
 * Check if note data has actual content.
 * Supports both HTML strings and structured block arrays.
 */
function hasNoteContent(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  // Block-based format: { type: "note", content: [...] }
  if (d.type === "note" && Array.isArray(d.content) && d.content.length > 0) return true;
  if (Array.isArray(d.content) && d.content.length > 0) return true;
  // HTML string format
  if (typeof d.html === "string" && d.html.trim().length > 0) return true;
  return false;
}

/**
 * Convert structured note blocks to HTML.
 */
function noteBlocksToHtml(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const d = data as Record<string, unknown>;

  // Already an HTML string
  if (typeof d.html === "string") return d.html;

  // Block-based format
  if (!Array.isArray(d.content)) return "";
  return (d.content as NoteBlock[])
    .map((block) => {
      switch (block.type) {
        case "h1":
          return `<h1>${block.content}</h1>`;
        case "h2":
          return `<h2>${block.content}</h2>`;
        case "h3":
          return `<h3>${block.content}</h3>`;
        case "p":
          return `<p>${block.content}</p>`;
        case "ul": {
          const items = Array.isArray(block.content) ? block.content : [];
          return `<ul>${items.map((item: string) => `<li>${item}</li>`).join("")}</ul>`;
        }
        case "ol": {
          const items = Array.isArray(block.content) ? block.content : [];
          return `<ol>${items.map((item: string) => `<li>${item}</li>`).join("")}</ol>`;
        }
        case "blockquote":
          return `<blockquote>${block.content}</blockquote>`;
        case "code":
          return `<pre><code>${block.content}</code></pre>`;
        default:
          return "";
      }
    })
    .join("");
}

// =========================================================================
// NoteWidget — OpenBB-compatible note widget with TipTap editor
// =========================================================================

/**
 * NoteWidget renders a structured note with a TipTap-based rich text editor
 * following the OpenBB Workspace reference architecture.
 *
 * Features:
 * - TipTap/ProseMirror WYSIWYG editor
 * - Floating formatting toolbar (bold, italic, lists, headings, color, etc.)
 * - ProseMirror placeholder when empty
 * - Backward-compatible with block-based JSON data model
 * - Read/Edit mode toggle via showControls (eye button)
 */
export function NoteWidget({
  widget,
  onRefresh,
  showControls = true,
}: WidgetInstanceProps & NoteWidgetExtraProps): JSX.Element {
  const [isUserEditing, setIsUserEditing] = useState(false);
  const lastContentRef = useRef<string>("");

  const { data: fetchedData, isLoading, error } = useWidgetData({
    endpoint: widget.endpoint || "",
    connectionUrl: widget.connectionUrl || "",
    connectionAuthentication: widget.connectionAuthentication || [],
    params: widget.currentParams || {},
    enabled: !!widget.endpoint,
  });

  const displayData = useMemo(
    () => getDisplayData(fetchedData, widget),
    [fetchedData, widget.data],
  );

  const hasContent = hasNoteContent(displayData);
  const initialHtml = hasContent ? noteBlocksToHtml(displayData) : "";

  // Track initial content so we can seed the editor on first load
  if (!isUserEditing && initialHtml && initialHtml !== lastContentRef.current) {
    lastContentRef.current = initialHtml;
  }

  const handleEditorChange = (_html: string) => {
    // Content change tracking for potential auto-save in the future.
    // Currently the widget system handles persistence via the dashboard API.
  };

  const handleFocus = () => setIsUserEditing(true);
  const handleBlur = () => {
    // Keep isUserEditing true to prevent overwriting content on re-render
  };

  return (
    <WidgetWrapper isLoading={isLoading} onRefresh={onRefresh}>
      <div className="flex flex-col h-full">
        {/* Error display */}
        {error && <ErrorDisplay error={error} />}

        {/* Note editor — TipTap/ProseMirror following OpenBB reference */}
        <NoteEditor
          content={lastContentRef.current}
          placeholder="Add your notes. Click here and start typing."
          onChange={handleEditorChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          showToolbar={showControls}
          className="flex-1"
        />
      </div>
    </WidgetWrapper>
  );
}

export default NoteWidget;
