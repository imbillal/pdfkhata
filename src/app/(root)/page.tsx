import Link from "next/link";

// "/" has no content of its own: Bangla browsers go to /bn/, everyone else to /en/.
// Static content only, so the inline script is safe.
const REDIRECT = `
  var langs = navigator.languages || [navigator.language || ""];
  var bn = langs.some(function (l) { return /^bn/i.test(l); });
  location.replace(bn ? "/bn/" : "/en/");
`;

export default function RootRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content="1; url=/en/" />
      <script dangerouslySetInnerHTML={{ __html: REDIRECT }} />
      <p style={{ padding: 24 }}>
        <Link href="/en/">English</Link> · <Link href="/bn/">বাংলা</Link>
      </p>
    </>
  );
}
