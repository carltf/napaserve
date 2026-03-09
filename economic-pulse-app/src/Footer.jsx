export default function Footer() {
  return (
    <footer style={{
      backgroundColor: "#1a0a0a",
      borderTop: "1px solid #3a1a1a",
      padding: "24px 32px",
      marginTop: "auto",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
    }}>
      <div style={{ color: "#8a5a5a", fontSize: "13px", letterSpacing: "0.04em" }}>
        © {new Date().getFullYear()} NapaServe · Napa County
      </div>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        alignItems: "center",
        fontSize: "13px",
      }}>
        <a
          href="mailto:napaserve@gmail.com"
          style={{ color: "#b08080", textDecoration: "none", letterSpacing: "0.03em" }}
          onMouseEnter={e => e.target.style.color = "#d4a0a0"}
          onMouseLeave={e => e.target.style.color = "#b08080"}
        >
          napaserve@gmail.com
        </a>
        <a
          href="tel:7076619465"
          style={{ color: "#b08080", textDecoration: "none", letterSpacing: "0.03em" }}
          onMouseEnter={e => e.target.style.color = "#d4a0a0"}
          onMouseLeave={e => e.target.style.color = "#b08080"}
        >
          707-661-9465
        </a>
      </div>
    </footer>
  );
}
