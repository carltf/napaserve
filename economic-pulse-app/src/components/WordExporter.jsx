import { useState } from "react";
import { Document, Packer, Paragraph, TextRun, ExternalHyperlink } from "docx";

const FONT = "Times New Roman";
const SIZE = 24; // 12pt in half-points
const BODY_SPACING = { line: 360, after: 160 };
const HEADER_SPACING = { line: 360, before: 240, after: 160 };

function tr(text) {
  return new TextRun({ text, size: SIZE, font: FONT });
}

function trItalic(text) {
  return new TextRun({ text, size: SIZE, font: FONT, italics: true });
}

function italicP(text) {
  return new Paragraph({ spacing: BODY_SPACING, children: [trItalic(text)] });
}

function blank() {
  return new Paragraph({ spacing: BODY_SPACING, children: [tr("")] });
}

// ── Unified inline markdown parser (single-pass) ──
// Handles *italic*, [link](url), and *[italic link](url)* in one scan.
// Recurses into italic spans and link text so nested patterns resolve correctly.
function parseInline(text, opts = {}) {
  const { bold = false, italic = false, hyperlink = false } = opts;
  const parts = [];
  let i = 0;
  let plainStart = 0;

  function makeRun(t, extraItalic) {
    const props = { text: t, size: SIZE, font: FONT, bold, italics: italic || extraItalic };
    if (hyperlink) props.style = "Hyperlink";
    return new TextRun(props);
  }

  function flushPlain(end) {
    if (end > plainStart) {
      parts.push(makeRun(text.slice(plainStart, end), false));
    }
  }

  while (i < text.length) {
    if (text[i] === "*") {
      const close = text.indexOf("*", i + 1);
      if (close > i + 1) {
        flushPlain(i);
        parts.push(...parseInline(text.slice(i + 1, close), { bold, italic: true, hyperlink }));
        i = close + 1;
        plainStart = i;
        continue;
      }
      i++;
      continue;
    }

    if (!hyperlink && text[i] === "[") {
      const closeBracket = text.indexOf("]", i + 1);
      if (closeBracket > i && closeBracket + 1 < text.length && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2);
        if (closeParen > closeBracket + 1) {
          flushPlain(i);
          const linkText = text.slice(i + 1, closeBracket);
          const url = text.slice(closeBracket + 2, closeParen);
          parts.push(
            new ExternalHyperlink({
              link: url,
              children: parseInline(linkText, { bold, italic, hyperlink: true }),
            })
          );
          i = closeParen + 1;
          plainStart = i;
          continue;
        }
      }
      i++;
      continue;
    }

    i++;
  }

  flushPlain(text.length);
  return parts.length > 0 ? parts : [makeRun(text, false)];
}

function p(text) {
  return new Paragraph({ spacing: BODY_SPACING, children: parseInline(text) });
}

function boldP(text) {
  return new Paragraph({ spacing: BODY_SPACING, children: parseInline(text, { bold: true }) });
}

function headerP(text) {
  return new Paragraph({ spacing: HEADER_SPACING, children: parseInline(text) });
}

export default function WordExporter({ article }) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const children = [];

      // 1. Headline — "Under the Hood: [Headline]"
      children.push(p(`Under the Hood: ${article.headline}`));

      // 2. Blank line
      children.push(blank());

      // 3. Byline
      children.push(p("By Tim Carl"));

      // 4. Blank line
      children.push(blank());

      // 5. Deck (optional)
      if (article.deck) {
        children.push(italicP(article.deck));
        children.push(blank());
      }

      // 6. Article Summary (optional)
      if (article.summary) {
        children.push(p("Article Summary:"));
        children.push(p(article.summary));
        children.push(blank());
      }

      // 7. Body — handles paragraph, header, and chart types
      if (article.body && article.body.length > 0) {
        for (const item of article.body) {
          if (item.type === "header") {
            children.push(headerP(item.text));
          } else if (item.type === "chart") {
            children.push(p(`[Chart ${item.number}]`));
          } else {
            children.push(p(item.text));
          }
        }
      }

      // 8. Blank line
      children.push(blank());

      // 9. Author bio
      children.push(
        p(
          "Tim Carl is a Napa Valley-based photojournalist and the founder and editor of Napa Valley, Sonoma County and Lake County Features."
        )
      );

      // 10. Blank line
      children.push(blank());

      // 11. Pull quote
      if (article.pullQuote) {
        children.push(p("Suggested Pull Quote:"));
        children.push(p(article.pullQuote));
        children.push(blank());
      }

      // 12. Captions
      if (article.captions && article.captions.length > 0) {
        children.push(p("Captions:"));
        children.push(
          ...article.captions.map((cap) => {
            let sourceText = "";
            if (cap.source) {
              sourceText = cap.source.replace(/\.$/, "");
            } else if (Array.isArray(cap.sources) && cap.sources.length > 0) {
              sourceText = cap.sources.map(s => s.label || s.url || "").filter(Boolean).join("; ");
            }
            const captionText = `Chart ${cap.number}: ${cap.title} \u2014 ${cap.description.replace(/\.$/, "")}. Source: ${sourceText}.`;
            return new Paragraph({
              spacing: BODY_SPACING,
              children: [new TextRun({ text: captionText, size: SIZE, font: FONT })],
            });
          })
        );
        children.push(blank());
      }

      // 13. Related Coverage (NEW)
      if (article.relatedCoverage && article.relatedCoverage.length > 0) {
        children.push(p("Related Coverage:"));
        for (const item of article.relatedCoverage) {
          // Render as markdown link so parseInline turns title into a clickable hyperlink
          const line = `[${item.title}](${item.url}) \u2014 ${item.publication} \u00B7 ${item.date}`;
          children.push(p(line));
        }
        children.push(blank());
      }

      // 14. Substack Polls (between Related Coverage and Sources)
      if (article.substackPolls && article.substackPolls.length > 0) {
        children.push(p("Substack Polls:"));
        for (const poll of article.substackPolls) {
          children.push(boldP(poll.question));
          for (const option of poll.options) {
            children.push(p(`    • ${option}`));
          }
          children.push(blank());
        }
      }

      // 15. Sources (last)
      if (article.sources && article.sources.length > 0) {
        children.push(p("Sources:"));
        for (const src of article.sources) {
          children.push(p(src));
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: { width: 12240, height: 15840 },
                margin: {
                  top: 1440,
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${article.slug}-draft.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Word export failed:", err);
      alert("Word export failed: " + (err?.message || "Unknown error") + ". Check console for details.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      style={{
        fontFamily: "'Source Sans 3', sans-serif",
        fontSize: 14,
        fontWeight: 600,
        border: "none",
        borderRadius: 4,
        cursor: exporting ? "wait" : "pointer",
        padding: "8px 16px",
        background: "#8B7355",
        color: "#fff",
        opacity: exporting ? 0.7 : 1,
      }}
    >
      {exporting ? "Exporting\u2026" : "Export Draft"}
    </button>
  );
}
