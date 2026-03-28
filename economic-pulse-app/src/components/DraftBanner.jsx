export default function DraftBanner() {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: "#F5F0E8",
      borderLeft: "4px solid #C4A050",
      padding: "10px 20px",
      fontFamily: "'Source Sans 3', sans-serif",
      fontSize: 13,
      fontWeight: 600,
      color: "#2C1810",
      letterSpacing: "0.02em",
    }}>
      DRAFT — This article is not yet published. Visible to admins only.
    </div>
  );
}
