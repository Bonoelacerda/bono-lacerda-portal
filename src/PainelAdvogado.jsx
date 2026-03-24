import { useState, useEffect, useRef } from "react";

const SUPA_URL = "https://jrkreiidaxadwryjhdzu.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impya3JlaWlkYXhhZHdyeWpoZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3Nzk3NTIsImV4cCI6MjA4OTM1NTc1Mn0.37Izlz1YVZlZadgXiL5xZC8ZofT3tob1VGPUr5m19jM";
const H = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json" };

const api = {
  get:   (t, q="")  => fetch(`${SUPA_URL}/rest/v1/${t}${q}`, { headers: H }).then(r => r.json()),
  post:  (t, b)     => fetch(`${SUPA_URL}/rest/v1/${t}`, { method:"POST", headers:{...H,Prefer:"return=representation"}, body:JSON.stringify(b) }).then(r => r.json()),
  patch: (t, id, b) => fetch(`${SUPA_URL}/rest/v1/${t}?id=eq.${id}`, { method:"PATCH", headers:{...H,Prefer:"return=representation"}, body:JSON.stringify(b) }).then(r => r.json()),
  del:   (t, id)    => fetch(`${SUPA_URL}/rest/v1/${t}?id=eq.${id}`, { method:"DELETE", headers: H }),
  upload: async (path, file) => {
    const r = await fetch(`${SUPA_URL}/storage/v1/object/documentos/${path}`, {
      method: "POST",
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": file.type, "x-upsert": "true" },
      body: file
    });
    if (!r.ok) console.error("Upload error:", await r.text());
    return r.ok;
  },
  signedUrl: async (path) => `${SUPA_URL}/storage/v1/object/public/documentos/${encodeURIComponent(path)}`
};

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const ini  = n => n.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
const fmtd = ts => ts ? new Date(ts).toLocaleDateString("pt-BR") : "—";
const fmtt = ts => ts ? new Date(ts).toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"}) : "";

