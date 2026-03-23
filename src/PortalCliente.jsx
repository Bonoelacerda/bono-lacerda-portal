import { useState, useEffect, useRef } from "react";

const SUPA_URL = "https://jrkreiidaxadwryjhdzu.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impya3JlaWlkYXhhZHdyeWpoZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3Nzk3NTIsImV4cCI6MjA4OTM1NTc1Mn0.37Izlz1YVZlZadgXiL5xZC8ZofT3tob1VGPUr5m19jM";
const H = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json" };

const db = {
  get:   (t, q="")  => fetch(`${SUPA_URL}/rest/v1/${t}${q}`, { headers: H }).then(r => r.json()),
  post:  (t, b)     => fetch(`${SUPA_URL}/rest/v1/${t}`, { method: "POST", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(b) }).then(r => r.json()),
  patch: (t, id, b) => fetch(`${SUPA_URL}/rest/v1/${t}?id=eq.${id}`, { method: "PATCH", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(b) }).then(r => r.json()),
  upload: async (path, file) => {
    const r = await fetch(`${SUPA_URL}/storage/v1/object/documentos/${path}`, {
      method: "POST",
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": file.type, "x-upsert": "true" },
      body: file
    });
    if (!r.ok) { const err = await r.text(); console.error("Upload error:", err); }
    return r.ok;
  },
  signedUrl: async (path) => `${SUPA_URL}/storage/v1/object/public/documentos/${encodeURIComponent(path)}`,
};

const MO = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const fmtd = ts => ts ? new Date(ts).toLocaleDateString("pt-BR") : "—";
const fmtt = ts => ts ? new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
const ini  = n  => n.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

