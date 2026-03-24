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

const IRN_STEPS = [
  { num: 1, label: "Análise" },
  { num: 2, label: "Documentação" },
  { num: 3, label: "Submissão" },
  { num: 4, label: "Processamento" },
  { num: 5, label: "Decisão" },
  { num: 6, label: "Emissão" },
  { num: 7, label: "Entrega" }
];

function Icon({ name, size = 24, color = "currentColor" }) {
  const icons = {
    dash: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    users: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    cal: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    plus: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>,
    check: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    trash: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
    send: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2"><path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346273 C3.34915502,0.9 2.40734225,0.9 1.77946707,1.4429026 C0.994623095,2.0772692 0.837654326,3.34915502 1.15159189,4.13399899 L3.03521743,10.5749919 C3.03521743,10.7320893 3.19218622,10.8891867 3.50612381,10.8891867 L16.6915026,11.6889879 C16.6915026,11.6889879 17.1624089,11.6889879 17.1624089,11.0546213 L17.1624089,12.4744748 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"/></svg>,
    close: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>,
    logout: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 8l4-4m0 0l-4 4m4-4v12"/></svg>,
    search: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    arrow: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
    file: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
    upload: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    bell: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    spin: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" style={{animation:"spin 1s linear infinite"}}><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>,
  };
  return icons[name] || null;
}

