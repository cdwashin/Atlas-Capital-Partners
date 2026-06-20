import { useState, useEffect, useRef, useCallback } from "react";

/* ─── TOKENS ──────────────────────────────────────────── */
const white  = "#FFFFFF";
const off    = "#FFFFFF";
const line   = "#EBEBED";
const ink    = "#111114";
const ink2   = "#44495A";
const ink3   = "#8A8FA0";
const navy   = "#1B3A6B";
const navyLt = "#2A5298";
const navyBg = "#FFFFFF";
const font   = "'Inter', system-ui, sans-serif";
const px     = "clamp(20px, 5.5vw, 80px)";

/* ─── GLOBAL ──────────────────────────────────────────── */
function Global() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      html {
        font-size: 16px;
        background: #ffffff !important;
      }
      html, body, #root {
        background: #ffffff !important;
        color: #111114;
        overflow-x: hidden;
      }
      body {
        font-family: ${font};
        background: #ffffff !important;
      }
      ::selection { background: ${navy}; color: #fff; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-thumb { background: ${line}; }
      button { border: none; background: none; cursor: pointer; font-family: inherit; color: inherit; padding: 0; }
      input, select, textarea { font-family: inherit; }
      @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
      @keyframes open   { from { opacity:0; } to { opacity:1; } }
      @media (prefers-reduced-motion: reduce) { * { animation-duration:0.01ms!important; transition-duration:0.01ms!important; } }
      @media (prefers-color-scheme: dark) {
        html, body, #root { background: #ffffff !important; color: #111114 !important; }
      }
    `}</style>
  );
}

/* ─── HOOKS ───────────────────────────────────────────── */
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

function useIsMobile() {
  const [mob, setMob] = useState(false);
  useEffect(() => {
    const check = () => setMob(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);
  return mob;
}

function useScrolled(threshold = 24) {
  const [sc, setSc] = useState(false);
  useEffect(() => {
    const h = () => setSc(window.scrollY > threshold);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, [threshold]);
  return sc;
}

/* ─── PRIMITIVES ──────────────────────────────────────── */
const Divider = ({ style = {} }) => <div style={{ height: "1px", background: line, ...style }} />;

const Label = ({ children, style = {} }) => (
  <span style={{ fontFamily: font, fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: navy, ...style }}>
    {children}
  </span>
);

function Btn({ children, onClick, outline, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        fontFamily: font, fontSize: "13px", fontWeight: 600, letterSpacing: "0.02em",
        padding: "12px 26px", transition: "all 0.15s", whiteSpace: "nowrap",
        background: outline ? (h ? '#FFFFFF' : '#FFFFFF') : (h ? navyLt : navy),
        color: outline ? (h ? ink : ink2) : white,
        border: `1.5px solid ${outline ? (h ? line : line) : (h ? navyLt : navy)}`,
        ...style,
      }}>{children}</button>
  );
}

function Sec({ children, style = {} }) {
  return (
    <section style={{
      paddingLeft: px, paddingRight: px,
      paddingTop: "clamp(64px, 9vw, 120px)",
      paddingBottom: "clamp(64px, 9vw, 120px)",
      ...style,
    }}>{children}</section>
  );
}

function FadeUp({ children, delay = 0, style = {} }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(14px)",
      transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      ...style,
    }}>{children}</div>
  );
}

/* ─── NAV LINK — own component so hooks are valid ──────── */
function NavLink({ id, label, active, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        fontFamily: font, fontSize: "13px", fontWeight: active ? 600 : 400,
        color: active ? ink : h ? ink2 : ink3,
        padding: "0 18px", height: "60px",
        borderBottom: `2px solid ${active ? navy : "transparent"}`,
        transition: "color 0.15s, border-color 0.15s",
      }}>{label}</button>
  );
}

function FooterLink({ id, label, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "block", fontFamily: font, fontSize: "13px", fontWeight: 400, color: h ? navy : ink3, marginBottom: "9px", textTransform: "capitalize", transition: "color 0.15s" }}>
      {label}
    </button>
  );
}

/* ─── NAV ─────────────────────────────────────────────── */
const LINKS = [
  { id: "solutions", label: "Solutions" },
  { id: "process",   label: "Process"   },
  { id: "about",     label: "About"     },
  { id: "contact",   label: "Contact"   },
];

function Nav({ page, go }) {
  const mob = useIsMobile();
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const nav = id => { go(id); setOpen(false); };

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingLeft: px, paddingRight: px,
        background: white,
        borderBottom: `1px solid ${scrolled ? line : "transparent"}`,
        transition: "border-color 0.3s",
      }}>
        <button onClick={() => nav("home")} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "26px", height: "26px", background: navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: font, fontSize: "11px", fontWeight: 800, color: white, letterSpacing: "-0.02em" }}>A</span>
          </div>
          <span style={{ fontFamily: font, fontSize: "14px", fontWeight: 700, color: ink, letterSpacing: "-0.02em" }}>
            Atlas Capital Partners
          </span>
        </button>

        {mob ? (
          <button onClick={() => setOpen(true)} style={{ fontFamily: font, fontSize: "13px", fontWeight: 500, color: ink3 }}>Menu</button>
        ) : (
          <div style={{ display: "flex", alignItems: "center" }}>
            {LINKS.map(({ id, label }) => (
              <NavLink key={id} id={id} label={label} active={page === id} onClick={() => nav(id)} />
            ))}
            <div style={{ width: "1px", height: "20px", background: line, margin: "0 16px" }} />
            <Btn onClick={() => nav("contact")} style={{ fontSize: "12px", padding: "9px 20px" }}>Schedule Consultation</Btn>
          </div>
        )}
      </header>

      {mob && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200, background: white,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: `1px solid ${line}` }}>
            <span style={{ fontFamily: font, fontSize: "14px", fontWeight: 700, color: ink }}>Menu</span>
            <button onClick={() => setOpen(false)} style={{ fontSize: "20px", color: ink3 }}>✕</button>
          </div>
          <div style={{ flex: 1 }}>
            {[{ id: "home", label: "Home" }, ...LINKS].map(({ id, label }) => (
              <button key={id} onClick={() => nav(id)} style={{
                display: "block", width: "100%", textAlign: "left", padding: "18px 20px",
                fontFamily: font, fontSize: "20px", fontWeight: page === id ? 700 : 400,
                color: page === id ? navy : ink, borderBottom: `1px solid ${line}`,
              }}>{label}</button>
            ))}
          </div>
          <div style={{ padding: "20px", borderTop: `1px solid ${line}` }}>
            <Btn onClick={() => nav("contact")} style={{ width: "100%", padding: "14px" }}>Schedule Consultation</Btn>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── HOME — subcomponents for rows that need hooks ────── */
function CapabilityRow({ n, title, body, delay }) {
  const [ref, vis] = useInView(0.1);
  const [hov, setHov] = useState(false);
  const mob = useIsMobile();
  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderTop: `1px solid ${line}`, opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(12px)", transition: `opacity 0.45s ease ${delay}s, transform 0.45s ease ${delay}s` }}>
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "80px 260px 1fr", gap: mob ? "4px" : "0", padding: mob ? "24px 0" : "32px 0" }}>
        <span style={{ fontFamily: font, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: hov ? navy : ink3, paddingTop: "2px", transition: "color 0.18s" }}>{n}</span>
        <span style={{ fontFamily: font, fontSize: mob ? "17px" : "18px", fontWeight: 700, color: ink, paddingRight: "32px", letterSpacing: "-0.02em" }}>{title}</span>
        <p style={{ fontFamily: font, fontSize: "15px", fontWeight: 400, color: ink2, lineHeight: 1.7 }}>{body}</p>
      </div>
    </div>
  );
}

function TransactionRow({ sector, mandate, type, size, delay }) {
  const [ref, vis] = useInView(0.1);
  const [hov, setHov] = useState(false);
  const mob = useIsMobile();
  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderBottom: `1px solid ${line}`, background: hov ? '#FFFFFF' : '#FFFFFF', transition: "background 0.15s", opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(8px)", transition2: `opacity 0.4s ease ${delay}s, transform 0.4s ease ${delay}s, background 0.15s` }}>
      {mob ? (
        <div style={{ padding: "20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
            <span style={{ fontFamily: font, fontSize: "15px", fontWeight: 700, color: ink }}>{sector}</span>
            <span style={{ fontFamily: font, fontSize: "18px", fontWeight: 800, color: navy, letterSpacing: "-0.03em" }}>{size}</span>
          </div>
          <p style={{ fontFamily: font, fontSize: "13px", fontWeight: 400, color: ink3, marginBottom: "8px" }}>{mandate}</p>
          <span style={{ fontFamily: font, fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: navy, padding: "3px 10px" }}>{type}</span>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 180px 110px", gap: "0 32px", padding: "22px 0", alignItems: "center" }}>
          <span style={{ fontFamily: font, fontSize: "14px", fontWeight: 700, color: ink }}>{sector}</span>
          <span style={{ fontFamily: font, fontSize: "13px", fontWeight: 400, color: ink2 }}>{mandate}</span>
          <span style={{ fontFamily: font, fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: navy, padding: "4px 10px", display: "inline-block" }}>{type}</span>
          <span style={{ fontFamily: font, fontSize: "18px", fontWeight: 800, color: navy, letterSpacing: "-0.03em", textAlign: "right" }}>{size}</span>
        </div>
      )}
    </div>
  );
}

function ProcessRow({ num, title, desc, delay }) {
  const [ref, vis] = useInView(0.1);
  const mob = useIsMobile();
  return (
    <div ref={ref} style={{ borderTop: `1px solid ${line}`, display: "grid", gridTemplateColumns: mob ? "1fr" : "44px 200px 1fr", gap: mob ? "4px" : "0", padding: mob ? "20px 0" : "26px 0", opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(8px)", transition: `opacity 0.4s ease ${delay}s, transform 0.4s ease ${delay}s` }}>
      <span style={{ fontFamily: font, fontSize: "11px", fontWeight: 700, color: ink3, letterSpacing: "0.08em", paddingTop: "2px" }}>{num}</span>
      <span style={{ fontFamily: font, fontSize: "15px", fontWeight: 700, color: ink, paddingRight: "24px" }}>{title}</span>
      <span style={{ fontFamily: font, fontSize: "14px", fontWeight: 400, color: ink2, lineHeight: 1.65 }}>{desc}</span>
    </div>
  );
}

function WhyRow({ title, body, delay }) {
  const [ref, vis] = useInView(0.1);
  const mob = useIsMobile();
  return (
    <div ref={ref} style={{ borderTop: `1px solid ${line}`, display: "grid", gridTemplateColumns: mob ? "1fr" : "180px 1fr", gap: mob ? "6px" : "40px", padding: mob ? "22px 0" : "28px 0", opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(8px)", transition: `opacity 0.4s ease ${delay}s, transform 0.4s ease ${delay}s` }}>
      <span style={{ fontFamily: font, fontSize: "15px", fontWeight: 700, color: ink }}>{title}</span>
      <p style={{ fontFamily: font, fontSize: "15px", fontWeight: 400, color: ink2, lineHeight: 1.7 }}>{body}</p>
    </div>
  );
}

/* ─── HOME ────────────────────────────────────────────── */
function Home({ go }) {
  const mob = useIsMobile();
  const [ph, setPh] = useState(0);

  useEffect(() => {
    const ts = [setTimeout(() => setPh(1), 60), setTimeout(() => setPh(2), 280), setTimeout(() => setPh(3), 520)];
    return () => ts.forEach(clearTimeout);
  }, []);

  const ap = (n, d = 0) => ({
    opacity: ph >= n ? 1 : 0,
    transform: ph >= n ? "none" : "translateY(14px)",
    transition: `opacity 0.5s ease ${d}s, transform 0.5s ease ${d}s`,
  });

  const capabilities = [
    { n: "01", title: "Debt Advisory",          body: "We evaluate your capital needs against the full spectrum of available structures — ensuring the right product for your business, not the easiest one to place." },
    { n: "02", title: "Transaction Management", body: "From document preparation through underwriting coordination and closing — every step managed on your behalf." },
    { n: "03", title: "Lender Relationships",   body: "100+ active relationships across banks, SBA Preferred Lenders, CDFIs, and asset-based lenders — sector-matched for every engagement." },
    { n: "04", title: "Capital Planning",       body: "Advisory beyond the immediate transaction: refinancing strategy, successive facilities, and long-term lender positioning." },
  ];

  const transactions = [
    { sector: "Healthcare",    mandate: "Equipment acquisition and working capital, specialty medical practice",  type: "SBA 7(a)",         size: "$250,000"   },
    { sector: "Construction",  mandate: "Fleet expansion for awarded public infrastructure contract",              type: "Asset-Based Note", size: "$1,200,000" },
    { sector: "Hospitality",   mandate: "Third-location expansion, multi-unit restaurant operator",               type: "SBA 7(a)",         size: "$500,000"   },
    { sector: "Manufacturing", mandate: "Dual-facility — equipment and working capital, concurrent close",        type: "Equipment + LOC",  size: "$800,000"   },
  ];

  const process = [
    ["Assessment",  "Structured intake — business profile, credit profile, capital objective, and timeline."],
    ["Strategy",    "We identify the optimal structure and lender fit before any application is submitted."],
    ["Matching",    "Targeted submission to 2–4 lenders with demonstrated appetite for your profile."],
    ["Management",  "All documentation, underwriting communication, and follow-up handled on your behalf."],
    ["Closing",     "Offer review, negotiation, and closing coordination — you review and sign."],
  ];

  return (
    <>
      {/* HERO */}
      <section style={{ minHeight: "100svh", paddingTop: "60px", paddingLeft: px, paddingRight: px, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? "48px" : "80px", alignItems: "center", paddingTop: mob ? "48px" : "0", paddingBottom: mob ? "48px" : "0" }}>
          {/* left */}
          <div>
            <div style={{ ...ap(1), marginBottom: "24px" }}>
              <Label>Capital Advisory · Nationwide</Label>
            </div>
            <h1 style={{ ...ap(2), fontFamily: font, fontSize: mob ? "clamp(40px, 11vw, 56px)" : "clamp(52px, 6.5vw, 80px)", fontWeight: 800, color: ink, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: "22px" }}>
              Business<br />financing,<br /><span style={{ color: navy }}>strategically<br />structured.</span>
            </h1>
            <p style={{ ...ap(3), fontFamily: font, fontSize: mob ? "15px" : "17px", fontWeight: 400, color: ink2, lineHeight: 1.75, maxWidth: "440px", marginBottom: "32px" }}>
              We serve as an outsourced capital advisory team — identifying the right financing structure and managing every step of the transaction on your behalf.
            </p>
            <div style={{ ...ap(3, 0.08), display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Btn onClick={() => go("contact")}>Schedule Consultation</Btn>
              <Btn outline onClick={() => go("solutions")}>View Solutions</Btn>
            </div>
          </div>

          {/* right — stat panel (desktop only) */}
          {!mob && (
            <div style={{ ...ap(3, 0.12) }}>
              <div style={{ border: `1px solid ${line}` }}>
                <div style={{ padding: "18px 22px", borderBottom: `1px solid ${line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Label>Firm Overview</Label>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34C759" }} />
                    <span style={{ fontFamily: font, fontSize: "11px", fontWeight: 500, color: ink3 }}>Active</span>
                  </div>
                </div>
                {[["$2.4B+","Capital facilitated"],["100+","Active lender relationships"],["500+","Advisory engagements"],["72 hrs","Average decision timeline"]].map(([v, l], i, arr) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: i < arr.length - 1 ? `1px solid ${line}` : "none" }}>
                    <span style={{ fontFamily: font, fontSize: "13px", fontWeight: 400, color: ink3 }}>{l}</span>
                    <span style={{ fontFamily: font, fontSize: "22px", fontWeight: 800, color: navy, letterSpacing: "-0.03em" }}>{v}</span>
                  </div>
                ))}
                <div style={{ padding: "14px 22px", background: '#FFFFFF', borderTop: `1px solid ${line}` }}>
                  <span style={{ fontFamily: font, fontSize: "12px", fontWeight: 500, color: navy }}>No upfront cost · Nationwide · Confidential</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* mobile stats */}
        {mob && (
          <div style={{ ...ap(3, 0.1), borderTop: `1px solid ${line}`, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {[["$2.4B+","Capital"],["100+","Lenders"]].map(([v, l], i) => (
              <div key={l} style={{ padding: "20px 0", borderRight: i === 0 ? `1px solid ${line}` : "none", paddingRight: i === 0 ? "16px" : "0", paddingLeft: i === 1 ? "16px" : "0" }}>
                <div style={{ fontFamily: font, fontSize: "28px", fontWeight: 800, color: navy, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "4px" }}>{v}</div>
                <Label style={{ color: ink3 }}>{l}</Label>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: `1px solid ${line}`, paddingTop: "18px", paddingBottom: "22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <span style={{ fontFamily: font, fontSize: "12px", fontWeight: 400, color: ink3 }}>Established 2018 · Not a direct lender</span>
          <button onClick={() => go("contact")} style={{ fontFamily: font, fontSize: "12px", fontWeight: 600, color: navy }}>Begin your assessment →</button>
        </div>
      </section>

      <Divider />

      {/* CAPABILITIES */}
      <Sec>
        <FadeUp style={{ marginBottom: mob ? "40px" : "60px" }}>
          <Label style={{ display: "block", marginBottom: "18px" }}>What We Do</Label>
          <h2 style={{ fontFamily: font, fontSize: mob ? "clamp(30px, 8vw, 44px)" : "clamp(40px, 5vw, 58px)", fontWeight: 800, color: ink, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
            We are not a lender.<br />We are your advisor.
          </h2>
        </FadeUp>
        {capabilities.map((c, i) => <CapabilityRow key={c.n} {...c} delay={i * 0.07} />)}
        <Divider />
      </Sec>

      <Divider />

      {/* TRANSACTIONS */}
      <Sec>
        <FadeUp style={{ marginBottom: mob ? "32px" : "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <Label style={{ display: "block", marginBottom: "16px" }}>Selected Transactions</Label>
              <h2 style={{ fontFamily: font, fontSize: mob ? "clamp(28px, 7vw, 40px)" : "clamp(36px, 4.5vw, 52px)", fontWeight: 800, color: ink, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
                Representative<br />mandates.
              </h2>
            </div>
            <span style={{ fontFamily: font, fontSize: "12px", fontWeight: 400, color: ink3, fontStyle: "italic" }}>Client confidentiality maintained</span>
          </div>
        </FadeUp>
        {!mob && (
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 180px 110px", gap: "0 32px", padding: "10px 0", borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
            {["Sector","Mandate","Structure","Facility"].map(h => (
              <span key={h} style={{ fontFamily: font, fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: ink3 }}>{h}</span>
            ))}
          </div>
        )}
        {transactions.map((t, i) => <TransactionRow key={t.sector} {...t} delay={i * 0.06} />)}
      </Sec>

      <Divider />

      {/* PROCESS */}
      <Sec>
        <FadeUp style={{ marginBottom: mob ? "32px" : "48px" }}>
          <Label style={{ display: "block", marginBottom: "16px" }}>How It Works</Label>
          <h2 style={{ fontFamily: font, fontSize: mob ? "clamp(28px, 7vw, 40px)" : "clamp(36px, 4.5vw, 52px)", fontWeight: 800, color: ink, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
            One advisor.<br />Full process.
          </h2>
        </FadeUp>
        {process.map(([title, desc], i) => <ProcessRow key={title} num={String(i + 1).padStart(2, "0")} title={title} desc={desc} delay={i * 0.06} />)}
        <Divider />
      </Sec>

      <Divider />

      {/* CTA */}
      <Sec>
        <FadeUp>
          <div style={{ border: `1px solid ${line}`, padding: mob ? "32px 24px" : "48px 56px", display: "flex", flexDirection: mob ? "column" : "row", justifyContent: "space-between", alignItems: mob ? "flex-start" : "center", gap: mob ? "24px" : "48px" }}>
            <div>
              <h2 style={{ fontFamily: font, fontSize: mob ? "22px" : "28px", fontWeight: 800, color: ink, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "8px" }}>Ready to discuss your capital objectives?</h2>
              <p style={{ fontFamily: font, fontSize: "14px", fontWeight: 400, color: ink3 }}>A brief conversation is sufficient to identify available financing pathways.</p>
            </div>
            <Btn onClick={() => go("contact")} style={{ flexShrink: 0 }}>Schedule Consultation</Btn>
          </div>
        </FadeUp>
      </Sec>
    </>
  );
}

/* ─── SOLUTIONS ───────────────────────────────────────── */
function SolutionRow({ name, range, body, isOpen, onClick }) {
  const mob = useIsMobile();
  return (
    <div>
      <button onClick={onClick}
        onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = '#FFFFFF'; }}
        onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = white; }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left", paddingLeft: px, paddingRight: px, paddingTop: mob ? "22px" : "26px", paddingBottom: mob ? "22px" : "26px", background: isOpen ? '#FFFFFF' : '#FFFFFF', borderBottom: `1px solid ${line}`, transition: "background 0.15s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontFamily: font, fontSize: mob ? "16px" : "18px", fontWeight: 700, color: ink, letterSpacing: "-0.02em" }}>{name}</span>
          {!mob && <span style={{ fontFamily: font, fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: navy, padding: "3px 10px" }}>{range}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {mob && <span style={{ fontFamily: font, fontSize: "12px", fontWeight: 500, color: ink3 }}>{range}</span>}
          <span style={{ fontFamily: font, fontSize: "20px", color: isOpen ? navy : ink3, transition: "color 0.15s" }}>{isOpen ? "−" : "+"}</span>
        </div>
      </button>
      {isOpen && (
        <div style={{ paddingLeft: px, paddingRight: px, paddingTop: "24px", paddingBottom: "32px", background: '#FFFFFF', borderBottom: `1px solid ${line}`, animation: "open 0.2s ease" }}>
          <div style={{ maxWidth: "600px" }}>
            {body.split("\n\n").map((p, j, arr) => (
              <p key={j} style={{ fontFamily: font, fontSize: "14px", fontWeight: 400, color: ink2, lineHeight: 1.8, marginBottom: j < arr.length - 1 ? "14px" : 0 }}>{p}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Solutions({ go }) {
  const mob = useIsMobile();
  const [open, setOpen] = useState(null);
  const items = [
    { name: "SBA 7(a) & 504 Loans",  range: "$50K – $5M",   body: "Government-backed facilities with the most favorable rate structures in commercial lending — available for expansion, acquisition, equipment, and real estate.\n\n10–25 year terms. Fixed and variable rate options. Lower equity requirements than conventional products." },
    { name: "Lines of Credit",        range: "$25K – $2M",   body: "Revolving credit structured around your operating cycle — liquidity on demand without a new application for each draw.\n\nAvailable unsecured or lightly secured depending on borrower profile and lender relationship." },
    { name: "Equipment Finance",      range: "$50K – $10M",  body: "Asset-backed financing for equipment acquisition, fleet expansion, and capital improvements. The asset serves as collateral, enabling longer terms.\n\n3–7 year terms. Fixed payment schedules. All commercial asset categories." },
    { name: "Commercial Real Estate", range: "$500K – $20M", body: "Acquisition, refinance, and construction financing across owner-occupied and investment properties — structured around the asset and objective.\n\n10–25 year amortization. Multiple lender types depending on property class." },
    { name: "Working Capital",        range: "$25K – $2M",   body: "Capital for cash-flow management, payroll, and growth. Structured to align with your receivables cycle and revenue seasonality.\n\nRevenue-based structures available for businesses requiring repayment flexibility." },
    { name: "Startup & Early Stage",  range: "$10K – $500K", body: "Specialized pathways for businesses with limited operating history — SBA microloan programs, CDFI products, and alternative credit structures appropriate to stage." },
  ];

  return (
    <div style={{ paddingTop: "60px" }}>
      <Sec style={{ paddingBottom: "clamp(40px,5vw,64px)" }}>
        <FadeUp>
          <Label style={{ display: "block", marginBottom: "16px" }}>Capital Solutions</Label>
          <h1 style={{ fontFamily: font, fontSize: mob ? "clamp(36px,10vw,52px)" : "clamp(52px,6vw,72px)", fontWeight: 800, color: ink, letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: "16px" }}>The full spectrum<br />of debt capital.</h1>
          <p style={{ fontFamily: font, fontSize: "15px", fontWeight: 400, color: ink3, lineHeight: 1.7, maxWidth: "420px" }}>Every recommendation is driven by your profile and objectives — not by product availability.</p>
        </FadeUp>
      </Sec>
      <Divider />
      {items.map((s, i) => <SolutionRow key={s.name} {...s} isOpen={open === i} onClick={() => setOpen(open === i ? null : i)} />)}
      <Sec style={{ paddingTop: "clamp(40px,5vw,64px)" }}>
        <FadeUp style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Btn onClick={() => go("contact")}>Schedule Consultation</Btn>
          <Btn outline onClick={() => go("process")}>See Our Process</Btn>
        </FadeUp>
      </Sec>
    </div>
  );
}

/* ─── PROCESS ─────────────────────────────────────────── */
function ProcessStep({ step, i, isActive, onClick }) {
  const mob = useIsMobile();
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", textAlign: "left", padding: mob ? "18px 20px" : "20px 28px", background: isActive ? '#FFFFFF' : hov ? '#FFFFFF' : 'transparent', borderBottom: `1px solid ${line}`, borderLeft: mob ? "none" : `3px solid ${isActive ? navy : "transparent"}`, transition: "all 0.15s" }}>
      <span style={{ fontFamily: font, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: isActive ? navy : ink3, flexShrink: 0, transition: "color 0.15s" }}>{String(i + 1).padStart(2, "0")}</span>
      <span style={{ fontFamily: font, fontSize: "14px", fontWeight: isActive ? 700 : 400, color: isActive ? ink : ink3 }}>{step.title}</span>
    </button>
  );
}

function Process({ go }) {
  const mob = useIsMobile();
  const [active, setActive] = useState(0);
  const steps = [
    { title: "Capital Assessment",     body: "A structured intake covering your business financials, credit profile, capital objective, and timeline. Not a form — a direct conversation with the advisor who will own your file from start to close.\n\nThe assessment produces a complete picture before any strategy is proposed." },
    { title: "Capital Strategy",       body: "We identify the optimal capital structure for your specific situation — product type, facility size, term, and lender profile — and present the recommendation before any submission.\n\nYou understand exactly what we are proposing and why." },
    { title: "Lender Matching",        body: "Your transaction is matched against our active lender relationships with precision. We identify 2–4 lenders with demonstrated sector expertise and current appetite for your profile.\n\nThis produces better terms and fewer conditions than broad submission." },
    { title: "Transaction Management", body: "We build your complete application package. Every document prepared, reviewed, and submitted. Every underwriting question handled on your behalf.\n\nYou are informed at every milestone." },
    { title: "Closing",                body: "When offers arrive, we present each option transparently — rate, term, conditions, trade-offs. We negotiate, coordinate closing, and confirm capital is deployed on your timeline." },
  ];

  return (
    <div style={{ paddingTop: "60px" }}>
      <Sec style={{ paddingBottom: "clamp(40px,5vw,64px)" }}>
        <FadeUp>
          <Label style={{ display: "block", marginBottom: "16px" }}>Advisory Process</Label>
          <h1 style={{ fontFamily: font, fontSize: mob ? "clamp(36px,10vw,52px)" : "clamp(52px,6vw,72px)", fontWeight: 800, color: ink, letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: "16px" }}>Structured.<br />Managed. Closed.</h1>
          <p style={{ fontFamily: font, fontSize: "15px", fontWeight: 400, color: ink3, lineHeight: 1.7, maxWidth: "420px" }}>One advisor manages your engagement from assessment through closing.</p>
        </FadeUp>
      </Sec>
      <Divider />
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "260px 1fr", minHeight: mob ? "auto" : "460px" }}>
        <div style={{ borderRight: mob ? "none" : `1px solid ${line}`, background: '#FFFFFF' }}>
          {steps.map((s, i) => <ProcessStep key={i} step={s} i={i} isActive={active === i} onClick={() => setActive(i)} />)}
        </div>
        <div key={active} style={{ padding: mob ? "28px 0" : `40px clamp(28px,4vw,60px)`, animation: "open 0.25s ease", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Label style={{ display: "block", marginBottom: "16px" }}>Phase {String(active + 1).padStart(2, "0")}</Label>
          <h3 style={{ fontFamily: font, fontSize: mob ? "22px" : "28px", fontWeight: 800, color: ink, letterSpacing: "-0.03em", marginBottom: "20px" }}>{steps[active].title}</h3>
          <div style={{ maxWidth: "480px" }}>
            {steps[active].body.split("\n\n").map((p, j, arr) => (
              <p key={j} style={{ fontFamily: font, fontSize: "15px", fontWeight: 400, color: ink2, lineHeight: 1.75, marginBottom: j < arr.length - 1 ? "16px" : 0 }}>{p}</p>
            ))}
          </div>
          <div style={{ display: "flex", gap: "6px", marginTop: "28px" }}>
            {steps.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} style={{ height: "3px", width: i === active ? "28px" : "14px", background: i === active ? navy : line, border: "none", cursor: "pointer", transition: "all 0.2s" }} />
            ))}
          </div>
          {active < steps.length - 1 && (
            <button onClick={() => setActive(a => a + 1)} style={{ marginTop: "18px", fontFamily: font, fontSize: "13px", fontWeight: 600, color: navy, display: "flex", alignItems: "center", gap: "6px" }}>Next phase →</button>
          )}
        </div>
      </div>
      <Divider />
      <Sec style={{ paddingTop: "clamp(40px,5vw,64px)", paddingBottom: "clamp(40px,5vw,64px)" }}>
        <FadeUp><Btn onClick={() => go("contact")}>Begin Your Assessment</Btn></FadeUp>
      </Sec>
    </div>
  );
}

/* ─── ABOUT ───────────────────────────────────────────── */
function About({ go }) {
  const mob = useIsMobile();
  const whyItems = [
    ["Access", "We submit to lenders who do not otherwise prioritize unsolicited applications at the same level."],
    ["Speed",  "A complete, structured application from an established advisor moves through underwriting faster."],
    ["Terms",  "Targeted submission to multiple lenders creates competitive tension — producing better rates and fewer conditions."],
    ["Time",   "A capital transaction should not consume weeks of your attention. We manage it entirely."],
  ];

  return (
    <div style={{ paddingTop: "60px" }}>
      <Sec style={{ paddingBottom: "clamp(40px,5vw,64px)" }}>
        <FadeUp>
          <Label style={{ display: "block", marginBottom: "16px" }}>About the Firm</Label>
          <h1 style={{ fontFamily: font, fontSize: mob ? "clamp(36px,10vw,52px)" : "clamp(52px,6vw,72px)", fontWeight: 800, color: ink, letterSpacing: "-0.04em", lineHeight: 1.0 }}>Client-side. Always.</h1>
        </FadeUp>
      </Sec>
      <Divider />
      <Sec>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? "40px" : "80px" }}>
          <FadeUp style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <p style={{ fontFamily: font, fontSize: "16px", fontWeight: 400, color: ink2, lineHeight: 1.8 }}>Atlas Capital Partners was founded to address a structural gap in business lending: most business owners approach lenders alone — without institutional relationships, without sector context, and without a structured process.</p>
            <p style={{ fontFamily: font, fontSize: "15px", fontWeight: 400, color: ink2, lineHeight: 1.8 }}>We serve as the client's capital advisory function — the role that larger companies fill with an in-house CFO or treasury team. Our process is disciplined, our lender relationships are active, and our sole mandate is the best available outcome for each client.</p>
            <p style={{ fontFamily: font, fontSize: "15px", fontWeight: 400, color: ink2, lineHeight: 1.8 }}>We do not accept lender-side compensation. Our alignment is with the client, exclusively.</p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div style={{ border: `1px solid ${line}` }}>
              {[["Structure","Capital advisory firm"],["Position","Client-side advisor, not a lender"],["Coverage","Nationwide — all 50 states"],["Established","2018"],["Network","100+ active lender relationships"],["Range","$25,000 – $20,000,000+"]].map(([k, v], i, arr) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "140px 1fr", borderBottom: i < arr.length - 1 ? `1px solid ${line}` : "none" }}>
                  <div style={{ padding: "13px 14px", borderRight: `1px solid ${line}`, background: '#FFFFFF' }}><Label style={{ color: ink3 }}>{k}</Label></div>
                  <div style={{ padding: "13px 14px" }}><span style={{ fontFamily: font, fontSize: "13px", fontWeight: 500, color: ink2 }}>{v}</span></div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </Sec>
      <Divider />
      <Sec>
        <FadeUp style={{ marginBottom: mob ? "36px" : "52px" }}>
          <Label style={{ display: "block", marginBottom: "16px" }}>Why Clients Use Us</Label>
          <h2 style={{ fontFamily: font, fontSize: mob ? "clamp(28px,7vw,40px)" : "clamp(36px,4.5vw,52px)", fontWeight: 800, color: ink, letterSpacing: "-0.04em", lineHeight: 1.05 }}>The function a larger<br />company fills internally.</h2>
        </FadeUp>
        {whyItems.map(([t, b], i) => <WhyRow key={t} title={t} body={b} delay={i * 0.07} />)}
        <Divider />
      </Sec>
      <Divider />
      <Sec style={{ paddingTop: "clamp(40px,5vw,64px)", paddingBottom: "clamp(40px,5vw,64px)" }}>
        <FadeUp><Btn onClick={() => go("contact")}>Schedule Consultation</Btn></FadeUp>
      </Sec>
    </div>
  );
}

/* ─── CONTACT ─────────────────────────────────────────── */
function Contact() {
  const mob = useIsMobile();
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", amount: "", note: "" });
  const [sent, setSent] = useState(false);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const fld = { width: "100%", padding: "12px 14px", background: white, border: `1.5px solid ${line}`, color: ink, fontFamily: font, fontSize: "14px", fontWeight: 400, outline: "none", transition: "border-color 0.15s", WebkitAppearance: "none", appearance: "none" };
  const onF = e => { e.target.style.borderColor = navy; };
  const onB = e => { e.target.style.borderColor = line; };

  return (
    <div style={{ paddingTop: "60px" }}>
      <Sec style={{ paddingBottom: "clamp(40px,5vw,64px)" }}>
        <FadeUp>
          <Label style={{ display: "block", marginBottom: "16px" }}>Contact</Label>
          <h1 style={{ fontFamily: font, fontSize: mob ? "clamp(36px,10vw,52px)" : "clamp(52px,6vw,72px)", fontWeight: 800, color: ink, letterSpacing: "-0.04em", lineHeight: 1.0 }}>Let's discuss<br />your situation.</h1>
        </FadeUp>
      </Sec>
      <Divider />
      <Sec>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? "48px" : "80px" }}>
          <FadeUp>
            <p style={{ fontFamily: font, fontSize: "15px", fontWeight: 400, color: ink3, lineHeight: 1.8, marginBottom: "32px" }}>A brief conversation is sufficient to understand your objectives and identify available financing pathways. No cost, no obligation.</p>
            <div style={{ border: `1px solid ${line}` }}>
              {[["Email","hello@atlascapitalpartners.com"],["Response","Within one business day"],["Confidentiality","All inquiries are confidential"],["Coverage","Nationwide — all 50 states"],["Upfront Cost","None"]].map(([k, v], i, arr) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "130px 1fr", borderBottom: i < arr.length - 1 ? `1px solid ${line}` : "none" }}>
                  <div style={{ padding: "12px 14px", borderRight: `1px solid ${line}`, background: '#FFFFFF' }}><Label style={{ color: ink3 }}>{k}</Label></div>
                  <div style={{ padding: "12px 14px" }}><span style={{ fontFamily: font, fontSize: "13px", fontWeight: 400, color: ink2 }}>{v}</span></div>
                </div>
              ))}
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            {!sent ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: "10px" }}>
                  <input placeholder="Full name" value={form.name} onChange={upd("name")} onFocus={onF} onBlur={onB} style={fld} />
                  <input placeholder="Company" value={form.company} onChange={upd("company")} onFocus={onF} onBlur={onB} style={fld} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: "10px" }}>
                  <input type="email" placeholder="Email address" value={form.email} onChange={upd("email")} onFocus={onF} onBlur={onB} style={fld} />
                  <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={upd("phone")} onFocus={onF} onBlur={onB} style={fld} />
                </div>
                <select value={form.amount} onChange={upd("amount")} onFocus={onF} onBlur={onB} style={{ ...fld, color: form.amount ? ink : ink3 }}>
                  <option value="">Capital objective (optional)</option>
                  {["Under $100K","$100K – $250K","$250K – $500K","$500K – $1M","$1M – $3M","$3M+"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <textarea placeholder="Brief description of your financing need (optional)" rows={4} value={form.note} onChange={upd("note")} onFocus={onF} onBlur={onB} style={{ ...fld, resize: "vertical" }} />
                <Btn onClick={() => { if (form.name && form.email) setSent(true); }} style={{ width: "100%", padding: "14px" }}>Submit Inquiry</Btn>
                <p style={{ fontFamily: font, fontSize: "11px", fontWeight: 500, color: ink3, textAlign: "center", letterSpacing: "0.06em", textTransform: "uppercase" }}>Confidential · No Credit Inquiry · No Upfront Obligation</p>
              </div>
            ) : (
              <div style={{ animation: "open 0.4s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34C759" }} />
                  <Label>Received</Label>
                </div>
                <h3 style={{ fontFamily: font, fontSize: mob ? "28px" : "36px", fontWeight: 800, color: ink, letterSpacing: "-0.04em", marginBottom: "14px" }}>Thank you.</h3>
                <p style={{ fontFamily: font, fontSize: "15px", fontWeight: 400, color: ink3, lineHeight: 1.8 }}>An Atlas advisor will contact you within one business day. All communications are held in strict confidence.</p>
              </div>
            )}
          </FadeUp>
        </div>
      </Sec>
    </div>
  );
}

/* ─── FOOTER ──────────────────────────────────────────── */
function Footer({ go }) {
  const mob = useIsMobile();
  return (
    <footer style={{ background: '#FFFFFF', borderTop: `1px solid ${line}` }}>
      <div style={{ paddingLeft: px, paddingRight: px, paddingTop: "clamp(40px,5vw,60px)", paddingBottom: "clamp(32px,4vw,48px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1.5fr 1fr 1fr", gap: mob ? "32px" : "60px", marginBottom: mob ? "28px" : "36px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "24px", height: "24px", background: navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: font, fontSize: "10px", fontWeight: 800, color: white }}>A</span>
              </div>
              <span style={{ fontFamily: font, fontSize: "13px", fontWeight: 700, color: ink }}>Atlas Capital Partners</span>
            </div>
            <p style={{ fontFamily: font, fontSize: "13px", fontWeight: 400, color: ink3, lineHeight: 1.65, maxWidth: "220px" }}>Capital advisory and business financing for established companies across the United States.</p>
          </div>
          <div>
            <Label style={{ display: "block", marginBottom: "14px", color: ink3 }}>Navigation</Label>
            {["solutions","process","about","contact"].map(id => (
              <FooterLink key={id} id={id} label={id.charAt(0).toUpperCase() + id.slice(1)} onClick={() => go(id)} />
            ))}
          </div>
          <div>
            <Label style={{ display: "block", marginBottom: "14px", color: ink3 }}>Contact</Label>
            <p style={{ fontFamily: font, fontSize: "13px", fontWeight: 400, color: ink3, lineHeight: 1.75 }}>
              hello@atlascapitalpartners.com<br />Nationwide — all 50 states<br />All inquiries confidential
            </p>
          </div>
        </div>
        <Divider style={{ marginBottom: "18px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <span style={{ fontFamily: font, fontSize: "12px", fontWeight: 400, color: ink3 }}>© 2026 Atlas Capital Partners. All rights reserved.</span>
          <span style={{ fontFamily: font, fontSize: "12px", fontWeight: 400, color: ink3 }}>Not a direct lender · NMLS # [Placeholder]</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── ROOT ────────────────────────────────────────────── */
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
