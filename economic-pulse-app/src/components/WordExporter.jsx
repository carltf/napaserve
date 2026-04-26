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

// ── Inline markdown link parser ──
// Converts "text [linkLabel](https://url) more text" into an array of runs
// mixing plain TextRun and ExternalHyperlink-wrapped runs.
// Safe for strings without any links — returns a single TextRun.
const LINK_RX = /\[([^\]]+)\]\(([^)]+)\)/g;

function parseInline(text, opts = {}) {
  const { bold = false } = opts;
  const parts = [];
  let lastEnd = 0;
  let match;
  LINK_RX.lastIndex = 0;
  while ((match = LINK_RX.exec(text)) !== null) {
    if (match.index > lastEnd) {
      parts.push(new TextRun({ text: text.slice(lastEnd, match.index), size: SIZE, font: FONT, bold }));
    }
    parts.push(
      new ExternalHyperlink({
        link: match[2],
        children: [
          new TextRun({
            text: match[1],
            size: SIZE,
            font: FONT,
            style: "Hyperlink",
            bold,
          }),
        ],
      })
    );
    lastEnd = match.index + match[0].length;
  }
  if (lastEnd < text.length) {
    parts.push(new TextRun({ text: text.slice(lastEnd), size: SIZE, font: FONT, bold }));
  }
  return parts.length > 0 ? parts : [new TextRun({ text, size: SIZE, font: FONT, bold })];
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
          ...article.captions.map(
            (cap) =>
              new Paragraph({
                spacing: BODY_SPACING,
                children: [
                  new TextRun({
                    text: `Chart ${cap.number}: ${cap.title} \u2014 ${cap.description}. Source: ${cap.source}.`,
                    size: SIZE,
                    font: FONT,
                  }),
                ],
              })
          )
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
