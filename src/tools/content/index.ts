import { PDF_CONTENT } from "./pdf";
import { OTHER_CONTENT } from "./other";
import type { ToolContent } from "./types";

export type { ToolContent } from "./types";

const ALL: Record<string, ToolContent> = { ...PDF_CONTENT, ...OTHER_CONTENT };

export function getToolContent(slug: string): ToolContent | undefined {
  return ALL[slug];
}
