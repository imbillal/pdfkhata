/**
 * Structured data for search engines. The payload is built from our own static
 * registry/content (no user input), and "<" is escaped so it can't close the tag.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
