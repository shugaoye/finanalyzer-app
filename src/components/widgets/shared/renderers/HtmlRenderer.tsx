import { useEffect, useRef, useState } from "react";
import { getHtmlWidgetSandbox } from "../../../../extensions/core/HtmlWidgetSandbox";

interface HtmlRendererProps {
  data: unknown;
  widgetId: string;
  instanceId: string;
  onUpdate?: (params: Record<string, unknown>) => void;
}

interface SandboxMessage {
  type: string;
  parameter?: string;
  value?: unknown;
  error?: string;
}

export function HtmlRenderer({
  data,
  widgetId,
  instanceId,
  onUpdate,
}: HtmlRendererProps): JSX.Element {
  const content =
    typeof data === "object" && data !== null && "content" in data
      ? String(data.content)
      : typeof data === "string"
        ? data
        : "<div>HTML Widget</div>";

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitializedRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const [isReady, setIsReady] = useState(false);

  // Initialize iframe once
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const sandbox = getHtmlWidgetSandbox();
    const iframe = sandbox.createSandbox(widgetId, instanceId);
    iframeRef.current = iframe;

    const cleanupFn = sandbox.setupCommunication(
      iframe,
      widgetId,
      instanceId,
      (message: SandboxMessage) => {
        if (message.type === "widgetReady") {
          setIsReady(true);
          if (iframeRef.current) {
            sandbox.injectContent(iframeRef.current, content);
          }
        } else if (message.type === "parameterUpdate" && onUpdate) {
          onUpdate({ [message.parameter as string]: message.value });
        } else if (message.type === "error") {
          console.error("HTML widget error:", message.error);
        }
      },
    );

    cleanupRef.current = cleanupFn;

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (iframeRef.current) {
        sandbox.cleanup(iframeRef.current);
        iframeRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [widgetId, instanceId]);

  // Inject content when ready or content changes
  useEffect(() => {
    if (isReady && iframeRef.current) {
      const sandbox = getHtmlWidgetSandbox();
      sandbox.injectContent(iframeRef.current, content);
    }
  }, [content, isReady]);

  // Append iframe to container
  useEffect(() => {
    if (containerRef.current && iframeRef.current && !containerRef.current.contains(iframeRef.current)) {
      containerRef.current.appendChild(iframeRef.current);
    }
  });

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
    >
      {!isReady && (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      )}
    </div>
  );
}
