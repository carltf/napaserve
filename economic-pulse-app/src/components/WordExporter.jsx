import { useState } from "react";
import { Document, Packer, Paragraph, TextRun } from "docx";

const FONT = "Times New Roman";
const SIZE = 24; // 12pt in half-points
const SPACING = { line: 240 };

function tr(text) {
  return new TextRun({ text, size: SIZE, font: FONT });
}

function p(text) {
  return new Paragraph({ spacing: SPACING, children: [tr(text)] });
}

function blank() {
  return new Paragraph({ spacing: SPACING, children: [tr("")] });
}

export default function WordExporter({ article }) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const children = [];

      // 1. Headline
      children.push(p(article.headline));

      // 2. Blank line
      children.push(blank());

      // 3. Byline
      children.push(p("By Tim Carl"));

      // 4. Blank line
      children.push(blank());

      // 5. Body prose — dateline flows into first paragraph
      if (article.body && article.body.length > 0) {
        const first = article.body[0];
        const hasDateline = first.startsWith(article.dateline);
        if (hasDateline) {
          children.push(p(first));
        } else {
          children.push(p(`${article.dateline} \u2014 ${first}`));
        }
        for (let i = 1; i < article.body.length; i++) {
          children.push(p(article.body[i]));
        }
      }

      // 6. Blank line
      children.push(blank());

      // 7. Author bio
      children.push(
        p(
          "Tim Carl is a Napa Valley-based photojournalist and the founder and editor of Napa Valley, Sonoma County and Lake County Features."
        )
      );

      // 8. Blank line
      children.push(blank());

      // 9. Suggested pull quote
      if (article.pullQuote) {
        children.push(p("Suggested Pull Quote:"));
        children.push(p(article.pullQuote));
      }

      // 10. Blank line
      children.push(blank());

      // 11. Links
      if (article.links && article.links.length > 0) {
        children.push(p("Links:"));
        for (const link of article.links) {
          children.push(p(`${link.label}: ${link.url}`));
        }
      }

      // 12. Blank line
      children.push(blank());

      // 13. Captions — all run together as one paragraph
      if (article.captions && article.captions.length > 0) {
        children.push(p("Captions:"));
        const captionText = article.captions
          .map(
            (c) =>
              `Chart ${c.number}: ${c.title} \u2014 ${c.description}. Source: ${c.source}.`
          )
          .join(" ");
        children.push(p(captionText));
      }

      // 14. Blank line
      children.push(blank());

      // 15. Sources
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
