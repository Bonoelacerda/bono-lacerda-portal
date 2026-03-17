import { useState, useEffect, useRef } from "react";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const URL_ = "https://jrkreiidaxadwryjhdzu.supabase.co";
const KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impya3JlaWlkYXhhZHdyeWpoZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3Nzk3NTIsImV4cCI6MjA4OTM1NTc1Mn0.37Izlz1YVZlZadgXiL5xZC8ZofT3tob1VGPUr5m19jM";
const HDR  = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const api = {
  get:   (t, q="")   => fetch(`${URL_}/rest/v1/${t}${q}`, { headers: HDR }).then(r => r.json()),
  post:  (t, b)      => fetch(`${URL_}/rest/v1/${t}`,           { method:"POST",   headers:{...HDR,Prefer:"return=representation"}, body:JSON.stringify(b) }).then(r=>r.json()),
  patch: (t, id, b)  => fetch(`${URL_}/rest/v1/${t}?id=eq.${id}`,{ method:"PATCH",  headers:{...HDR,Prefer:"return=representation"}, body:JSON.stringify(b) }).then(r=>r.json()),
  del:   (t, id)     => fetch(`${URL_}/rest/v1/${t}?id=eq.${id}`,{ method:"DELETE", headers: HDR }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name="") => name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const fmtDate  = (ts) => ts ? new Date(ts).toLocaleDateString("pt-BR") : "—";
const fmtTime  = (ts) => ts ? new Date(ts).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) : "";
const MONTHS   = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

