import { useState, useEffect, useRef, useCallback } from "react";

/* ─── TOKENS ─────────────────────────────────────────────── */
const C = {
  bg:      "#0D0D0F",
  s1:      "#12121A",
  s2:      "#16161F",
  border:  "#1E1E2A",
  b2:      "#2A2A38",
  b3:      "#383848",
  white:   "#F0EEF8",
  w2:      "#9896AA",
  w3:      "#5E5C70",
  w4:      "#2E2C40",
  // Slate / Steel accent — no blue
  accent:  "#8A9BB0",
  aDim:    "rgba(138,155,176,0.1)",
  aGlo:    "rgba(138,155,176,0.06)",
  aBorder: "rgba(138,155,176,0.28)",
  aHov:    "#9AAFC4",
  sans:    "'Inter', system-ui, -apple-system, sans-serif",
  mono:    "'JetBrains Mono', 'Courier New', monospace",
};

/* ─── GLOBAL CSS ─────────────────────────────────────────── */
const Global = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; }

    body {
      background: ${C.bg};
      color: ${C.white};
      font-family: ${C.sans};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
      /* safe-area for notched devices */
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
    }

    ::selection { background: ${C.accent}; color: #000; }
    ::-webkit-scrollbar { width: 2px; }
    ::-webkit-scrollbar-thumb { background: ${C.b2}; }
    a { color: inherit; text-decoration: none; }
    button { border: none; background: none; cursor: pointer; font-family: inherit; color: inherit; padding: 0; }
    input, select, textarea { font-family: inherit; }

    .reveal {
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .reveal.in { opacity: 1; transform: none; }

    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

    @media (prefers-reduced-motion: reduce) {
      .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
    }
  `}</style>
);

/* ─── HOOKS ──────────────────────────────────────────────── */
function useReveal(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => el.classList.add("in"), delay * 1000);
          obs.disconnect();
        }
      },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return ref;
}

function useViewport() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, []);
  return { mob: w < 768, mid: w < 1080 };
}

/* ─── LAYOUT ─────────────────────────────────────────────── */
// All horizontal padding goes through this — safe-area aware
const PX = "clamp(20px, 5vw, 64px)";
const PY_SEC = "clamp(52px, 7vw, 96px)";

/* ─── PRIMITIVES ─────────────────────────────────────────── */
const HR = ({ style = {} }) => (
  <div style={{ height: "1px", background: C.border, ...style }} />
);

const Mono = ({ children, accent, style = {} }) => (
  <span style={{
    fontFamily: C.mono,
    fontSize: "10px",
    fontWeight: 400,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: accent ? C.accent : C.w3,
    ...style,
  }}>{children}</span>
);

/* ─── BUTTONS ────────────────────────────────────────────── */
function PrimaryBtn({ children, onClick, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        fontFamily: C.sans, fontSize: "12px", fontWeight: 500,
        letterSpacing: "0.02em", padding: "11px 24px",
        background: h ? C.aHov : C.accent,
        color: "#000",
        transition: "background 0.18s",
        ...style,
      }}>{children}</button>
  );
}

function GhostBtn({ children, onClick, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        fontFamily: C.sans, fontSize: "12px", fontWeight: 400,
        letterSpacing: "0.02em", padding: "11px 24px",
        background: "transparent",
        color: h ? C.w2 : C.w3,
        border: `1px solid ${h ? C.b2 : C.border}`,
        transition: "all 0.18s",
        ...style,
      }}>{children}</button>
  );
}

function NavCTA({ children, onClick, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        fontFamily: C.sans, fontSize: "11px", fontWeight: 500,
        letterSpacing: "0.04em", padding: "8px 16px",
        background: h ? C.accent : C.aDim,
        color: h ? "#000" : C.accent,
        border: `1px solid ${h ? C.accent : C.aBorder}`,
        transition: "all 0.18s",
        ...style,
      }}>{children}</button>
  );
}

/* ─── NAV ────────────────────────────────────────────────── */
const NAV_LINKS = [
  { id: "solutions", label: "Solutions" },
  { id: "process",   label: "Process"   },
  { id: "about",     label: "About"     },
  { id: "contact",   label: "Contact"   },
];

function Nav({ page, go }) {
  const { mob } = useViewport();
  const [sc, setSc] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setSc(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const nav = id => { go(id); setOpen(false); };

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: "56px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingLeft: `max(${PX}, env(safe-area-inset-left))`,
        paddingRight: `max(${PX}, env(safe-area-inset-right))`,
        background: sc ? "rgba(13,13,15,0.96)" : "rgba(13,13,15,0.75)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${sc ? C.border : "transparent"}`,
        transition: "border-color 0.3s, background 0.3s",
      }}>
        {/* Wordmark */}
        <button onClick={() => nav("home")}
          style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div style={{
            width: "22px", height: "22px",
            border: `1.5px solid ${C.accent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: C.mono, fontSize: "9px", fontWeight: 500, color: C.accent }}>A</span>
          </div>
          <span style={{ fontFamily: C.sans, fontSize: "13px", fontWeight: 600, letterSpacing: "0.02em", color: C.white }}>
            Atlas Capital Partners
          </span>
        </button>

        {mob ? (
          <button onClick={() => setOpen(true)}
            style={{ fontFamily: C.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.w3 }}>
            Menu
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {NAV_LINKS.map(({ id, label }) => {
              const active = page === id;
              const [h, setH] = useState(false);
              return (
                <button key={id} onClick={() => nav(id)}
                  onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                  style={{
                    fontFamily: C.sans, fontSize: "12px", fontWeight: 400,
                    letterSpacing: "0.01em", padding: "0 14px", height: "56px",
                    color: active ? C.white : h ? C.w2 : C.w3,
                    borderBottom: `2px solid ${active ? C.accent : "transparent"}`,
                    transition: "color 0.15s, border-color 0.15s",
                  }}>{label}</button>
              );
            })}
            <div style={{ width: "1px", height: "18px", background: C.border, margin: "0 12px" }} />
            <NavCTA onClick={() => nav("contact")}>Schedule Consultation</NavCTA>
          </div>
        )}
      </header>

      {/* Mobile full-screen drawer */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: C.bg,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        // safe-area padding
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        <div style={{
          height: "56px", display: "flex", alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: `max(20px, env(safe-area-inset-left))`,
          paddingRight: `max(20px, env(safe-area-inset-right))`,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "22px", height: "22px", border: `1.5px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: C.mono, fontSize: "9px", color: C.accent }}>A</span>
            </div>
            <span style={{ fontFamily: C.sans, fontSize: "13px", fontWeight: 600, color: C.white }}>
              Atlas Capital Partners
            </span>
          </div>
          <button onClick={() => setOpen(false)} style={{ color: C.w3, fontSize: "18px", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 0", overflowY: "auto" }}>
          {[{ id: "home", label: "Home" }, ...NAV_LINKS].map(({ id, label }) => (
            <button key={id} onClick={() => nav(id)} style={{
              textAlign: "left",
              paddingLeft: `max(20px, env(safe-area-inset-left))`,
              paddingRight: `max(20px, env(safe-area-inset-right))`,
              paddingTop: "18px", paddingBottom: "18px",
              fontFamily: C.sans, fontSize: "20px", fontWeight: 400,
              color: page === id ? C.white : C.w2,
              borderBottom: `1px solid ${C.border}`,
              borderLeft: `2px solid ${page === id ? C.accent : "transparent"}`,
            }}>{label}</button>
          ))}
        </div>

        <div style={{
          paddingLeft: `max(20px, env(safe-area-inset-left))`,
          paddingRight: `max(20px, env(safe-area-inset-right))`,
          paddingTop: "20px", paddingBottom: "20px",
          borderTop: `1px solid ${C.border}`,
        }}>
          <NavCTA onClick={() => nav("contact")} style={{ display: "block", width: "100%", textAlign: "center", padding: "14px" }}>
            Schedule Consultation
          </NavCTA>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════ */
function Home({ go }) {
  const { mob } = useViewport();
  const [ph, setPh] = useState(0);

  useEffect(() => {
    const ts = [
      setTimeout(() => setPh(1), 100),
      setTimeout(() => setPh(2), 450),
      setTimeout(() => setPh(3), 800),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const fade = (n, extra = {}) => ({
    opacity: ph >= n ? 1 : 0,
    transform: ph >= n ? "none" : "translateY(8px)",
    transition: "opacity 0.6s ease, transform 0.6s ease",
    ...extra,
  });

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        minHeight: "100svh",   // svh respects mobile browser chrome
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        paddingLeft: `max(${PX}, env(safe-area-inset-left))`,
        paddingRight: `max(${PX}, env(safe-area-inset-right))`,
        paddingTop: "80px",
        paddingBottom: "clamp(48px, 7vw, 80px)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(to right, ${C.border} 1px, transparent 1px),
            linear-gradient(to bottom, ${C.border} 1px, transparent 1px)
          `,
          backgroundSize: mob ? "72px 72px" : "120px 120px",
          opacity: 0.25,
        }} />
        {/* Slate glow — top right */}
        <div style={{
          position: "absolute", top: "-10%", right: "-5%",
          width: mob ? "280px" : "480px", height: mob ? "280px" : "480px",
          background: `radial-gradient(circle, ${C.aGlo} 0%, transparent 65%)`,
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Status badge */}
          <div style={{ ...fade(1), display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: mob ? "32px" : "44px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.accent, boxShadow: `0 0 7px ${C.accent}` }} />
            <Mono accent>Capital Advisory · Nationwide</Mono>
          </div>

          {/* Firm name + tagline */}
          <h1 style={{
            ...fade(2),
            fontFamily: C.sans,
            fontSize: mob ? "clamp(34px, 9.5vw, 52px)" : "clamp(52px, 5.8vw, 80px)",
            fontWeight: 700,
            color: C.white,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: mob ? "6px" : "10px",
          }}>Atlas Capital Partners</h1>

          <h2 style={{
            ...fade(2, { transitionDelay: "0.07s" }),
            fontFamily: C.sans,
            fontSize: mob ? "clamp(34px, 9.5vw, 52px)" : "clamp(52px, 5.8vw, 80px)",
            fontWeight: 300,
            color: C.w2,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: mob ? "28px" : "44px",
          }}>Business Financing,<br />Strategically Structured.</h2>

          <div style={{ ...fade(3), maxWidth: "540px", marginBottom: mob ? "32px" : "44px" }}>
            <p style={{ fontFamily: C.sans, fontSize: mob ? "14px" : "15px", fontWeight: 400, color: C.w2, lineHeight: 1.75 }}>
              We serve as an outsourced capital advisory team — identifying the right financing structure, preparing lender-ready packages, and managing every step of the transaction on your behalf.
            </p>
          </div>

          <div style={{ ...fade(3, { transitionDelay: "0.1s" }), display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <PrimaryBtn onClick={() => go("contact")}>Schedule Consultation</PrimaryBtn>
            <GhostBtn onClick={() => go("solutions")}>View Solutions</GhostBtn>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────── */}
      <div style={{ background: C.s1, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: mob ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: "1px", background: C.border,
        }}>
          {[["$2.4B+","Capital Facilitated"],["100+","Lender Relationships"],["500+","Advisory Engagements"],["$0","Upfront Cost"]].map(([n, l]) => {
            const ref = useReveal();
            return (
              <div key={l} ref={ref} className="reveal" style={{
                background: C.s1,
                paddingLeft: mob ? "16px" : "28px",
                paddingRight: mob ? "16px" : "28px",
                paddingTop: mob ? "20px" : "26px",
                paddingBottom: mob ? "20px" : "26px",
              }}>
                <div style={{ fontFamily: C.sans, fontSize: mob ? "24px" : "30px", fontWeight: 700, color: C.white, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "5px" }}>{n}</div>
                <Mono>{l}</Mono>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WHAT WE DO ───────────────────────────────────── */}
      <section style={{ padding: `${PY_SEC} ${PX}` }}>
        <div ref={useReveal()} className="reveal" style={{ marginBottom: mob ? "36px" : "52px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <Mono accent>What We Do</Mono>
            <div style={{ width: "32px", height: "1px", background: C.border }} />
          </div>
          <h2 style={{ fontFamily: C.sans, fontSize: mob ? "clamp(24px, 7vw, 34px)" : "clamp(26px, 3vw, 40px)", fontWeight: 600, color: C.white, letterSpacing: "-0.025em", lineHeight: 1.15 }}>
            We are not a lender.<br />We are your advisor.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(2, 1fr)", gap: "1px", background: C.border }}>
          {[
            { n: "01", title: "Debt Advisory",          body: "We evaluate capital needs against the full spectrum of available structures — ensuring the right product for your business, not the easiest one to place." },
            { n: "02", title: "Transaction Management", body: "From document preparation through underwriting and closing — every step of the transaction is managed on your behalf." },
            { n: "03", title: "Lender Matching",        body: "100+ active relationships across banks, SBA Preferred Lenders, CDFIs, and asset-based lenders — sector-matched for every engagement." },
            { n: "04", title: "Capital Planning",       body: "Advisory beyond the immediate transaction: refinancing strategy, successive facilities, and long-term lender positioning." },
          ].map(({ n, title, body }, i) => {
            const ref = useReveal(i * 0.06);
            const [h, setH] = useState(false);
            return (
              <div key={n} ref={ref} className="reveal"
                onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                style={{ background: h ? C.s2 : C.s1, padding: mob ? "28px 20px" : "36px 32px", transition: "background 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                  <Mono accent={h} style={{ fontSize: "9px", transition: "color 0.2s" }}>{n}</Mono>
                  <div style={{ width: "18px", height: "1px", background: h ? C.accent : C.border, transition: "background 0.2s" }} />
                </div>
                <div style={{ fontFamily: C.sans, fontSize: mob ? "15px" : "16px", fontWeight: 600, color: C.white, marginBottom: "10px", letterSpacing: "-0.01em" }}>{title}</div>
                <p style={{ fontFamily: C.sans, fontSize: "13px", fontWeight: 400, color: C.w2, lineHeight: 1.75 }}>{body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <HR />

      {/* ── TRANSACTION LOG ──────────────────────────────── */}
      <section style={{ padding: `${PY_SEC} ${PX}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: mob ? "28px" : "36px", flexWrap: "wrap", gap: "12px" }}>
          <div ref={useReveal()} className="reveal">
            <Mono accent style={{ display: "block", marginBottom: "10px" }}>Selected Transactions</Mono>
            <h2 style={{ fontFamily: C.sans, fontSize: mob ? "clamp(22px, 6vw, 30px)" : "clamp(22px, 2.5vw, 34px)", fontWeight: 600, color: C.white, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              Representative mandates.
            </h2>
          </div>
          <Mono style={{ fontSize: "9px" }}>Confidential · Details are representative</Mono>
        </div>

        {/* Column headers — desktop only */}
        {!mob && (
          <div style={{
            display: "grid", gridTemplateColumns: "140px 1fr 180px 120px",
            gap: "0 28px", padding: "10px 16px",
            background: C.s1, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
          }}>
            {["Sector", "Mandate", "Structure", "Facility"].map(h => (
              <Mono key={h} style={{ fontSize: "9px" }}>{h}</Mono>
            ))}
          </div>
        )}

        {[
          { sector: "Healthcare",    mandate: "Equipment acquisition and working capital, specialty medical practice",  type: "SBA 7(a)",         size: "$250,000"   },
          { sector: "Construction",  mandate: "Fleet expansion for awarded public infrastructure contract",              type: "Asset-Based Note", size: "$1,200,000" },
          { sector: "Hospitality",   mandate: "Third-location expansion, multi-unit restaurant operator",               type: "SBA 7(a)",         size: "$500,000"   },
          { sector: "Manufacturing", mandate: "Dual-facility — equipment and working capital, concurrent close",        type: "Equipment + LOC",  size: "$800,000"   },
        ].map((t, i) => {
          const [h, setH] = useState(false);
          const ref = useReveal(i * 0.05);
          return (
            <div key={i} ref={ref} className="reveal"
              onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
              style={{ borderBottom: `1px solid ${C.border}`, background: h ? C.s1 : "transparent", transition: "background 0.18s" }}>
              {mob ? (
                <div style={{ padding: "18px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <span style={{ fontFamily: C.sans, fontSize: "13px", fontWeight: 500, color: C.white }}>{t.sector}</span>
                    <span style={{ fontFamily: C.sans, fontSize: "14px", fontWeight: 600, color: C.white }}>{t.size}</span>
                  </div>
                  <p style={{ fontFamily: C.sans, fontSize: "12px", fontWeight: 400, color: C.w2, marginBottom: "5px" }}>{t.mandate}</p>
                  <Mono style={{ fontSize: "9px" }}>{t.type}</Mono>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 180px 120px", gap: "0 28px", padding: "22px 16px", alignItems: "center" }}>
                  <span style={{ fontFamily: C.sans, fontSize: "13px", fontWeight: 500, color: C.white }}>{t.sector}</span>
                  <span style={{ fontFamily: C.sans, fontSize: "13px", fontWeight: 400, color: C.w2 }}>{t.mandate}</span>
                  <Mono>{t.type}</Mono>
                  <span style={{ fontFamily: C.sans, fontSize: "15px", fontWeight: 600, color: C.white, textAlign: "right" }}>{t.size}</span>
                </div>
              )}
            </div>
          );
        })}
      </section>

      <HR />

      {/* ── PROCESS STRIP ────────────────────────────────── */}
      <section style={{ padding: `${PY_SEC} ${PX}` }}>
        <div ref={useReveal()} className="reveal" style={{ marginBottom: mob ? "36px" : "48px" }}>
          <Mono accent style={{ display: "block", marginBottom: "10px" }}>How It Works</Mono>
          <h2 style={{ fontFamily: C.sans, fontSize: mob ? "clamp(22px, 6vw, 30px)" : "clamp(22px, 2.5vw, 34px)", fontWeight: 600, color: C.white, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            One advisor. Full process.
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            ["Assessment",  "Structured intake — business profile, credit, capital objective, and timeline."],
            ["Strategy",    "We identify the optimal structure and lender fit before any application is submitted."],
            ["Matching",    "Targeted submission to 2–4 lenders with demonstrated appetite for your profile."],
            ["Management",  "All documentation, underwriting communication, and follow-up handled on your behalf."],
            ["Closing",     "Offer review, term negotiation, and closing coordination — you review and sign."],
          ].map(([title, desc], i) => {
            const ref = useReveal(i * 0.05);
            return (
              <div key={title} ref={ref} className="reveal"
                style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "44px 188px 1fr", gap: mob ? "4px" : "0", borderTop: `1px solid ${C.border}`, padding: mob ? "18px 0" : "22px 0" }}>
                <Mono accent style={{ paddingTop: mob ? 0 : "1px", fontSize: "9px" }}>{String(i + 1).padStart(2, "0")}</Mono>
                <span style={{ fontFamily: C.sans, fontSize: "14px", fontWeight: 500, color: C.white, paddingRight: "28px" }}>{title}</span>
                <span style={{ fontFamily: C.sans, fontSize: "13px", fontWeight: 400, color: C.w2, lineHeight: 1.65 }}>{desc}</span>
              </div>
            );
          })}
          <HR />
        </div>
      </section>

      <HR />

      {/* ── BOTTOM CTA ───────────────────────────────────── */}
      <section style={{ padding: `${PY_SEC} ${PX}` }}>
        <div ref={useReveal()} className="reveal" style={{
          background: C.s1, border: `1px solid ${C.border}`,
          padding: mob ? "28px 20px" : "48px 56px",
          display: "flex", flexDirection: mob ? "column" : "row",
          justifyContent: "space-between", alignItems: mob ? "flex-start" : "center",
          gap: mob ? "24px" : "40px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "240px", height: "240px", background: `radial-gradient(circle at top right, ${C.aGlo}, transparent 70%)`, pointerEvents: "none" }} />
          <div>
            <h2 style={{ fontFamily: C.sans, fontSize: mob ? "20px" : "26px", fontWeight: 600, color: C.white, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "8px" }}>
              Ready to discuss your capital objectives?
            </h2>
            <p style={{ fontFamily: C.sans, fontSize: "13px", fontWeight: 400, color: C.w2 }}>
              A brief conversation is sufficient to identify available financing pathways.
            </p>
          </div>
          <PrimaryBtn onClick={() => go("contact")} style={{ flexShrink: 0 }}>Schedule Consultation</PrimaryBtn>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   SOLUTIONS
══════════════════════════════════════════════════════════ */
function Solutions({ go }) {
  const { mob } = useViewport();
  const [open, setOpen] = useState(null);

  const items = [
    { name: "SBA 7(a) & 504 Loans",  range: "$50K – $5M",   body: "Government-backed facilities with the most favorable rate structures in commercial lending — available for expansion, acquisition, equipment, and real estate.\n\n10–25 year terms. Fixed and variable rate options. Lower equity requirements than conventional products." },
    { name: "Lines of Credit",        range: "$25K – $2M",   body: "Revolving credit structured around your operating cycle — liquidity on demand without a new application for each draw.\n\nAvailable unsecured or lightly secured depending on the borrower profile and lender relationship." },
    { name: "Equipment Finance",      range: "$50K – $10M",  body: "Asset-backed financing for equipment acquisition, fleet expansion, and capital improvements. The asset serves as collateral, enabling longer terms and preserving operating cash flow.\n\n3–7 year terms. Fixed payment schedules. All commercial asset categories." },
    { name: "Commercial Real Estate", range: "$500K – $20M", body: "Acquisition, refinance, and construction financing across owner-occupied and investment properties — structured around the asset and objective, not a product template.\n\n10–25 year amortization. Multiple lender types depending on property class." },
    { name: "Working Capital",        range: "$25K – $2M",   body: "Capital for cash-flow management, payroll, and growth. Structured to align with your receivables cycle and revenue seasonality.\n\nRevenue-based structures available for businesses requiring repayment flexibility." },
    { name: "Startup & Early Stage",  range: "$10K – $500K", body: "Specialized pathways for businesses with limited operating history — SBA microloan programs, CDFI products, and alternative credit structures appropriate to stage.\n\nWe identify the realistic options for your profile, not the theoretical ones." },
  ];

  return (
    <div style={{ paddingTop: "56px" }}>
      <section style={{ padding: `clamp(44px,6vw,72px) ${PX} clamp(36px,5vw,56px)`, borderBottom: `1px solid ${C.border}` }}>
        <div ref={useReveal()} className="reveal">
          <Mono accent style={{ display: "block", marginBottom: "14px" }}>Capital Solutions</Mono>
          <h1 style={{ fontFamily: C.sans, fontSize: mob ? "clamp(30px, 9vw, 46px)" : "clamp(38px, 4.5vw, 58px)", fontWeight: 700, color: C.white, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "14px" }}>
            The full spectrum<br />of debt capital.
          </h1>
          <p style={{ fontFamily: C.sans, fontSize: "14px", fontWeight: 400, color: C.w2, lineHeight: 1.7, maxWidth: "420px" }}>
            Every recommendation is driven by your profile and objectives — not by product availability or lender preferences.
          </p>
        </div>
      </section>

      {items.map((s, i) => {
        const isOpen = open === i;
        const ref = useReveal(i * 0.04);
        return (
          <div key={s.name} ref={ref} className="reveal">
            <button onClick={() => setOpen(isOpen ? null : i)}
              onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = C.s1; }}
              onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}
              style={{
                display: "grid", gridTemplateColumns: mob ? "1fr auto" : "1fr 160px 20px",
                gap: "12px", width: "100%", textAlign: "left",
                paddingLeft: PX, paddingRight: PX,
                paddingTop: mob ? "20px" : "22px", paddingBottom: mob ? "20px" : "22px",
                background: isOpen ? C.s1 : "transparent",
                borderBottom: `1px solid ${C.border}`,
                transition: "background 0.15s", alignItems: "center",
              }}>
              <span style={{ fontFamily: C.sans, fontSize: mob ? "15px" : "16px", fontWeight: 600, color: C.white, letterSpacing: "-0.01em" }}>{s.name}</span>
              {!mob && <Mono style={{ textAlign: "right" }}>{s.range}</Mono>}
              <span style={{ fontFamily: C.mono, fontSize: "15px", color: isOpen ? C.accent : C.w3, transition: "color 0.15s" }}>{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div style={{
                paddingLeft: PX, paddingRight: PX,
                paddingTop: "20px", paddingBottom: "28px",
                background: C.s1, borderBottom: `1px solid ${C.border}`,
                animation: "slideUp 0.25s ease",
              }}>
                {mob && <Mono style={{ display: "block", marginBottom: "10px" }}>{s.range}</Mono>}
                <div style={{ maxWidth: "580px" }}>
                  {s.body.split("\n\n").map((p, j, arr) => (
                    <p key={j} style={{ fontFamily: C.sans, fontSize: "13px", fontWeight: 400, color: C.w2, lineHeight: 1.8, marginBottom: j < arr.length - 1 ? "12px" : 0 }}>{p}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <section style={{ padding: `clamp(40px,6vw,64px) ${PX}` }}>
        <div ref={useReveal()} className="reveal" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <PrimaryBtn onClick={() => go("contact")}>Schedule Consultation</PrimaryBtn>
          <GhostBtn onClick={() => go("process")}>See Our Process</GhostBtn>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PROCESS
══════════════════════════════════════════════════════════ */
function Process({ go }) {
  const { mob } = useViewport();
  const [active, setActive] = useState(0);

  const steps = [
    { title: "Capital Assessment",     body: "A structured intake covering your business financials, credit profile, capital objective, and timeline. Not a form — a direct conversation with the advisor who will own your file from start to close.\n\nThe assessment produces a complete picture before any strategy is proposed." },
    { title: "Capital Strategy",       body: "We identify the optimal capital structure for your specific situation — product type, facility size, term, and lender profile — and present the recommendation before any submission is made.\n\nYou understand exactly what we are proposing and why." },
    { title: "Lender Matching",        body: "Your transaction is matched against our active lender relationships with precision. We identify 2–4 lenders with demonstrated sector expertise and current appetite for your profile.\n\nThis produces better terms and fewer conditions than broad submission." },
    { title: "Transaction Management", body: "We build your complete application package. Every document prepared, reviewed, and submitted. Every underwriting question and lender communication handled on your behalf.\n\nYou are informed at every milestone." },
    { title: "Closing",                body: "When offers arrive, we present each option transparently — rate, term, conditions, trade-offs. We negotiate, coordinate closing, and confirm capital is deployed on your timeline.\n\nYour involvement is limited to reviewing the offer and executing documents." },
  ];

  return (
    <div style={{ paddingTop: "56px" }}>
      <section style={{ padding: `clamp(44px,6vw,72px) ${PX} clamp(36px,5vw,56px)`, borderBottom: `1px solid ${C.border}` }}>
        <div ref={useReveal()} className="reveal">
          <Mono accent style={{ display: "block", marginBottom: "14px" }}>Advisory Process</Mono>
          <h1 style={{ fontFamily: C.sans, fontSize: mob ? "clamp(30px, 9vw, 46px)" : "clamp(38px, 4.5vw, 58px)", fontWeight: 700, color: C.white, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "14px" }}>
            Structured. Managed.<br />Closed.
          </h1>
          <p style={{ fontFamily: C.sans, fontSize: "14px", fontWeight: 400, color: C.w2, lineHeight: 1.7, maxWidth: "420px" }}>
            One advisor manages your engagement from assessment through closing. Defined process. Consistent communication.
          </p>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "260px 1fr", minHeight: mob ? "auto" : "460px" }}>
        {/* Step list */}
        <div style={{ borderRight: mob ? "none" : `1px solid ${C.border}`, background: C.s1 }}>
          {steps.map((s, i) => {
            const isActive = active === i;
            return (
              <button key={i} onClick={() => setActive(i)}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.s2; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  width: "100%", textAlign: "left",
                  paddingLeft: mob ? "20px" : "24px", paddingRight: mob ? "20px" : "24px",
                  paddingTop: "18px", paddingBottom: "18px",
                  background: isActive ? C.bg : "transparent",
                  borderBottom: `1px solid ${C.border}`,
                  borderLeft: `2px solid ${isActive ? C.accent : "transparent"}`,
                  transition: "all 0.15s",
                }}>
                <Mono accent={isActive} style={{ flexShrink: 0, fontSize: "9px", transition: "color 0.15s" }}>
                  {String(i + 1).padStart(2, "0")}
                </Mono>
                <span style={{ fontFamily: C.sans, fontSize: "13px", fontWeight: isActive ? 500 : 400, color: isActive ? C.white : C.w3 }}>
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail pane */}
        <div key={active} style={{
          padding: mob ? "28px 20px" : `40px clamp(28px,4vw,56px)`,
          animation: "slideUp 0.25s ease",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <Mono accent>Phase {String(active + 1).padStart(2, "0")}</Mono>
            <div style={{ width: "20px", height: "1px", background: C.accent, opacity: 0.5 }} />
          </div>
          <h3 style={{ fontFamily: C.sans, fontSize: mob ? "19px" : "23px", fontWeight: 600, color: C.white, letterSpacing: "-0.02em", marginBottom: "18px" }}>
            {steps[active].title}
          </h3>
          <div style={{ maxWidth: "460px" }}>
            {steps[active].body.split("\n\n").map((p, j, arr) => (
              <p key={j} style={{ fontFamily: C.sans, fontSize: "14px", fontWeight: 400, color: C.w2, lineHeight: 1.8, marginBottom: j < arr.length - 1 ? "14px" : 0 }}>{p}</p>
            ))}
          </div>
          <div style={{ display: "flex", gap: "4px", marginTop: "28px" }}>
            {steps.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} style={{ flex: 1, height: "2px", background: i === active ? C.accent : C.w4, cursor: "pointer", transition: "background 0.2s" }} />
            ))}
          </div>
          {active < steps.length - 1 && (
            <button onClick={() => setActive(a => a + 1)}
              style={{ marginTop: "18px", fontFamily: C.mono, fontSize: "10px", color: C.accent, display: "flex", alignItems: "center", gap: "6px", letterSpacing: "0.08em" }}>
              Next phase →
            </button>
          )}
        </div>
      </div>

      <section style={{ padding: `clamp(40px,6vw,64px) ${PX}`, borderTop: `1px solid ${C.border}` }}>
        <div ref={useReveal()} className="reveal">
          <PrimaryBtn onClick={() => go("contact")}>Begin Your Assessment</PrimaryBtn>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ABOUT
══════════════════════════════════════════════════════════ */
function About({ go }) {
  const { mob } = useViewport();

  return (
    <div style={{ paddingTop: "56px" }}>
      <section style={{ padding: `clamp(44px,6vw,72px) ${PX} clamp(36px,5vw,56px)`, borderBottom: `1px solid ${C.border}` }}>
        <div ref={useReveal()} className="reveal">
          <Mono accent style={{ display: "block", marginBottom: "14px" }}>About the Firm</Mono>
          <h1 style={{ fontFamily: C.sans, fontSize: mob ? "clamp(30px, 9vw, 46px)" : "clamp(38px, 4.5vw, 58px)", fontWeight: 700, color: C.white, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            Client-side. Always.
          </h1>
        </div>
      </section>

      <section style={{ padding: `${PY_SEC} ${PX}` }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? "36px" : "72px" }}>
          <div ref={useReveal()} className="reveal" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontFamily: C.sans, fontSize: mob ? "14px" : "15px", fontWeight: 400, color: C.w2, lineHeight: 1.8 }}>
              Atlas Capital Partners was founded to address a gap in business lending: most business owners approach lenders alone — without institutional relationships, without sector context, and without a structured process.
            </p>
            <p style={{ fontFamily: C.sans, fontSize: mob ? "14px" : "15px", fontWeight: 400, color: C.w2, lineHeight: 1.8 }}>
              We serve as the client's capital advisory function — the role that larger companies fill with an in-house CFO or treasury team. Disciplined process, active lender relationships, one mandate: the best available outcome for each engagement.
            </p>
            <p style={{ fontFamily: C.sans, fontSize: mob ? "14px" : "15px", fontWeight: 400, color: C.w2, lineHeight: 1.8 }}>
              We do not accept lender-side compensation. Our alignment is with the client, exclusively.
            </p>
          </div>

          <div ref={useReveal(0.1)} className="reveal">
            <div style={{ background: C.s1, border: `1px solid ${C.border}` }}>
              {[
                ["Structure",  "Capital advisory firm"],
                ["Position",   "Client-side advisor"],
                ["Coverage",   "Nationwide — all 50 states"],
                ["Established","2018"],
                ["Network",    "100+ active lender relationships"],
                ["Range",      "$25,000 – $20,000,000+"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "130px 1fr", borderBottom: `1px solid ${C.border}` }}>
                  <Mono style={{ padding: "13px 14px", borderRight: `1px solid ${C.border}` }}>{k}</Mono>
                  <span style={{ fontFamily: C.sans, fontSize: "12px", fontWeight: 400, color: C.w2, padding: "13px 14px" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HR />

      <section style={{ padding: `${PY_SEC} ${PX}` }}>
        <div ref={useReveal()} className="reveal" style={{ marginBottom: mob ? "32px" : "44px" }}>
          <Mono accent style={{ display: "block", marginBottom: "10px" }}>Why Clients Use Us</Mono>
          <h2 style={{ fontFamily: C.sans, fontSize: mob ? "clamp(22px, 6vw, 30px)" : "clamp(22px, 2.5vw, 34px)", fontWeight: 600, color: C.white, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            The function a larger company fills internally.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(2, 1fr)", gap: "1px", background: C.border }}>
          {[
            ["Access", "We submit to lenders who do not otherwise prioritize unsolicited applications at the same level."],
            ["Speed",  "A complete, structured application from an established advisor moves through underwriting faster."],
            ["Terms",  "Targeted submission to multiple lenders creates competitive tension — producing better rates and fewer conditions."],
            ["Time",   "A capital transaction should not consume weeks of your attention. We manage it entirely."],
          ].map(([t, b], i) => {
            const ref = useReveal(i * 0.06);
            return (
              <div key={t} ref={ref} className="reveal"
                style={{ background: C.s1, padding: mob ? "24px 20px" : "28px 28px" }}>
                <div style={{ fontFamily: C.sans, fontSize: "14px", fontWeight: 600, color: C.white, marginBottom: "8px" }}>{t}</div>
                <p style={{ fontFamily: C.sans, fontSize: "13px", fontWeight: 400, color: C.w2, lineHeight: 1.75 }}>{b}</p>
              </div>
            );
          })}
        </div>
      </section>

      <HR />
      <section style={{ padding: `clamp(40px,6vw,64px) ${PX}` }}>
        <div ref={useReveal()} className="reveal">
          <PrimaryBtn onClick={() => go("contact")}>Schedule Consultation</PrimaryBtn>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CONTACT
══════════════════════════════════════════════════════════ */
function Contact() {
  const { mob } = useViewport();
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", amount: "", note: "" });
  const [sent, setSent] = useState(false);
  const s = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const field = {
    width: "100%", padding: "11px 12px",
    background: C.s1, border: `1px solid ${C.border}`,
    color: C.white, fontFamily: C.sans, fontSize: "13px", fontWeight: 400,
    outline: "none", transition: "border-color 0.2s",
    WebkitAppearance: "none", appearance: "none",
  };
  const ff = e => e.target.style.borderColor = C.accent;
  const fb = e => e.target.style.borderColor = C.border;

  return (
    <div style={{ paddingTop: "56px" }}>
      <section style={{ padding: `clamp(44px,6vw,72px) ${PX} clamp(36px,5vw,56px)`, borderBottom: `1px solid ${C.border}` }}>
        <div ref={useReveal()} className="reveal">
          <Mono accent style={{ display: "block", marginBottom: "14px" }}>Contact</Mono>
          <h1 style={{ fontFamily: C.sans, fontSize: mob ? "clamp(30px, 9vw, 46px)" : "clamp(38px, 4.5vw, 58px)", fontWeight: 700, color: C.white, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            Let's discuss<br />your situation.
          </h1>
        </div>
      </section>

      <section style={{ padding: `${PY_SEC} ${PX}` }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? "44px" : "72px" }}>
          {/* Left — context */}
          <div ref={useReveal()} className="reveal">
            <p style={{ fontFamily: C.sans, fontSize: "14px", fontWeight: 400, color: C.w2, lineHeight: 1.8, marginBottom: "36px" }}>
              A brief conversation is sufficient to understand your objectives and identify available financing pathways. No cost, no obligation.
            </p>
            <div style={{ background: C.s1, border: `1px solid ${C.border}` }}>
              {[
                ["Email",           "hello@atlascapitalpartners.com"],
                ["Response",        "Within one business day"],
                ["Confidentiality", "All inquiries are confidential"],
                ["Coverage",        "Nationwide — all 50 states"],
                ["Upfront Cost",    "None"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "130px 1fr", borderBottom: `1px solid ${C.border}` }}>
                  <Mono style={{ padding: "11px 13px", borderRight: `1px solid ${C.border}` }}>{k}</Mono>
                  <span style={{ fontFamily: C.sans, fontSize: "12px", fontWeight: 400, color: C.w2, padding: "11px 13px" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div ref={useReveal(0.1)} className="reveal">
            {!sent ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: "8px" }}>
                  <input placeholder="Full name" value={form.name} onChange={s("name")} onFocus={ff} onBlur={fb} style={field} />
                  <input placeholder="Company" value={form.company} onChange={s("company")} onFocus={ff} onBlur={fb} style={field} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: "8px" }}>
                  <input type="email" placeholder="Email address" value={form.email} onChange={s("email")} onFocus={ff} onBlur={fb} style={field} />
                  <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={s("phone")} onFocus={ff} onBlur={fb} style={field} />
                </div>
                <select value={form.amount} onChange={s("amount")} onFocus={ff} onBlur={fb}
                  style={{ ...field, color: form.amount ? C.white : C.w3 }}>
                  <option value="" style={{ background: C.bg }}>Capital objective (select)</option>
                  {["Under $100K","$100K – $250K","$250K – $500K","$500K – $1M","$1M – $3M","$3M+"].map(o => (
                    <option key={o} value={o} style={{ background: C.bg }}>{o}</option>
                  ))}
                </select>
                <textarea placeholder="Brief description of your financing need (optional)" rows={4} value={form.note} onChange={s("note")} onFocus={ff} onBlur={fb}
                  style={{ ...field, resize: "vertical" }} />
                <PrimaryBtn onClick={() => { if (form.name && form.email) setSent(true); }} style={{ marginTop: "4px", width: "100%", padding: "13px" }}>
                  Submit Inquiry
                </PrimaryBtn>
                <p style={{ fontFamily: C.mono, fontSize: "9px", color: C.w3, textAlign: "center", letterSpacing: "0.1em" }}>
                  CONFIDENTIAL · NO CREDIT INQUIRY · NO UPFRONT OBLIGATION
                </p>
              </div>
            ) : (
              <div style={{ animation: "fadeIn 0.4s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.accent, boxShadow: `0 0 8px ${C.accent}` }} />
                  <Mono accent>Received</Mono>
                </div>
                <h3 style={{ fontFamily: C.sans, fontSize: mob ? "24px" : "30px", fontWeight: 700, color: C.white, letterSpacing: "-0.025em", marginBottom: "14px" }}>
                  Thank you.
                </h3>
                <p style={{ fontFamily: C.sans, fontSize: "14px", fontWeight: 400, color: C.w2, lineHeight: 1.8 }}>
                  An Atlas advisor will contact you within one business day. All communications are held in strict confidence.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════ */
function Footer({ go }) {
  const { mob } = useViewport();
  return (
    <footer style={{
      background: C.s1,
      borderTop: `1px solid ${C.border}`,
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      <div style={{ padding: `clamp(36px,5vw,52px) ${PX}` }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr 1fr", gap: mob ? "28px" : "48px", marginBottom: mob ? "28px" : "36px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: "18px", height: "18px", border: `1.5px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: C.mono, fontSize: "8px", color: C.accent }}>A</span>
              </div>
              <span style={{ fontFamily: C.sans, fontSize: "12px", fontWeight: 600, color: C.white }}>Atlas Capital Partners</span>
            </div>
            <p style={{ fontFamily: C.sans, fontSize: "12px", fontWeight: 400, color: C.w3, lineHeight: 1.65, maxWidth: "220px" }}>
              Capital advisory and business financing for established companies across the United States.
            </p>
          </div>

          <div>
            <Mono style={{ display: "block", marginBottom: "12px" }}>Navigation</Mono>
            {["solutions","process","about","contact"].map(id => {
              const [h, setH] = useState(false);
              return (
                <button key={id} onClick={() => go(id)}
                  onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                  style={{ display: "block", fontFamily: C.sans, fontSize: "12px", fontWeight: 400, color: h ? C.w2 : C.w3, marginBottom: "8px", textTransform: "capitalize", transition: "color 0.15s" }}>
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              );
            })}
          </div>

          <div>
            <Mono style={{ display: "block", marginBottom: "12px" }}>Contact</Mono>
            <p style={{ fontFamily: C.sans, fontSize: "12px", fontWeight: 400, color: C.w3, lineHeight: 1.75 }}>
              hello@atlascapitalpartners.com<br />
              Nationwide — all 50 states<br />
              All inquiries confidential
            </p>
          </div>
        </div>

        <HR style={{ marginBottom: "18px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <Mono>© 2026 Atlas Capital Partners. All rights reserved.</Mono>
          <Mono>Not a direct lender · NMLS # [Placeholder]</Mono>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════ */
const VIEWS = { home: Home, solutions: Solutions, process: Process, about: About, contact: Contact };

export default function App() {
  const [page, setPage] = useState("home");
  const go = useCallback(id => { setPage(id); window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  const View = VIEWS[page] || Home;
  return (
    <>
      <Global />
      <Nav page={page} go={go} />
      <main><View key={page} go={go} /></main>
      <Footer go={go} />
    </>
  );
}