function Icon({ name, size = 20 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
  const map = {
    home:     <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    file:     <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
    bell:     <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    chat:     <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    cal:      <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    logout:   <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    users:    <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    upload:   <svg {...p}><polyline points="16,16 12,12 8,16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    send:     <svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>,
    check:    <svg {...p}><polyline points="20,6 9,17 4,12"/></svg>,
    eye:      <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    dl:       <svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    scale:    <svg {...p}><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 7l4 4-4 4"/><path d="M21 7l-4 4 4 4"/><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="15" x2="21" y2="15"/></svg>,
    spin:     <svg {...p} style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
    key:      <svg {...p}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
    clip:     <svg {...p}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
    img:      <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>,
  };
  return map[name] || null;
}

/* ── CSS ────────────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideIn { from { transform:translateX(80px); opacity:0; } to { transform:translateX(0); opacity:1; } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
@keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
@keyframes breathe { 0%,100% { box-shadow:0 0 0 0 rgba(201,168,76,.25); } 50% { box-shadow:0 0 0 8px rgba(201,168,76,0); } }

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --n:#0f1e35; --nl:#1a3050; --nd:#0a1525; --g:#c9a84c; --gl:#d4b96a; --gd:rgba(201,168,76,.10);
  --cr:#f7f3ec; --cd:#ede8de; --wh:#ffffff; --tx:#1a1a2e; --mu:#7b889e;
  --bo:#e4dfd6; --ok:#16a34a; --er:#dc2626; --inf:#3b82f6;
  --sh:0 2px 12px rgba(15,30,53,.06); --sh2:0 8px 32px rgba(15,30,53,.10); --sh3:0 16px 48px rgba(15,30,53,.14);
  --r:14px; --r2:18px; --r3:24px;
}
html { scroll-behavior:smooth; }
body { font-family:'DM Sans',sans-serif; background:var(--cr); color:var(--tx); min-height:100vh; -webkit-font-smoothing:antialiased; }

/* ── LOGIN ── */
.lw { min-height:100vh; display:flex; }
.ll { width:44%; background:linear-gradient(160deg, var(--nd) 0%, var(--n) 40%, var(--nl) 100%); display:flex; flex-direction:column; justify-content:center; align-items:center; padding:3rem; position:relative; overflow:hidden; }
.ll::before { content:''; position:absolute; width:500px; height:500px; border-radius:50%; border:1px solid rgba(201,168,76,.08); top:-150px; left:-150px; animation:breathe 4s infinite; }
.ll::after  { content:''; position:absolute; width:350px; height:350px; border-radius:50%; border:1px solid rgba(201,168,76,.06); bottom:-100px; right:-100px; }
.ll .deco1 { position:absolute; top:15%; right:10%; width:80px; height:80px; border:1px solid rgba(201,168,76,.1); border-radius:20px; transform:rotate(45deg); }
.ll .deco2 { position:absolute; bottom:20%; left:8%; width:50px; height:50px; border:1px solid rgba(201,168,76,.08); border-radius:50%; }
.logo { display:flex; flex-direction:column; align-items:center; gap:1.2rem; z-index:1; }
.logo-ic { width:72px; height:72px; background:linear-gradient(135deg, rgba(201,168,76,.15), rgba(201,168,76,.05)); border:1.5px solid rgba(201,168,76,.3); border-radius:20px; display:flex; align-items:center; justify-content:center; color:var(--g); backdrop-filter:blur(10px); }
.logo h1 { font-family:'Playfair Display',serif; color:#fff; font-size:2rem; text-align:center; line-height:1.25; letter-spacing:.01em; }
.logo p  { color:rgba(255,255,255,.45); font-size:.8rem; letter-spacing:.15em; text-transform:uppercase; text-align:center; }
.ltag { margin-top:3rem; color:rgba(255,255,255,.3); font-size:.78rem; text-align:center; line-height:2; z-index:1; letter-spacing:.02em; }
.lr { flex:1; display:flex; align-items:center; justify-content:center; padding:3rem; background:var(--cr); }
.lc { width:100%; max-width:420px; animation:fadeUp .5s ease; }
.lc h2 { font-family:'Playfair Display',serif; font-size:2.1rem; color:var(--n); margin-bottom:.35rem; letter-spacing:-.01em; }
.lc > p { color:var(--mu); margin-bottom:2.5rem; font-size:.9rem; line-height:1.6; }
.chave-input { width:100%; padding:1.1rem; border:2px solid var(--bo); border-radius:var(--r); font-family:'DM Sans',sans-serif; font-size:1.5rem; font-weight:700; letter-spacing:.25em; text-align:center; background:var(--wh); color:var(--n); outline:none; transition:all .25s; }
.chave-input:focus { border-color:var(--g); box-shadow:0 0 0 4px var(--gd); }
.chave-hint { font-size:.78rem; color:var(--mu); text-align:center; margin-top:.65rem; margin-bottom:1.75rem; }
.btnp { width:100%; padding:1rem; background:linear-gradient(135deg, var(--n), var(--nl)); color:#fff; border:none; border-radius:var(--r); font-family:'DM Sans',sans-serif; font-size:.95rem; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:.5rem; transition:all .25s; letter-spacing:.01em; }
.btnp:hover { background:linear-gradient(135deg, var(--nl), var(--n)); transform:translateY(-1px); box-shadow:var(--sh2); }
.btnp:active { transform:translateY(0); }
.btnp:disabled { opacity:.6; cursor:not-allowed; transform:none; }
.errmsg { color:var(--er); font-size:.82rem; margin-top:.9rem; text-align:center; padding:.6rem; background:rgba(220,38,38,.06); border-radius:8px; }

/* ── LAYOUT ── */
.al  { display:flex; min-height:100vh; }
.sb  { width:270px; background:linear-gradient(180deg, var(--nd) 0%, var(--n) 100%); display:flex; flex-direction:column; position:fixed; top:0; left:0; height:100vh; z-index:100; }
.sbl { padding:1.8rem 1.5rem 1.4rem; border-bottom:1px solid rgba(255,255,255,.06); }
.sbl h2 { font-family:'Playfair Display',serif; color:#fff; font-size:1.15rem; line-height:1.3; }
.sbl span { color:var(--g); font-size:.72rem; display:block; letter-spacing:.1em; margin-top:2px; }
.sbu { padding:1.2rem 1.5rem; display:flex; align-items:center; gap:.75rem; border-bottom:1px solid rgba(255,255,255,.06); }
.av  { border-radius:50%; background:linear-gradient(135deg, var(--g), var(--gl)); display:flex; align-items:center; justify-content:center; font-weight:700; color:var(--n); flex-shrink:0; font-size:.85rem; }
.sbn { font-size:.88rem; font-weight:600; color:#fff; }
.sbs { font-size:.72rem; color:rgba(255,255,255,.35); letter-spacing:.03em; }
.sbnav { flex:1; padding:1rem 0; overflow-y:auto; }
.ni { display:flex; align-items:center; gap:.8rem; padding:.8rem 1.5rem; color:rgba(255,255,255,.5); font-size:.88rem; font-weight:500; cursor:pointer; transition:all .2s; border-left:3px solid transparent; position:relative; }
.ni:hover { color:rgba(255,255,255,.85); background:rgba(255,255,255,.03); }
.ni.on { color:var(--g); border-left-color:var(--g); background:rgba(201,168,76,.06); font-weight:600; }
.sbf { padding:1rem 1.5rem 1.5rem; border-top:1px solid rgba(255,255,255,.06); }
.out { display:flex; align-items:center; gap:.6rem; color:rgba(255,255,255,.35); font-size:.82rem; cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; transition:color .2s; }
.out:hover { color:rgba(255,255,255,.7); }
.mc { margin-left:270px; flex:1; padding:2.5rem 3rem; min-height:100vh; animation:fadeUp .35s ease; }

/* ── MOBILE ── */
.mob-nav { display:none; position:fixed; bottom:0; left:0; right:0; background:linear-gradient(180deg, var(--n), var(--nd)); border-top:1px solid rgba(255,255,255,.08); z-index:200; padding:.45rem 0 calc(.45rem + env(safe-area-inset-bottom)); }
.mob-nav-inner { display:flex; justify-content:space-around; align-items:center; }
.mob-ni { display:flex; flex-direction:column; align-items:center; gap:.2rem; padding:.45rem .7rem; color:rgba(255,255,255,.4); font-size:.6rem; font-weight:500; cursor:pointer; border:none; background:none; font-family:'DM Sans',sans-serif; transition:all .2s; min-width:50px; }
.mob-ni.on { color:var(--g); }
.mob-ni svg { flex-shrink:0; }
.mob-hdr { display:none; position:fixed; top:0; left:0; right:0; background:linear-gradient(90deg, var(--nd), var(--n)); z-index:150; padding:.85rem 1.25rem; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(201,168,76,.1); }
.mob-hdr h2 { font-family:'Playfair Display',serif; color:#fff; font-size:1rem; }
.mob-hdr span { color:var(--g); font-size:.68rem; display:block; letter-spacing:.03em; }
.mob-out { background:none; border:none; color:rgba(255,255,255,.45); cursor:pointer; padding:.3rem; }

@media (max-width: 768px) {
  .sb { display:none; }
  .mob-hdr { display:flex; }
  .mob-nav { display:block; }
  .mc { margin-left:0; padding:1.1rem; padding-top:4.8rem; padding-bottom:5.5rem; }
  .lw { flex-direction:column; }
  .ll { width:100%; min-height:auto; padding:2.5rem 1.5rem 1.5rem; }
  .ll::before, .ll::after, .ll .deco1, .ll .deco2 { display:none; }
  .ltag { margin-top:.75rem; }
  .lr { padding:1.5rem 1.25rem; }
  .dg { grid-template-columns:1fr 1fr !important; gap:.75rem !important; }
  .dg > .sc:last-child { grid-column: span 2; }
  .card { padding:1.15rem; border-radius:var(--r); }
  .ph h1 { font-size:1.5rem; }
  .ph p  { margin-bottom:1rem; }
  .type-grid { grid-template-columns:1fr 1fr; }
  .fg2 { grid-template-columns:1fr 1fr; }
  .dit { flex-wrap:wrap; gap:.5rem; }
  .cw { height:calc(100vh - 300px); }
  .chave-input { font-size:1.15rem; letter-spacing:.15em; }
  .tl { padding-left:1.75rem; }
  ::-webkit-scrollbar { display:none; }
}

/* ── COMPONENTS ── */
.ph h1 { font-family:'Playfair Display',serif; font-size:1.8rem; color:var(--n); letter-spacing:-.01em; }
.ph p  { color:var(--mu); font-size:.88rem; margin-top:.3rem; margin-bottom:2rem; line-height:1.5; }
.card { background:var(--wh); border-radius:var(--r2); padding:1.6rem; box-shadow:var(--sh); border:1px solid var(--bo); transition:box-shadow .25s; }
.card:hover { box-shadow:var(--sh2); }
.ct { font-family:'Playfair Display',serif; font-size:1.1rem; color:var(--n); margin-bottom:1rem; }

/* ── STATS ── */
.dg { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1.25rem; margin-bottom:1.75rem; }
.sc { background:var(--wh); border-radius:var(--r); padding:1.3rem 1.5rem; border:1px solid var(--bo); box-shadow:var(--sh); transition:all .25s; }
.sc:hover { box-shadow:var(--sh2); transform:translateY(-2px); }
.sl { font-size:.72rem; text-transform:uppercase; letter-spacing:.08em; color:var(--mu); margin-bottom:.5rem; font-weight:600; }
.sv { font-family:'Playfair Display',serif; font-size:1.5rem; color:var(--n); }
.ss { font-size:.78rem; color:var(--mu); margin-top:.25rem; }
.pb  { background:var(--cd); border-radius:99px; height:7px; margin-top:.5rem; overflow:hidden; }
.pbf { height:7px; border-radius:99px; background:linear-gradient(90deg, var(--n), var(--g), var(--gl)); background-size:200% 100%; animation:shimmer 3s ease infinite; transition:width .8s cubic-bezier(.4,0,.2,1); }

/* ── BADGES ── */
.bd { display:inline-flex; align-items:center; padding:.25rem .7rem; border-radius:99px; font-size:.72rem; font-weight:600; letter-spacing:.01em; }
.bg { background:#e8faf2; color:#15803d; }
.ba { background:var(--gd); color:#92400e; }
.bb { background:#eff6ff; color:#2563eb; }
.br { background:#fef2f2; color:#b91c1c; }

/* ── TIMELINE ── */
.tl { position:relative; padding-left:2rem; }
.tl::before { content:''; position:absolute; left:10px; top:0; bottom:0; width:2px; background:linear-gradient(180deg, var(--g), var(--cd)); }
.ti { position:relative; padding-bottom:1.75rem; }
.ti:last-child { padding-bottom:0; }
.td { position:absolute; left:-2rem; top:2px; width:22px; height:22px; border-radius:50%; border:2px solid var(--bo); background:#fff; display:flex; align-items:center; justify-content:center; transition:all .3s; }
.td.dn { background:var(--n); border-color:var(--n); color:#fff; }
.td.ac { background:var(--g); border-color:var(--g); box-shadow:0 0 0 4px var(--gd); animation:breathe 3s infinite; }
.tit { font-weight:600; font-size:.9rem; color:var(--n); }
.tit.mu { color:var(--mu); font-weight:400; }
.tdt { font-size:.78rem; color:var(--mu); margin-top:.15rem; }
.tde { font-size:.82rem; color:var(--mu); margin-top:.3rem; background:var(--cr); padding:.5rem .75rem; border-radius:8px; }

/* ── DOCUMENTS ── */
.dl  { display:flex; flex-direction:column; gap:.65rem; }
.dit { display:flex; align-items:center; gap:1rem; padding:1rem 1.25rem; background:var(--cr); border-radius:12px; border:1px solid var(--bo); transition:all .2s; }
.dit:hover { background:var(--cd); border-color:var(--g); transform:translateX(4px); }
.dic { width:40px; height:40px; background:linear-gradient(135deg, var(--n), var(--nl)); border-radius:10px; display:flex; align-items:center; justify-content:center; color:var(--g); flex-shrink:0; }
.dn2 { font-weight:600; font-size:.88rem; color:var(--n); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.dm  { font-size:.73rem; color:var(--mu); margin-top:.15rem; }
.ib  { width:34px; height:34px; border-radius:10px; border:1.5px solid var(--bo); background:var(--wh); display:flex; align-items:center; justify-content:center; color:var(--mu); cursor:pointer; transition:all .2s; }
.ib:hover { border-color:var(--g); color:var(--g); background:var(--gd); transform:scale(1.05); }
.uz  { border:2px dashed var(--bo); border-radius:var(--r2); padding:3rem; text-align:center; cursor:pointer; transition:all .25s; color:var(--mu); position:relative; overflow:hidden; }
.uz:hover { border-color:var(--g); background:var(--gd); color:var(--n); }
.uz:hover .uz-icon { transform:translateY(-4px); }
.uz-icon { transition:transform .25s; }
.upload-progress { height:4px; background:var(--cd); border-radius:99px; margin-top:1rem; overflow:hidden; }
.upload-progress-bar { height:4px; background:linear-gradient(90deg, var(--n), var(--g)); border-radius:99px; transition:width .3s; }

/* ── NOTIFICATIONS ── */
.nl2 { display:flex; flex-direction:column; gap:.6rem; }
.ni2 { display:flex; gap:1rem; padding:1.1rem 1.25rem; border-radius:var(--r); border:1px solid var(--bo); background:var(--wh); transition:all .2s; }
.ni2:hover { box-shadow:var(--sh); }
.ni2.u { background:linear-gradient(135deg, #fffdf5, #fffbeb); border-color:rgba(201,168,76,.25); }
.ntx { font-size:.88rem; color:var(--n); font-weight:500; line-height:1.5; }
.ntm { font-size:.73rem; color:var(--mu); margin-top:.25rem; }
.ud  { width:8px; height:8px; background:var(--g); border-radius:50%; flex-shrink:0; margin-top:6px; animation:breathe 2s infinite; }

/* ── MEETINGS ── */
.mcard { border:1px solid var(--bo); border-radius:var(--r); padding:1.1rem 1.25rem; display:flex; align-items:center; gap:1rem; margin-bottom:.65rem; background:var(--wh); transition:all .2s; }
.mcard:hover { box-shadow:var(--sh); border-color:var(--g); }
.mdb  { background:linear-gradient(135deg, var(--n), var(--nl)); color:#fff; border-radius:12px; width:56px; text-align:center; padding:.6rem 0; flex-shrink:0; }
.mdb .day { font-family:'Playfair Display',serif; font-size:1.7rem; line-height:1; }
.mdb .mon { font-size:.62rem; text-transform:uppercase; letter-spacing:.08em; opacity:.6; margin-top:3px; }

/* ── FORMS ── */
.fg { margin-bottom:1.2rem; }
.fg label { display:block; font-size:.78rem; font-weight:600; color:var(--n); text-transform:uppercase; letter-spacing:.06em; margin-bottom:.5rem; }
.fg input, .fg select, .fg textarea { width:100%; padding:.85rem 1rem; border:1.5px solid var(--bo); border-radius:12px; font-family:'DM Sans',sans-serif; font-size:.9rem; color:var(--tx); background:var(--wh); outline:none; transition:all .25s; }
.fg input:focus, .fg select:focus, .fg textarea:focus { border-color:var(--g); box-shadow:0 0 0 3px var(--gd); background:var(--wh); }
.fg textarea { resize:vertical; min-height:80px; }
.fg2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.fg-hint { font-size:.72rem; color:var(--mu); margin-top:4px; }

/* ── CHAT ── */
.cw  { display:flex; flex-direction:column; height:calc(100vh - 230px); min-height:380px; }
.che { display:flex; align-items:center; gap:.75rem; padding-bottom:1rem; border-bottom:1px solid var(--bo); margin-bottom:1rem; }
.chi h3 { font-weight:600; font-size:.92rem; color:var(--n); }
.chi p  { font-size:.73rem; color:var(--ok); }
.cms { flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:.75rem; padding:.5rem 0; }
.mr  { display:flex; gap:.5rem; align-items:flex-end; animation:fadeUp .2s ease; }
.mr.mi { flex-direction:row-reverse; }
.mb  { max-width:72%; padding:.8rem 1.1rem; border-radius:var(--r2); font-size:.88rem; line-height:1.55; position:relative; }
.mb.th { background:var(--cr); color:var(--tx); border-bottom-left-radius:4px; border:1px solid var(--bo); }
.mb.mi { background:linear-gradient(135deg, var(--n), var(--nl)); color:#fff; border-bottom-right-radius:4px; }
.mtime { font-size:.68rem; color:var(--mu); margin-top:.2rem; }
.cir { display:flex; gap:.6rem; padding-top:1rem; border-top:1px solid var(--bo); }
.cin { flex:1; padding:.8rem 1rem; border:1.5px solid var(--bo); border-radius:var(--r); font-family:'DM Sans',sans-serif; font-size:.9rem; outline:none; resize:none; color:var(--tx); transition:all .2s; }
.cin:focus { border-color:var(--g); box-shadow:0 0 0 3px var(--gd); }
.bsend { width:46px; height:46px; background:linear-gradient(135deg, var(--n), var(--nl)); border:none; border-radius:var(--r); display:flex; align-items:center; justify-content:center; color:var(--g); cursor:pointer; flex-shrink:0; transition:all .2s; }
.bsend:hover { transform:scale(1.05); box-shadow:var(--sh2); }
.chat-reply-notice { background:linear-gradient(135deg, rgba(201,168,76,.06), rgba(201,168,76,.03)); border:1px solid rgba(201,168,76,.18); border-radius:12px; padding:.7rem 1rem; text-align:center; font-size:.78rem; color:#92400e; margin-bottom:.5rem; }

/* ── IRN TRACKER ── */
.irn-track { display:flex; align-items:flex-start; margin-bottom:1.5rem; overflow-x:auto; padding-bottom:.5rem; }
.irn-step  { display:flex; flex-direction:column; align-items:center; flex:1; min-width:55px; position:relative; }
.irn-line  { position:absolute; top:18px; right:50%; width:100%; height:3px; background:var(--cd); z-index:0; border-radius:2px; }
.irn-line.lit { background:linear-gradient(90deg, var(--g), var(--gl)); }
.irn-circle-wrap { display:flex; flex-direction:column; align-items:center; z-index:1; position:relative; }
.irn-circle { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.85rem; font-weight:700; transition:all .4s cubic-bezier(.4,0,.2,1); background:var(--cr); color:#bbb; border:2px solid var(--cd); }
.irn-circle.done   { background:linear-gradient(135deg, var(--g), var(--gl)); color:var(--n); border:none; box-shadow:0 2px 8px rgba(201,168,76,.3); }
.irn-circle.active { background:var(--n); color:var(--g); border:2px solid var(--g); box-shadow:0 0 0 5px rgba(201,168,76,.15); animation:breathe 3s infinite; }
.irn-label { font-size:.68rem; margin-top:6px; text-align:center; color:var(--mu); line-height:1.3; }
.irn-label.done   { color:var(--g); font-weight:600; }
.irn-label.active { color:var(--n); font-weight:700; }
.irn-dot { display:block; font-size:.6rem; color:var(--g); font-weight:700; margin-top:2px; }

@media (max-width:600px) {
  .irn-track { flex-direction:column; overflow-x:visible; padding-bottom:0; gap:0; }
  .irn-step  { flex-direction:row; flex:unset; width:100%; min-width:unset; align-items:flex-start; padding:.5rem 0; }
  .irn-line  { position:absolute; top:0; right:unset; left:17px; width:3px; height:100%; }
  .irn-circle-wrap { flex-direction:row; gap:.75rem; align-items:center; }
  .irn-label { text-align:left; margin-top:0; font-size:.82rem; }
  .irn-dot   { display:inline; margin-left:.4rem; }
}

/* ── MEETING TYPES ── */
.type-grid { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; margin-top:.25rem; }
.type-opt  { border:2px solid var(--bo); border-radius:12px; padding:.85rem 1rem; cursor:pointer; transition:all .2s; background:var(--wh); }
.type-opt:hover { border-color:var(--g); background:rgba(201,168,76,.03); }
.type-opt.sel { border-color:var(--g); background:var(--gd); box-shadow:0 0 0 3px rgba(201,168,76,.1); }
.type-opt h4 { font-weight:600; font-size:.88rem; color:var(--n); }
.type-opt p  { font-size:.73rem; color:var(--mu); margin-top:3px; }

/* ── MISC ── */
.ld { display:flex; align-items:center; justify-content:center; min-height:200px; flex-direction:column; gap:1rem; color:var(--mu); font-size:.88rem; }
.toast { position:fixed; bottom:2rem; right:2rem; background:linear-gradient(135deg, var(--n), var(--nl)); color:#fff; padding:1rem 1.5rem; border-radius:var(--r); font-size:.88rem; z-index:9999; box-shadow:var(--sh3); border-left:3px solid var(--g); animation:slideIn .35s ease; backdrop-filter:blur(8px); }
::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-thumb { background:var(--bo); border-radius:99px; } ::-webkit-scrollbar-thumb:hover { background:var(--mu); }
.empty-state { text-align:center; padding:3rem 2rem; color:var(--mu); }
.empty-state .emoji { font-size:2.5rem; margin-bottom:1rem; display:block; }
.empty-state .title { font-family:'Playfair Display',serif; font-size:1.15rem; color:var(--n); margin-bottom:.5rem; }
.empty-state .desc { font-size:.85rem; line-height:1.6; max-width:320px; margin:0 auto; }
`;

/* ── TOAST ── */
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div className="toast">{msg}</div>;
}

function Loader({ text = "Carregando…" }) {
  return <div className="ld"><Icon name="spin" size={28} /><span>{text}</span></div>;
}

/* ── LOGIN ────────────────────────────────────────────────────────────── */
function Login({ onLogin }) {
  const [chave, setChave] = useState("");
  const [err,   setErr]   = useState("");
  const [busy,  setBusy]  = useState(false);

  const fmt = (val) => {
    const d = val.replace(/[^0-9a-zA-Z]/g, "").slice(0, 12);
    if (d.length > 8) return d.slice(0,4) + "-" + d.slice(4,8) + "-" + d.slice(8);
    if (d.length > 4) return d.slice(0,4) + "-" + d.slice(4);
    return d;
  };

  const go = async () => {
    const c = chave.trim();
    if (!c) { setErr("Insira a sua chave de acesso."); return; }
    setBusy(true); setErr("");
    try {
      const rows = await db.get("clients", `?chave_acesso=eq.${encodeURIComponent(c)}&select=*`);
      if (rows.length > 0) onLogin(rows[0]);
      else setErr("Chave não encontrada. Verifique e tente novamente.");
    } catch { setErr("Erro de ligação. Tente novamente."); }
    setBusy(false);
  };

  return (
    <div className="lw">
      <div className="ll">
        <div className="deco1" />
        <div className="deco2" />
        <div className="logo">
          <div className="logo-ic"><Icon name="scale" size={30} /></div>
          <h1>Bono & Lacerda<br />Advogados</h1>
          <p>Portal do Cliente</p>
        </div>
        <p className="ltag">Advocacia Internacional<br />Migração · Nacionalidade · Empresarial</p>
      </div>
      <div className="lr">
        <div className="lc">
          <h2>Bem-vindo</h2>
          <p>Insira a sua chave de acesso para acompanhar o seu processo em tempo real.</p>
          <input
            className="chave-input"
            placeholder="XXXX-XXXX-XXXX"
            value={chave}
            maxLength={14}
            onChange={e => setChave(fmt(e.target.value))}
            onKeyDown={e => e.key === "Enter" && go()}
          />
          <p className="chave-hint">A chave foi enviada pelo escritório Bono & Lacerda</p>
          <button className="btnp" onClick={go} disabled={busy}>
            {busy ? <><Icon name="spin" size={16} /> A verificar…</> : <><Icon name="key" size={16} /> Aceder ao Portal</>}
          </button>
          {err && <p className="errmsg">{err}</p>}
        </div>
      </div>
    </div>
  );
}

/* ── IRN STEPS ────────────────────────────────────────────────────────── */
const IRN_STEPS = [
  { num:1, label:"Recebido",    icon:"📥", desc:"Pedido recebido pelo IRN.",
    optimista: "O seu pedido chegou ao IRN e está devidamente registado no sistema. Este é o primeiro passo de uma jornada que termina com a sua nacionalidade portuguesa. Tudo começa aqui — e o seu processo já está dentro do sistema!",
    detalhes:  "Nesta fase, o IRN confirma que recebeu o seu pedido e que toda a documentação foi entregue. A equipa de registo está a verificar os dados iniciais. É completamente normal estar nesta fase — todos os processos passam por ela obrigatoriamente." },
  { num:2, label:"Registado",   icon:"📋", desc:"Pedido registado no sistema IRN.",
    optimista: "Excelente notícia! O seu processo foi registado oficialmente e tem agora um número único no sistema do IRN. Está na fila de análise e a avançar!",
    detalhes:  "O registo significa que o IRN validou a sua candidatura e atribuiu-lhe um número de processo oficial. A partir deste momento, o seu processo está em linha aguardando a sua vez de ser analisado. O IRN segue rigorosamente a ordem de entrada — cada processo protocolado antes do seu será analisado primeiro, garantindo total imparcialidade." },
  { num:3, label:"Consultas",   icon:"🔍", desc:"IRN a consultar entidades externas.",
    optimista: "O seu processo está activamente a ser trabalhado! O IRN está a consultar outras entidades oficiais para verificar e confirmar os dados da sua candidatura. Isso significa que há movimento real no seu processo.",
    detalhes:  "Nesta fase, o IRN contacta entidades como o Arquivo Nacional Torre do Tombo, registos civis, ou outras instituições para verificar os vínculos históricos com Portugal. Estas consultas são essenciais para fundamentar juridicamente a decisão. Quanto mais documentação completa tiver submetido, mais rápidas e favoráveis tendem a ser estas consultas." },
  { num:4, label:"Documentos",  icon:"📄", desc:"Análise da documentação submetida.",
    optimista: "O seu processo está a ser analisado a fundo! A equipa do IRN está a examinar toda a documentação que submeteu. Cada documento analisado é mais um passo em direcção ao despacho favorável.",
    detalhes:  "Nesta etapa, um técnico especializado do IRN revê minuciosamente todos os documentos do seu processo — certidões de nascimento, procurações, passaportes, certificados comunitários e demais comprovativos. A qualidade e completude da documentação que o escritório Bono & Lacerda preparou para si é fundamental para que esta fase decorra sem contratempos." },
  { num:5, label:"Análise",     icon:"⚖️",  desc:"Análise jurídica do pedido em curso.",
    optimista: "Estamos muito perto! O IRN está a realizar a análise jurídica final do seu processo. Um jurista especializado está a estudar o seu caso para emitir a decisão. Esta é uma das etapas mais avançadas do processo!",
    detalhes:  "A análise jurídica é a fase em que um consultor jurídico ou conservador avalia todos os elementos do processo à luz da legislação portuguesa sobre nacionalidade. O escritório Bono & Lacerda acompanha activamente esta fase e está disponível para responder a qualquer pedido de informação adicional do IRN com a máxima celeridade." },
  { num:6, label:"Despacho",    icon:"✍️",  desc:"Decisão final em elaboração.",
    optimista: "A linha de chegada está à vista! O Conservador está a elaborar o despacho final do seu processo. Em breve receberá a confirmação oficial da sua nacionalidade portuguesa. Estamos quase lá!",
    detalhes:  "O despacho é a decisão formal e definitiva do Conservador dos Registos Centrais ou do Arquivo Central do Porto. Nesta fase, o documento oficial de concessão (ou o despacho fundamentado em caso de necessidade de documentação adicional) está a ser redigido. O escritório Bono & Lacerda será notificado assim que o despacho for emitido." },
  { num:7, label:"Terminado",   icon:"🎉", desc:"Processo concluído.",
    optimista: "Parabéns! O seu processo de nacionalidade portuguesa está concluído! Bem-vindo à família portuguesa! Este momento representa o culminar de toda a sua jornada.",
    detalhes:  "O processo chegou ao fim com sucesso! Pode agora solicitar a certidão de nascimento portuguesa e, posteriormente, o passaporte português. O escritório Bono & Lacerda irá orientá-lo nos próximos passos para usufruir plenamente dos seus direitos como cidadão português e europeu." },
];

/* ── IRN TIMELINE ─────────────────────────────────────────────────────── */
function IRNTimeline({ proc, submissao }) {
  const getStep = () => {
    if (!proc) return 0;
    const status = (proc.status || '').toLowerCase();
    const sub = (proc.submissao_irn || submissao || '');
    if (status === 'concluido') return 7;
    if (status === 'aguardando') return 1;
    if (sub && status === 'em_andamento') return 2;
    return 1;
  };

  const currentStep = proc?.current_step || getStep();
  const submissaoText = proc?.submissao_irn || submissao || '';

  let submissaoDate = '';
  if (submissaoText) {
    const match = submissaoText.match(/de (\d{4}\/\d{2}\/\d{2})/);
    if (match) submissaoDate = match[1].replace(/\//g, '-');
  }

  return (
    <div>
      {submissaoText && (
        <div style={{ background:"linear-gradient(135deg, rgba(201,168,76,.06), rgba(201,168,76,.03))", border:"1px solid rgba(201,168,76,.2)", borderRadius:12, padding:".7rem 1.1rem", marginBottom:"1.25rem", fontSize:".8rem", color:"var(--n)" }}>
          <span style={{ color:"var(--mu)", marginRight:6 }}>Submissão:</span>
          <strong>{submissaoText}</strong>
        </div>
      )}

      <div className="irn-track">
        {IRN_STEPS.map((s, i) => {
          const done   = s.num < currentStep;
          const active = s.num === currentStep;
          return (
            <div key={s.num} className="irn-step">
              {i > 0 && <div className={`irn-line${done || active ? " lit" : ""}`} />}
              <div className="irn-circle-wrap">
                <div className={`irn-circle${done ? " done" : active ? " active" : ""}`}>
                  {done ? "✓" : s.num}
                </div>
                <div className={`irn-label${active ? " active" : done ? " done" : ""}`}>
                  {s.label}
                  {active && <span className="irn-dot">● actual</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {IRN_STEPS.filter(s => s.num === currentStep).map(s => (
        <div key={s.num}>
          <div style={{
            background:"linear-gradient(135deg, rgba(15,30,53,.03), rgba(201,168,76,.05))",
            border:"1px solid rgba(201,168,76,.18)", borderRadius:14, padding:"1.1rem 1.3rem",
            display:"flex", gap:".85rem", alignItems:"flex-start", marginBottom:"1rem"
          }}>
            <div style={{ fontSize:"1.6rem", lineHeight:1 }}>{s.icon}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:".9rem", color:"var(--n)", marginBottom:4 }}>
                Etapa {s.num} de 7 — {s.label}
              </div>
              <div style={{ fontSize:".82rem", color:"var(--mu)", lineHeight:1.55 }}>{s.desc}</div>
              {proc?.arquivo && (
                <div style={{ fontSize:".78rem", color:"var(--mu)", marginTop:5 }}>
                  {proc.arquivo}
                </div>
              )}
              {submissaoDate && (
                <div style={{ fontSize:".78rem", color:"var(--mu)", marginTop:2 }}>
                  Submetido a {new Date(submissaoDate).toLocaleDateString("pt-BR")}
                </div>
              )}
            </div>
          </div>

          <div style={{
            background:"linear-gradient(135deg, rgba(22,163,74,.04), rgba(201,168,76,.06))",
            border:"1px solid rgba(22,163,74,.15)", borderRadius:14, padding:"1.1rem 1.3rem",
            marginBottom:".75rem"
          }}>
            <div style={{ display:"flex", gap:".6rem", alignItems:"flex-start", marginBottom:".6rem" }}>
              <div style={{ fontWeight:700, fontSize:".85rem", color:"#14532d" }}>O que isto significa para si</div>
            </div>
            <div style={{ fontSize:".82rem", color:"#166534", lineHeight:1.75 }}>{s.optimista}</div>
          </div>

          <div style={{
            background:"rgba(248,246,241,.7)", border:"1px solid var(--bo)",
            borderRadius:14, padding:"1.1rem 1.3rem"
          }}>
            <div style={{ display:"flex", gap:".6rem", alignItems:"flex-start", marginBottom:".6rem" }}>
              <div style={{ fontWeight:700, fontSize:".82rem", color:"var(--n)" }}>O que acontece nesta fase</div>
            </div>
            <div style={{ fontSize:".8rem", color:"var(--mu)", lineHeight:1.8 }}>{s.detalhes}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── DASHBOARD ────────────────────────────────────────────────────────── */
function Dashboard({ client, proc, steps }) {
  const done = steps.filter(s => s.done).length;
  const totalSteps  = 7;
  const currentStep = proc?.current_step || 1;
  const completedFull = Math.max(0, currentStep - 1);
  const pct = Math.round(((completedFull + 0.5) / totalSteps) * 100);
  const stepNames = {1:'Recebido',2:'Registado',3:'Consultas',4:'Documentos',5:'Análise',6:'Despacho',7:'Terminado'};
  const stepName  = stepNames[currentStep] || '';
  const first = client.name.split(" ")[0];

  if (!proc) return (
    <div>
      <div className="ph"><h1>Olá, {first}!</h1><p>O seu processo está a ser preparado pelo escritório.</p></div>
      <div className="card" style={{ textAlign:"center", padding:"3.5rem 2rem" }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"var(--gd)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.5rem", margin:"0 auto 1.25rem" }}>⏳</div>
        <div style={{ fontFamily:"Playfair Display,serif", fontSize:"1.3rem", color:"var(--n)", marginBottom:".75rem" }}>Processo em preparação</div>
        <p style={{ color:"var(--mu)", fontSize:".88rem", lineHeight:1.7, maxWidth:420, margin:"0 auto" }}>
          O escritório Bono & Lacerda está a preparar o seu processo.<br />Em breve terá acesso a todas as informações aqui.
        </p>
        <div style={{ marginTop:"2rem", padding:".75rem 1.25rem", background:"var(--cr)", borderRadius:12, display:"inline-block", fontSize:".82rem", color:"var(--mu)" }}>
          +351 21 793 1934 · bonoelacerda@gmail.com
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="ph"><h1>Olá, {first}!</h1><p>Acompanhe o andamento do seu processo em tempo real.</p></div>

      {/* Hero progress card */}
      <div style={{ background:"linear-gradient(135deg, var(--n) 0%, var(--nl) 100%)", borderRadius:"var(--r3)", padding:"2rem 2.5rem", marginBottom:"1.75rem", color:"#fff", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", border:"1px solid rgba(201,168,76,.1)" }} />
        <div style={{ position:"absolute", bottom:-30, left:"60%", width:120, height:120, borderRadius:"50%", border:"1px solid rgba(201,168,76,.06)" }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", position:"relative", zIndex:1 }}>
          <div>
            <div style={{ fontSize:".72rem", textTransform:"uppercase", letterSpacing:".12em", color:"rgba(201,168,76,.7)", marginBottom:".5rem", fontWeight:600 }}>Progresso do Processo</div>
            <div style={{ fontSize:"3rem", fontFamily:"'Playfair Display',serif", fontWeight:700, lineHeight:1 }}>{pct}%</div>
            <div style={{ fontSize:".85rem", color:"rgba(255,255,255,.6)", marginTop:".4rem" }}>Etapa {currentStep} de {totalSteps} — {stepName}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:".72rem", textTransform:"uppercase", letterSpacing:".1em", color:"rgba(201,168,76,.7)", marginBottom:".4rem", fontWeight:600 }}>{client.artigo || proc.type}</div>
            <div style={{ fontSize:".82rem", color:"rgba(255,255,255,.5)" }}>Chave: {client.chave_acesso}</div>
          </div>
        </div>
        <div style={{ marginTop:"1.25rem", background:"rgba(255,255,255,.12)", borderRadius:99, height:10, overflow:"hidden", position:"relative", zIndex:1 }}>
          <div style={{ height:10, borderRadius:99, background:"linear-gradient(90deg, var(--g), var(--gl))", width:`${pct}%`, transition:"width 1s cubic-bezier(.4,0,.2,1)", boxShadow:"0 0 12px rgba(201,168,76,.4)" }} />
        </div>
      </div>

      <div className="dg" style={{ gridTemplateColumns:"1fr 1fr 1fr" }}>
        <div className="sc">
          <div className="sl">Data de Protocolo</div>
          <div className="sv" style={{ fontSize:"1.1rem", marginTop:4 }}>{proc.opened_at ? fmtd(proc.opened_at) : "—"}</div>
          <div style={{ marginTop:8 }}>
            <span className={`bd ${proc.status==="concluido"?"bg":proc.status==="aguardando"?"ba":"bb"}`}>
              {proc.status==="concluido"?"Concluído":proc.status==="aguardando"?"Aguardando":"Em andamento"}
            </span>
          </div>
        </div>
        <div className="sc">
          <div className="sl">Local de Processamento</div>
          <div style={{ fontWeight:600, fontSize:".88rem", color:"var(--n)", marginTop:6, lineHeight:1.4 }}>
            {proc.arquivo || (client.observacao?.includes("IRN") ? "IRN — Em análise" : "—")}
          </div>
          <div className="ss" style={{ marginTop:6 }}>{fmtd(proc.last_update)}</div>
        </div>
        <div className="sc">
          <div className="sl">Artigo</div>
          <div style={{ fontWeight:700, fontSize:"1rem", color:"var(--n)", marginTop:6 }}>{client.artigo || proc.type || "—"}</div>
          <div className="ss" style={{ marginTop:4 }}>Nacionalidade Portuguesa</div>
        </div>
      </div>

      {/* Prazo estimado */}
      {(() => {
        const artigo = (client.artigo || proc.type || '').toLowerCase();
        const arquivo = (proc.arquivo || '').toLowerCase();
        const protocolo = proc.opened_at || '';

        const PRAZOS = [
          { match: a => a.includes('6') && (a.includes('n.º 7') || a.includes('no 7') || a.includes('n7')),
            porto:  { julgando: '2ª quinzena de maio de 2022',     fonte: 'ACP — Jan/2026' },
            lisboa: { julgando: '1ª quinzena de maio de 2021',     fonte: 'CRC Lisboa — Fev/2026' } },
          { match: a => a.includes('6') && (a.includes('n.º 1') || a.includes('no 1') || a.includes('n1')),
            porto:  { julgando: '2ª quinzena de setembro de 2023', fonte: 'ACP — Jan/2026' },
            lisboa: { julgando: '1ª quinzena de janeiro de 2024',  fonte: 'CRC Lisboa — Fev/2026' } },
          { match: a => a.includes('6') && (a.includes('n.º 2') || a.includes('no 2') || a.includes('n2')),
            porto:  { julgando: '1ª quinzena de setembro de 2025', fonte: 'ACP — Jan/2026' },
            lisboa: { julgando: '2ª quinzena de fevereiro de 2026',fonte: 'CRC Lisboa — Fev/2026' } },
          { match: a => a.includes('1') && (a.includes('alínea d') || a.includes('alinea d') || a.includes('1.º d') || a.includes('1o d')),
            porto:  { julgando: '—',                               fonte: 'ACP' },
            lisboa: { julgando: '2ª quinzena de fevereiro de 2026',fonte: 'CRC Lisboa — Fev/2026' } },
          { match: a => a.includes('1') && (a.includes('alínea c') || a.includes('alinea c') || a.includes('inscrição') || a.includes('inscricao')),
            porto:  { julgando: '—',                               fonte: 'ACP' },
            lisboa: { julgando: '1ª quinzena de janeiro de 2026',  fonte: 'CRC Lisboa — Fev/2026' } },
        ];

        const isPorto  = arquivo.includes('porto');
        const isLisboa = arquivo.includes('central') || arquivo.includes('conservatória') || arquivo.includes('conservatoria') || arquivo.includes('lisboa');
        const prazo = PRAZOS.find(p => p.match(artigo));
        if (!prazo) return null;
        const info = isPorto ? prazo.porto : isLisboa ? prazo.lisboa : null;
        if (!info || info.julgando === '—') return null;

        const isLate = protocolo && new Date(protocolo) < new Date('2022-06-01');
        const isRecent = protocolo && new Date(protocolo) > new Date('2024-06-01');

        return (
          <div style={{ background:"linear-gradient(135deg, rgba(29,53,87,.03) 0%, rgba(201,168,76,.05) 100%)", border:"1px solid rgba(201,168,76,.2)", borderRadius:"var(--r2)", padding:"1.3rem 1.5rem", marginBottom:"1.5rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:"1rem" }}>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", fontWeight:600, color:"var(--n)" }}>
                Previsão de Análise pelo IRN
              </span>
              <span style={{ marginLeft:"auto", fontSize:".68rem", color:"var(--mu)", background:"var(--wh)", padding:"3px 10px", borderRadius:99, border:"1px solid var(--bo)" }}>{info.fonte}</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
              <div style={{ background:"var(--wh)", borderRadius:12, padding:".85rem 1.1rem", border:"1px solid var(--bo)" }}>
                <div style={{ fontSize:".7rem", textTransform:"uppercase", letterSpacing:".07em", color:"var(--mu)", marginBottom:5, fontWeight:600 }}>O seu processo entrou em</div>
                <div style={{ fontWeight:700, fontSize:".95rem", color:"var(--n)" }}>{protocolo ? fmtd(protocolo) : "—"}</div>
                <div style={{ fontSize:".75rem", color:"var(--mu)", marginTop:3 }}>{client.artigo || proc.type}</div>
              </div>
              <div style={{ background:"rgba(201,168,76,.06)", borderRadius:12, padding:".85rem 1.1rem", border:"1px solid rgba(201,168,76,.2)" }}>
                <div style={{ fontSize:".7rem", textTransform:"uppercase", letterSpacing:".07em", color:"#92400e", marginBottom:5, fontWeight:600 }}>IRN a analisar processos de</div>
                <div style={{ fontWeight:700, fontSize:".95rem", color:"#92400e" }}>{info.julgando}</div>
                <div style={{ fontSize:".75rem", color:"#b45309", marginTop:3 }}>
                  {isPorto ? "Arquivo Central do Porto" : "Conservatória dos Registos Centrais"}
                </div>
              </div>
            </div>
            <div style={{ marginTop:"1rem", fontSize:".78rem", color:"var(--mu)", lineHeight:1.65, padding:".7rem 1rem", background:"var(--wh)", borderRadius:10, border:"1px solid var(--bo)" }}>
              <strong style={{color:"var(--n)"}}>O que isto significa:</strong> O IRN analisa os processos pela ordem de entrada. Actualmente estão a analisar processos que entraram na <strong style={{color:"var(--n)"}}>{info.julgando}</strong>.
              {isLate && <span style={{color:"var(--ok)",fontWeight:600}}> O seu processo está na fila para análise em breve!</span>}
              {isRecent && <span style={{color:"#92400e"}}> O seu processo é mais recente e aguarda que os anteriores sejam analisados primeiro.</span>}
            </div>
          </div>
        );
      })()}

      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:"1.25rem" }}>
        <div className="card">
          <div className="ct">Etapas do Processo IRN</div>
          <IRNTimeline proc={proc} submissao={client.observacao} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
          <div className="card">
            <div className="ct">Advogados</div>
            <div style={{ display:"flex", alignItems:"center", gap:".85rem", marginBottom:"1rem" }}>
              <div className="av" style={{ width:48, height:48, fontSize:".95rem" }}>RL</div>
              <div>
                <div style={{ fontWeight:600, fontSize:".92rem" }}>Dr. Ramom Lacerda</div>
                <div style={{ fontSize:".73rem", color:"var(--mu)", marginTop:2 }}>OAB/PB 19.165</div>
                <div style={{ fontSize:".73rem", color:"var(--mu)" }}>Lisboa — Cédula 65899L · Madrid — 142952</div>
                <div style={{ fontSize:".73rem", color:"var(--ok)", marginTop:3, fontWeight:600 }}>● Online</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:".85rem", paddingTop:".85rem", borderTop:"1px solid var(--bo)" }}>
              <div className="av" style={{ width:48, height:48, fontSize:".95rem" }}>LF</div>
              <div>
                <div style={{ fontWeight:600, fontSize:".92rem" }}>Dr. Luis Felipe Bono</div>
                <div style={{ fontSize:".73rem", color:"var(--mu)", marginTop:2 }}>OAB/SP 441.255 · OAB/PB 33587A</div>
                <div style={{ fontSize:".73rem", color:"var(--mu)", marginTop:1 }}>Lisboa 67321L · Madrid 142951</div>
                <div style={{ fontSize:".73rem", color:"var(--ok)", marginTop:3, fontWeight:600 }}>● Online</div>
              </div>
            </div>
            {proc?.opened_at && (
              <div style={{ marginTop:".9rem", paddingTop:".8rem", borderTop:"1px solid var(--bo)", fontSize:".78rem", color:"var(--mu)" }}>
                Data de protocolo: <strong style={{color:"var(--n)"}}>{fmtd(proc.opened_at)}</strong>
              </div>
            )}
          </div>
          <div className="card">
            <div className="ct">Escritório</div>
            <div style={{ fontSize:".82rem", color:"var(--mu)", lineHeight:2 }}>
              Av João XXI, 72B, LJ E38<br />1000-219 Lisboa, Portugal<br />
              +351 21 793 1934<br />
              bonoelacerda@gmail.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── DOCUMENTS ────────────────────────────────────────────────────────── */
function Docs({ proc, toast }) {
  const [docs, setDocs] = useState([]);
  const [ld,   setLd]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!proc) return;
    db.get("documents", `?process_id=eq.${proc.id}&order=created_at.desc`).then(setDocs).finally(() => setLd(false));
  }, [proc]);

  const upload = async f => {
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { toast("Ficheiro demasiado grande. Máximo 20 MB."); return; }
    setUploading(true);
    const path = `${proc.id}/${Date.now()}_${f.name}`;
    const ok = await db.upload(path, f);
    if (!ok) { toast("Erro ao enviar ficheiro. Tente novamente."); setUploading(false); return; }
    const row = { process_id:proc.id, name:f.name, size:`${(f.size/1024).toFixed(0)} KB`, date:new Date().toISOString().split("T")[0], status:"aguardando", uploaded_by:"cliente", storage_path:path };
    const saved = await db.post("documents", row);
    if (saved[0]) { setDocs(d => [saved[0], ...d]); toast(`"${f.name}" enviado com sucesso!`); }
    setUploading(false);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) upload(f); };

  const download = async doc => {
    if (!doc.storage_path) { toast("Este ficheiro não tem download disponível."); return; }
    const url = await db.signedUrl(doc.storage_path);
    if (url) { window.open(url, "_blank"); }
    else toast("Erro ao gerar link de download.");
  };

  const badge = s => s==="aprovado" ? <span className="bd bg">Aprovado</span> : s==="aguardando" ? <span className="bd ba">Aguardando</span> : <span className="bd bb">Disponível</span>;

  return (
    <div>
      <div className="ph"><h1>Documentos</h1><p>Envie e consulte documentos do seu processo.</p></div>
      <div className="card" style={{ marginBottom:"1.25rem" }}>
        <div className="ct">Enviar Documento</div>
        <div
          className="uz"
          onClick={() => ref.current.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={dragOver ? { borderColor:"var(--g)", background:"var(--gd)" } : {}}
        >
          {uploading ? (
            <>
              <Icon name="spin" size={32} />
              <div style={{ fontWeight:600, marginTop:10, fontSize:".9rem" }}>A enviar ficheiro…</div>
            </>
          ) : (
            <>
              <div className="uz-icon"><Icon name="upload" size={36} /></div>
              <div style={{ fontWeight:600, marginTop:10, fontSize:".9rem", color:"var(--n)" }}>
                {dragOver ? "Solte o ficheiro aqui" : "Arraste um ficheiro ou clique para selecionar"}
              </div>
              <div style={{ fontSize:".78rem", marginTop:6, color:"var(--mu)" }}>PDF, DOC, JPG, PNG — até 20 MB</div>
            </>
          )}
          <input ref={ref} type="file" style={{ display:"none" }} onChange={e => upload(e.target.files[0])} />
        </div>
      </div>
      <div className="card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
          <div className="ct" style={{ margin:0 }}>Todos os Documentos</div>
          {docs.length > 0 && <span style={{ fontSize:".75rem", color:"var(--mu)", background:"var(--cr)", padding:".25rem .65rem", borderRadius:99 }}>{docs.length} ficheiro{docs.length!==1?"s":""}</span>}
        </div>
        {ld ? <Loader /> : (
          <div className="dl">
            {docs.map(d => (
              <div key={d.id} className="dit">
                <div className="dic"><Icon name="file" size={18} /></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="dn2">{d.name}</div>
                  <div className="dm">{d.size} · {d.date} · {d.uploaded_by==="cliente"?"Enviado por si":"Enviado pelo advogado"}</div>
                </div>
                <div style={{ marginRight:8 }}>{badge(d.status)}</div>
                <button className="ib" onClick={() => download(d)} title="Download">
                  <Icon name="dl" size={14} />
                </button>
              </div>
            ))}
            {!docs.length && (
              <div className="empty-state">
                <span className="emoji">📁</span>
                <div className="title">Nenhum documento</div>
                <div className="desc">Envie o seu primeiro documento usando a área acima.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── NOTIFICATIONS ────────────────────────────────────────────────────── */
function Notifs({ client }) {
  const [ns, setNs] = useState([]);
  const [ld, setLd] = useState(true);

  useEffect(() => {
    db.get("notifications", `?client_id=eq.${client.id}&order=created_at.desc`).then(setNs).finally(() => setLd(false));
  }, []);

  const markAll = async () => {
    await Promise.all(ns.filter(n => !n.read).map(n => db.patch("notifications", n.id, { read:true })));
    setNs(ns => ns.map(n => ({ ...n, read:true })));
  };

  const unread = ns.filter(n => !n.read).length;

  return (
    <div>
      <div className="ph"><h1>Notificações</h1><p>Atualizações sobre o seu processo.</p></div>
      <div className="card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
            <div className="ct" style={{ margin:0 }}>Todas as notificações</div>
            {unread > 0 && <span style={{ background:"var(--g)", color:"var(--n)", fontSize:".68rem", fontWeight:700, padding:".15rem .5rem", borderRadius:99, minWidth:20, textAlign:"center" }}>{unread}</span>}
          </div>
          {unread > 0 && <button onClick={markAll} style={{ fontSize:".78rem", color:"var(--g)", background:"var(--gd)", border:"1px solid rgba(201,168,76,.2)", borderRadius:8, padding:".4rem .8rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600, transition:"all .2s" }}>Marcar como lidas</button>}
        </div>
        {ld ? <Loader /> : (
          <div className="nl2">
            {ns.map(n => (
              <div key={n.id} className={`ni2${!n.read?" u":""}`}>
                <div style={{ fontSize:"1.3rem", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", background:!n.read?"var(--gd)":"var(--cr)", borderRadius:10, flexShrink:0 }}>{n.icon}</div>
                <div style={{ flex:1 }}>
                  <div className="ntx">{n.text}</div>
                  <div className="ntm">{fmtd(n.created_at)}</div>
                </div>
                {!n.read && <div className="ud" />}
              </div>
            ))}
            {!ns.length && (
              <div className="empty-state">
                <span className="emoji">🔔</span>
                <div className="title">Sem notificações</div>
                <div className="desc">Quando houver atualizações no seu processo, aparecerão aqui.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── MEETINGS ─────────────────────────────────────────────────────────── */
function Meetings({ proc, client }) {
  const [ms,    setMs]    = useState([]);
  const [ld,    setLd]    = useState(true);
  const [form,  setForm]  = useState({ title:"Consulta sobre o meu processo", date:"", time:"10:00", type:"videochamada", notes:"" });
  const [busy,  setBusy]  = useState(false);
  const [sent,  setSent]  = useState(false);

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  useEffect(() => {
    if (!proc) return;
    db.get("meetings", `?process_id=eq.${proc.id}&order=date.asc`).then(setMs).finally(() => setLd(false));
  }, [proc]);

  const submit = async () => {
    if (!form.date || !proc) return;
    setBusy(true);
    const saved = await db.post("meetings", { process_id:proc.id, title:form.title||"Reunião solicitada pelo cliente", date:form.date, time:form.time, type:form.type, notes:form.notes, status:"pendente" });
    if (saved[0]) {
      setMs(m => [...m, saved[0]]);
      await db.post("notifications", { client_id:client.id, text:`Pedido de reunião enviado para ${form.date.split("-").reverse().join("/")} às ${form.time}. Aguarde confirmação.`, icon:"📅", read:false });
      setSent(true);
    }
    setBusy(false);
  };

  const cancel = async id => {
    await db.patch("meetings", id, { status:"cancelado" });
    setMs(m => m.map(x => x.id === id ? { ...x, status:"cancelado" } : x));
  };

  const statusBadge = s => {
    if (s === "confirmado") return <span className="bd bg">Confirmado</span>;
    if (s === "cancelado")  return <span className="bd br">Cancelado</span>;
    if (s === "recusado")   return <span className="bd br">Recusado</span>;
    return <span className="bd ba">Aguardando</span>;
  };

  const TYPES = [
    { val:"videochamada", label:"Videochamada", icon:"📹", sub:"Google Meet / Zoom" },
    { val:"presencial",   label:"Presencial",   icon:"📍", sub:"Lisboa, Portugal" },
    { val:"telefone",     label:"Telefone",     icon:"📞", sub:"Ligação direta" },
    { val:"whatsapp",     label:"WhatsApp",     icon:"💬", sub:"+351 21 793 1934" },
  ];

  return (
    <div>
      <div className="ph"><h1>Reuniões</h1><p>Agende uma reunião com o seu advogado.</p></div>
      <div className="card" style={{ marginBottom:"1.25rem" }}>
        <div className="ct">Solicitar Nova Reunião</div>
        {sent ? (
          <div style={{ textAlign:"center", padding:"3rem 1.5rem" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"#e8faf2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", margin:"0 auto 1.25rem" }}>✅</div>
            <div style={{ fontFamily:"Playfair Display,serif", fontSize:"1.2rem", color:"var(--n)", marginBottom:".5rem" }}>Pedido enviado!</div>
            <p style={{ color:"var(--mu)", fontSize:".88rem", lineHeight:1.7, marginBottom:"1.5rem", maxWidth:340, margin:"0 auto 1.5rem" }}>
              O escritório irá confirmar em breve.<br />Receberá uma notificação assim que confirmado.
            </p>
            <button className="btnp" style={{ width:"auto", padding:".75rem 2rem", display:"inline-flex" }} onClick={() => setSent(false)}>
              Solicitar outra reunião
            </button>
          </div>
        ) : (
          <>
            <div className="fg">
              <label>Assunto</label>
              <input value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} placeholder="Ex: Consulta sobre o meu processo" />
            </div>
            <div className="fg2">
              <div className="fg">
                <label>Data</label>
                <input type="date" min={minDate} value={form.date} onChange={e => setForm(f => ({...f, date:e.target.value}))} />
              </div>
              <div className="fg">
                <label>Hora</label>
                <input type="time" value={form.time} onChange={e => setForm(f => ({...f, time:e.target.value}))} />
              </div>
            </div>
            <div className="fg">
              <label>Tipo de Reunião</label>
              <div className="type-grid">
                {TYPES.map(t => (
                  <div key={t.val} className={`type-opt${form.type===t.val?" sel":""}`} onClick={() => setForm(f => ({...f, type:t.val}))}>
                    <h4>{t.icon} {t.label}</h4>
                    <p>{t.sub}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="fg">
              <label>Mensagem (opcional)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes:e.target.value}))} placeholder="Descreva o assunto ou dúvidas que quer esclarecer…" />
            </div>
            <button className="btnp" onClick={submit} disabled={busy || !form.date}>
              {busy ? <><Icon name="spin" size={16} /> A enviar…</> : "Enviar Pedido de Reunião"}
            </button>
          </>
        )}
      </div>
      <div className="card">
        <div className="ct">As Minhas Reuniões</div>
        {ld ? <Loader /> : ms.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">📅</span>
            <div className="title">Nenhuma reunião</div>
            <div className="desc">Solicite a sua primeira reunião usando o formulário acima.</div>
          </div>
        ) : ms.map(m => {
          const d = new Date((m.date || "") + "T12:00:00");
          return (
            <div className="mcard" key={m.id}>
              <div className="mdb">
                <div className="day">{d.getDate()}</div>
                <div className="mon">{MO[d.getMonth()]}</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:".9rem" }}>{m.title}</div>
                <div style={{ fontSize:".78rem", color:"var(--mu)", marginTop:4 }}>
                  {m.time} · {m.type==="videochamada"?"Videochamada":m.type==="presencial"?"Presencial":m.type==="whatsapp"?"WhatsApp":"Telefone"}
                </div>
                {m.notes && <div style={{ fontSize:".78rem", color:"var(--mu)", marginTop:4, fontStyle:"italic" }}>{m.notes}</div>}
              </div>
              {statusBadge(m.status)}
              {m.status === "pendente" && (
                <button onClick={() => cancel(m.id)} style={{ background:"none", border:"1px solid var(--bo)", borderRadius:8, color:"var(--mu)", fontSize:".72rem", cursor:"pointer", padding:".35rem .6rem", fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }} onMouseOver={e => e.target.style.borderColor="var(--er)"} onMouseOut={e => e.target.style.borderColor="var(--bo)"}>Cancelar</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── CHAT ─────────────────────────────────────────────────────────────── */
function Chat({ client, proc }) {
  const [msgs,       setMsgs]       = useState([]);
  const [input,      setInput]      = useState("");
  const [ld,         setLd]         = useState(true);
  const [justSent,   setJustSent]   = useState(false);
  const bot = useRef();

  useEffect(() => {
    if (!proc) return;
    db.get("messages", `?process_id=eq.${proc.id}&order=created_at.asc`).then(setMsgs).finally(() => setLd(false));
  }, [proc]);

  useEffect(() => { bot.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || !proc) return;
    const saved = await db.post("messages", { process_id:proc.id, from_role:"client", text:input });
    if (saved[0]) { setMsgs(m => [...m, saved[0]]); setJustSent(true); }
    setInput("");
  };

  const clientMsgsCount = msgs.filter(m => m.from_role === "client").length;

  return (
    <div>
      <div className="ph"><h1>Chat</h1><p>Converse diretamente com o seu advogado.</p></div>
      <div className="card">
        <div className="cw">
          <div className="che">
            <div className="av" style={{ width:40, height:40, fontSize:".8rem" }}>{proc?.lawyer_avatar || "RL"}</div>
            <div className="chi">
              <h3>{proc?.lawyer || "Dr. Ramom Lacerda"}</h3>
              <p>● Bono & Lacerda Advogados</p>
            </div>
          </div>
          {ld ? <Loader /> : (
            <div className="cms">
              <div className="chat-reply-notice">
                A nossa equipa responde normalmente em até <strong>24 horas úteis</strong>
              </div>
              {msgs.map(m => (
                <div key={m.id} className={`mr${m.from_role==="client"?" mi":""}`}>
                  <div>
                    <div className={`mb${m.from_role==="client"?" mi":" th"}`}>{m.text}</div>
                    <div className="mtime" style={{ textAlign:m.from_role==="client"?"right":"left" }}>{fmtt(m.created_at)}</div>
                  </div>
                </div>
              ))}
              {!msgs.length && (
                <div className="empty-state" style={{ padding:"2.5rem 1rem" }}>
                  <span className="emoji">💬</span>
                  <div className="title">Inicie a conversa</div>
                  <div className="desc">Envie a sua mensagem e respondemos em breve.</div>
                </div>
              )}
              {justSent && clientMsgsCount >= 1 && (
                <div style={{ textAlign:"center", padding:".5rem", fontSize:".78rem", color:"var(--ok)", fontWeight:600 }}>
                  Mensagem enviada! Responderemos em até 24h úteis.
                </div>
              )}
              <div ref={bot} />
            </div>
          )}
          <div className="cir">
            <textarea className="cin" rows={1} placeholder="Digite a sua mensagem…" value={input}
              onChange={e => { setInput(e.target.value); setJustSent(false); }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <button className="bsend" onClick={send}><Icon name="send" size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── PROFILE ──────────────────────────────────────────────────────────── */
function Perfil({ client, toast, onUpdate }) {
  const [form,   setForm]   = useState({
    email:    client.email    || "",
    phone:    client.phone    || "",
    whatsapp: client.whatsapp || client.phone || "",
    address:  client.address  || "",
    city:     client.city     || "",
    state:    client.state    || "",
    zip:      client.zip      || "",
    country:  client.country  || "Brasil",
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setSaved(false); };

  const save = async () => {
    if (!form.email.trim()) { toast("Por favor insira um email válido."); return; }
    setSaving(true);
    const payload = {
      email: form.email.trim(), phone: form.phone.trim(), whatsapp: form.whatsapp.trim(),
      address: form.address.trim(), city: form.city.trim(), state: form.state.trim(),
      zip: form.zip.trim(), country: form.country.trim(),
    };
    const r = await db.patch("clients", client.id, payload);
    if (r[0]) { onUpdate({ ...client, ...payload }); setSaved(true); toast("Dados actualizados com sucesso!"); }
    else toast("Erro ao guardar. Tente novamente.");
    setSaving(false);
  };

  const stateLabel = ["Brasil"].includes(form.country) ? "Estado"
    : ["Portugal","Espanha","França","Itália","Alemanha"].includes(form.country) ? "Região / Distrito"
    : ["EUA","Canadá","Austrália","México"].includes(form.country) ? "Estado / Província"
    : "Estado / Região";

  const zipLabel = ["Brasil"].includes(form.country) ? "CEP"
    : ["Portugal"].includes(form.country) ? "Código Postal"
    : ["EUA","Canadá"].includes(form.country) ? "ZIP Code"
    : ["Reino Unido"].includes(form.country) ? "Postcode"
    : "Código Postal";

  const COUNTRIES = [
    "Brasil","Portugal","Angola","Cabo Verde","Moçambique","São Tomé e Príncipe",
    "Guiné-Bissau","Timor-Leste",
    "---",
    "Alemanha","Argentina","Austrália","Áustria","Bélgica","Bolívia","Canadá",
    "Chile","China","Colômbia","Dinamarca","Equador","Espanha","EUA","Finlândia",
    "França","Grécia","Holanda","Hungria","Índia","Irlanda","Israel","Itália",
    "Japão","México","Noruega","Nova Zelândia","Panamá","Paraguai","Peru",
    "Polónia","Reino Unido","República Checa","Roménia","Rússia","Suécia",
    "Suíça","Turquia","Ucrânia","Uruguai","Venezuela","Outro",
  ];

  return (
    <div>
      <div className="ph"><h1>Meu Perfil</h1><p>Mantenha os seus dados de contacto actualizados.</p></div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:"1.25rem", maxWidth:580 }}>

        {/* User card */}
        <div className="card" style={{ padding:"1.5rem", display:"flex", alignItems:"center", gap:"1.25rem", background:"linear-gradient(135deg, var(--wh) 0%, var(--cr) 100%)" }}>
          <div className="av" style={{ width:68, height:68, fontSize:"1.5rem", flexShrink:0 }}>{ini(client.name)}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:"1.15rem", color:"var(--n)" }}>{client.name}</div>
            <div style={{ fontSize:".82rem", color:"var(--mu)", marginTop:4 }}>{client.artigo || "Nacionalidade Portuguesa"}</div>
            <div style={{ fontSize:".78rem", color:"var(--mu)", marginTop:3, display:"flex", alignItems:"center", gap:".4rem" }}>
              <Icon name="key" size={12} /> {client.chave_acesso}
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="card" style={{ padding:"1.75rem" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", color:"var(--n)", marginBottom:"1.5rem", fontWeight:600, paddingBottom:".75rem", borderBottom:"1px solid var(--bo)" }}>
            Dados de Contacto
          </div>

          <div className="fg" style={{ marginBottom:"1.1rem" }}>
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="o.seu@email.com" />
            <div className="fg-hint">Usado para comunicações do escritório</div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.1rem" }}>
            <div className="fg" style={{ marginBottom:0 }}>
              <label>Telefone</label>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+55 11 99999-9999" />
            </div>
            <div className="fg" style={{ marginBottom:0 }}>
              <label>WhatsApp</label>
              <input type="tel" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="+55 11 99999-9999" />
              <div className="fg-hint">Pode ser diferente do telefone</div>
            </div>
          </div>

          <div style={{ borderTop:"1px solid var(--bo)", paddingTop:"1.25rem", marginTop:".5rem", marginBottom:"1.1rem" }}>
            <div style={{ fontSize:".72rem", fontWeight:700, color:"var(--mu)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:"1rem" }}>
              Endereço
            </div>

            <div className="fg" style={{ marginBottom:"1.1rem" }}>
              <label>País</label>
              <select value={form.country} onChange={e => set("country", e.target.value)}>
                {COUNTRIES.map(c => c === "---"
                  ? <option key="---" disabled>──────────────</option>
                  : <option key={c} value={c}>{c}</option>
                )}
              </select>
            </div>

            <div className="fg" style={{ marginBottom:"1.1rem" }}>
              <label>Rua / Avenida</label>
              <input type="text" value={form.address} onChange={e => set("address", e.target.value)} placeholder="Nome da rua, número, complemento" />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.1rem" }}>
              <div className="fg" style={{ marginBottom:0 }}>
                <label>Cidade</label>
                <input type="text" value={form.city} onChange={e => set("city", e.target.value)} placeholder="Cidade" />
              </div>
              <div className="fg" style={{ marginBottom:0 }}>
                <label>{stateLabel}</label>
                <input type="text" value={form.state} onChange={e => set("state", e.target.value)} placeholder={stateLabel} />
              </div>
            </div>

            <div className="fg" style={{ marginBottom:0 }}>
              <label>{zipLabel}</label>
              <input type="text" value={form.zip} onChange={e => set("zip", e.target.value)} placeholder="Código postal" style={{ maxWidth:220 }} />
            </div>
          </div>

          <button onClick={save} disabled={saving} style={{
            width:"100%", padding:".9rem", background: saved ? "var(--ok)" : "linear-gradient(135deg, var(--n), var(--nl))",
            color:"#fff", border:"none", borderRadius:14, fontFamily:"'DM Sans',sans-serif",
            fontSize:".95rem", fontWeight:600, cursor: saving ? "not-allowed" : "pointer",
            transition:"all .25s", display:"flex", alignItems:"center", justifyContent:"center", gap:".6rem",
            opacity: saving ? .6 : 1,
          }}>
            {saving ? <><Icon name="spin" size={16} /> A guardar…</>
            : saved  ? <><Icon name="check" size={16} /> Dados guardados!</>
            :           <>Guardar alterações</>}
          </button>
        </div>

        <div style={{ background:"linear-gradient(135deg, rgba(201,168,76,.05), rgba(201,168,76,.02))", border:"1px solid rgba(201,168,76,.15)", borderRadius:"var(--r)", padding:"1rem 1.25rem", fontSize:".8rem", color:"var(--mu)", lineHeight:1.7 }}>
          <strong style={{ color:"var(--n)" }}>Nota:</strong> As suas informações são confidenciais e utilizadas exclusivamente pelo escritório Bono & Lacerda para comunicações relacionadas com o seu processo.
        </div>
      </div>
    </div>
  );
}

/* ── APP ──────────────────────────────────────────────────────────────── */
export default function App() {
  const [client,  setClient]  = useState(null);
  const [proc,    setProc]    = useState(null);
  const [steps,   setSteps]   = useState([]);
  const [tab,     setTab]     = useState("home");
  const [toast,   setToast]   = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const onLogin = async c => {
    setClient(c); setLoading(true);
    const ps = await db.get("processes", `?client_id=eq.${c.id}&limit=1`);
    if (ps[0]) {
      setProc(ps[0]);
      const ss = await db.get("process_steps", `?process_id=eq.${ps[0].id}&order=step_order.asc`);
      setSteps(ss);
    }
    setLoading(false);
  };

  const nav = [
    { id:"home",     label:"Visão Geral",   ic:"home" },
    { id:"docs",     label:"Documentos",    ic:"file" },
    { id:"meetings", label:"Reuniões",      ic:"cal"  },
    { id:"notifs",   label:"Notificações",  ic:"bell" },
    { id:"chat",     label:"Chat",          ic:"chat" },
    { id:"perfil",   label:"Meu Perfil",    ic:"users"},
  ];

  if (!client) return <><style>{css}</style><Login onLogin={onLogin} /></>;

  return (
    <>
      <style>{css}</style>
      <div className="al">

        <header className="mob-hdr">
          <div>
            <h2>Bono & Lacerda</h2>
            <span>{client.name.split(" ")[0]} · {client.chave_acesso}</span>
          </div>
          <button className="mob-out" onClick={() => { setClient(null); setProc(null); setSteps([]); }}>
            <Icon name="logout" size={20} />
          </button>
        </header>

        <aside className="sb">
          <div className="sbl">
            <h2>Bono & Lacerda</h2>
            <span>Portal do Cliente</span>
          </div>
          <div className="sbu">
            <div className="av" style={{ width:40, height:40, fontSize:".82rem" }}>{ini(client.name)}</div>
            <div>
              <div className="sbn">{client.name}</div>
              <div className="sbs">{client.chave_acesso}</div>
            </div>
          </div>
          <nav className="sbnav">
            {nav.map(n => (
              <div key={n.id} className={`ni${tab === n.id ? " on" : ""}`} onClick={() => setTab(n.id)}>
                <Icon name={n.ic} size={17} />{n.label}
              </div>
            ))}
          </nav>
          <div className="sbf">
            <button className="out" onClick={() => { setClient(null); setProc(null); setSteps([]); }}>
              <Icon name="logout" size={16} /> Sair
            </button>
          </div>
        </aside>

        <main className="mc">
          {loading ? <Loader text="A carregar o seu processo…" /> : (
            <>
              {tab === "home"     && <Dashboard client={client} proc={proc} steps={steps} />}
              {tab === "docs"     && <Docs proc={proc} toast={showToast} />}
              {tab === "meetings" && <Meetings proc={proc} client={client} />}
              {tab === "notifs"   && <Notifs client={client} />}
              {tab === "chat"     && <Chat client={client} proc={proc} />}
              {tab === "perfil"   && <Perfil client={client} toast={showToast} onUpdate={c => setClient(c)} />}
            </>
          )}
        </main>

        <nav className="mob-nav">
          <div className="mob-nav-inner">
            {nav.map(n => (
              <button key={n.id} className={`mob-ni${tab === n.id ? " on" : ""}`} onClick={() => setTab(n.id)}>
                <Icon name={n.ic} size={22} />
                {n.label === "Visão Geral" ? "Início" :
                 n.label === "Documentos" ? "Docs" :
                 n.label === "Reuniões" ? "Reuniões" :
                 n.label === "Notificações" ? "Avisos" :
                 n.label === "Meu Perfil" ? "Perfil" : "Chat"}
              </button>
            ))}
          </div>
        </nav>

      </div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