const WA_TEMPLATES = [
  {
    id: "acesso",
    label: "🔑 Enviar Acesso ao Portal",
    msg: (c) => `Olá ${c.name.split(" ")[0]}! 👋\n\nO escritório *Bono & Lacerda Advogados* criou o seu portal exclusivo.\n\n🔗 *Acesse agora:* bono-lacerda-portal.vercel.app\n🔑 *Chave de acesso:* ${c.chave_acesso || "—"}\n\n*Portal do Cliente*\nSeu espaço seguro para gerenciar documentos e atualizações do seu processo.\n\n*Bono & Lacerda Advogados*\n📞 +351 21 793 1934`
  },
  {
    id: "atualizacao",
    label: "📋 Actualização do Processo",
    msg: (c, proc) => `Olá ${c.name.split(" ")[0]}! 👋\n\nTemos uma actualização sobre o seu processo de Nacionalidade Portuguesa.\n\n📌 *Estado actual:* ${proc?.status === "em_andamento" ? "Em andamento ✅" : proc?.status === "aguardando" ? "Aguardando documentos ⚠️" : "Concluído 🎉"}\n🏛️ *Local:* ${proc?.arquivo || "IRN"}\n📅 *Última atualização:* ${proc?.last_update ? new Date(proc.last_update).toLocaleDateString("pt-BR") : "—"}\n\nPara mais detalhes aceda ao portal:\n🔗 bono-lacerda-portal.vercel.app\n🔑 Chave: ${c.chave_acesso || "—"}\n\n*Bono & Lacerda Advogados*\n📞 +351 21 793 1934`
  },
  {
    id: "pendencia",
    label: "⚠️ Pendência Identificada",
    msg: (c) => `Olá ${c.name.split(" ")[0]}! 👋\n\nIdentificámos uma pendência no seu processo que requer a sua atenção:\n\n⚠️ *Pendência:* ${c.pendencias || "Documentação em falta"}\n${c.observacao ? `📝 *Detalhe:* ${c.observacao}` : ""}\n\nPor favor envie os documentos necessários o mais breve possível para evitar atrasos no seu processo.\n\nPode enviá-los directamente pelo portal:\n🔗 bono-lacerda-portal.vercel.app\n🔑 Chave: ${c.chave_acesso || "—"}\n\n*Bono & Lacerda Advogados*\n📞 +351 21 793 1934`
  },
  {
    id: "reuniao",
    label: "📅 Confirmar Reunião",
    msg: (c) => `Olá ${c.name.split(" ")[0]}! 👋\n\nA sua reunião com o escritório Bono & Lacerda foi confirmada. 🎉\n\nConsulte os detalhes no portal:\n🔗 bono-lacerda-portal.vercel.app\n🔑 Chave: ${c.chave_acesso || "—"}\n\n*Bono & Lacerda Advogados*\n📞 +351 21 793 1934`
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
      <div className="lw">
        <div className="ll">
          <div className="logo">
            <div className="logo-ic">⚖️</div>
            <h1>Bono & Lacerda</h1>
            <p>Advocacia Internacional</p>
          </div>
          <div className="ltag">Painel Administrativo<br/>Acesso restrito a colaboradores</div>
        </div>
        <div className="lr">
          <div className="lc">
            <h2>Painel de Controlo</h2>
            <p>Insira as suas credenciais de administrador</p>
            <div className="fg">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="bonoelacerda@gmail.com" style={{width:"100%", padding:".85rem 1rem", border:"1.5px solid var(--glass-border)", borderRadius:"var(--r)", fontFamily:"'DM Sans',sans-serif", fontSize:".9rem", color:"#fff", background:"var(--glass)", backdropFilter:"var(--blur2)", outline:"none", transition:"all .3s"}}/>
            </div>
            <div className="fg">
              <label>Palavra-passe</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" style={{width:"100%", padding:".85rem 1rem", border:"1.5px solid var(--glass-border)", borderRadius:"var(--r)", fontFamily:"'DM Sans',sans-serif", fontSize:".9rem", color:"#fff", background:"var(--glass)", backdropFilter:"var(--blur2)", outline:"none", transition:"all .3s"}}/>
            </div>
            <button onClick={go} className="btnp">Entrar no Painel</button>
            {err && <div className="errmsg">{err}</div>}
            <div className="chave-hint">Demo: bonoelacerda@gmail.com / admin123</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dash({ clients }) {
  const [search, setSearch] = useState("");
  const [showPend, setShowPend] = useState(false);

  const total = clients.length;
  const comChave = clients.filter(c => c.chave_acesso).length;
  const semChave = clients.filter(c => !c.chave_acesso).length;
  const pendentes = clients.filter(c => c.pendencias).length;
  const emAndamento = clients.filter(c => c.proc?.status === "em_andamento").length;
  const aguardando = clients.filter(c => c.proc?.status === "aguardando").length;
  const porto = clients.filter(c => c.proc?.arquivo?.includes("Porto")).length;
  const crc = clients.filter(c => c.proc?.arquivo?.includes("Conservatória")).length;
  const reunPend = clients.reduce((a,c) => a + (c.meetings||[]).filter(m => m.status==="pendente").length, 0);

  const filtered = search.trim()
    ? clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.chave_acesso||"").includes(search))
    : [];
  const comPendencias = clients.filter(c => c.pendencias).slice(0, 8);

  return (
    <div>
      <div className="ph">
        <h1>Painel Geral</h1>
        <p>📅 {new Date().toLocaleDateString("pt-BR")} • <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" style={{color:"var(--g)",textDecoration:"none"}}>Abrir Calendário Google</a></p>
      </div>

      <div className="dg">
        <div className="sc">
          <div className="sl">Total de Clientes</div>
          <div className="sv">{total}</div>
          <div style={{fontSize:".78rem", marginTop:".5rem", color:"var(--mu)"}}>Clientes registados</div>
        </div>
        <div className="sc">
          <div className="sl">Em Andamento</div>
          <div className="sv">{emAndamento}</div>
          <div className="pb"><div className="pbf" style={{width:`${emAndamento > 0 ? Math.min(100, (emAndamento/total)*100) : 0}%`}}></div></div>
        </div>
        <div className="sc">
          <div className="sl">Com Pendências</div>
          <div className="sv">{pendentes}</div>
          <div style={{fontSize:".78rem", marginTop:".5rem", color:"#f87171"}}>Atenção requerida</div>
        </div>
        <div className="sc">
          <div className="sl">Sem Chave de Acesso</div>
          <div className="sv">{semChave}</div>
          <div style={{fontSize:".78rem", marginTop:".5rem", color:"var(--mu)"}}>{comChave} com acesso</div>
        </div>
      </div>

      {reunPend > 0 && (
        <div className="card" style={{background:"rgba(96,165,250,.08)", border:"1px solid rgba(96,165,250,.2)", marginBottom:"1.5rem"}}>
          <div style={{display:"flex", alignItems:"center", gap:"1rem"}}>
            <div style={{fontSize:"1.5rem"}}>🔔</div>
            <div>
              <div style={{fontWeight:600, color:"#60a5fa"}}>Reuniões Pendentes</div>
              <div style={{fontSize:".85rem", color:"var(--mu)", marginTop:".2rem"}}>{reunPend} reunião{reunPend!==1?"ões":""} aguardam confirmação</div>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", marginBottom:"1.5rem"}}>
        <div className="card">
          <div className="ct">🔍 Busca Rápida</div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Procurar cliente ou chave..." style={{width:"100%", padding:".85rem 1rem", border:"1.5px solid var(--glass-border)", borderRadius:"var(--r)", fontSize:".9rem", color:"#fff", background:"var(--glass)", backdropFilter:"var(--blur2)", outline:"none", marginBottom:"1rem"}}/>
          {filtered.length > 0 && (
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:".5rem"}}>
              {filtered.slice(0,6).map(c => (
                <div key={c.id} style={{padding:".75rem", background:"rgba(212,168,67,.08)", border:"1px solid rgba(212,168,67,.2)", borderRadius:"10px"}}>
                  <div style={{fontSize:".82rem", fontWeight:600, color:"#fff"}}>{c.name}</div>
                  <div style={{fontSize:".7rem", color:"var(--mu)", marginTop:".2rem"}}>{c.chave_acesso || "Sem chave"}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="ct">📅 Próximos Eventos</div>
          <div style={{fontSize:".85rem", color:"var(--mu)", marginBottom:"1rem"}}>Esta semana</div>
          <div style={{display:"flex", flexDirection:"column", gap:".75rem"}}>
            <div style={{padding:".75rem", background:"var(--glass2)", borderRadius:"10px", borderLeft:"3px solid var(--g)"}}>
              <div style={{fontSize:".82rem", fontWeight:600, color:"#fff"}}>Reunião com Cliente A</div>
              <div style={{fontSize:".7rem", color:"var(--mu)", marginTop:".2rem"}}>📅 Segunda, 10:00</div>
            </div>
            <div style={{padding:".75rem", background:"var(--glass2)", borderRadius:"10px", borderLeft:"3px solid var(--g)"}}>
              <div style={{fontSize:".82rem", fontWeight:600, color:"#fff"}}>Submissão de Documentos</div>
              <div style={{fontSize:".7rem", color:"var(--mu)", marginTop:".2rem"}}>📅 Quarta, 14:30</div>
            </div>
            <div style={{padding:".75rem", background:"var(--glass2)", borderRadius:"10px", borderLeft:"3px solid var(--g)"}}>
              <div style={{fontSize:".82rem", fontWeight:600, color:"#fff"}}>Análise Processual</div>
              <div style={{fontSize:".7rem", color:"var(--mu)", marginTop:".2rem"}}>📅 Sexta, 16:00</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:"1.5rem"}}>
        <div className="card">
          <div className="ct">📊 Distribuição dos Processos</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem"}}>
            <div>
              <div style={{fontSize:".8rem", color:"var(--mu)", marginBottom:"1rem"}}>Por Local/Arquivo</div>
              <div style={{display:"flex", flexDirection:"column", gap:".75rem"}}>
                <div>
                  <div style={{display:"flex", justifyContent:"space-between", fontSize:".82rem", marginBottom:".3rem"}}><span>Porto</span><span style={{fontWeight:600, color:"var(--g)"}}>8</span></div>
                  <div className="pb"><div className="pbf" style={{width:"65%"}}></div></div>
                </div>
                <div>
                  <div style={{display:"flex", justifyContent:"space-between", fontSize:".82rem", marginBottom:".3rem"}}><span>Conservatória</span><span style={{fontWeight:600, color:"var(--g)"}}>5</span></div>
                  <div className="pb"><div className="pbf" style={{width:"40%"}}></div></div>
                </div>
                <div>
                  <div style={{display:"flex", justifyContent:"space-between", fontSize:".82rem", marginBottom:".3rem"}}><span>IRN</span><span style={{fontWeight:600, color:"var(--g)"}}>12</span></div>
                  <div className="pb"><div className="pbf" style={{width:"95%"}}></div></div>
                </div>
              </div>
            </div>
            <div>
              <div style={{fontSize:".8rem", color:"var(--mu)", marginBottom:"1rem"}}>Por Status</div>
              <div style={{display:"flex", flexDirection:"column", gap:".75rem"}}>
                <div><span className="bd ba">Em Andamento: {emAndamento}</span></div>
                <div><span className="bd bb">Aguardando: {aguardando}</span></div>
                <div><span className="bd br">Pendentes: {pendentes}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="ct">⚠️ Pendências Ativas</div>
          <div style={{display:"flex", flexDirection:"column", gap:".75rem", maxHeight:"300px", overflowY:"auto"}}>
            {comPendencias.length > 0 ? (
              comPendencias.map(c => (
                <div key={c.id} style={{padding:".75rem", background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.2)", borderRadius:"10px"}}>
                  <div style={{fontSize:".82rem", fontWeight:600, color:"#fff"}}>{c.name}</div>
                  <div style={{fontSize:".7rem", color:"var(--mu)", marginTop:".2rem"}}>{c.pendencias}</div>
                </div>
              ))
            ) : (
              <div style={{textAlign:"center", color:"var(--mu)", padding:"1rem"}}>Nenhuma pendência</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Clients({ clients, setClients, onSelectClient, showToast }) {
  const [search, setSearch] = useState("");
  const [showNewC, setShowNewC] = useState(false);
  const [newC, setNewC] = useState({name:"", email:"", phone:"", cpf:"", tipo:"", senha:""});

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.chave_acesso||"").includes(search));

  const addClient = async () => {
    if (!newC.name || !newC.email) { showToast("Nome e email obrigatórios"); return; }
    const c = {...newC, chave_acesso: Math.random().toString(36).slice(2,8).toUpperCase()};
    const r = await api.post("clients", c);
    if (r[0]) {
      setClients(ps => [...ps, {...r[0], proc:null, steps:[], docs:[], msgs:[], meetings:[]}]);
      const proc = await api.post("processes", {client_id: r[0].id, status:"em_andamento"});
      if (proc[0]) {
        const stps = await Promise.all(IRN_STEPS.map((s, i) => api.post("process_steps", {process_id: proc[0].id, step_order:i+1, title:s.label, detail:"", done:false})));
      }
      setShowNewC(false);
      setNewC({name:"", email:"", phone:"", cpf:"", tipo:"", senha:""});
      showToast(`Cliente "${newC.name}" criado!`);
    }
  };

  const delClient = async (id) => {
    if (window.confirm("Tem certeza?")) {
      await api.del("clients", id);
      setClients(ps => ps.filter(c => c.id !== id));
      showToast("Cliente removido");
    }
  };

  return (
    <div>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem"}}>
        <div className="ph"><h1>Clientes</h1></div>
        <button onClick={() => setShowNewC(true)} style={{display:"flex", alignItems:"center", gap:".5rem", padding:".85rem 1.5rem", background:"linear-gradient(135deg, var(--g), var(--gl))", color:"var(--n)", border:"none", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>
          <Icon name="plus" size={18} /> Novo Cliente
        </button>
      </div>

      {showNewC && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"var(--blur)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{background:"var(--glass)",borderRadius:20,width:"100%",maxWidth:500,maxHeight:"90vh",overflow:"auto",boxShadow:"var(--sh3)",border:"1px solid var(--glass-border)",padding:"2rem"}}>
            <h2 style={{fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", color:"#fff", marginBottom:"1.5rem"}}>Novo Cliente</h2>
            <div className="fg"><label>Nome Completo</label><input type="text" value={newC.name} onChange={e=>setNewC({...newC,name:e.target.value})} placeholder="Nome do cliente"/></div>
            <div className="fg"><label>Email</label><input type="email" value={newC.email} onChange={e=>setNewC({...newC,email:e.target.value})} placeholder="email@example.com"/></div>
            <div className="fg"><label>Telefone</label><input type="tel" value={newC.phone} onChange={e=>setNewC({...newC,phone:e.target.value})} placeholder="+351 XXX XXX XXX"/></div>
            <div className="fg"><label>CPF/NIB</label><input type="text" value={newC.cpf} onChange={e=>setNewC({...newC,cpf:e.target.value})} placeholder="Identificação"/></div>
            <div className="fg"><label>Tipo de Processo</label><select value={newC.tipo} onChange={e=>setNewC({...newC,tipo:e.target.value})}><option value="">Selecione...</option><option value="nacionalidade">Nacionalidade</option><option value="residencia">Residência</option><option value="laboral">Laboral</option></select></div>
            <div style={{display:"flex", gap:".75rem"}}>
              <button onClick={addClient} style={{flex:1, padding:".85rem", background:"linear-gradient(135deg, var(--g), var(--gl))", color:"var(--n)", border:"none", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>Criar</button>
              <button onClick={() => setShowNewC(false)} style={{flex:1, padding:".85rem", background:"var(--glass)", border:"1px solid var(--glass-border)", color:"var(--tx)", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{marginBottom:"1.5rem"}}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Procurar cliente..." style={{width:"100%", padding:".85rem 1rem", border:"1.5px solid var(--glass-border)", borderRadius:"var(--r)", fontSize:".9rem", color:"#fff", background:"var(--glass)", backdropFilter:"var(--blur2)", outline:"none"}}/>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr><th>Cliente</th><th>Chave/Email</th><th>Tipo</th><th>Status</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td><div style={{display:"flex", alignItems:"center", gap:".75rem"}}><div className="av" style={{width:"32px", height:"32px", fontSize:".7rem"}}>{ini(c.name)}</div><div><div style={{fontWeight:600}}>{c.name}</div><div style={{fontSize:".75rem", color:"var(--mu)"}}>{c.email}</div></div></div></td>
                <td>{c.chave_acesso ? <div style={{fontFamily:"monospace", fontSize:".8rem", color:"var(--g)"}}>{c.chave_acesso}</div> : <span style={{color:"var(--mu)"}}>—</span>}</td>
                <td>{c.tipo || "—"}</td>
                <td><StatusBadge status={c.proc?.status || "pendente"} /></td>
                <td><div style={{display:"flex", gap:".5rem"}}>
                  <button onClick={() => onSelectClient(c.id)} style={{padding:".5rem .75rem", background:"var(--glass)", border:"1px solid var(--glass-border)", color:"var(--tx)", borderRadius:"10px", fontSize:".8rem", cursor:"pointer"}}>Abrir</button>
                  <button onClick={() => delClient(c.id)} style={{padding:".5rem .75rem", background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.2)", color:"#f87171", borderRadius:"10px", fontSize:".8rem", cursor:"pointer"}}>Remover</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Detail({cid, clients, setClients, showToast, onBack}) {
  const client = clients.find(c => c.id === cid);
  if (!client) return <Loader />;

  const [tab, setTab] = useState("processo");
  const [steps, setSteps] = useState([]);
  const [docs, setDocs] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [meets, setMeets] = useState([]);
  const [chatIn, setChatIn] = useState("");
  const [showMtg, setShowMtg] = useState(false);
  const [showWA, setShowWA] = useState(false);
  const [mf, setMf] = useState({title:"",date:"",time:"10:00",type:"presencial",notes:""});
  const [saving, setSaving] = useState(false);
  const [ldData, setLdData] = useState(true);
  const fileRef = useRef();

  const proc = client.proc;

  useEffect(() => {
    const load = async () => {
      setLdData(true);
      const procs = await api.get("processes", `?client_id=eq.${client.id}&limit=1`);
      const proc = procs[0] || null;
      if(proc){
        const [ss,dd,mm,mt] = await Promise.all([
          api.get("process_steps", `?process_id=eq.${proc.id}&order=step_order.asc`),
          api.get("documents", `?process_id=eq.${proc.id}&order=created_at.desc`),
          api.get("messages", `?process_id=eq.${proc.id}&order=created_at.asc`),
          api.get("meetings", `?process_id=eq.${proc.id}&order=date.asc`),
        ]);
        setSteps(ss); setDocs(dd); setMsgs(mm); setMeets(mt);
        setClients(cs => cs.map(c => c.id===client.id ? {...c,proc,steps:ss,docs:dd,msgs:mm,meetings:mt} : c));
      }
      setLdData(false);
    };
    load();
  }, [cid]);

  const toggleStep = async s => {
    const r = await api.patch("process_steps", s.id, {done:!s.done});
    if(r[0]) setSteps(ss => ss.map(x => x.id===s.id ? {...x,done:!s.done} : x));
    showToast("Etapa atualizada!");
  };

  const uploadDoc = async f => {
    if(!f||!proc) return;
    setSaving(true);
    const path = `${proc.id}/${Date.now()}_${f.name}`;
    const ok = await api.upload(path, f);
    if(!ok){showToast("Erro ao enviar ficheiro."); setSaving(false); return;}
    const r = await api.post("documents", {process_id:proc.id, name:f.name, size:`${(f.size/1024).toFixed(0)} KB`, date:new Date().toISOString().split("T")[0], status:"disponível", uploaded_by:"advogado", storage_path:path});
    if(r[0]){setDocs(d=>[r[0],...d]);showToast(`"${f.name}" adicionado!`);}
    setSaving(false);
  };

  const downloadDoc = async (d) => {
    const url = await api.signedUrl(d.storage_path);
    window.open(url, "_blank");
  };

  const sendMsg = async () => {
    if(!chatIn.trim()||!proc) return;
    const r = await api.post("messages", {process_id:proc.id, from_role:"lawyer", text:chatIn});
    if(r[0]) setMsgs(m => [...m, r[0]]);
    setChatIn(""); showToast("Mensagem enviada!");
  };

  const confirmMeet = async m => {
    await api.patch("meetings", m.id, {status:"confirmado"});
    setMeets(ms => ms.map(x => x.id===m.id ? {...x,status:"confirmado"} : x));
    setClients(cs => cs.map(c => c.id===client.id ? {...c,meetings:(c.meetings||[]).map(x => x.id===m.id ? {...x,status:"confirmado"} : x)} : c));
    await api.post("notifications", {client_id:client.id, text:`Reunião confirmada para ${m.date.split("-").reverse().join("/")} às ${m.time}.`, icon:"✅", read:false});
    showToast("✅ Reunião confirmada!");
  };

  const rejectMeet = async m => {
    await api.patch("meetings", m.id, {status:"recusado"});
    setMeets(ms => ms.map(x => x.id===m.id ? {...x,status:"recusado"} : x));
    showToast("❌ Reunião recusada");
  };

  const addMeet = async () => {
    if(!mf.title || !mf.date) { showToast("Preencha título e data"); return; }
    const r = await api.post("meetings", {process_id:proc.id, ...mf, status:"pendente"});
    if(r[0]) {
      setMeets(m => [...m, r[0]]);
      setMf({title:"",date:"",time:"10:00",type:"presencial",notes:""});
      setShowMtg(false);
      showToast("Reunião criada!");
    }
  };

  const updateContact = async (id, form) => {
    await api.patch("clients", id, form);
    setClients(cs => cs.map(c => c.id===id ? {...c,...form} : c));
    showToast("Contacto atualizado!");
  };

  if (ldData) return <Loader />;

  const pendMeets = meets.filter(m => m.status === "pendente");

  return (
    <div>
      <button onClick={onBack} style={{marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:".5rem", padding:".6rem 1rem", background:"var(--glass)", border:"1px solid var(--glass-border)", color:"var(--tx)", borderRadius:"var(--r)", fontWeight:500, cursor:"pointer"}}>
        <Icon name="arrow" size={16} style={{transform:"scaleX(-1)"}} /> Voltar
      </button>

      <div className="card" style={{marginBottom:"1.5rem"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem"}}>
          <div style={{display:"flex", alignItems:"center", gap:"1.5rem"}}>
            <div className="av" style={{width:"56px", height:"56px", fontSize:"1.2rem"}}>{ini(client.name)}</div>
            <div>
              <h2 style={{fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", color:"#fff", marginBottom:".2rem"}}>{client.name}</h2>
              <div style={{fontSize:".85rem", color:"var(--mu)"}}>
                {client.chave_acesso && <span style={{fontFamily:"monospace", color:"var(--g)", fontWeight:600}}>{client.chave_acesso}</span>}
              </div>
            </div>
          </div>
          <div style={{display:"flex", gap:".5rem"}}>
            <button onClick={() => setShowWA(true)} style={{padding:".7rem 1rem", background:"#25D366", color:"#fff", border:"none", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>💬 WhatsApp</button>
            {proc && <StatusBadge status={proc.status} />}
          </div>
        </div>

        {proc && (
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"1rem", marginBottom:"1.5rem", paddingBottom:"1.5rem", borderBottom:"1px solid var(--glass-border)"}}>
            <div><div style={{fontSize:".75rem", color:"var(--mu)", textTransform:"uppercase", marginBottom:".3rem"}}>Processo Nº</div><div style={{fontSize:".95rem", fontWeight:600, color:"#fff"}}>{proc.number || "—"}</div></div>
            <div><div style={{fontSize:".75rem", color:"var(--mu)", textTransform:"uppercase", marginBottom:".3rem"}}>Artigo</div><div style={{fontSize:".95rem", fontWeight:600, color:"#fff"}}>{proc.type || "Nacionalidade"}</div></div>
            <div><div style={{fontSize:".75rem", color:"var(--mu)", textTransform:"uppercase", marginBottom:".3rem"}}>Data Submissão</div><div style={{fontSize:".95rem", fontWeight:600, color:"#fff"}}>{fmtd(proc.submissao_irn)}</div></div>
            <div><div style={{fontSize:".75rem", color:"var(--mu)", textTransform:"uppercase", marginBottom:".3rem"}}>Local/Arquivo</div><div style={{fontSize:".95rem", fontWeight:600, color:"#fff"}}>{proc.arquivo || "IRN"}</div></div>
          </div>
        )}

        {proc && <IRNTimeline proc={proc} />}
      </div>

      <ContactCard client={client} onUpdate={updateContact} />

      {showWA && <WhatsAppNotify client={client} proc={proc} onClose={() => setShowWA(false)} toast={showToast} />}

      <div className="card">
        <div className="tabs">
          {["processo", "documentos", "reunioes", "chat"].map(t => (
            <button key={t} className={`tab ${tab===t?"on":""}`} onClick={() => setTab(t)}>
              {t==="processo"?"📋 Processo":t==="documentos"?"📄 Documentos":t==="reunioes"?"📅 Reuniões":"💬 Chat"}
            </button>
          ))}
        </div>

        {tab === "processo" && (
          <div>
            {steps.length > 0 ? (
              <div className="tl">
                {steps.map(s => (
                  <div key={s.id} className="ti">
                    <div style={{display:"flex", alignItems:"center", gap:"1rem"}}>
                      <input type="checkbox" checked={s.done} onChange={() => toggleStep(s)} style={{cursor:"pointer", width:"18px", height:"18px", accentColor:"var(--g)"}}/>
                      <div style={{flex:1}}>
                        <div className={`tit ${s.done?"mu":""}`}>{s.title}</div>
                        {s.detail && <div className="tde">{s.detail}</div>}
                        {s.date && <div className="tdt">{fmtd(s.date)}</div>}
                      </div>
                      <div className={`td ${s.done?"dn":""}`}>{s.done?"✓":steps.indexOf(s)+1}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><span className="emoji">📋</span><div className="title">Sem etapas</div></div>
            )}
          </div>
        )}

        {tab === "documentos" && (
          <div>
            <div className="uz" onClick={() => fileRef.current?.click()} style={{marginBottom:"1.5rem"}}>
              <div className="uz-icon" style={{fontSize:"2rem", marginBottom:".5rem"}}>📁</div>
              <div style={{fontWeight:600, color:"var(--g)", marginBottom:".3rem"}}>Arraste ficheiros ou clique</div>
              <div style={{fontSize:".8rem"}}>Máx 50MB por ficheiro</div>
              <input ref={fileRef} type="file" onChange={e => e.target.files?.[0] && uploadDoc(e.target.files[0])} style={{display:"none"}} multiple={false}/>
            </div>
            {saving && <Loader text="Enviando..." />}
            {docs.length > 0 ? (
              <div className="dl">
                {docs.map(d => (
                  <div key={d.id} className="dit">
                    <div className="dic"><Icon name="file" size={20} /></div>
                    <div style={{flex:1, minWidth:0}}>
                      <div className="dn2">{d.name}</div>
                      <div className="dm">{d.size} • {fmtd(d.date)}</div>
                    </div>
                    <button onClick={() => downloadDoc(d)} className="ib" title="Download"><Icon name="arrow" size={16} style={{transform:"rotate(180deg)"}} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><span className="emoji">📄</span><div className="title">Nenhum documento</div></div>
            )}
          </div>
        )}

        {tab === "reunioes" && (
          <div>
            {pendMeets.length > 0 && (
              <div style={{background:"rgba(96,165,250,.08)", border:"1px solid rgba(96,165,250,.2)", borderRadius:"var(--r)", padding:"1rem", marginBottom:"1.5rem"}}>
                <div style={{fontWeight:600, color:"#60a5fa", marginBottom:".5rem"}}>🔔 Reuniões Pendentes de Confirmação</div>
                {pendMeets.map(m => (
                  <div key={m.id} style={{fontSize:".85rem", color:"var(--mu)", marginBottom:".5rem"}}>
                    {m.title} • {m.date} às {m.time}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowMtg(true)} style={{marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:".5rem", padding:".7rem 1.2rem", background:"linear-gradient(135deg, var(--g), var(--gl))", color:"var(--n)", border:"none", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>
              <Icon name="plus" size={16} /> Nova Reunião
            </button>
            {showMtg && (
              <div style={{background:"var(--glass2)", border:"1px solid var(--glass-border)", borderRadius:"var(--r)", padding:"1.5rem", marginBottom:"1.5rem"}}>
                <h3 style={{fontWeight:600, color:"#fff", marginBottom:"1rem"}}>Nova Reunião</h3>
                <div className="fg2">
                  <div className="fg"><label>Título</label><input type="text" value={mf.title} onChange={e=>setMf({...mf,title:e.target.value})} placeholder="Ex: Revisão de Documentos"/></div>
                  <div className="fg"><label>Data</label><input type="date" value={mf.date} onChange={e=>setMf({...mf,date:e.target.value})}/></div>
                  <div className="fg"><label>Hora</label><input type="time" value={mf.time} onChange={e=>setMf({...mf,time:e.target.value})}/></div>
                  <div className="fg"><label>Tipo</label><select value={mf.type} onChange={e=>setMf({...mf,type:e.target.value})}><option value="presencial">Presencial</option><option value="online">Online</option><option value="telefone">Telefone</option></select></div>
                </div>
                <div className="fg"><label>Notas</label><textarea value={mf.notes} onChange={e=>setMf({...mf,notes:e.target.value})} placeholder="Adicionar observações..."/></div>
                <div style={{display:"flex", gap:".75rem"}}>
                  <button onClick={addMeet} style={{flex:1, padding:".85rem", background:"linear-gradient(135deg, var(--g), var(--gl))", color:"var(--n)", border:"none", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>Criar Reunião</button>
                  <button onClick={() => setShowMtg(false)} style={{flex:1, padding:".85rem", background:"var(--glass)", border:"1px solid var(--glass-border)", color:"var(--tx)", borderRadius:"var(--r)", fontWeight:600, cursor:"pointer"}}>Cancelar</button>
                </div>
              </div>
            )}
            {meets.length > 0 ? (
              <div>
                {meets.map(m => (
                  <div key={m.id} className="mcard">
                    <div className="mdb">
                      <div className="day">{new Date(m.date).getDate()}</div>
                      <div className="mon">{MONTHS[new Date(m.date).getMonth()]}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600, color:"#fff"}}>{m.title}</div>
                      <div style={{fontSize:".8rem", color:"var(--mu)", marginTop:".3rem"}}>🕐 {m.time} • {m.type}</div>
                    </div>
                    {m.status === "pendente" && (
                      <div style={{display:"flex", gap:".5rem"}}>
                        <button onClick={() => confirmMeet(m)} style={{padding:".5rem .75rem", background:"rgba(74,222,128,.15)", border:"1px solid rgba(74,222,128,.3)", color:"#4ade80", borderRadius:"8px", fontSize:".75rem", fontWeight:600, cursor:"pointer"}}>✓ Confirmar</button>
                        <button onClick={() => rejectMeet(m)} style={{padding:".5rem .75rem", background:"rgba(248,113,113,.15)", border:"1px solid rgba(248,113,113,.3)", color:"#f87171", borderRadius:"8px", fontSize:".75rem", fontWeight:600, cursor:"pointer"}}>✕ Recusar</button>
                      </div>
                    )}
                    {m.status !== "pendente" && <StatusBadge status={m.status} />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><span className="emoji">📅</span><div className="title">Nenhuma reunião</div></div>
            )}
          </div>
        )}

        {tab === "chat" && (
          <div className="cw">
            {msgs.length > 0 ? (
              <div className="cms">
                {msgs.map(m => (
                  <div key={m.id} className={`mr ${m.from_role==="lawyer"?"mi":""}`}>
                    <div className={`mb ${m.from_role==="lawyer"?"mi":"th"}`}>
                      {m.text}
                      <div className="mtime">{fmtt(m.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ld">Sem mensagens</div>
            )}
            <div className="cir">
              <input type="text" className="cin" value={chatIn} onChange={e => setChatIn(e.target.value)} onKeyPress={e => e.key==="Enter" && sendMsg()} placeholder="Escrever mensagem..."/>
              <button onClick={sendMsg} className="bsend" title="Enviar"><Icon name="send" size={20} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AllMeetings({ clients, showToast }) {
  const allMeets = clients.flatMap(c => (c.meetings || []).map(m => ({...m, clientName: c.name, clientId: c.id})));
  const sorted = allMeets.sort((a,b) => new Date(a.date) - new Date(b.date));
  const pend = sorted.filter(m => m.status === "pendente");

  return (
    <div>
      <div className="ph">
        <h1>Reuniões</h1>
        <p>Todas as reuniões agendadas</p>
      </div>

      {pend.length > 0 && (
        <div className="card" style={{background:"rgba(96,165,250,.08)", border:"1px solid rgba(96,165,250,.2)", marginBottom:"1.5rem"}}>
          <div style={{display:"flex", alignItems:"center", gap:"1rem"}}>
            <div style={{fontSize:"1.5rem"}}>🔔</div>
            <div>
              <div style={{fontWeight:600, color:"#60a5fa"}}>Reuniões Pendentes</div>
              <div style={{fontSize:".85rem", color:"var(--mu)", marginTop:".2rem"}}>{pend.length} reunião{pend.length!==1?"ões":""} aguardam confirmação</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {sorted.length > 0 ? (
          <div>
            {sorted.map(m => (
              <div key={`${m.clientId}-${m.id}`} className="mcard">
                <div className="mdb">
                  <div className="day">{new Date(m.date).getDate()}</div>
                  <div className="mon">{MONTHS[new Date(m.date).getMonth()]}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600, color:"#fff"}}>{m.title}</div>
                  <div style={{fontSize:".8rem", color:"var(--mu)", marginTop:".3rem"}}>👤 {m.clientName}</div>
                  <div style={{fontSize:".8rem", color:"var(--mu)"}}>🕐 {m.time} • {m.type}</div>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state"><span className="emoji">📅</span><div className="title">Nenhuma reunião</div></div>
        )}
      </div>
    </div>
  );
}

function ClaudeChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{role:"assistant", content:"Olá! Sou um assistente de IA para o Painel Administrativo do Bono & Lacerda. Como posso ajudá-lo?"}]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!inp.trim()) return;
    setMsgs(m => [...m, {role:"user", content:inp}]);
    setInp("");
    setLoading(true);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": "", "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: "Você é um assistente de IA para o painel administrativo de um escritório de advocacia internacional (Bono & Lacerda). Ajude com dúvidas sobre o painel, procedimentos de imigração, e gestão de clientes. Seja profissional e conciso.",
        messages: msgs.map(m => ({role:m.role, content:m.content}))
      })
    }).catch(() => null);
    setLoading(false);
    if (res?.ok) {
      const data = await res.json();
      if (data.content?.[0]) setMsgs(m => [...m, {role:"assistant", content:data.content[0].text}]);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{position:"fixed", bottom:"2rem", right:"2rem", width:"56px", height:"56px", borderRadius:"50%", background:"linear-gradient(135deg, var(--g), var(--gl))", border:"none", color:"var(--n)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"var(--sh2)", zIndex:99, fontSize:"1.4rem"}}>
        🤖
      </button>
    );
  }

  return (
    <div style={{position:"fixed", bottom:"2rem", right:"2rem", width:"380px", height:"600px", borderRadius:"20px", background:"var(--glass)", backdropFilter:"var(--blur)", border:"1px solid var(--glass-border)", boxShadow:"var(--sh3)", zIndex:99, display:"flex", flexDirection:"column", overflow:"hidden"}}>
      <div style={{padding:"1.25rem 1.5rem", borderBottom:"1px solid var(--glass-border)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div><h3 style={{fontWeight:600, color:"#fff", marginBottom:".2rem"}}>Claude Chat</h3><p style={{fontSize:".75rem", color:"var(--ok)"}}>Online</p></div>
        <button onClick={() => setOpen(false)} style={{background:"none", border:"none", color:"var(--mus)", cursor:"pointer", fontSize:"1.4rem", lineHeight:1}}>×</button>
      </div>
      <div style={{flex:1, overflow:"y:auto", display:"flex", flexDirection:"column", gap:"1rem", padding:"1rem", backgroundColor:"rgba(0,0,0,.2)"}}>
        {msgs.map((m,i) => (
          <div key={i} style={{display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"75%", padding:".75rem 1rem", borderRadius:"12px", background:m.role==="user"?"linear-gradient(135deg, rgba(212,168,67,.2), rgba(212,168,67,.1))":"var(--glass2)", color:"#fff", fontSize:".85rem", lineHeight:1.5}}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{textAlign:"center", color:"var(--mu)"}}><Icon name="spin" size={20} /></div>}
      </div>
      <div style={{display:"flex", gap:".5rem", padding:"1rem", borderTop:"1px solid var(--glass-border)"}}>
        <input type="text" value={inp} onChange={e => setInp(e.target.value)} onKeyPress={e => e.key==="Enter" && send()} placeholder="Escrever mensagem..." style={{flex:1, padding:".6rem .8rem", border:"1px solid var(--glass-border)", borderRadius:"10px", fontSize:".85rem", color:"#fff", background:"var(--glass)", outline:"none"}}/>
        <button onClick={send} disabled={loading} style={{width:"40px", height:"40px", background:"linear-gradient(135deg, var(--g), var(--gl))", border:"none", borderRadius:"10px", color:"var(--n)", cursor:"pointer", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center"}}>
          {loading?"⏳":"→"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState(false);
  const [tab, setTab] = useState("dash");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openC, setOpenC] = useState(null);
  const [toast, setToast] = useState(null);

  const loadClients = async () => {
    setLoading(true);
    const allClients = await api.get("clients", "?order=created_at.desc&limit=10000");
    setClients(allClients.map(c => ({...c,proc:null,steps:[],docs:[],msgs:[],meetings:[]})));
    const enriched = await Promise.all(allClients.slice(0,200).map(async(c) => {
      const procs = await api.get("processes", `?client_id=eq.${c.id}&limit=1`);
      return {...c, proc:procs[0]||null};
    }));
    setClients(enriched.concat(allClients.slice(200)));
    setLoading(false);
  };

  const onLogin = () => { setAuth(true); loadClients(); };

  const pendentes = clients.reduce((a,c) => a+(c.meetings||[]).filter(m => m.status==="pendente").length, 0);
  const nav = [
    {id:"dash", label:"Painel Geral", ic:"dash"},
    {id:"clients", label:"Clientes", ic:"users", badge:clients.length},
    {id:"meetings", label:"Reuniões", ic:"cal", badge:pendentes||undefined},
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  if (!auth) return <><style>{css}</style><Login onLogin={onLogin} /></>;

  return (
    <>
      <style>{css}</style>
      <div className="al">
        <div className="mob-hdr">
          <h2>Bono & Lacerda</h2>
          <span>Painel</span>
          <button onClick={() => setAuth(false)} className="mob-out"><Icon name="logout" size={20} /></button>
        </div>

        <div className="sb">
          <div className="sbl">
            <h2>Bono & Lacerda</h2>
            <span>Painel Administrativo</span>
          </div>
          <div className="sbu">
            <div className="av" style={{width:"40px", height:"40px"}}>RL</div>
            <div>
              <div className="sbn">Dr. Ramom Lacerda</div>
              <div className="sbs">OAB/PB 19.165</div>
            </div>
          </div>
          <nav className="sbnav">
            {nav.map(n => (
              <div key={n.id} className={`ni ${tab===n.id?"on":""}`} onClick={() => {setTab(n.id); setOpenC(null);}}>
                <Icon name={n.ic} size={20} />
                <span style={{flex:1}}>{n.label}</span>
                {n.badge && <span style={{background:"var(--g)", color:"var(--n)", borderRadius:"99px", padding:".2rem .5rem", fontSize:".65rem", fontWeight:700, minWidth:"24px", textAlign:"center"}}>{n.badge}</span>}
              </div>
            ))}
          </nav>
          <div className="sbf">
            <button onClick={() => setAuth(false)} className="out"><Icon name="logout" size={18} /> Sair</button>
          </div>
        </div>

        <div className="mob-nav">
          <div className="mob-nav-inner">
            {nav.map(n => (
              <button key={n.id} className={`mob-ni ${tab===n.id?"on":""}`} onClick={() => {setTab(n.id); setOpenC(null);}}>
                <Icon name={n.ic} size={20} />
                <span style={{fontSize:".55rem"}}>{n.label.split(" ")[0]}</span>
                {n.badge && <span style={{fontSize:".5rem", marginTop:".1rem"}}>●</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="mc">
          {loading && <Loader />}
          {!loading && tab === "dash" && <Dash clients={clients} />}
          {!loading && tab === "clients" && <Clients clients={clients} setClients={setClients} onSelectClient={setOpenC} showToast={showToast} />}
          {!loading && openC && <Detail cid={openC} clients={clients} setClients={setClients} showToast={showToast} onBack={() => setOpenC(null)} />}
          {!loading && tab === "meetings" && <AllMeetings clients={clients} showToast={showToast} />}
        </div>
      </div>

      <ClaudeChat />

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
