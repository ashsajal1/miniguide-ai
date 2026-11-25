"use server";

export interface ExtractedContent {
  title: string;
  text: string;
  wordCount: number;
  isLarge: boolean;
}

// Maximum characters to send to AI (~12K tokens estimate)
const MAX_CONTENT_CHARS = 40000;

// Elements whose whole subtree is chrome, not content
const BOILERPLATE =
  /<(script|style|nav|header|footer|aside|iframe|noscript|svg|form|button|select|textarea|dialog|menu|template)\b[\s\S]*?<\/\1>/gi;

const BLOCK_END = /<\/(p|div|section|article|main|li|tr|table|blockquote|figure|dl|dd|dt)>/gi;

const ENTITY_NAMES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  ldquo: "“",
  rdquo: "”",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (match, name: string) => {
    if (name[0] === "#") {
      const code =
        name[1] === "x" || name[1] === "X"
          ? parseInt(name.slice(2), 16)
          : parseInt(name.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return ENTITY_NAMES[name.toLowerCase()] ?? match;
  });
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}

/**
 * Extracts clean text content from a URL.
 *
 * No DOM library: jsdom cannot boot on Cloudflare Workers (`__dirname` in its
 * style-rules, and `node:vm` is missing), so the HTML is reduced to text with
 * targeted regexes. Trimmed-down markdown is all the outline prompt needs.
 */
export async function extractContentFromUrl(url: string): Promise<ExtractedContent> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; CourseBot/1.0; +https://github.com/coursebot)",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
    },
    signal: AbortSignal.timeout(30000), // 30 second timeout
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  const title =
    decodeEntities(stripTags(/<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? ""))
      .trim() ||
    decodeEntities(
      stripTags(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] ?? "")
    ).trim() ||
    "Untitled Document";

  const cleanedText = cleanText(htmlToText(contentRegion(html)));
  const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;

  return {
    title,
    text: cleanedText,
    wordCount,
    isLarge: cleanedText.length > MAX_CONTENT_CHARS,
  };
}

/** Narrows to the page's main content block when the site marks one. */
function contentRegion(html: string): string {
  const tag = /<(main|article)\b[^>]*>([\s\S]*?)<\/\1>/i.exec(html);
  if (tag) return tag[2];
  const role = /<[a-z]+\b[^>]*role="main"[^>]*>([\s\S]*?)<\/[a-z]+>/i.exec(html);
  return role ? role[1] : html;
}

/** Flattens HTML into markdown-ish text, keeping headings, lists and code. */
function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(BOILERPLATE, " ")
      // Code and pre blocks first, so their angle brackets survive
      .replace(
        /<(pre|code)\b[^>]*>([\s\S]*?)<\/\1>/gi,
        (_, __, body: string) =>
          `\n\`\`\`\n${decodeEntities(stripTags(body)).trim()}\n\`\`\`\n`
      )
      .replace(
        /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi,
        (_, level: string, body: string) =>
          `\n\n${"#".repeat(Number(level))} ${stripTags(body)}\n`
      )
      .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, body: string) => `\n- ${stripTags(body)}`)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(BLOCK_END, "\n\n")
      .replace(/<[^>]*>/g, " ")
  );
}

/**
 * Cleans and normalizes extracted text
 */
function cleanText(text: string): string {
  return text
    // Collapse multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    // Collapse multiple spaces
    .replace(/[ \t]+/g, " ")
    // Remove leading/trailing whitespace per line
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    // Remove empty lines that are just whitespace
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

/**
 * Chunks large content into manageable pieces for AI processing
 */
export async function chunkContent(text: string, maxChunkSize: number = MAX_CONTENT_CHARS): Promise<string[]> {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  const paragraphs = text.split("\n\n");
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 2 > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = paragraph;
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Summarizes content if it's too large by taking key sections
 */
export async function summarizeForOutline(text: string, maxLength: number = MAX_CONTENT_CHARS): Promise<string> {
  if (text.length <= maxLength) {
    return text;
  }

  // Strategy: Take beginning + middle + end to capture structure
  const sectionSize = Math.floor(maxLength / 3);
  const beginning = text.slice(0, sectionSize);
  const middle = text.slice(
    Math.floor(text.length / 2) - sectionSize / 2,
    Math.floor(text.length / 2) + sectionSize / 2
  );
  const end = text.slice(-sectionSize);

  return `${beginning}\n\n[... content truncated ...]\n\n${middle}\n\n[... content truncated ...]\n\n${end}`;
}