// ─── Icons ────────────────────────────────────────────────────────────────────
function Icon({ name, size=18 }) {
  const p = { width:size, height:size, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" };
  const icons = {
    dashboard: <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    users:     <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    calendar:  <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    plus:      <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    check:     <svg {...p}><polyline points="20,6 9,17 4,12"/></svg>,
    trash:     <svg {...p}><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/></svg>,
    send:      <svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>,
    close:     <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    logout:    <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    search:    <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    arrow:     <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>,
    file:      <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
    upload:    <svg {...p}><polyline points="16,16 12,12 8,16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    bell:      <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    spin:      <svg {...p} style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  };
  return icons[name] || null;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap');
  @keyframes spin  { to { transform: rotate(360deg); } }
  @keyframes fadeUp{ from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes toast { from { transform:translateX(80px); opacity:0; } to { transform:translateX(0); opacity:1; } }
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --bg:#f8f6f1; --white:#fff; --navy:#16213e; --navy2:#1a2a4a;
    --gold:#b8860b; --gold2:#d4a017; --goldd:rgba(184,134,11,.12);
    --text:#1c1c2e; --muted:#7a7a95; --border:#e8e4dc;
    --green:#16a34a; --red:#dc2626;
    --shadow:0 2px 16px rgba(22,33,62,.08);
    --shadow-lg:0 6px 32px rgba(22,33,62,.14);
  }
  body { font-family:'Outfit',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; }

  /* LOGIN */
  .login-bg { min-height:100vh; background:var(--navy); display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; }
  .login-bg::before { content:'ADVOCACIA'; position:absolute; font-family:'Cormorant Garamond',serif; font-size:16vw; font-weight:700; color:rgba(255,255,255,.03); pointer-events:none; white-space:nowrap; }
  .login-box { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:20px; padding:3rem; width:380px; position:relative; z-index:1; animation:fadeUp .4s ease; }
  .login-box .tag { display:inline-block; background:var(--goldd); border:1px solid var(--gold); color:var(--gold2); font-size:.7rem; font-weight:600; padding:.2rem .7rem; border-radius:99px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:1rem; }
  .login-box h1 { font-family:'Cormorant Garamond',serif; color:#fff; font-size:1.9rem; margin-bottom:.3rem; }
  .login-box p { color:rgba(255,255,255,.45); font-size:.85rem; margin-bottom:2.5rem; }
  .login-box .hint { margin-top:1.5rem; color:rgba(255,255,255,.3); font-size:.78rem; text-align:center; line-height:1.7; }
  .login-box .err { color:#f87171; font-size:.82rem; margin-top:.7rem; text-align:center; }
  .lf { margin-bottom:1.1rem; }
  .lf label { display:block; color:rgba(255,255,255,.5); font-size:.75rem; font-weight:500; text-transform:uppercase; letter-spacing:.08em; margin-bottom:.5rem; }
  .lf input { width:100%; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12); border-radius:10px; padding:.8rem 1rem; color:#fff; font-family:'Outfit',sans-serif; font-size:.9rem; outline:none; transition:border-color .2s; }
  .lf input:focus { border-color:var(--gold); }
  .btn-login { width:100%; padding:.9rem; background:var(--gold); color:#fff; border:none; border-radius:10px; font-family:'Outfit',sans-serif; font-size:.95rem; font-weight:600; cursor:pointer; transition:background .2s; display:flex; align-items:center; justify-content:center; gap:.5rem; }
  .btn-login:hover { background:var(--gold2); }

  /* LAYOUT */
  .layout { display:flex; min-height:100vh; }
  .sidebar { width:240px; background:var(--navy); position:fixed; top:0; left:0; height:100vh; display:flex; flex-direction:column; z-index:100; }
  .sidebar .brand { padding:1.8rem 1.5rem 1.2rem; border-bottom:1px solid rgba(255,255,255,.06); }
  .sidebar .brand h2 { font-family:'Cormorant Garamond',serif; color:#fff; font-size:1.05rem; line-height:1.3; }
  .sidebar .brand span { color:var(--gold2); font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; }
  .sidebar .who { padding:1rem 1.5rem; display:flex; align-items:center; gap:.7rem; border-bottom:1px solid rgba(255,255,255,.06); }
  .sidebar .who-name { font-size:.85rem; font-weight:600; color:#fff; }
  .sidebar .who-role { font-size:.72rem; color:rgba(255,255,255,.4); }
  .sidebar nav { flex:1; padding:.75rem 0; }
  .nav-item { display:flex; align-items:center; gap:.7rem; padding:.7rem 1.5rem; color:rgba(255,255,255,.5); font-size:.85rem; font-weight:500; cursor:pointer; transition:all .15s; border-left:3px solid transparent; }
  .nav-item:hover { color:#fff; background:rgba(255,255,255,.04); }
  .nav-item.active { color:var(--gold2); border-left-color:var(--gold2); background:var(--goldd); }
  .nav-badge { margin-left:auto; background:var(--gold); color:var(--navy); font-size:.68rem; font-weight:700; min-width:18px; height:18px; border-radius:99px; display:flex; align-items:center; justify-content:center; padding:0 4px; }
  .sidebar footer { padding:1rem 1.5rem; border-top:1px solid rgba(255,255,255,.06); }
  .btn-logout { display:flex; align-items:center; gap:.6rem; color:rgba(255,255,255,.35); font-size:.82rem; cursor:pointer; background:none; border:none; font-family:'Outfit',sans-serif; }
  .btn-logout:hover { color:rgba(255,255,255,.7); }
  .main { margin-left:240px; flex:1; padding:2.5rem; animation:fadeUp .3s ease; }

  /* AVATAR */
  .av { border-radius:50%; background:var(--gold); display:flex; align-items:center; justify-content:center; font-weight:700; color:var(--navy); flex-shrink:0; }

  /* PAGE HEADER */
  .page-title { font-family:'Cormorant Garamond',serif; font-size:1.9rem; color:var(--text); }
  .page-sub { color:var(--muted); font-size:.85rem; margin-top:.1rem; }
  .topbar { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:2rem; }

  /* CARD */
  .card { background:var(--white); border-radius:16px; border:1px solid var(--border); box-shadow:var(--shadow); }
  .card-body { padding:1.5rem; }
  .card-title { font-family:'Cormorant Garamond',serif; font-size:1.15rem; color:var(--text); margin-bottom:1rem; font-weight:600; }

  /* STATS */
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
  .stat { background:var(--white); border:1px solid var(--border); border-radius:14px; padding:1.25rem 1.5rem; box-shadow:var(--shadow); }
  .stat-label { font-size:.72rem; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin-bottom:.4rem; }
  .stat-value { font-family:'Cormorant Garamond',serif; font-size:2.2rem; color:var(--text); line-height:1; }
  .stat-sub { font-size:.75rem; color:var(--muted); margin-top:.3rem; }

  /* BADGES */
  .badge { display:inline-flex; align-items:center; padding:.2rem .65rem; border-radius:99px; font-size:.72rem; font-weight:600; }
  .badge-green  { background:#dcfce7; color:#15803d; }
  .badge-amber  { background:#fef3c7; color:#92400e; }
  .badge-blue   { background:#dbeafe; color:#1d4ed8; }
  .badge-gray   { background:#f1f5f9; color:#475569; }

  /* TABLE */
  .table { width:100%; border-collapse:collapse; }
  .table th { text-align:left; font-size:.72rem; text-transform:uppercase; letter-spacing:.07em; color:var(--muted); font-weight:600; padding:.75rem 1rem; border-bottom:1px solid var(--border); }
  .table td { padding:1rem; border-bottom:1px solid var(--border); font-size:.88rem; vertical-align:middle; }
  .table tr:last-child td { border-bottom:none; }
  .table tr:hover td { background:#fafaf8; }

  /* SEARCH */
  .search-wrap { position:relative; margin-bottom:1.25rem; }
  .search-wrap input { width:100%; padding:.75rem 1rem .75rem 2.75rem; border:1.5px solid var(--border); border-radius:10px; font-family:'Outfit',sans-serif; font-size:.9rem; background:var(--white); color:var(--text); outline:none; transition:border-color .2s; }
  .search-wrap input:focus { border-color:var(--gold); }
  .search-icon { position:absolute; left:.85rem; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none; }

  /* BUTTONS */
  .btn { display:inline-flex; align-items:center; gap:.5rem; padding:.6rem 1.2rem; border-radius:8px; font-family:'Outfit',sans-serif; font-size:.85rem; font-weight:600; cursor:pointer; border:none; transition:all .15s; }
  .btn-dark  { background:var(--navy); color:#fff; }
  .btn-dark:hover { background:var(--navy2); }
  .btn-ghost { background:transparent; color:var(--muted); border:1.5px solid var(--border); }
  .btn-ghost:hover { border-color:var(--gold); color:var(--gold); }
  .icon-btn { width:32px; height:32px; border-radius:8px; border:1.5px solid var(--border); background:transparent; display:flex; align-items:center; justify-content:center; color:var(--muted); cursor:pointer; transition:all .15s; }
  .icon-btn:hover { border-color:var(--gold); color:var(--gold); }
  .icon-btn.danger:hover { border-color:var(--red); color:var(--red); }

  /* MODAL */
  .overlay { position:fixed; inset:0; background:rgba(22,33,62,.55); backdrop-filter:blur(4px); z-index:200; display:flex; align-items:center; justify-content:center; padding:1rem; animation:fadeUp .2s; }
  .modal { background:var(--white); border-radius:20px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto; box-shadow:var(--shadow-lg); animation:fadeUp .25s ease; }
  .modal-head { display:flex; align-items:center; justify-content:space-between; padding:1.5rem; border-bottom:1px solid var(--border); }
  .modal-head h2 { font-family:'Cormorant Garamond',serif; font-size:1.3rem; }
  .modal-body { padding:1.5rem; }
  .modal-foot { padding:1.25rem 1.5rem; border-top:1px solid var(--border); display:flex; gap:.75rem; justify-content:flex-end; }

  /* FORM FIELDS */
  .field { margin-bottom:1.1rem; }
  .field label { display:block; font-size:.75rem; font-weight:600; color:var(--text); text-transform:uppercase; letter-spacing:.06em; margin-bottom:.4rem; }
  .field input, .field select, .field textarea { width:100%; padding:.75rem 1rem; border:1.5px solid var(--border); border-radius:10px; font-family:'Outfit',sans-serif; font-size:.9rem; color:var(--text); background:var(--bg); outline:none; transition:border-color .2s; }
  .field input:focus, .field select:focus, .field textarea:focus { border-color:var(--gold); background:#fff; }
  .field textarea { resize:vertical; min-height:80px; }
  .field-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }

  /* TABS */
  .tabs { display:flex; gap:.25rem; background:var(--white); padding:.3rem; border-radius:12px; border:1px solid var(--border); width:fit-content; margin-bottom:1.25rem; }
  .tab-btn { padding:.5rem 1.2rem; border:none; border-radius:9px; font-family:'Outfit',sans-serif; font-size:.85rem; font-weight:600; cursor:pointer; transition:all .15s; background:transparent; color:var(--muted); }
  .tab-btn.active { background:var(--navy); color:#fff; }

  /* STEPS */
  .step-row { display:flex; align-items:flex-start; gap:1rem; padding:.9rem 0; border-bottom:1px solid var(--border); }
  .step-row:last-child { border-bottom:none; }
  .step-circle { width:28px; height:28px; border-radius:50%; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0; cursor:pointer; transition:all .2s; }
  .step-circle.done { background:var(--navy); border-color:var(--navy); color:#fff; }

  /* CHAT */
  .chat-box { display:flex; flex-direction:column; height:320px; }
  .chat-msgs { flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:.75rem; }
  .msg-row { display:flex; gap:.5rem; align-items:flex-end; }
  .msg-row.mine { flex-direction:row-reverse; }
  .msg-bubble { max-width:70%; padding:.65rem .9rem; border-radius:14px; font-size:.85rem; line-height:1.5; }
  .msg-bubble.theirs { background:var(--bg); border:1px solid var(--border); border-bottom-left-radius:4px; }
  .msg-bubble.mine { background:var(--navy); color:#fff; border-bottom-right-radius:4px; }
  .msg-time { font-size:.68rem; color:var(--muted); margin-top:.2rem; }
  .chat-input-row { display:flex; gap:.6rem; margin-top:.75rem; border-top:1px solid var(--border); padding-top:.75rem; }
  .chat-input { flex:1; padding:.65rem .9rem; border:1.5px solid var(--border); border-radius:10px; font-family:'Outfit',sans-serif; font-size:.87rem; outline:none; color:var(--text); }
  .chat-input:focus { border-color:var(--gold); }
  .btn-send { width:38px; height:38px; border-radius:10px; background:var(--navy); border:none; display:flex; align-items:center; justify-content:center; color:var(--gold2); cursor:pointer; flex-shrink:0; }
  .btn-send:hover { background:var(--navy2); }

  /* MEETINGS */
  .meet-card { border:1px solid var(--border); border-radius:12px; padding:1rem 1.25rem; display:flex; align-items:center; gap:1rem; margin-bottom:.75rem; background:var(--bg); }
  .meet-date { background:var(--navy); color:#fff; border-radius:10px; width:52px; text-align:center; padding:.5rem 0; flex-shrink:0; }
  .meet-date .d { font-family:'Cormorant Garamond',serif; font-size:1.6rem; line-height:1; }
  .meet-date .m { font-size:.65rem; text-transform:uppercase; letter-spacing:.06em; opacity:.7; margin-top:2px; }

  /* DOCS */
  .doc-row { display:flex; align-items:center; gap:.9rem; padding:.85rem 1rem; border-radius:10px; border:1px solid var(--border); background:var(--bg); margin-bottom:.6rem; }
  .doc-ic { width:36px; height:36px; background:var(--navy); border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--gold2); flex-shrink:0; }
  .upload-zone { border:2px dashed var(--border); border-radius:12px; padding:2rem; text-align:center; cursor:pointer; transition:all .2s; color:var(--muted); margin-bottom:1.25rem; }
  .upload-zone:hover { border-color:var(--gold); color:var(--gold); background:var(--goldd); }

  /* PROGRESS BAR */
  .prog-wrap { background:var(--border); border-radius:99px; height:6px; }
  .prog-fill { height:6px; border-radius:99px; background:var(--navy); transition:width .4s; }

  /* UTILS */
  .loading { display:flex; align-items:center; justify-content:center; min-height:200px; flex-direction:column; gap:1rem; color:var(--muted); font-size:.9rem; }
  .toast { position:fixed; bottom:2rem; right:2rem; background:var(--navy); color:#fff; padding:.9rem 1.3rem; border-radius:12px; font-size:.85rem; z-index:9999; box-shadow:var(--shadow-lg); border-left:3px solid var(--gold); animation:toast .3s ease; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:var(--border); border-radius:99px; }
`;

// ─── Small components ─────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div className="toast">✓ {msg}</div>;
}

function Loader({ text = "Carregando…" }) {
  return (
    <div className="loading">
      <Icon name="spin" size={28} />
      <span>{text}</span>
    </div>
  );
}

function Avatar({ name="", size=36, style={} }) {
  return (
    <div className="av" style={{ width:size, height:size, fontSize:size*.22, ...style }}>
      {initials(name)}
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "em_andamento") return <span className="badge badge-amber">Em andamento</span>;
  if (status === "concluido")    return <span className="badge badge-green">Concluído</span>;
  return <span className="badge badge-gray">Aguardando</span>;
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [busy,  setBusy]  = useState(false);

  const submit = () => {
    if (email === "bonoelacerda@gmail.com" && pass === "admin123") {
      onLogin();
    } else {
      setErr("Credenciais inválidas. Use o acesso de demonstração.");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-box">
        <span className="tag">Painel Administrativo</span>
        <h1>Bono & Lacerda</h1>
        <p>Advocacia Internacional — Acesso restrito</p>
        <div className="lf">
          <label>E-mail</label>
          <input type="email" placeholder="bonoelacerda@gmail.com" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==="Enter" && submit()} />
        </div>
        <div className="lf">
          <label>Senha</label>
          <input type="password" placeholder="••••••••" value={pass}
            onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==="Enter" && submit()} />
        </div>
        <button className="btn-login" onClick={submit}>
          {busy ? <><Icon name="spin" size={16} /> Entrando…</> : "Entrar no Painel"}
        </button>
        {err && <p className="err">{err}</p>}
        <p className="hint">Demo: bonoelacerda@gmail.com / admin123</p>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashScreen({ clients }) {
  const ativos     = clients.filter(c => c.proc?.status === "em_andamento").length;
  const concluidos = clients.filter(c => c.proc?.status === "concluido").length;
  const reunioes   = clients.reduce((a, c) => a + (c.meetings?.length || 0), 0);

  return (
    <div>
      <div className="topbar">
        <div><h1 className="page-title">Painel Geral</h1><p className="page-sub">Visão geral do escritório</p></div>
      </div>
      <div className="stats-grid">
        {[
          ["Total de Clientes", clients.length, "cadastrados"],
          ["Processos Ativos",  ativos,          "em andamento"],
          ["Concluídos",        concluidos,       "processos encerrados"],
          ["Reuniões",          reunioes,         "agendadas"],
        ].map(([label, val, sub]) => (
          <div className="stat" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{val}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>
      <div className="card card-body">
        <div className="card-title">Clientes Recentes</div>
        <table className="table">
          <thead><tr><th>Cliente</th><th>Tipo</th><th>Status</th><th>Progresso</th></tr></thead>
          <tbody>
            {clients.slice(0, 6).map(c => {
              const steps = c.steps || [];
              const pct   = steps.length ? Math.round(steps.filter(s=>s.done).length / steps.length * 100) : 0;
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:".7rem"}}>
                      <Avatar name={c.name} size={32} />
                      <div>
                        <div style={{fontWeight:600,fontSize:".88rem"}}>{c.name}</div>
                        <div style={{fontSize:".75rem",color:"var(--muted)"}}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{fontSize:".82rem"}}>{c.proc?.type || "—"}</td>
                  <td><StatusBadge status={c.proc?.status} /></td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:".6rem"}}>
                      <div className="prog-wrap" style={{flex:1}}>
                        <div className="prog-fill" style={{width:`${pct}%`}} />
                      </div>
                      <span style={{fontSize:".75rem",color:"var(--muted)",flexShrink:0}}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── CLIENT DETAIL ────────────────────────────────────────────────────────────
function ClientDetail({ clientId, clients, setClients, showToast, onBack }) {
  const client = clients.find(c => c.id === clientId);
  const [tab,     setTab]     = useState("processo");
  const [steps,   setSteps]   = useState(client?.steps    || []);
  const [docs,    setDocs]    = useState(client?.docs     || []);
  const [msgs,    setMsgs]    = useState(client?.msgs     || []);
  const [meets,   setMeets]   = useState(client?.meetings || []);
  const [chatIn,  setChatIn]  = useState("");
  const [showMtg, setShowMtg] = useState(false);
  const [mf, setMf] = useState({ title:"", date:"", time:"10:00", type:"presencial", notes:"" });
  const fileRef = useRef();
  const botRef  = useRef();

  useEffect(() => { botRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  if (!client) return null;
  const proc = client.proc;
  const done = steps.filter(s => s.done).length;
  const pct  = steps.length ? Math.round(done / steps.length * 100) : 0;

  const toggleStep = async (step) => {
    const res = await api.patch("process_steps", step.id, { done: !step.done });
    if (res[0]) {
      setSteps(ss => ss.map(s => s.id === step.id ? { ...s, done: !s.done } : s));
      showToast("Etapa atualizada!");
    }
  };

  const sendMsg = async () => {
    if (!chatIn.trim() || !proc) return;
    const res = await api.post("messages", { process_id: proc.id, from_role:"lawyer", text: chatIn });
    if (res[0]) setMsgs(m => [...m, res[0]]);
    setChatIn("");
    showToast("Mensagem enviada!");
  };

  const addMeeting = async () => {
    if (!mf.title || !mf.date || !proc) return;
    const res = await api.post("meetings", { process_id: proc.id, ...mf, status:"confirmado" });
    if (res[0]) { setMeets(m => [...m, res[0]]); showToast("Reunião agendada!"); }
    setShowMtg(false);
    setMf({ title:"", date:"", time:"10:00", type:"presencial", notes:"" });
  };

  const delMeeting = async (id) => {
    await api.del("meetings", id);
    setMeets(m => m.filter(x => x.id !== id));
    showToast("Reunião removida.");
  };

  const uploadDoc = async (file) => {
    if (!file || !proc) return;
    const row = { process_id: proc.id, name: file.name, size:`${(file.size/1024).toFixed(0)} KB`, date: new Date().toISOString().split("T")[0], status:"disponível", uploaded_by:"advogado" };
    const res = await api.post("documents", row);
    if (res[0]) { setDocs(d => [res[0], ...d]); showToast(`"${file.name}" adicionado!`); }
  };

  const notify = async () => {
    await api.post("notifications", { client_id: client.id, text: "Nova atualização no seu processo. Acesse o portal para ver.", icon:"🔔", read: false });
    showToast("Notificação enviada ao cliente!");
  };

  const TABS = [["processo","Processo"],["documentos","Documentos"],["reunioes","Reuniões"],["chat","Chat"]];

  return (
    <div>
      <div className="topbar">
        <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
          <button className="btn btn-ghost" onClick={onBack}>← Voltar</button>
          <Avatar name={client.name} size={44} />
          <div>
            <h1 className="page-title" style={{fontSize:"1.6rem"}}>{client.name}</h1>
            <p className="page-sub">{client.email} · {client.phone || "—"}</p>
          </div>
        </div>
        <StatusBadge status={proc?.status} />
      </div>

      {/* Info strip */}
      <div className="card card-body" style={{marginBottom:"1.25rem",display:"flex",gap:"2rem",flexWrap:"wrap",alignItems:"center"}}>
        {[["Processo", proc?.number||"—"],["Tipo", proc?.type||"—"],["CPF", client.cpf||"—"],["Cliente desde", fmtDate(client.since)]].map(([k,v]) => (
          <div key={k}>
            <div style={{fontSize:".7rem",textTransform:"uppercase",letterSpacing:".07em",color:"var(--muted)",marginBottom:3}}>{k}</div>
            <div style={{fontWeight:600,fontSize:".88rem"}}>{v}</div>
          </div>
        ))}
        <div style={{marginLeft:"auto",minWidth:160}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:".72rem",color:"var(--muted)"}}>Progresso</span>
            <span style={{fontSize:".72rem",fontWeight:700}}>{pct}%</span>
          </div>
          <div className="prog-wrap" style={{height:8}}>
            <div className="prog-fill" style={{width:`${pct}%`,height:8}} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={`tab-btn${tab===id?" active":""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* PROCESSO */}
      {tab === "processo" && (
        <div className="card card-body">
          <div className="card-title">Etapas do Processo</div>
          <p style={{fontSize:".82rem",color:"var(--muted)",marginBottom:"1rem"}}>Clique no círculo para marcar/desmarcar etapas.</p>
          {steps.map(s => (
            <div className="step-row" key={s.id}>
              <div className={`step-circle${s.done?" done":""}`} onClick={() => toggleStep(s)}>
                {s.done && <Icon name="check" size={12} />}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:".9rem",color:s.done?"var(--text)":"var(--muted)"}}>{s.title}</div>
                <div style={{fontSize:".75rem",color:"var(--muted)",marginTop:1}}>{s.date}</div>
              </div>
              <span className={`badge${s.done?" badge-green":" badge-gray"}`}>{s.done?"Concluído":"Pendente"}</span>
            </div>
          ))}
          <button className="btn btn-dark" style={{marginTop:"1.25rem"}} onClick={notify}>
            <Icon name="bell" size={15} /> Notificar cliente
          </button>
        </div>
      )}

      {/* DOCUMENTOS */}
      {tab === "documentos" && (
        <div className="card card-body">
          <div className="card-title">Documentos do Processo</div>
          <div className="upload-zone" onClick={() => fileRef.current.click()}>
            <Icon name="upload" size={28} />
            <div style={{fontWeight:600,marginTop:8,fontSize:".9rem"}}>Clique para enviar documento ao cliente</div>
            <div style={{fontSize:".78rem",marginTop:4}}>PDF, DOC, JPG — até 20 MB</div>
            <input ref={fileRef} type="file" style={{display:"none"}} onChange={e => uploadDoc(e.target.files[0])} />
          </div>
          {docs.length === 0 && <p style={{textAlign:"center",color:"var(--muted)",padding:"1.5rem",fontSize:".85rem"}}>Nenhum documento ainda.</p>}
          {docs.map(d => (
            <div className="doc-row" key={d.id}>
              <div className="doc-ic"><Icon name="file" size={16} /></div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:".85rem"}}>{d.name}</div>
                <div style={{fontSize:".73rem",color:"var(--muted)",marginTop:2}}>{d.size} · {d.date}</div>
              </div>
              <span className={`badge${d.uploaded_by==="advogado"?" badge-blue":" badge-green"}`}>
                {d.uploaded_by === "advogado" ? "Advogado" : "Cliente"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* REUNIÕES */}
      {tab === "reunioes" && (
        <div className="card card-body">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
            <div className="card-title" style={{margin:0}}>Reuniões Agendadas</div>
            <button className="btn btn-dark" onClick={() => setShowMtg(true)}><Icon name="plus" size={15} /> Nova Reunião</button>
          </div>
          {meets.length === 0 && <p style={{textAlign:"center",color:"var(--muted)",padding:"2rem",fontSize:".85rem"}}>Nenhuma reunião agendada.</p>}
          {meets.map(m => {
            const d = new Date((m.date || "") + "T12:00:00");
            return (
              <div className="meet-card" key={m.id}>
                <div className="meet-date">
                  <div className="d">{d.getDate()}</div>
                  <div className="m">{MONTHS[d.getMonth()]}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:".9rem"}}>{m.title}</div>
                  <div style={{fontSize:".78rem",color:"var(--muted)",marginTop:3}}>
                    ⏰ {m.time} · {m.type === "videochamada" ? "📹 Videochamada" : "📍 Presencial"}
                  </div>
                  {m.notes && <div style={{fontSize:".78rem",color:"var(--muted)",marginTop:4}}>📝 {m.notes}</div>}
                </div>
                <span className="badge badge-green">{m.status}</span>
                <button className="icon-btn danger" onClick={() => delMeeting(m.id)}><Icon name="trash" size={13} /></button>
              </div>
            );
          })}
        </div>
      )}

      {/* CHAT */}
      {tab === "chat" && (
        <div className="card card-body">
          <div className="card-title">Mensagens com {client.name}</div>
          <div className="chat-box">
            <div className="chat-msgs">
              {msgs.length === 0 && <p style={{textAlign:"center",color:"var(--muted)",padding:"2rem",fontSize:".85rem"}}>Nenhuma mensagem ainda.</p>}
              {msgs.map(m => (
                <div key={m.id} className={`msg-row${m.from_role==="lawyer"?" mine":""}`}>
                  <div>
                    <div className={`msg-bubble${m.from_role==="lawyer"?" mine":" theirs"}`}>{m.text}</div>
                    <div className="msg-time" style={{textAlign:m.from_role==="lawyer"?"right":"left"}}>{fmtTime(m.created_at)}</div>
                  </div>
                </div>
              ))}
              <div ref={botRef} />
            </div>
            <div className="chat-input-row">
              <input className="chat-input" placeholder="Escreva uma mensagem para o cliente…"
                value={chatIn} onChange={e => setChatIn(e.target.value)}
                onKeyDown={e => e.key==="Enter" && sendMsg()} />
              <button className="btn-send" onClick={sendMsg}><Icon name="send" size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Modal */}
      {showMtg && (
        <div className="overlay" onClick={e => e.target===e.currentTarget && setShowMtg(false)}>
          <div className="modal">
            <div className="modal-head">
              <h2>Agendar Reunião</h2>
              <button className="icon-btn" onClick={() => setShowMtg(false)}><Icon name="close" size={15} /></button>
            </div>
            <div className="modal-body">
              <div className="field"><label>Título *</label><input placeholder="Ex: Alinhamento processual" value={mf.title} onChange={e => setMf(f=>({...f,title:e.target.value}))} /></div>
              <div className="field-row">
                <div className="field"><label>Data *</label><input type="date" value={mf.date} onChange={e => setMf(f=>({...f,date:e.target.value}))} /></div>
                <div className="field"><label>Horário</label><input type="time" value={mf.time} onChange={e => setMf(f=>({...f,time:e.target.value}))} /></div>
              </div>
              <div className="field">
                <label>Tipo</label>
                <select value={mf.type} onChange={e => setMf(f=>({...f,type:e.target.value}))}>
                  <option value="presencial">Presencial</option>
                  <option value="videochamada">Videochamada</option>
                  <option value="telefone">Telefone</option>
                </select>
              </div>
              <div className="field"><label>Observações</label><textarea value={mf.notes} onChange={e => setMf(f=>({...f,notes:e.target.value}))} /></div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setShowMtg(false)}>Cancelar</button>
              <button className="btn btn-dark" onClick={addMeeting}><Icon name="check" size={15} /> Agendar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CLIENTS SCREEN ───────────────────────────────────────────────────────────
function ClientsScreen({ clients, setClients, showToast, onOpenClient }) {
  const [query,   setQuery]   = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form,    setForm]    = useState({ name:"", email:"", phone:"", cpf:"", type:"", pass:"123456" });
  const [saving,  setSaving]  = useState(false);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.email.toLowerCase().includes(query.toLowerCase()) ||
    (c.proc?.type||"").toLowerCase().includes(query.toLowerCase())
  );

  const saveClient = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    const cl = await api.post("clients", { name:form.name, email:form.email, password:form.pass||"123456", phone:form.phone, cpf:form.cpf });
    if (cl[0]) {
      const pr = await api.post("processes", { client_id:cl[0].id, number:`BL-${Date.now().toString().slice(-6)}`, type:form.type||"Processo Jurídico", status:"aguardando", current_step:1, lawyer:"Dr. Ramom Lacerda", lawyer_avatar:"RL" });
      if (pr[0]) {
        const defaultSteps = [
          "Análise Documental","Submissão do Requerimento","Entrevista / Análise","Aprovação","Emissão do Documento Final"
        ];
        await Promise.all(defaultSteps.map((title, i) =>
          api.post("process_steps", { process_id:pr[0].id, step_order:i+1, title, detail:"Fase não iniciada.", done:false, date:"—" })
        ));
        const steps = await api.get("process_steps", `?process_id=eq.${pr[0].id}&order=step_order.asc`);
        setClients(cs => [...cs, { ...cl[0], proc:pr[0], steps, docs:[], msgs:[], meetings:[] }]);
        showToast(`Cliente "${form.name}" cadastrado!`);
      }
    }
    setSaving(false);
    setShowAdd(false);
    setForm({ name:"", email:"", phone:"", cpf:"", type:"", pass:"123456" });
  };

  const removeClient = async (id) => {
    await api.del("clients", id);
    setClients(cs => cs.filter(c => c.id !== id));
    showToast("Cliente removido.");
  };

  return (
    <div>
      <div className="topbar">
        <div><h1 className="page-title">Clientes</h1><p className="page-sub">{clients.length} clientes cadastrados</p></div>
        <button className="btn btn-dark" onClick={() => setShowAdd(true)}><Icon name="plus" size={16} /> Novo Cliente</button>
      </div>
      <div className="card card-body">
        <div className="search-wrap">
          <span className="search-icon"><Icon name="search" size={16} /></span>
          <input placeholder="Buscar por nome, e-mail ou tipo de processo…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <table className="table">
          <thead><tr><th>Cliente</th><th>Telefone</th><th>Tipo</th><th>Status</th><th>Desde</th><th></th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{display:"flex",alignItems:"center",gap:".75rem"}}>
                    <Avatar name={c.name} size={34} />
                    <div>
                      <div style={{fontWeight:600,fontSize:".88rem"}}>{c.name}</div>
                      <div style={{fontSize:".75rem",color:"var(--muted)"}}>{c.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{fontSize:".85rem"}}>{c.phone || "—"}</td>
                <td style={{fontSize:".85rem"}}>{c.proc?.type || "—"}</td>
                <td><StatusBadge status={c.proc?.status} /></td>
                <td style={{fontSize:".82rem",color:"var(--muted)"}}>{fmtDate(c.since)}</td>
                <td>
                  <div style={{display:"flex",gap:".4rem"}}>
                    <button className="btn btn-ghost" style={{padding:".4rem .8rem",fontSize:".78rem"}} onClick={() => onOpenClient(c.id)}>
                      <Icon name="arrow" size={13} /> Abrir
                    </button>
                    <button className="icon-btn danger" onClick={() => removeClient(c.id)}><Icon name="trash" size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{textAlign:"center",padding:"2rem",color:"var(--muted)",fontSize:".88rem"}}>Nenhum cliente encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="overlay" onClick={e => e.target===e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <div className="modal-head">
              <h2>Novo Cliente</h2>
              <button className="icon-btn" onClick={() => setShowAdd(false)}><Icon name="close" size={15} /></button>
            </div>
            <div className="modal-body">
              <div className="field-row">
                <div className="field"><label>Nome Completo *</label><input placeholder="Ex: João da Silva" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></div>
                <div className="field"><label>CPF</label><input placeholder="000.000.000-00" value={form.cpf} onChange={e => setForm(f=>({...f,cpf:e.target.value}))} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>E-mail *</label><input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} /></div>
                <div className="field"><label>Telefone</label><input placeholder="+351 9xx xxx xxx" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Tipo de Processo</label><input placeholder="Ex: Nacionalidade Portuguesa" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))} /></div>
                <div className="field"><label>Senha inicial do cliente</label><input value={form.pass} onChange={e => setForm(f=>({...f,pass:e.target.value}))} /></div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
              <button className="btn btn-dark" onClick={saveClient} disabled={saving}>
                {saving ? <><Icon name="spin" size={15} /> Salvando…</> : <><Icon name="check" size={15} /> Cadastrar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ALL MEETINGS ─────────────────────────────────────────────────────────────
function MeetingsScreen({ clients }) {
  const all = clients
    .flatMap(c => (c.meetings || []).map(m => ({ ...m, clientName: c.name })))
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  return (
    <div>
      <div className="topbar"><div><h1 className="page-title">Todas as Reuniões</h1><p className="page-sub">{all.length} reuniões agendadas</p></div></div>
      <div className="card card-body">
        {all.length === 0 && <p style={{textAlign:"center",color:"var(--muted)",padding:"3rem",fontSize:".88rem"}}>Nenhuma reunião agendada ainda.</p>}
        {all.map(m => {
          const d = new Date((m.date || "") + "T12:00:00");
          return (
            <div className="meet-card" key={m.id}>
              <div className="meet-date">
                <div className="d">{d.getDate()}</div>
                <div className="m">{MONTHS[d.getMonth()]}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:".9rem"}}>{m.title}</div>
                <div style={{fontSize:".78rem",color:"var(--muted)",marginTop:3}}>
                  Cliente: <strong>{m.clientName}</strong> · ⏰ {m.time} · {m.type === "videochamada" ? "📹 Video" : "📍 Presencial"}
                </div>
                {m.notes && <div style={{fontSize:".78rem",color:"var(--muted)",marginTop:4}}>📝 {m.notes}</div>}
              </div>
              <span className="badge badge-green">{m.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn,   setLoggedIn]   = useState(false);
  const [tab,        setTab]        = useState("dashboard");
  const [clients,    setClients]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [openClient, setOpenClient] = useState(null);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const loadData = async () => {
    setLoading(true);
    try {
      const cs = await api.get("clients", "?order=created_at.desc");
      const enriched = await Promise.all(cs.map(async (c) => {
        const procs = await api.get("processes", `?client_id=eq.${c.id}&limit=1`);
        const proc  = procs[0] || null;
        let steps = [], docs = [], msgs = [], meetings = [];
        if (proc) {
          [steps, docs, msgs, meetings] = await Promise.all([
            api.get("process_steps", `?process_id=eq.${proc.id}&order=step_order.asc`),
            api.get("documents",     `?process_id=eq.${proc.id}&order=created_at.desc`),
            api.get("messages",      `?process_id=eq.${proc.id}&order=created_at.asc`),
            api.get("meetings",      `?process_id=eq.${proc.id}&order=date.asc`),
          ]);
        }
        return { ...c, proc, steps, docs, msgs, meetings };
      }));
      setClients(enriched);
    } catch (e) {
      showToast("Erro ao carregar dados do banco.");
    }
    setLoading(false);
  };

  const onLogin = () => { setLoggedIn(true); loadData(); };

  const navItems = [
    { id:"dashboard", label:"Painel Geral", icon:"dashboard" },
    { id:"clients",   label:"Clientes",     icon:"users",    badge: clients.length },
    { id:"meetings",  label:"Reuniões",     icon:"calendar", badge: clients.reduce((a,c)=>a+(c.meetings?.length||0),0) },
  ];

  if (!loggedIn) {
    return (
      <>
        <style>{CSS}</style>
        <LoginScreen onLogin={onLogin} />
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="layout">
        <aside className="sidebar">
          <div className="brand">
            <h2>Bono & Lacerda</h2>
            <span>Painel Administrativo</span>
          </div>
          <div className="who">
            <Avatar name="Ramom Lacerda" size={36} />
            <div>
              <div className="who-name">Dr. Ramom Lacerda</div>
              <div className="who-role">OAB/PB 19.165 · Lisboa 65899L</div>
            </div>
          </div>
          <nav>
            {navItems.map(item => (
              <div
                key={item.id}
                className={`nav-item${tab===item.id && !openClient ? " active" : ""}`}
                onClick={() => { setTab(item.id); setOpenClient(null); }}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
                {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </nav>
          <footer>
            <button className="btn-logout" onClick={() => { setLoggedIn(false); setClients([]); }}>
              <Icon name="logout" size={15} /> Sair
            </button>
          </footer>
        </aside>

        <main className="main">
          {loading ? (
            <Loader text="Carregando dados do banco de dados…" />
          ) : openClient ? (
            <ClientDetail
              clientId={openClient}
              clients={clients}
              setClients={setClients}
              showToast={showToast}
              onBack={() => setOpenClient(null)}
            />
          ) : tab === "dashboard" ? (
            <DashScreen clients={clients} />
          ) : tab === "clients" ? (
            <ClientsScreen
              clients={clients}
              setClients={setClients}
              showToast={showToast}
              onOpenClient={id => setOpenClient(id)}
            />
          ) : tab === "meetings" ? (
            <MeetingsScreen clients={clients} />
          ) : null}
        </main>
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
