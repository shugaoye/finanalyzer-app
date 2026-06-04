import type {
  QueryRequest,
  QueryMessage,
  WidgetInfo,
  WidgetContext,
  Message,
} from "../../types/ai";

export function buildQueryRequest(
  userMessage: string,
  history: Message[],
  primaryWidgets?: WidgetInfo[],
  secondaryWidgets?: WidgetInfo[],
): QueryRequest {
  const messages: QueryMessage[] = [];

  for (const msg of history) {
    if (msg.role === "user") {
      messages.push({
        role: "human",
        content: msg.content,
      });
    } else if (msg.role === "assistant" && !msg.isReasoning) {
      messages.push({
        role: "ai",
        content: msg.content,
      });
    }
  }

  messages.push({
    role: "human",
    content: userMessage,
  });

  const widgets: WidgetContext | undefined = extractWidgetContext(
    primaryWidgets,
    secondaryWidgets,
  );

  return {
    messages,
    widgets,
  };
}

export function extractWidgetContext(
  primaryWidgets?: WidgetInfo[],
  secondaryWidgets?: WidgetInfo[],
): WidgetContext | undefined {
  const hasPrimary = primaryWidgets && primaryWidgets.length > 0;
  const hasSecondary = secondaryWidgets && secondaryWidgets.length > 0;

  if (!hasPrimary && !hasSecondary) {
    return undefined;
  }

  return {
    primary: primaryWidgets || [],
    secondary: hasSecondary ? secondaryWidgets : undefined,
  };
}

export function parseWidgetMention(message: string): string[] {
  const mentionRegex = /@([\w-]+\/[\w-]+|[\w-]+)/g;
  const matches = message.match(mentionRegex);

  if (!matches) {
    return [];
  }

  return matches.map((match) => match.slice(1));
}

export function extractWidgetNamesFromMention(message: string): string[] {
  const mentions = parseWidgetMention(message);

  return mentions.filter((mention) => {
    return !isCommonWord(mention);
  });
}

function isCommonWord(word: string): boolean {
  const commonWords = new Set([
    "help",
    "please",
    "thanks",
    "thank",
    "you",
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
  ]);

  return commonWords.has(word.toLowerCase());
}

export function removeWidgetMentions(message: string): string {
  return message.replace(/@[\w-]+\/[\w-]+/g, "").replace(/@[\w-]+/g, "").trim();
}

export function formatMessageForAgent(message: string): string {
  let formatted = message.trim();

  formatted = formatted.replace(/\s+/g, " ");

  return formatted;
}

export function buildWidgetInfoFromId(
  widgetId: string,
  name?: string,
): WidgetInfo {
  return {
    uuid: "",
    widget_id: widgetId,
    name: name || widgetId,
    description: "",
    origin: "openbb",
  };
}

export function findWidgetByMention(
  widgetId: string,
  availableWidgets: WidgetInfo[],
): WidgetInfo | undefined {
  const normalizedMention = widgetId.toLowerCase().replace(/^@/, "");

  return availableWidgets.find((widget) => {
    const normalizedId = widget.widget_id.toLowerCase();
    const normalizedName = widget.name.toLowerCase();

    return (
      normalizedId === normalizedMention ||
      normalizedName === normalizedMention ||
      normalizedId.endsWith(`/${normalizedMention}`) ||
      normalizedName.endsWith(`/${normalizedMention}`)
    );
  });
}

export function mergeWidgetsWithMentions(
  primaryWidgets: WidgetInfo[],
  message: string,
  allWidgets: WidgetInfo[],
): WidgetInfo[] {
  const mentionedNames = extractWidgetNamesFromMention(message);

  const mentionedWidgets = mentionedNames
    .map((name) => findWidgetByMention(name, allWidgets))
    .filter((w): w is WidgetInfo => w !== undefined);

  const existingIds = new Set(primaryWidgets.map((w) => w.widget_id));

  const newWidgets = mentionedWidgets.filter((w) => !existingIds.has(w.widget_id));

  return [...primaryWidgets, ...newWidgets];
}
