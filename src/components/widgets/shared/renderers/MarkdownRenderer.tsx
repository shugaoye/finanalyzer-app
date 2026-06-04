import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ImageProcessor } from "../../../../utils/imageProcessor";

interface MarkdownRendererProps {
  data: unknown;
}

export function MarkdownRenderer({ data }: MarkdownRendererProps): JSX.Element {
  const [content, setContent] = useState<string>(() => {
    if (typeof data === "object" && data !== null && "content" in data) {
      return String(data.content);
    }
    if (typeof data === "string") {
      return data;
    }
    return "# Markdown Widget\n\nThis is a Markdown widget.";
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const processMarkdownImages = async () => {
      if (typeof data === "object" && data !== null && "content" in data) {
        setLoading(true);
        try {
          let processedContent: string = String(data.content);

          const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
          const matches = [...processedContent.matchAll(imageRegex)];

          for (const match of matches) {
            const [fullMatch, altText, imageUrl] = match;
            try {
              if (
                imageUrl.startsWith("http://") ||
                imageUrl.startsWith("https://")
              ) {
                const base64Image = await ImageProcessor.urlToBase64(imageUrl);
                processedContent = processedContent.replace(
                  fullMatch,
                  `![${altText}](${base64Image})`,
                );
              }
            } catch (error) {
              console.error(`Error processing image ${imageUrl}:`, error);
            }
          }

          setContent(processedContent);
        } catch (error) {
          console.error("Error processing markdown images:", error);
        } finally {
          setLoading(false);
        }
      } else if (typeof data === "string") {
        setContent(data);
      }
    };

    processMarkdownImages();
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4 overflow-auto h-full">
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ children }) => (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="border-b border-gray-200 dark:border-dark-700">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="text-left font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">
                {children}
              </th>
            ),
            tr: ({ children }) => (
              <tr className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-800">
                {children}
              </tr>
            ),
            td: ({ children }) => (
              <td className="text-left text-gray-700 dark:text-gray-300 px-3 py-2">
                {children}
              </td>
            ),
            h1: ({ children }) => (
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 mt-4">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900 dark:text-white">
                {children}
              </strong>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-blue-500 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mb-3 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 mb-3 space-y-1">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-sm text-gray-700 dark:text-gray-300">
                {children}
              </li>
            ),
            code: ({ className, children }) => {
              const isInline = !className || !className.includes('language-');
              if (isInline) {
                return (
                  <code className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-dark-700 rounded text-gray-800 dark:text-gray-200">
                    {children}
                  </code>
                );
              }
              return (
                <code className={`${className} p-3 rounded-lg bg-dark-900 dark:bg-dark-900 text-gray-100`}>
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="p-3 rounded-lg bg-dark-900 dark:bg-dark-900 text-gray-100 overflow-x-auto mb-3">
                {children}
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
                {children}
              </blockquote>
            ),
            hr: () => (
              <hr className="my-6 border-gray-200 dark:border-dark-700" />
            ),
            img: ({ src, alt }) => (
              <img
                src={src}
                alt={alt || ''}
                className="max-w-full h-auto rounded-lg"
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