function Icon({ name, size=18 }) {
  const p = { width:size, height:size, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" };
  const map = {
    dash:   <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    users:  <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    cal:    <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    plus:   <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    check:  <svg {...p}><polyline points="20,6 9,17 4,12"/></svg>,
    trash:  <svg {...p}><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/></svg>,
    send:   <svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>,
    close:  <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    logout: <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    search: <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    arrow:  <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>,
    file:   <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
    upload: <svg {...p}><polyline points="16,16 12,12 8,16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    bell:   <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    spin:   <svg {...p} style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  };
  return map[name] || null;
}

const IRN_STEPS = [
  { num:1, label:"Recebido",    icon:"📥", desc:"Pedido recebido pelo IRN." },
  { num:2, label:"Registado",   icon:"📋", desc:"Pedido registado no sistema." },
  { num:3, label:"Consultas",   icon:"🔍", desc:"IRN a consultar entidades." },
  { num:4, label:"Documentos",  icon:"📄", desc:"Análise de documentação." },
  { num:5, label:"Análise",     icon:"⚖️",  desc:"Análise jurídica em curso." },
  { num:6, label:"Despacho",    icon:"✍️",  desc:"Decisão final em elaboração." },
  { num:7, label:"Terminado",   icon:"🎉", desc:"Processo concluído." },
];

const WA_TEMPLATES = [
  {
    id: "acesso",
    label: "🔑 Enviar Acesso ao Portal",
    msg: (c) =>
`Olá ${c.name.split(" ")[0]}! 👋

O escritório *Bono & Lacerda Advogados* criou o seu portal exclusivo para acompanhar o seu processo de Nacionalidade Portuguesa.

🔗 *Acesse agora:* bono-lacerda-portal.vercel.app
🔑 *Chave de acesso:* ${c.chave_acesso || "—"}

No portal pode acompanhar o estado do seu processo em tempo real, enviar documentos, agendar reuniões e enviar mensagens directamente para a equipa.

Qualquer dúvida estamos disponíveis! 😊
*Bono & Lacerda Advogados*
📞 +351 21 793 1934`
  },
  {
    id: "atualizacao",
    label: "📋 Actualização do Processo",
    msg: (c, proc) =>
`Olá ${c.name.split(" ")[0]}! 👋

Temos uma actualização sobre o seu processo de Nacionalidade Portuguesa.

📌 *Estado actual:* ${proc?.status === "em_andamento" ? "Em andamento ✅" : proc?.status === "aguardando" ? "Aguardando documentos ⚠️" : "Concluído 🎉"}
🏛️ *Local:* ${proc?.arquivo || "IRN"}
📅 *Última atualização:* ${proc?.last_update ? new Date(proc.last_update).toLocaleDateString("pt-BR") : "—"}

Para mais detalhes aceda ao portal:
🔗 bono-lacerda-portal.vercel.app
🔑 Chave: ${c.chave_acesso || "—"}

*Bono & Lacerda Advogados*
📞 +351 21 793 1934`
  },
  {
    id: "pendencia",
    label: "⚠️ Pendência Identificada",
    msg: (c) =>
`Olá ${c.name.split(" ")[0]}! 👋

Identificámos uma pendência no seu processo que requer a sua atenção:

⚠️ *Pendência:* ${c.pendencias || "Documentação em falta"}
${c.observacao ? `📝 *Detalhe:* ${c.observacao}` : ""}

Por favor envie os documentos necessários o mais breve possível para evitar atrasos no seu processo.

Pode enviá-los directamente pelo portal:
🔗 bono-lacerda-portal.vercel.app
🔑 Chave: ${c.chave_acesso || "—"}

*Bono & Lacerda Advogados*
📞 +351 21 793 1934`
  },
  {
    id: "reuniao",
    label: "📅 Confirmar Reunião",
    msg: (c) =>
`Olá ${c.name.split(" ")[0]}! 👋

A sua reunião com o escritório Bono & Lacerda foi confirmada. 🎉

Consulte os detalhes no portal:
🔗 bono-lacerda-portal.vercel.app
🔑 Chave: ${c.chave_acesso || "—"}

*Bono & Lacerda Advogados*
📞 +351 21 793 1934`
  },
  {
    id: "custom",
    label: "✏️ Mensagem Personalizada",
    msg: () => ""
  },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideIn { from { transform:translateX(80px); opacity:0; } to { transform:translateX(0); opacity:1; } }
@keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
@keyframes breathe { 0%,100% { box-shadow:0 0 0 0 rgba(212,168,67,.3); } 50% { box-shadow:0 0 0 10px rgba(212,168,67,0); } }
@keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
@keyframes glow { 0%,100% { opacity:.6; } 50% { opacity:1; } }

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --n:#0a1628; --nl:#12243d; --nd:#060e1a; --g:#d4a843; --gl:#e8c76a; --gd:rgba(212,168,67,.12);
  --tx:#e8e6e3; --txd:#fff; --mu:rgba(255,255,255,.55); --mus:rgba(255,255,255,.35);
  --glass:rgba(255,255,255,.07); --glass2:rgba(255,255,255,.04); --glass-border:rgba(255,255,255,.1);
  --glass-hover:rgba(255,255,255,.12); --ok:#4ade80; --er:#f87171; --inf:#60a5fa;
  --sh:0 4px 24px rgba(0,0,0,.2); --sh2:0 12px 40px rgba(0,0,0,.3); --sh3:0 20px 60px rgba(0,0,0,.35);
  --blur:blur(20px); --blur2:blur(12px);
  --r:16px; --r2:20px; --r3:28px;
}
html { scroll-behavior:smooth; overflow-x:hidden; }
body {
  font-family:'DM Sans',sans-serif; color:var(--tx); min-height:100vh; -webkit-font-smoothing:antialiased;
  background: linear-gradient(135deg, #060e1a 0%, #0f1e35 25%, #162544 50%, #0d1b2e 75%, #0a1628 100%);
  background-attachment:fixed; overflow-x:hidden;
}
body::before {
  content:''; position:fixed; top:0; left:0; right:0; bottom:0; z-index:-1;
  background: radial-gradient(ellipse at 20% 20%, rgba(212,168,67,.08) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(212,168,67,.05) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(18,36,61,.5) 0%, transparent 70%);
}

/* ── LOGIN ── */
.login-wrap { display:flex; flex-direction:column; min-height:100vh; width:100%; max-width:100vw; }
.lw { flex:1; display:flex; overflow-x:hidden; width:100%; }
.ll { width:44%; background:linear-gradient(160deg, var(--nd) 0%, #0c1a2f 50%, #14294a 100%); display:flex; flex-direction:column; justify-content:center; align-items:center; padding:3rem; position:relative; overflow:hidden; }
.ll::before { content:''; position:absolute; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle, rgba(212,168,67,.06) 0%, transparent 70%); top:-200px; left:-200px; animation:float 8s ease-in-out infinite; }
.ll::after  { content:''; position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle, rgba(212,168,67,.04) 0%, transparent 70%); bottom:-120px; right:-120px; animation:float 10s ease-in-out infinite reverse; }
.logo { display:flex; flex-direction:column; align-items:center; gap:1.4rem; z-index:1; }
.logo-ic { width:80px; height:80px; background:rgba(212,168,67,.08); backdrop-filter:var(--blur); border:1.5px solid rgba(212,168,67,.2); border-radius:24px; display:flex; align-items:center; justify-content:center; color:var(--g); }
.logo h1 { font-family:'Playfair Display',serif; color:#fff; font-size:2.2rem; text-align:center; line-height:1.25; }
.logo p  { color:rgba(255,255,255,.4); font-size:.78rem; letter-spacing:.18em; text-transform:uppercase; text-align:center; }
.ltag { margin-top:3rem; color:rgba(255,255,255,.25); font-size:.75rem; text-align:center; line-height:2.2; z-index:1; letter-spacing:.03em; }
.lr { flex:1; display:flex; align-items:center; justify-content:center; padding:3rem; background:linear-gradient(135deg, #0c1a2f, #0f1e35); }
.lc { width:100%; max-width:420px; animation:fadeUp .5s ease; }
.lc h2 { font-family:'Playfair Display',serif; font-size:2.2rem; color:#fff; margin-bottom:.4rem; }
.lc > p { color:var(--mu); margin-bottom:2.5rem; font-size:.9rem; line-height:1.6; }
.chave-input { width:100%; padding:1.15rem; border:2px solid var(--glass-border); border-radius:var(--r); font-family:'DM Sans',sans-serif; font-size:1.5rem; font-weight:700; letter-spacing:.25em; text-align:center; background:var(--glass); backdrop-filter:var(--blur2); color:#fff; outline:none; transition:all .3s; }
.chave-input:focus { border-color:var(--g); box-shadow:0 0 0 4px rgba(212,168,67,.15), 0 0 30px rgba(212,168,67,.1); }
.chave-input::placeholder { color:rgba(255,255,255,.25); }
.chave-hint { font-size:.78rem; color:var(--mus); text-align:center; margin-top:.7rem; margin-bottom:1.75rem; }
.btnp { width:100%; padding:1.05rem; background:linear-gradient(135deg, var(--g), var(--gl)); color:var(--n); border:none; border-radius:var(--r); font-family:'DM Sans',sans-serif; font-size:.95rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:.5rem; transition:all .3s; letter-spacing:.01em; }
.btnp:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(212,168,67,.35); }
.btnp:active { transform:translateY(0); }
.btnp:disabled { opacity:.5; cursor:not-allowed; transform:none; }
.errmsg { color:var(--er); font-size:.82rem; margin-top:.9rem; text-align:center; padding:.7rem; background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.15); border-radius:10px; }

/* ── LAYOUT ── */
.al  { display:flex; min-height:100vh; overflow-x:hidden; width:100%; }
.sb  { width:270px; background:rgba(6,14,26,.85); backdrop-filter:var(--blur); border-right:1px solid var(--glass-border); display:flex; flex-direction:column; position:fixed; top:0; left:0; height:100vh; z-index:100; }
.sbl { padding:1.8rem 1.5rem 1.4rem; border-bottom:1px solid var(--glass-border); }
.sbl h2 { font-family:'Playfair Display',serif; color:#fff; font-size:1.15rem; line-height:1.3; }
.sbl span { color:var(--g); font-size:.7rem; display:block; letter-spacing:.12em; margin-top:3px; }
.sbu { padding:1.2rem 1.5rem; display:flex; align-items:center; gap:.75rem; border-bottom:1px solid var(--glass-border); }
.av  { border-radius:50%; background:linear-gradient(135deg, var(--g), var(--gl)); display:flex; align-items:center; justify-content:center; font-weight:700; color:var(--n); flex-shrink:0; font-size:.85rem; }
.sbn { font-size:.88rem; font-weight:600; color:#fff; }
.sbs { font-size:.7rem; color:var(--mus); letter-spacing:.04em; }
.sbnav { flex:1; padding:.75rem 0; overflow-y:auto; }
.ni { display:flex; align-items:center; gap:.8rem; padding:.8rem 1.5rem; color:var(--mu); font-size:.88rem; font-weight:500; cursor:pointer; transition:all .25s; border-left:3px solid transparent; }
.ni:hover { color:rgba(255,255,255,.9); background:var(--glass); }
.ni.on { color:var(--g); border-left-color:var(--g); background:rgba(212,168,67,.08); font-weight:600; }
.sbf { padding:1rem 1.5rem 1.5rem; border-top:1px solid var(--glass-border); }
.out { display:flex; align-items:center; gap:.6rem; color:var(--mus); font-size:.82rem; cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; transition:color .2s; }
.out:hover { color:rgba(255,255,255,.7); }
.mc { margin-left:270px; flex:1; padding:2.5rem 3rem; min-height:100vh; animation:fadeUp .4s ease; }

/* ── MOBILE ── */
.mob-nav { display:none; position:fixed; bottom:0; left:0; right:0; background:rgba(6,14,26,.92); backdrop-filter:var(--blur); border-top:1px solid var(--glass-border); z-index:200; padding:.4rem 0 calc(.4rem + env(safe-area-inset-bottom)); }
.mob-nav-inner { display:flex; justify-content:space-around; align-items:center; }
.mob-ni { display:flex; flex-direction:column; align-items:center; gap:.2rem; padding:.4rem .7rem; color:var(--mus); font-size:.58rem; font-weight:500; cursor:pointer; border:none; background:none; font-family:'DM Sans',sans-serif; transition:all .2s; min-width:50px; }
.mob-ni.on { color:var(--g); }
.mob-hdr { display:none; position:fixed; top:0; left:0; right:0; background:rgba(6,14,26,.9); backdrop-filter:var(--blur); z-index:150; padding:.85rem 1.25rem; align-items:center; justify-content:space-between; border-bottom:1px solid var(--glass-border); }
.mob-hdr h2 { font-family:'Playfair Display',serif; color:#fff; font-size:1rem; }
.mob-hdr span { color:var(--g); font-size:.66rem; display:block; letter-spacing:.04em; }
.mob-out { background:none; border:none; color:var(--mus); cursor:pointer; padding:.3rem; }

@media (max-width: 768px) {
  .sb { display:none; }
  .mob-hdr { display:flex; }
  .mob-nav { display:block; }
  .mc { margin-left:0; padding:1.1rem; padding-top:4.8rem; padding-bottom:5.5rem; overflow-x:hidden; }
  .lw { flex-direction:column; }
  .ll { width:100%; min-height:auto; padding:2.5rem 1.5rem 1.5rem; }
  .ll::before, .ll::after { display:none; }
  .ltag { margin-top:.75rem; }
  .lr { padding:1.5rem 1.25rem; }
  .dg { grid-template-columns:1fr !important; gap:.75rem !important; }
  .card { padding:1.15rem; border-radius:var(--r); }
  .ph h1 { font-size:1.5rem; }
  .ph p  { margin-bottom:1rem; }
  .chave-input { font-size:1.15rem; letter-spacing:.15em; }
  .tl { padding-left:1.75rem; }
  .dash-cols { grid-template-columns:1fr !important; }
  ::-webkit-scrollbar { display:none; }
  .ctbl { display:grid; grid-template-columns:1fr; gap:.75rem; }
  .ctbl-row { display:flex; flex-direction:column; gap:.5rem; padding:1rem; background:var(--glass); border-radius:var(--r); border:1px solid var(--glass-border); }
  .ctbl-row span { display:flex; justify-content:space-between; font-size:.85rem; }
  .ctbl-row span::before { content:attr(data-label); font-weight:600; color:var(--mu); }
  .tbl { display:none; }
}

/* ── COMPONENTS — GLASS CARDS ── */
.ph h1 { font-family:'Playfair Display',serif; font-size:1.9rem; color:#fff; letter-spacing:-.01em; }
.ph p  { color:var(--mu); font-size:.88rem; margin-top:.35rem; margin-bottom:2rem; line-height:1.5; }
.card { background:var(--glass); backdrop-filter:var(--blur); border-radius:var(--r2); padding:1.6rem; box-shadow:var(--sh); border:1px solid var(--glass-border); transition:all .3s; }
.card:hover { background:var(--glass-hover); box-shadow:var(--sh2); border-color:rgba(255,255,255,.15); }
.ct { font-family:'Playfair Display',serif; font-size:1.1rem; color:#fff; margin-bottom:1rem; }

/* ── STATS ── */
.dg { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1.25rem; margin-bottom:1.75rem; }
.sc { background:var(--glass); backdrop-filter:var(--blur2); border-radius:var(--r); padding:1.3rem 1.5rem; border:1px solid var(--glass-border); box-shadow:var(--sh); transition:all .3s; }
.sc:hover { background:var(--glass-hover); box-shadow:var(--sh2); transform:translateY(-3px); border-color:rgba(212,168,67,.2); }
.sl { font-size:.7rem; text-transform:uppercase; letter-spacing:.1em; color:var(--mu); margin-bottom:.5rem; font-weight:600; }
.sv { font-family:'Playfair Display',serif; font-size:1.5rem; color:#fff; }
.ss { font-size:.78rem; color:var(--mu); margin-top:.25rem; }
.pb  { background:rgba(255,255,255,.08); border-radius:99px; height:8px; margin-top:.5rem; overflow:hidden; }
.pbf { height:8px; border-radius:99px; background:linear-gradient(90deg, var(--g), var(--gl), var(--g)); background-size:200% 100%; animation:shimmer 2.5s ease infinite; transition:width 1s cubic-bezier(.4,0,.2,1); }

/* ── BADGES ── */
.bd { display:inline-flex; align-items:center; padding:.3rem .75rem; border-radius:99px; font-size:.72rem; font-weight:600; letter-spacing:.01em; backdrop-filter:var(--blur2); }
.bg { background:rgba(74,222,128,.12); color:#4ade80; border:1px solid rgba(74,222,128,.2); }
.ba { background:rgba(212,168,67,.12); color:var(--gl); border:1px solid rgba(212,168,67,.2); }
.bb { background:rgba(96,165,250,.12); color:#60a5fa; border:1px solid rgba(96,165,250,.2); }
.br { background:rgba(248,113,113,.12); color:#f87171; border:1px solid rgba(248,113,113,.2); }

/* ── TIMELINE ── */
.tl { position:relative; padding-left:2rem; }
.tl::before { content:''; position:absolute; left:10px; top:0; bottom:0; width:2px; background:linear-gradient(180deg, var(--g), rgba(255,255,255,.08)); }
.ti { position:relative; padding-bottom:1.75rem; }
.ti:last-child { padding-bottom:0; }
.td { position:absolute; left:-2rem; top:2px; width:22px; height:22px; border-radius:50%; border:2px solid var(--glass-border); background:var(--glass); backdrop-filter:var(--blur2); display:flex; align-items:center; justify-content:center; transition:all .3s; }
.td.dn { background:var(--g); border-color:var(--g); color:var(--n); }
.td.ac { background:rgba(212,168,67,.2); border-color:var(--g); color:var(--g); box-shadow:0 0 0 4px rgba(212,168,67,.15); animation:breathe 3s infinite; }
.tit { font-weight:600; font-size:.9rem; color:#fff; }
.tit.mu { color:var(--mu); font-weight:400; }
.tdt { font-size:.78rem; color:var(--mu); margin-top:.15rem; }
.tde { font-size:.82rem; color:var(--mu); margin-top:.3rem; background:var(--glass2); padding:.5rem .75rem; border-radius:8px; }

/* ── DOCUMENTS ── */
.dl  { display:flex; flex-direction:column; gap:.65rem; }
.dit { display:flex; align-items:center; gap:1rem; padding:1rem 1.25rem; background:var(--glass2); border-radius:14px; border:1px solid var(--glass-border); transition:all .3s; }
.dit:hover { background:var(--glass-hover); border-color:rgba(212,168,67,.25); transform:translateX(6px); }
.dic { width:42px; height:42px; background:linear-gradient(135deg, rgba(212,168,67,.15), rgba(212,168,67,.05)); border:1px solid rgba(212,168,67,.2); border-radius:12px; display:flex; align-items:center; justify-content:center; color:var(--g); flex-shrink:0; }
.dn2 { font-weight:600; font-size:.88rem; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.dm  { font-size:.73rem; color:var(--mu); margin-top:.15rem; }
.ib  { width:36px; height:36px; border-radius:10px; border:1.5px solid var(--glass-border); background:var(--glass); backdrop-filter:var(--blur2); display:flex; align-items:center; justify-content:center; color:var(--mu); cursor:pointer; transition:all .25s; }
.ib:hover { border-color:var(--g); color:var(--g); background:rgba(212,168,67,.1); transform:scale(1.08); }
.uz  { border:2px dashed rgba(255,255,255,.15); border-radius:var(--r2); padding:3.5rem; text-align:center; cursor:pointer; transition:all .3s; color:var(--mu); position:relative; overflow:hidden; }
.uz:hover { border-color:var(--g); background:rgba(212,168,67,.06); color:var(--g); }
.uz:hover .uz-icon { transform:translateY(-6px); }
.uz-icon { transition:transform .3s; }

/* ── FORMS ── */
.fg { margin-bottom:1.2rem; }
.fg label { display:block; font-size:.76rem; font-weight:600; color:var(--mu); text-transform:uppercase; letter-spacing:.08em; margin-bottom:.5rem; }
.fg input, .fg select, .fg textarea { width:100%; padding:.85rem 1rem; border:1.5px solid var(--glass-border); border-radius:12px; font-family:'DM Sans',sans-serif; font-size:.9rem; color:#fff; background:var(--glass); backdrop-filter:var(--blur2); outline:none; transition:all .3s; }
.fg input:focus, .fg select:focus, .fg textarea:focus { border-color:var(--g); box-shadow:0 0 0 3px rgba(212,168,67,.12), 0 0 20px rgba(212,168,67,.06); }
.fg input::placeholder, .fg textarea::placeholder { color:var(--mus); }
.fg select option { background:var(--n); color:#fff; }
.fg textarea { resize:vertical; min-height:80px; }
.fg2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.fg-hint { font-size:.72rem; color:var(--mus); margin-top:4px; }

/* ── CHAT ── */
.cw  { display:flex; flex-direction:column; height:calc(100vh - 230px); min-height:380px; }
.che { display:flex; align-items:center; gap:.75rem; padding-bottom:1rem; border-bottom:1px solid var(--glass-border); margin-bottom:1rem; }
.chi h3 { font-weight:600; font-size:.92rem; color:#fff; }
.chi p  { font-size:.73rem; color:var(--ok); }
.cms { flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:.75rem; padding:.5rem 0; }
.mr  { display:flex; gap:.5rem; align-items:flex-end; animation:fadeUp .25s ease; }
.mr.mi { flex-direction:row-reverse; }
.mb  { max-width:72%; padding:.85rem 1.15rem; border-radius:var(--r2); font-size:.88rem; line-height:1.55; position:relative; }
.mb.th { background:var(--glass); backdrop-filter:var(--blur2); color:var(--tx); border-bottom-left-radius:4px; border:1px solid var(--glass-border); }
.mb.mi { background:linear-gradient(135deg, rgba(212,168,67,.2), rgba(212,168,67,.1)); border:1px solid rgba(212,168,67,.2); color:#fff; border-bottom-right-radius:4px; }
.mtime { font-size:.68rem; color:var(--mus); margin-top:.2rem; }
.cir { display:flex; gap:.6rem; padding-top:1rem; border-top:1px solid var(--glass-border); }
.cin { flex:1; padding:.8rem 1rem; border:1.5px solid var(--glass-border); border-radius:var(--r); font-family:'DM Sans',sans-serif; font-size:.9rem; outline:none; resize:none; color:#fff; background:var(--glass); backdrop-filter:var(--blur2); transition:all .25s; }
.cin::placeholder { color:var(--mus); }
.cin:focus { border-color:var(--g); box-shadow:0 0 0 3px rgba(212,168,67,.12); }
.bsend { width:46px; height:46px; background:linear-gradient(135deg, var(--g), var(--gl)); border:none; border-radius:var(--r); display:flex; align-items:center; justify-content:center; color:var(--n); cursor:pointer; flex-shrink:0; transition:all .25s; font-weight:700; }
.bsend:hover { transform:scale(1.08); box-shadow:0 4px 20px rgba(212,168,67,.35); }

/* ── IRN TRACKER ── */
.irn-track { display:flex; align-items:flex-start; margin-bottom:1.5rem; overflow-x:hidden; padding-bottom:.5rem; }
.irn-step  { display:flex; flex-direction:column; align-items:center; flex:1; min-width:55px; position:relative; }
.irn-line  { position:absolute; top:18px; right:50%; width:100%; height:3px; background:rgba(255,255,255,.06); z-index:0; border-radius:2px; }
.irn-line.lit { background:linear-gradient(90deg, var(--g), var(--gl)); box-shadow:0 0 8px rgba(212,168,67,.3); }
.irn-circle-wrap { display:flex; flex-direction:column; align-items:center; z-index:1; position:relative; }
.irn-circle { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.85rem; font-weight:700; transition:all .4s cubic-bezier(.4,0,.2,1); background:var(--glass); backdrop-filter:var(--blur2); color:var(--mus); border:2px solid var(--glass-border); }
.irn-circle.done { background:linear-gradient(135deg, var(--g), var(--gl)); color:var(--n); border:none; box-shadow:0 2px 12px rgba(212,168,67,.35); }
.irn-circle.active { background:rgba(212,168,67,.12); color:var(--g); border:2px solid var(--g); box-shadow:0 0 0 6px rgba(212,168,67,.12); animation:breathe 3s infinite; }
.irn-label { font-size:.66rem; margin-top:7px; text-align:center; color:var(--mu); line-height:1.3; }
.irn-label.done   { color:var(--g); font-weight:600; }
.irn-label.active { color:#fff; font-weight:700; }
.irn-dot { display:block; font-size:.58rem; color:var(--g); font-weight:700; margin-top:2px; }

@media (max-width:600px) {
  .irn-track { flex-direction:column; overflow-x:visible; padding-bottom:0; gap:0; }
  .irn-step  { flex-direction:row; flex:unset; width:100%; min-width:unset; align-items:flex-start; padding:.5rem 0; }
  .irn-line  { position:absolute; top:0; right:unset; left:17px; width:3px; height:100%; }
  .irn-circle-wrap { flex-direction:row; gap:.75rem; align-items:center; }
  .irn-label { text-align:left; margin-top:0; font-size:.82rem; }
  .irn-dot   { display:inline; margin-left:.4rem; }
}

/* ── MEETINGS ── */
.mcard { border:1px solid var(--glass-border); border-radius:var(--r); padding:1.1rem 1.25rem; display:flex; align-items:center; gap:1rem; margin-bottom:.65rem; background:var(--glass2); transition:all .25s; }
.mcard:hover { background:var(--glass-hover); box-shadow:var(--sh); border-color:rgba(212,168,67,.2); }
.mdb  { background:linear-gradient(135deg, rgba(212,168,67,.15), rgba(212,168,67,.05)); border:1px solid rgba(212,168,67,.2); color:var(--g); border-radius:14px; width:58px; text-align:center; padding:.65rem 0; flex-shrink:0; }
.mdb .day { font-family:'Playfair Display',serif; font-size:1.7rem; line-height:1; color:#fff; }
.mdb .mon { font-size:.6rem; text-transform:uppercase; letter-spacing:.08em; opacity:.7; margin-top:3px; }

/* ── TABLES ── */
.tbl { width:100%; border-collapse:collapse; }
.tbl th { text-align:left; font-size:.72rem; text-transform:uppercase; letter-spacing:.07em; color:var(--mu); font-weight:600; padding:.75rem 1rem; border-bottom:1px solid var(--glass-border); }
.tbl td { padding:1rem; border-bottom:1px solid var(--glass-border); font-size:.88rem; vertical-align:middle; color:var(--tx); }
.tbl tr:last-child td { border-bottom:none; }
.tbl tr:hover td { background:rgba(255,255,255,.04); }

/* ── TABS ── */
.tabs { display:flex; gap:.25rem; background:transparent; padding:.3rem 0; border-bottom:2px solid var(--glass-border); width:fit-content; margin-bottom:1.25rem; }
.tab { padding:.7rem 1.2rem; border:none; border-bottom:2px solid transparent; font-family:'DM Sans'; font-size:.88rem; font-weight:600; cursor:pointer; transition:all .15s; background:transparent; color:var(--mu); }
.tab:hover { color:rgba(255,255,255,.8); }
.tab.on { color:var(--g); border-bottom-color:var(--g); }

/* ── MISC ── */
.ld { display:flex; align-items:center; justify-content:center; min-height:200px; flex-direction:column; gap:1rem; color:var(--mu); font-size:.88rem; }
.toast { position:fixed; bottom:2rem; right:2rem; background:rgba(10,22,40,.85); backdrop-filter:var(--blur); color:#fff; padding:1rem 1.5rem; border-radius:var(--r); font-size:.88rem; z-index:9999; box-shadow:var(--sh3); border-left:3px solid var(--g); animation:slideIn .35s ease; }
::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:99px; } ::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,.2); }
.empty-state { text-align:center; padding:3rem 2rem; color:var(--mu); }
.empty-state .emoji { font-size:2.5rem; margin-bottom:1rem; display:block; }
.empty-state .title { font-family:'Playfair Display',serif; font-size:1.15rem; color:#fff; margin-bottom:.5rem; }
.empty-state .desc { font-size:.85rem; line-height:1.6; max-width:320px; margin:0 auto; }
.wa-modal { position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:var(--blur); z-index:300; display:flex; align-items:center; justify-content:center; }
.wa-modal .card { width:100%; max-width:500px; max-height:85vh; overflow-y:auto; }
`;

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div className="toast">{msg}</div>;
}

function Loader({ text = "Carregando…" }) {
  return <div className="ld"><Icon name="spin" size={28} /><span>{text}</span></div>;
}

function IRNTimeline({ proc }) {
  const getStep = () => {
    if (!proc) return 0;
    const status = (proc.status || '').toLowerCase();
    if (status === 'concluido') return 7;
    if (status === 'aguardando') return 1;
    if (status === 'em_andamento') return 2;
    return 1;
  };

  const currentStep = proc?.current_step || getStep();

  return (
    <div>
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
                  {active && <span className="irn-dot">● atual</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusMap = {
    "em_andamento": { class: "ba", label: "Em Andamento" },
    "concluido": { class: "bg", label: "Concluído" },
    "aguardando": { class: "bb", label: "Aguardando" },
    "pendente": { class: "br", label: "Pendente" },
  };
  const cfg = statusMap[status] || { class: "bb", label: status };
  return <span className={`bd ${cfg.class}`}>{cfg.label}</span>;
}

function ContactCard({ client, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    email: client.email || "",
    phone: client.phone || "",
    whatsapp: client.whatsapp || "",
    address: client.address || "",
    city: client.city || "",
    state: client.state || "",
    zip: client.zip || "",
    country: client.country || "",
  });

  const save = async () => {
    await onUpdate(client.id, form);
    setEditMode(false);
  };

  if (editMode) {
    return (
      <div className="card" style={{marginBottom:"1.5rem"}}>
        <div className="ct">📞 Contacto (Edição)</div>
        <div className="fg2">
          <div className="fg"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div className="fg"><label>Telefone</label><input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
          <div className="fg"><label>WhatsApp</label><input type="tel" value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})}/></div>
          <div className="fg"><label>Morada</label><input type="text" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></div>
          <div className="fg"><label>Cidade</label><input type="text" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></div>
          <div className="fg"><label>Estado/Prov</label><input type="text" value={form.state} onChange={e=>setForm({...form,state:e.target.value})}/></div>
          <div className="fg"><label>Código Postal</label><input type="text" value={form.zip} onChange={e=>setForm({...form,zip:e.target.value})}/></div>
          <div className="fg"><label>País</label><input type="text" value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/></div>
        </div>
        <div style={{display:"flex", gap:".75rem"}}>
          <button onClick={save} style={{flex:1, padding:".85rem", background:"linear-gradient(135deg, var(--g), var(--gl))", color:"var(--n)", border:"none", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>✓ Guardar</button>
          <button onClick={()=>setEditMode(false)} style={{flex:1, padding:".85rem", background:"var(--glass)", border:"1px solid var(--glass-border)", color:"var(--tx)", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{marginBottom:"1.5rem"}}>
      <div className="ct">📞 Contacto</div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem"}}>
        {form.email && <div><div style={{fontSize:".75rem", color:"var(--mu)", textTransform:"uppercase", marginBottom:".3rem"}}>Email</div><div style={{fontSize:".88rem", color:"#fff"}}>{form.email}</div></div>}
        {form.phone && <div><div style={{fontSize:".75rem", color:"var(--mu)", textTransform:"uppercase", marginBottom:".3rem"}}>Telefone</div><div style={{fontSize:".88rem", color:"#fff"}}>{form.phone}</div></div>}
        {form.whatsapp && <div><div style={{fontSize:".75rem", color:"var(--mu)", textTransform:"uppercase", marginBottom:".3rem"}}>WhatsApp</div><div style={{fontSize:".88rem", color:"#fff"}}>{form.whatsapp}</div></div>}
        {form.address && <div><div style={{fontSize:".75rem", color:"var(--mu)", textTransform:"uppercase", marginBottom:".3rem"}}>Morada</div><div style={{fontSize:".88rem", color:"#fff"}}>{form.address}</div></div>}
      </div>
      <button onClick={()=>setEditMode(true)} style={{width:"100%", padding:".85rem", background:"var(--glass)", border:"1px solid var(--glass-border)", color:"var(--tx)", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>✎ Editar</button>
    </div>
  );
}

function WhatsAppNotify({ client, proc, onClose, toast }) {
  const [sel,   setSel]   = useState(null);
  const [msg,   setMsg]   = useState("");
  const [phone, setPhone] = useState(client.whatsapp || client.phone || "");

  const selectTemplate = (t) => { setSel(t.id); setMsg(t.msg(client, proc)); };

  const sendWhatsApp = () => {
    const num = phone.replace(/\D/g, "");
    if (!num) { toast?.("⚠️ Número de telefone em falta!"); return; }
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
    onClose();
    toast?.("✅ WhatsApp aberto!");
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"var(--blur)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"var(--nl)",borderRadius:20,width:"100%",maxWidth:520,maxHeight:"90vh",overflow:"auto",boxShadow:"var(--sh3)",border:"1px solid var(--glass-border)"}}>
        <div style={{background:"#25D366",padding:"1.25rem 1.5rem",borderRadius:"20px 20px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:"#fff",fontWeight:700,fontSize:"1rem"}}>💬 Notificação WhatsApp</div>
            <div style={{color:"rgba(255,255,255,.8)",fontSize:".78rem",marginTop:2}}>{client.name}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#fff",cursor:"pointer",fontSize:"1.4rem",lineHeight:1}}>×</button>
        </div>
        <div style={{padding:"1.25rem 1.5rem"}}>
          <div style={{marginBottom:"1rem"}}>
            <label style={{display:"block",fontSize:".75rem",fontWeight:600,color:"var(--mu)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Número WhatsApp</label>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+55 11 99999-9999 ou +351 9XX XXX XXX"
              style={{width:"100%",padding:".7rem 1rem",border:"1.5px solid var(--glass-border)",borderRadius:10,fontSize:".9rem",outline:"none",fontFamily:"inherit",background:"var(--glass)",color:"#fff"}}/>
          </div>
          <div style={{marginBottom:"1rem"}}>
            <label style={{display:"block",fontSize:".75rem",fontWeight:600,color:"var(--mu)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Tipo de Mensagem</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".5rem"}}>
              {WA_TEMPLATES.map(t=>(
                <button key={t.id} onClick={()=>selectTemplate(t)} style={{
                  padding:".6rem .8rem",borderRadius:10,border:`2px solid ${sel===t.id?"#25D366":"var(--glass-border)"}`,
                  background:sel===t.id?"rgba(37,211,102,.1)":"var(--glass)",cursor:"pointer",
                  fontSize:".78rem",fontWeight:sel===t.id?700:400,
                  color:sel===t.id?"#25D366":"var(--tx)",textAlign:"left",fontFamily:"inherit",transition:"all .15s"
                }}>{t.label}</button>
              ))}
            </div>
          </div>
          {sel && (
            <div style={{marginBottom:"1rem"}}>
              <label style={{display:"block",fontSize:".75rem",fontWeight:600,color:"var(--mu)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>
                Mensagem {sel==="custom"?"(personalize abaixo)":"(editável)"}
              </label>
              <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={10}
                style={{width:"100%",padding:".85rem 1rem",border:"1.5px solid var(--glass-border)",borderRadius:10,fontSize:".82rem",lineHeight:1.6,fontFamily:"inherit",outline:"none",resize:"vertical",background:"var(--glass)",color:"#fff"}}/>
              <div style={{fontSize:".72rem",color:"var(--mus)",marginTop:4}}>{msg.length} caracteres</div>
            </div>
          )}
          <div style={{display:"flex",gap:".75rem"}}>
            <button onClick={onClose} style={{flex:1,padding:".75rem",borderRadius:10,border:"1px solid var(--glass-border)",background:"var(--glass)",cursor:"pointer",fontFamily:"inherit",fontSize:".88rem",fontWeight:500,color:"var(--tx)"}}>Cancelar</button>
            <button onClick={sendWhatsApp} disabled={!sel||!msg.trim()||!phone.trim()}
              style={{flex:2,padding:".75rem",borderRadius:10,border:"none",background:(!sel||!msg.trim()||!phone.trim())?"rgba(255,255,255,.1)":"#25D366",color:"#fff",cursor:(!sel||!msg.trim()||!phone.trim())?"not-allowed":"pointer",fontFamily:"inherit",fontSize:".88rem",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:".5rem"}}>
              Abrir no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── LOGIN ────────────────────────────────────────────────────────────── */
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");

  const go = () => {
    if (email === "bonoelacerda@gmail.com" && pass === "admin123") onLogin();
    else setErr("Credenciais inválidas.");
  };

  return (
    <div className="login-wrap">
      <style>{css}</style>
      <div className="lw">
        <div className="ll">
          <div className="logo">
            <div className="logo-ic">⚖️</div>
            <h1>Bono & Lacerda</h1>
            <p>Advocacia Internacional</p>
          </div>
          <p className="ltag">Painel Administrativo<br/>Acesso exclusivo para advogados</p>
        </div>
        <div className="lr">
          <div className="lc">
            <h2>Acesso ao Painel</h2>
            <p>Insira as suas credenciais para aceder ao painel administrativo.</p>
            <div className="fg">
              <label>E-mail</label>
              <input type="email" placeholder="bonoelacerda@gmail.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/>
            </div>
            <div className="fg">
              <label>Senha</label>
              <input type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/>
            </div>
            <button className="btnp" onClick={go}>
              <Icon name="arrow" size={16}/> Entrar no Painel
            </button>
            {err && <div className="errmsg">{err}</div>}
            <p style={{marginTop:"1.5rem",color:"var(--mus)",fontSize:".78rem",textAlign:"center"}}>Demo: bonoelacerda@gmail.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── DASHBOARD ────────────────────────────────────────────────────────── */
function Dash({ clients, onSelectClient }) {
  const [search, setSearch] = useState("");

  const total = clients.length;
  const comChave = clients.filter(c => c.chave_acesso).length;
  const emAndamento = clients.filter(c => c.proc?.status === "em_andamento").length;
  const pendentes = clients.filter(c => c.pendencias).length;

  const filtered = search.trim()
    ? clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.chave_acesso||"").includes(search))
    : [];

  return (
    <div>
      <div className="ph">
        <h1>Painel Geral</h1>
        <p>Bono & Lacerda Advogados — {new Date().toLocaleDateString("pt-BR")}</p>
      </div>

      <div className="dg dash-cols">
        <div className="sc">
          <div className="sl">👥 Total Clientes</div>
          <div className="sv">{total}</div>
          <div className="ss">{comChave} com acesso</div>
        </div>
        <div className="sc">
          <div className="sl">⚡ Em Andamento</div>
          <div className="sv">{emAndamento}</div>
          <div className="ss">processos ativos</div>
        </div>
        <div className="sc">
          <div className="sl">⚠️ Com Pendências</div>
          <div className="sv">{pendentes}</div>
          <div className="ss">requerem atenção</div>
        </div>
      </div>

      <div className="card">
        <div className="ct">🔍 Busca Rápida</div>
        <div style={{position:"relative"}}>
          <Icon name="search" size={16} style={{position:"absolute", left:"1rem", top:"50%", transform:"translateY(-50%)", color:"var(--mu)", pointerEvents:"none"}}/>
          <input
            style={{width:"100%", paddingLeft:"2.75rem", padding:".85rem 1rem", border:"1.5px solid var(--glass-border)", borderRadius:"var(--r)", fontFamily:"DM Sans,sans-serif", fontSize:".9rem", color:"#fff", background:"var(--glass)", backdropFilter:"var(--blur2)", outline:"none", transition:"border-color .3s"}}
            placeholder="Nome ou chave de acesso..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {search && (
          <div style={{marginTop:"1rem"}}>
            {filtered.length > 0 ? (
              <div className="ctbl">
                {filtered.map(c => (
                  <div key={c.id} className="ctbl-row" onClick={() => onSelectClient(c)} style={{cursor:"pointer"}}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      <div style={{fontWeight:600, color:"#fff"}}>{c.name}</div>
                      <span className="bd bg">{c.chave_acesso ? "Ativo" : "Sem acesso"}</span>
                    </div>
                    <span data-label="Chave: ">{c.chave_acesso || "—"}</span>
                    {c.proc && <span data-label="Status: ">{c.proc.status}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="emoji">🔍</span>
                <div className="title">Nenhum cliente encontrado</div>
                <div className="desc">Tente outro nome ou chave de acesso</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── CLIENTS ──────────────────────────────────────────────────────────── */
function Clients({ clients, onSelect, onAdd, onDelete }) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : clients;

  return (
    <div>
      <div className="ph">
        <h1>Clientes</h1>
        <p>{clients.length} clientes registados</p>
      </div>

      <div className="card" style={{marginBottom:"1.5rem"}}>
        <div style={{display:"flex", gap:"1rem"}}>
          <div style={{flex:1, position:"relative"}}>
            <Icon name="search" size={16} style={{position:"absolute", left:"1rem", top:"50%", transform:"translateY(-50%)", color:"var(--mu)", pointerEvents:"none"}}/>
            <input
              style={{width:"100%", paddingLeft:"2.75rem", padding:".85rem 1rem", border:"1.5px solid var(--glass-border)", borderRadius:"var(--r)", fontFamily:"DM Sans,sans-serif", fontSize:".9rem", color:"#fff", background:"var(--glass)", backdropFilter:"var(--blur2)", outline:"none"}}
              placeholder="Procurar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="ib" onClick={onAdd} title="Adicionar cliente" style={{background:"linear-gradient(135deg, var(--g), var(--gl))", border:"none", color:"var(--n)", cursor:"pointer"}}>
            <Icon name="plus" size={18}/>
          </button>
        </div>
      </div>

      <div className="ctbl">
        {filtered.map(c => (
          <div key={c.id} className="ctbl-row" onClick={() => onSelect(c)} style={{cursor:"pointer"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".5rem"}}>
              <div style={{fontWeight:600, color:"#fff"}}>{c.name}</div>
              <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="ib" style={{color:"var(--er)", borderColor:"rgba(248,113,113,.2)"}}>
                <Icon name="trash" size={16}/>
              </button>
            </div>
            {c.chave_acesso && <span style={{fontSize:".78rem", color:"var(--mu)"}}>🔑 {c.chave_acesso}</span>}
            {c.proc && <div style={{fontSize:".78rem", marginTop:".3rem"}}><span className="bd ba">Status: {c.proc.status}</span></div>}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <span className="emoji">👥</span>
          <div className="title">{search ? "Nenhum cliente encontrado" : "Sem clientes"}</div>
          <div className="desc">{search ? "Tente outro nome" : "Adicione o primeiro cliente"}</div>
        </div>
      )}
    </div>
  );
}

/* ── CLIENT DETAIL ───────────────────────────────────────────────────── */
function Detail({ client, onBack, onUpdate, onDelete }) {
  const [tab, setTab] = useState("processo");
  const [editName, setEditName] = useState(client.name);
  const [editEmail, setEditEmail] = useState(client.email || "");
  const [editPhone, setEditPhone] = useState(client.phone || "");
  const [editChave, setEditChave] = useState(client.chave_acesso || "");
  const [showWA, setShowWA] = useState(false);
  const [steps, setSteps] = useState(client.process_steps || []);
  const [messages, setMessages] = useState(client.messages || []);
  const [msgText, setMsgText] = useState("");
  const [newMeetingOpen, setNewMeetingOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ titulo: "", data: "", hora: "", tipo: "reuniao", notas: "" });

  const save = async () => {
    await onUpdate(client.id, { name:editName, email:editEmail, phone:editPhone, chave_acesso:editChave });
  };

  const toggleStep = async (stepId, done) => {
    const newSteps = steps.map(s => s.id === stepId ? {...s, done: !done} : s);
    setSteps(newSteps);
    await api.patch("process_steps", stepId, { done: !done });
  };

  const sendMessage = async () => {
    if (!msgText.trim()) return;
    const msg = { client_id: client.id, text: msgText, sender: "admin", created_at: new Date().toISOString() };
    const newMsg = await api.post("messages", msg);
    setMessages([...messages, newMsg[0]]);
    setMsgText("");
  };

  const saveMeeting = async () => {
    if (!meetingForm.titulo || !meetingForm.data || !meetingForm.hora) return;
    const meeting = {
      client_id: client.id,
      titulo: meetingForm.titulo,
      data: meetingForm.data,
      hora: meetingForm.hora,
      tipo: meetingForm.tipo,
      notas: meetingForm.notas,
      created_at: new Date().toISOString()
    };
    const newMeeting = await api.post("meetings", meeting);
    setNewMeetingOpen(false);
    setMeetingForm({ titulo: "", data: "", hora: "", tipo: "reuniao", notas: "" });
  };

  return (
    <div>
      <button className="ib" onClick={onBack} style={{marginBottom:"1rem", color:"var(--mu)"}}>
        <Icon name="arrow" size={18} style={{transform:"scaleX(-1)"}}/>
      </button>

      <div className="card" style={{marginBottom:"1.5rem"}}>
        <div className="ct">{editName}</div>
        <div className="fg2">
          <div className="fg">
            <label>Nome</label>
            <input type="text" value={editName} onChange={e=>setEditName(e.target.value)}/>
          </div>
          <div className="fg">
            <label>Email</label>
            <input type="email" value={editEmail} onChange={e=>setEditEmail(e.target.value)}/>
          </div>
          <div className="fg">
            <label>Telefone</label>
            <input type="tel" value={editPhone} onChange={e=>setEditPhone(e.target.value)}/>
          </div>
          <div className="fg">
            <label>Chave de Acesso</label>
            <input type="text" value={editChave} onChange={e=>setEditChave(e.target.value)}/>
          </div>
        </div>
        <div style={{display:"flex", gap:".75rem"}}>
          <button onClick={save} style={{flex:1, padding:".85rem", background:"linear-gradient(135deg, var(--g), var(--gl))", color:"var(--n)", border:"none", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>✓ Guardar</button>
          <button onClick={() => onDelete(client.id)} style={{padding:".85rem 1.5rem", background:"rgba(248,113,113,.12)", color:"var(--er)", border:"1px solid rgba(248,113,113,.2)", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>Eliminar</button>
        </div>
      </div>

      <ContactCard client={client} onUpdate={onUpdate}/>

      <div className="tabs">
        <button className={`tab${tab==="processo"?" on":""}`} onClick={()=>setTab("processo")}>Processo</button>
        <button className={`tab${tab==="documentos"?" on":""}`} onClick={()=>setTab("documentos")}>Documentos</button>
        <button className={`tab${tab==="reunioes"?" on":""}`} onClick={()=>setTab("reunioes")}>Reuniões</button>
        <button className={`tab${tab==="chat"?" on":""}`} onClick={()=>setTab("chat")}>Chat</button>
      </div>

      {tab === "processo" && client.proc && (
        <div className="card">
          <div className="ct">📋 Informações do Processo</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.5rem"}}>
            {[
              ["Processo", client.proc?.number || client.chave_acesso || "—"],
              ["Artigo", client.artigo || client.proc?.type || "—"],
              ["Protocolo", client.proc?.opened_at ? fmtd(client.proc.opened_at) : "—"],
              ["Submissão IRN", client.proc?.submissao_irn || "—"],
              ["Local / Arquivo", client.proc?.arquivo || client.fonte || "—"],
              ["Desde", fmtd(client.since)],
            ].map(([k,v])=>(
              <div key={k}>
                <div style={{fontSize:".7rem", color:"var(--mu)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:4}}>{k}</div>
                <div style={{fontSize:".88rem", color:"#fff", fontWeight:600}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:"1rem",alignItems:"center",marginBottom:"1rem"}}>
            <StatusBadge status={client.proc?.status}/>
            <div style={{marginLeft:"auto",minWidth:160}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:".72rem",color:"var(--mu)"}}>Progresso</span><span style={{fontSize:".72rem",fontWeight:700,color:"var(--g)"}}>{client.proc?.current_step ? Math.round(((client.proc.current_step-1)/7)*100) : 0}%</span></div>
              <div className="pb"><div className="pbf" style={{width:`${client.proc?.current_step ? Math.round(((client.proc.current_step-1)/7)*100) : 0}%`}}/></div>
            </div>
          </div>

          <div style={{marginBottom:"1.5rem"}}>
            <div className="ct">Progresso IRN</div>
            <IRNTimeline proc={client.proc}/>
          </div>

          {steps.length > 0 && (
            <div style={{marginBottom:"1.5rem"}}>
              <div className="ct">✓ Passos</div>
              <div className="tl">
                {steps.map(s => (
                  <div key={s.id} className="ti">
                    <div className={`td${s.done?" dn":" ac"}`} onClick={() => toggleStep(s.id, s.done)} style={{cursor:"pointer"}}>
                      {s.done ? "✓" : "○"}
                    </div>
                    <div className={`tit${s.done?" mu":""}`} style={{textDecoration: s.done ? "line-through" : "none"}}>{s.titulo}</div>
                    {s.descricao && <div className="tde">{s.descricao}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setShowWA(true)} style={{width:"100%", padding:".85rem", background:"rgba(37,211,102,.12)", color:"#25d366", border:"1px solid rgba(37,211,102,.2)", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>📱 Notificar WhatsApp</button>

          {client.pendencias && (
            <div style={{background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.15)", borderRadius:"var(--r)", padding:"1rem", marginTop:"1rem"}}>
              <div style={{color:"var(--er)", fontWeight:600, marginBottom:".5rem"}}>⚠️ Pendências</div>
              <div style={{fontSize:".85rem", color:"var(--tx)", lineHeight:"1.6"}}>{client.pendencias}</div>
            </div>
          )}
        </div>
      )}

      {tab === "documentos" && (
        <div className="card">
          <div className="ct">📄 Documentos</div>
          <div className="uz">
            <div className="uz-icon" style={{fontSize:"2rem", marginBottom:".5rem"}}>📎</div>
            <div style={{fontWeight:600, color:"#fff", marginBottom:".25rem"}}>Arraste ficheiros aqui</div>
            <div style={{fontSize:".78rem", color:"var(--mus)"}}>ou clique para selecionar</div>
          </div>
          {client.documents && client.documents.length > 0 && (
            <div className="dl" style={{marginTop:"1.5rem"}}>
              {client.documents.map(d => (
                <div key={d.id} className="dit">
                  <div className="dic"><Icon name="file" size={18}/></div>
                  <div style={{flex:1}}>
                    <div className="dn2">{d.nome}</div>
                    <div className="dm">Enviado por: {d.uploaded_by || "—"}</div>
                  </div>
                  <button className="ib">
                    <Icon name="arrow" size={16} style={{transform:"rotate(-90deg)"}}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "reunioes" && (
        <div className="card">
          <div className="ct">📅 Reuniões</div>
          {client.meetings?.length > 0 ? (
            <div style={{marginBottom:"1.5rem"}}>
              {client.meetings.map(m => (
                <div key={m.id} className="mcard">
                  <div className="mdb">
                    <div className="day">{new Date(m.data).getDate()}</div>
                    <div className="mon">{MONTHS[new Date(m.data).getMonth()]}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600, color:"#fff"}}>{m.titulo}</div>
                    <div style={{fontSize:".78rem", color:"var(--mu)", marginTop:".2rem"}}>{m.hora} • {m.tipo}</div>
                  </div>
                  <button className="ib" style={{color:"var(--er)"}}>
                    <Icon name="trash" size={16}/>
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <button onClick={() => setNewMeetingOpen(!newMeetingOpen)} style={{width:"100%", padding:".85rem", background:"var(--glass)", border:"1px solid var(--glass-border)", color:"var(--tx)", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>+ Nova Reunião</button>

          {newMeetingOpen && (
            <div style={{marginTop:"1.5rem", background:"var(--glass2)", border:"1px solid var(--glass-border)", borderRadius:"var(--r)", padding:"1.5rem"}}>
              <div className="fg">
                <label>Título</label>
                <input type="text" value={meetingForm.titulo} onChange={e=>setMeetingForm({...meetingForm,titulo:e.target.value})} placeholder="Título da reunião"/>
              </div>
              <div className="fg2">
                <div className="fg">
                  <label>Data</label>
                  <input type="date" value={meetingForm.data} onChange={e=>setMeetingForm({...meetingForm,data:e.target.value})}/>
                </div>
                <div className="fg">
                  <label>Hora</label>
                  <input type="time" value={meetingForm.hora} onChange={e=>setMeetingForm({...meetingForm,hora:e.target.value})}/>
                </div>
              </div>
              <div className="fg">
                <label>Tipo</label>
                <select value={meetingForm.tipo} onChange={e=>setMeetingForm({...meetingForm,tipo:e.target.value})} style={{width:"100%", padding:".85rem 1rem", border:"1.5px solid var(--glass-border)", borderRadius:"12px", fontFamily:"DM Sans,sans-serif", fontSize:".9rem", color:"#fff", background:"var(--glass)", backdropFilter:"var(--blur2)", outline:"none"}}>
                  <option value="reuniao">Reunião</option>
                  <option value="consulta">Consulta</option>
                  <option value="seguimento">Seguimento</option>
                </select>
              </div>
              <div className="fg">
                <label>Notas</label>
                <textarea value={meetingForm.notas} onChange={e=>setMeetingForm({...meetingForm,notas:e.target.value})} placeholder="Notas..." style={{width:"100%", padding:".85rem 1rem", border:"1.5px solid var(--glass-border)", borderRadius:"12px", fontFamily:"DM Sans,sans-serif", fontSize:".9rem", color:"#fff", background:"var(--glass)", backdropFilter:"var(--blur2)", outline:"none", resize:"vertical", minHeight:"80px"}}/>
              </div>
              <div style={{display:"flex", gap:".75rem"}}>
                <button onClick={saveMeeting} style={{flex:1, padding:".85rem", background:"linear-gradient(135deg, var(--g), var(--gl))", color:"var(--n)", border:"none", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>✓ Agendar</button>
                <button onClick={() => setNewMeetingOpen(false)} style={{flex:1, padding:".85rem", background:"var(--glass)", border:"1px solid var(--glass-border)", color:"var(--tx)", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "chat" && (
        <div className="card">
          <div className="che">
            <div className="chi">
              <h3>Chat com Cliente</h3>
              <p>{client.name}</p>
            </div>
          </div>
          <div className="cw">
            <div className="cms">
              {messages.map(m => (
                <div key={m.id} className={`mr${m.sender==="admin"?" mi":""}`}>
                  <div className={`mb ${m.sender==="admin"?"mi":"th"}`}>
                    {m.text}
                    <div className="mtime">{fmtt(m.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cir">
              <input type="text" className="cin" placeholder="Mensagem..." value={msgText} onChange={e=>setMsgText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()}/>
              <button className="bsend" onClick={sendMessage}><Icon name="send" size={18}/></button>
            </div>
          </div>
        </div>
      )}

      {showWA && <WhatsAppNotify client={client} proc={client.proc} onClose={() => setShowWA(false)} toast={()=>{}}/>}
    </div>
  );
}

/* ── ADD CLIENT MODAL ─────────────────────────────────────────────────── */
function AddClient({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const go = async () => {
    if (!name.trim()) return;
    const r = await api.post("clients", { name, email, phone, created_at: new Date().toISOString() });
    onAdd(r[0]);
    onClose();
  };

  return (
    <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,.6)", backdropFilter:"var(--blur)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div className="card" style={{width:"100%", maxWidth:"420px"}}>
        <div className="ct">Adicionar Cliente</div>
        <div className="fg">
          <label>Nome Completo</label>
          <input type="text" placeholder="Nome..." value={name} onChange={e=>setName(e.target.value)}/>
        </div>
        <div className="fg">
          <label>Email</label>
          <input type="email" placeholder="email@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
        </div>
        <div className="fg">
          <label>Telefone</label>
          <input type="tel" placeholder="+351..." value={phone} onChange={e=>setPhone(e.target.value)}/>
        </div>
        <div style={{display:"flex", gap:".75rem"}}>
          <button onClick={go} style={{flex:1, padding:".85rem", background:"linear-gradient(135deg, var(--g), var(--gl))", color:"var(--n)", border:"none", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>✓ Adicionar</button>
          <button onClick={onClose} style={{flex:1, padding:".85rem", background:"var(--glass)", border:"1px solid var(--glass-border)", color:"var(--tx)", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN APP ─────────────────────────────────────────────────────────── */
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [view, setView] = useState("dash");
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      (async () => {
        try {
          const allClients = await api.get("clients", "?order=created_at.desc&limit=10000");
          if(!allClients||allClients.error){setLoading(false);return;}
          // Set clients immediately for count
          setClients((allClients||[]).map(c=>({...c,proc:null,process_steps:[],documents:[],messages:[],meetings:[]})));
          // Enrich first 200 with process data
          const enriched = await Promise.all((allClients||[]).map(async(c,i)=>{
            if(i>=200) return{...c,proc:null,process_steps:[],documents:[],messages:[],meetings:[]};
            try {
              const procs = await api.get("processes", `?client_id=eq.${c.id}&limit=1`);
              const proc = procs[0]||null;
              if(proc){
                const [steps,docs,msgs,meets] = await Promise.all([
                  api.get("process_steps", `?process_id=eq.${proc.id}&order=step_order.asc`),
                  api.get("documents", `?process_id=eq.${proc.id}&order=created_at.desc`),
                  api.get("messages", `?process_id=eq.${proc.id}&order=created_at.asc`),
                  api.get("meetings", `?process_id=eq.${proc.id}&order=date.asc`),
                ]);
                return { ...c, proc, process_steps: steps, documents: docs, messages: msgs, meetings: meets };
              }
              return { ...c, proc:null, process_steps:[], documents:[], messages:[], meetings:[] };
            } catch (e) { return {...c,proc:null,process_steps:[],documents:[],messages:[],meetings:[]}; }
          }));
          setClients(enriched);
        } catch (e) {
          console.error("Error loading clients:", e);
        }
        setLoading(false);
      })();
    }
  }, [loggedIn]);

  const toast = (msg) => {
    const id = Date.now();
    setToasts(t => [...t, {id, msg}]);
  };

  const updateClient = async (id, data) => {
    try {
      const updated = await api.patch("clients", id, data);
      setClients(c => c.map(x => x.id === id ? {...x, ...data} : x));
      toast("Cliente atualizado com sucesso");
    } catch (e) {
      console.error("Error updating client:", e);
    }
  };

  const deleteClient = async (id) => {
    if (!confirm("Tem a certeza?")) return;
    try {
      await api.del("clients", id);
      setClients(c => c.filter(x => x.id !== id));
      setSelected(null);
      setView("clientes");
      toast("Cliente eliminado");
    } catch (e) {
      console.error("Error deleting client:", e);
    }
  };

  const addClient = async (newClient) => {
    setClients(c => [...c, newClient]);
    toast("Cliente adicionado com sucesso");
  };

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)}/>;

  if (loading) return <><style>{css}</style><div style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center"}}><Loader/></div></>;

  return (
    <>
      <style>{css}</style>
      <div className="al">
        {/* DESKTOP SIDEBAR */}
        <div className="sb">
          <div className="sbl">
            <h2>Bono & Lacerda</h2>
            <span>Painel Administrativo</span>
          </div>
          <div className="sbu">
            <div className="av" style={{width:40, height:40}}>RL</div>
            <div>
              <div className="sbn">Dr. Ramom Lacerda</div>
              <div className="sbs">OAB/PB 19.165 · 🇵🇹 65899L · 🇪🇸 142952</div>
            </div>
          </div>
          <nav className="sbnav">
            <div className={`ni${view==="dash"?" on":""}`} onClick={()=>{setView("dash"); setSelected(null);}}>
              <Icon name="dash" size={18}/> Painel
            </div>
            <div className={`ni${view==="clientes"?" on":""}`} onClick={()=>{setView("clientes"); setSelected(null);}}>
              <Icon name="users" size={18}/> Clientes ({clients.length})
            </div>
            <div className={`ni${view==="reunioes"?" on":""}`} onClick={()=>{setView("reunioes"); setSelected(null);}}>
              <Icon name="cal" size={18}/> Reuniões
            </div>
          </nav>
          <div className="sbf">
            <button className="out" onClick={() => setLoggedIn(false)}>
              <Icon name="logout" size={16}/> Sair
            </button>
          </div>
        </div>

        {/* MOBILE HEADER */}
        <div className="mob-hdr">
          <div>
            <h2>Bono & Lacerda</h2>
            <span>Painel</span>
          </div>
          <button className="mob-out" onClick={() => setLoggedIn(false)}>
            <Icon name="logout" size={18}/>
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="mc">
          {view === "dash" && !selected && <Dash clients={clients} onSelectClient={c=>{setSelected(c); setView("clientes");}}/>}
          {view === "clientes" && !selected && <Clients clients={clients} onSelect={setSelected} onAdd={()=>setShowAdd(true)} onDelete={deleteClient}/>}
          {view === "clientes" && selected && <Detail client={selected} onBack={()=>setSelected(null)} onUpdate={updateClient} onDelete={deleteClient}/>}
          {view === "reunioes" && (()=>{
            const all=clients.flatMap(c=>(c.meetings||[]).map(m=>({...m,clientName:c.name,clientId:c.id}))).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
            const pendentes=all.filter(m=>m.status==="pendente");
            return(
              <div>
                <div className="ph">
                  <h1>Todas as Reuniões</h1>
                  <p>{all.length} reuniões · {pendentes.length} pendentes</p>
                </div>
                {pendentes.length>0&&<div style={{background:"rgba(251,191,36,.08)",border:"1px solid rgba(251,191,36,.2)",borderRadius:12,padding:"1rem 1.25rem",marginBottom:"1.25rem"}}><div style={{fontWeight:600,fontSize:".9rem",color:"#fbbf24"}}>📬 {pendentes.length} pedido(s) aguardando — abra o cliente para confirmar</div></div>}
                <div className="card">
                  {!all.length&&<div className="empty-state"><span className="emoji">📅</span><div className="title">Nenhuma reunião ainda</div></div>}
                  {all.map(m=>{const d=new Date((m.date||"")+"T12:00:00");return(
                    <div className="mcard" key={m.id} style={{borderColor:m.status==="pendente"?"rgba(251,191,36,.3)":"var(--glass-border)",background:m.status==="pendente"?"rgba(251,191,36,.05)":"var(--glass2)"}}>
                      <div className="mdb"><div className="day">{d.getDate()}</div><div className="mon">{MONTHS[d.getMonth()]}</div></div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:".9rem",color:"#fff"}}>{m.title}</div>
                        <div style={{fontSize:".78rem",color:"var(--mu)",marginTop:3}}>👤 <strong>{m.clientName}</strong> · ⏰ {m.time} · {m.type==="videochamada"?"📹":m.type==="whatsapp"?"💬":m.type==="presencial"?"📍":"📞"} {m.type}</div>
                        {m.notes&&<div style={{fontSize:".78rem",color:"var(--mu)",marginTop:4}}>📝 {m.notes}</div>}
                      </div>
                      <StatusBadge status={m.status==="confirmado"?"em_andamento":m.status==="pendente"?"pendente":"aguardando"}/>
                    </div>
                  );})}
                </div>
              </div>
            );
          })()}
        </div>

        {/* MOBILE BOTTOM NAV */}
        <div className="mob-nav">
          <div className="mob-nav-inner">
            <button className={`mob-ni${view==="dash"?" on":""}`} onClick={()=>{setView("dash"); setSelected(null);}} title="Painel">
              <Icon name="dash" size={18}/> <span>Painel</span>
            </button>
            <button className={`mob-ni${view==="clientes"?" on":""}`} onClick={()=>{setView("clientes"); setSelected(null);}} title="Clientes">
              <Icon name="users" size={18}/> <span>Clientes</span>
            </button>
            <button className={`mob-ni${view==="reunioes"?" on":""}`} onClick={()=>{setView("reunioes"); setSelected(null);}} title="Reuniões">
              <Icon name="cal" size={18}/> <span>Reuniões</span>
            </button>
          </div>
        </div>
      </div>

      {showAdd && <AddClient onClose={()=>setShowAdd(false)} onAdd={addClient}/>}

      {toasts.map(t => (
        <Toast key={t.id} msg={t.msg} onClose={() => setToasts(toasts.filter(x => x.id !== t.id))}/>
      ))}
    </>
  );
}
