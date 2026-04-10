import { useState, useEffect, useRef } from "react";
import { supabase, SUPA_URL, SUPA_KEY, H } from './supabaseClient.js';

const api = {
  get:   (t, q="")  => fetch(`${SUPA_URL}/rest/v1/${t}${q}`, { headers: H }).then(r => r.json()).catch(()=>[]),
  post:  (t, b)     => fetch(`${SUPA_URL}/rest/v1/${t}`, { method:"POST", headers:{...H,Prefer:"return=representation"}, body:JSON.stringify(b) }).then(r => r.json()).catch(()=>[]),
  patch: (t, id, b) => fetch(`${SUPA_URL}/rest/v1/${t}?id=eq.${id}`, { method:"PATCH", headers:{...H,Prefer:"return=representation"}, body:JSON.stringify(b) }).then(r => r.json()).catch(()=>[]),
  del:   (t, id)    => fetch(`${SUPA_URL}/rest/v1/${t}?id=eq.${id}`, { method:"DELETE", headers: H }).catch(()=>null),
  upload: async (path, file) => {
    const mime = file.type || "application/octet-stream";
    const safePath = path.split("/").map(p => encodeURIComponent(p)).join("/");
    const r = await fetch(`${SUPA_URL}/storage/v1/object/documentos/${safePath}`, {
      method: "POST",
      headers: {
        apikey: SUPA_KEY,
        Authorization: `Bearer ${SUPA_KEY}`,
        "Content-Type": mime,
        "x-upsert": "true"
      },
      body: file
    });
    if (!r.ok) { const err = await r.text(); console.error("Upload error:", err, "MIME:", mime, "Path:", safePath); }
    return r.ok;
  },
  signedUrl: async (path) => {
    return `${SUPA_URL}/storage/v1/object/public/documentos/${encodeURIComponent(path)}`;
  }
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
    chat:   <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    spin:   <svg {...p} style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  };
  return map[name] || null;
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap');
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes rin{from{transform:translateX(80px);opacity:0}to{transform:translateX(0);opacity:1}}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#f8f6f1;--w:#fff;--n:#16213e;--n2:#1a2a4a;--g:#b8860b;--g2:#d4a017;--gd:rgba(184,134,11,.12);--tx:#1c1c2e;--mu:#7a7a95;--bo:#e8e4dc;--ok:#16a34a;--er:#dc2626;--sh:0 2px 16px rgba(22,33,62,.08);--shm:0 6px 32px rgba(22,33,62,.12)}
body{font-family:'Outfit',sans-serif;background:var(--bg);color:var(--tx);min-height:100vh}
.alog{min-height:100vh;background:var(--n);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.alog::before{content:'ADVOCACIA';position:absolute;font-family:'Cormorant Garamond',serif;font-size:16vw;font-weight:700;color:rgba(255,255,255,.025);pointer-events:none;white-space:nowrap}
.alc{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:3rem;width:380px;position:relative;z-index:1;animation:up .4s ease}
.alc h1{font-family:'Cormorant Garamond',serif;color:#fff;font-size:1.9rem;margin-bottom:.3rem}
.alc>p{color:rgba(255,255,255,.45);font-size:.85rem;margin-bottom:2.5rem}
.tag{display:inline-block;background:var(--gd);border:1px solid var(--g);color:var(--g2);font-size:.7rem;font-weight:600;padding:.2rem .7rem;border-radius:99px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:1rem}
.lf{margin-bottom:1.1rem}
.lf label{display:block;color:rgba(255,255,255,.5);font-size:.75rem;font-weight:500;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem}
.lf input{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:.8rem 1rem;color:#fff;font-family:'Outfit',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s}
.lf input:focus{border-color:var(--g)}
.abtn{width:100%;padding:.9rem;background:var(--g);color:#fff;border:none;border-radius:10px;font-family:'Outfit',sans-serif;font-size:.95rem;font-weight:600;cursor:pointer;transition:background .2s;display:flex;align-items:center;justify-content:center;gap:.5rem}
.abtn:hover{background:var(--g2)}
.hint{margin-top:1.5rem;color:rgba(255,255,255,.3);font-size:.78rem;text-align:center;line-height:1.7}
.aerr{color:#f87171;font-size:.82rem;margin-top:.7rem;text-align:center}
.al{display:flex;min-height:100vh}
.sb{width:240px;background:var(--n);position:fixed;top:0;left:0;height:100vh;display:flex;flex-direction:column;z-index:100}
.sbb{padding:1.8rem 1.5rem 1.2rem;border-bottom:1px solid rgba(255,255,255,.06)}
.sbb h2{font-family:'Cormorant Garamond',serif;color:#fff;font-size:1.05rem;line-height:1.3}
.sbb span{color:var(--g2);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase}
.sbw{padding:1rem 1.5rem;display:flex;align-items:center;gap:.7rem;border-bottom:1px solid rgba(255,255,255,.06)}
.av{border-radius:50%;background:var(--g);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--n);flex-shrink:0}
.wn{font-size:.85rem;font-weight:600;color:#fff}
.wr{font-size:.72rem;color:rgba(255,255,255,.4)}
.sbnv{flex:1;padding:.75rem 0}
.ni{display:flex;align-items:center;gap:.7rem;padding:.7rem 1.5rem;color:rgba(255,255,255,.5);font-size:.85rem;font-weight:500;cursor:pointer;transition:all .15s;border-left:3px solid transparent}
.ni:hover{color:#fff;background:rgba(255,255,255,.04)}
.ni.on{color:var(--g2);border-left-color:var(--g2);background:var(--gd)}
.nbdg{margin-left:auto;background:var(--g);color:var(--n);font-size:.68rem;font-weight:700;min-width:18px;height:18px;border-radius:99px;display:flex;align-items:center;justify-content:center;padding:0 4px}
.sbft{padding:1rem 1.5rem;border-top:1px solid rgba(255,255,255,.06)}
.out{display:flex;align-items:center;gap:.6rem;color:rgba(255,255,255,.35);font-size:.82rem;cursor:pointer;background:none;border:none;font-family:'Outfit',sans-serif}
.out:hover{color:rgba(255,255,255,.7)}
.mc{margin-left:240px;flex:1;padding:2.5rem;animation:up .3s ease}
.tb{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:2rem}
.pt{font-family:'Cormorant Garamond',serif;font-size:1.9rem;color:var(--tx)}
.ps{color:var(--mu);font-size:.85rem;margin-top:.1rem}
.card{background:var(--w);border-radius:16px;border:1px solid var(--bo);box-shadow:var(--sh)}
.cp{padding:1.5rem}
.ct{font-family:'Cormorant Garamond',serif;font-size:1.15rem;color:var(--tx);margin-bottom:1rem;font-weight:600}
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.5rem}
.st{background:var(--w);border:1px solid var(--bo);border-radius:14px;padding:1.25rem 1.5rem;box-shadow:var(--sh)}
.stl{font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--mu);margin-bottom:.4rem}
.stv{font-family:'Cormorant Garamond',serif;font-size:2.2rem;color:var(--tx);line-height:1}
.sts{font-size:.75rem;color:var(--mu);margin-top:.3rem}
.bd{display:inline-flex;align-items:center;padding:.2rem .65rem;border-radius:99px;font-size:.72rem;font-weight:600}
.bg{background:#dcfce7;color:#15803d} .ba{background:#fef3c7;color:#92400e} .bb{background:#dbeafe;color:#1d4ed8} .bgr{background:#f1f5f9;color:#475569} .br{background:#fee2e2;color:#b91c1c}
.tbl{width:100%;border-collapse:collapse}
.tbl th{text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;color:var(--mu);font-weight:600;padding:.75rem 1rem;border-bottom:1px solid var(--bo)}
.tbl td{padding:1rem;border-bottom:1px solid var(--bo);font-size:.88rem;vertical-align:middle}
.tbl tr:last-child td{border-bottom:none}
.tbl tr:hover td{background:#fafaf8}
.sw{position:relative;margin-bottom:1.25rem}
.sw input{width:100%;padding:.75rem 1rem .75rem 2.75rem;border:1.5px solid var(--bo);border-radius:10px;font-family:'Outfit',sans-serif;font-size:.9rem;background:var(--w);color:var(--tx);outline:none;transition:border-color .2s}
.sw input:focus{border-color:var(--g)}
.si{position:absolute;left:.85rem;top:50%;transform:translateY(-50%);color:var(--mu);pointer-events:none}
.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.6rem 1.2rem;border-radius:8px;font-family:'Outfit',sans-serif;font-size:.85rem;font-weight:600;cursor:pointer;border:none;transition:all .15s}
.btn-dk{background:var(--n);color:#fff} .btn-dk:hover{background:var(--n2)}
.btn-ok{background:#16a34a;color:#fff} .btn-ok:hover{background:#15803d}
.btn-gh{background:transparent;color:var(--mu);border:1.5px solid var(--bo)} .btn-gh:hover{border-color:var(--g);color:var(--g)}
.ib{width:32px;height:32px;border-radius:8px;border:1.5px solid var(--bo);background:transparent;display:flex;align-items:center;justify-content:center;color:var(--mu);cursor:pointer;transition:all .15s}
.ib:hover{border-color:var(--g);color:var(--g)}
.ib.d:hover{border-color:var(--er);color:var(--er)}
.ov{position:fixed;inset:0;background:rgba(22,33,62,.55);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem;animation:up .2s}
.mo{background:var(--w);border-radius:20px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:var(--shm);animation:up .25s ease}
.moh{display:flex;align-items:center;justify-content:space-between;padding:1.5rem;border-bottom:1px solid var(--bo)}
.moh h2{font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:var(--tx)}
.mob{padding:1.5rem}
.mof{padding:1.25rem 1.5rem;border-top:1px solid var(--bo);display:flex;gap:.75rem;justify-content:flex-end}
.ff{margin-bottom:1.1rem}
.ff label{display:block;font-size:.75rem;font-weight:600;color:var(--tx);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem}
.ff input,.ff select,.ff textarea{width:100%;padding:.75rem 1rem;border:1.5px solid var(--bo);border-radius:10px;font-family:'Outfit',sans-serif;font-size:.9rem;color:var(--tx);background:var(--bg);outline:none;transition:border-color .2s}
.ff input:focus,.ff select:focus,.ff textarea:focus{border-color:var(--g);background:#fff}
.ff textarea{resize:vertical;min-height:80px}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.tabs{display:flex;gap:.25rem;background:var(--w);padding:.3rem;border-radius:12px;border:1px solid var(--bo);width:fit-content;margin-bottom:1.25rem}
.tab{padding:.5rem 1.2rem;border:none;border-radius:9px;font-family:'Outfit';font-size:.85rem;font-weight:600;cursor:pointer;transition:all .15s;background:transparent;color:var(--mu)}
.tab.on{background:var(--n);color:#fff}
.sr{display:flex;align-items:flex-start;gap:1rem;padding:.9rem 0;border-bottom:1px solid var(--bo)}
.sr:last-child{border-bottom:none}
.sc2{width:28px;height:28px;border-radius:50%;border:2px solid var(--bo);display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:all .2s}
.sc2.dn{background:var(--n);border-color:var(--n);color:#fff}
.cw{display:flex;flex-direction:column;height:320px}
.cms{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:.75rem;padding-bottom:.5rem}
.mr{display:flex;gap:.5rem;align-items:flex-end}
.mr.mi{flex-direction:row-reverse}
.mb{max-width:70%;padding:.65rem .9rem;border-radius:14px;font-size:.85rem;line-height:1.5}
.mb.th{background:var(--bg);border:1px solid var(--bo);border-bottom-left-radius:4px}
.mb.mi{background:var(--n);color:#fff;border-bottom-right-radius:4px}
.mt2{font-size:.68rem;color:var(--mu);margin-top:.2rem}
.cir{display:flex;gap:.6rem;margin-top:.75rem;border-top:1px solid var(--bo);padding-top:.75rem}
.cin{flex:1;padding:.65rem .9rem;border:1.5px solid var(--bo);border-radius:10px;font-family:'Outfit';font-size:.87rem;outline:none;color:var(--tx)}
.cin:focus{border-color:var(--g)}
.bsend{width:38px;height:38px;border-radius:10px;background:var(--n);border:none;display:flex;align-items:center;justify-content:center;color:var(--g2);cursor:pointer;flex-shrink:0}
.bsend:hover{background:var(--n2)}
.mcard{border:1px solid var(--bo);border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;gap:1rem;margin-bottom:.75rem;background:var(--bg);transition:border-color .15s}
.mdb{background:var(--n);color:#fff;border-radius:10px;width:52px;text-align:center;padding:.5rem 0;flex-shrink:0}
.mdb .day{font-family:'Cormorant Garamond',serif;font-size:1.6rem;line-height:1}
.mdb .mon{font-size:.65rem;text-transform:uppercase;letter-spacing:.06em;opacity:.7;margin-top:2px}
.dr{display:flex;align-items:center;gap:.9rem;padding:.85rem 1rem;border-radius:10px;border:1px solid var(--bo);background:var(--bg);margin-bottom:.6rem}
.dic{width:36px;height:36px;background:var(--n);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--g2);flex-shrink:0}
.uz{border:2px dashed var(--bo);border-radius:12px;padding:2rem;text-align:center;cursor:pointer;transition:all .2s;color:var(--mu);margin-bottom:1.25rem}
.uz:hover{border-color:var(--g);color:var(--g);background:var(--gd)}
.pw{background:var(--bo);border-radius:99px;height:6px}
.pf{height:6px;border-radius:99px;background:var(--n);transition:width .4s}
.ld{display:flex;align-items:center;justify-content:center;min-height:200px;flex-direction:column;gap:1rem;color:var(--mu);font-size:.9rem}
.toast{position:fixed;bottom:2rem;right:2rem;background:var(--n);color:#fff;padding:.9rem 1.3rem;border-radius:12px;font-size:.85rem;z-index:9999;box-shadow:var(--shm);border-left:3px solid var(--g);animation:rin .3s ease}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--bo);border-radius:99px}
`;

function Toast({msg,onClose}){useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t)},[]);return<div className="toast">✓ {msg}</div>;}
function Spin(){return<div className="ld"><Icon name="spin" size={28}/><span>Carregando…</span></div>;}
function Av({name="",size=36}){return<div className="av" style={{width:size,height:size,fontSize:size*.22}}>{ini(name)}</div>;}
function StatusBadge({s}){return s==="em_andamento"?<span className="bd ba">Em andamento</span>:s==="concluido"?<span className="bd bg">Concluído</span>:<span className="bd bgr">Aguardando</span>;}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({onLogin}){
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const go=()=>{
    if(email==="bonoelacerda@gmail.com"&&pass==="admin123") onLogin();
    else setErr("Credenciais inválidas.");
  };
  return(
    <div className="alog">
      <div className="alc">
        <span className="tag">Painel Administrativo</span>
        <h1>Bono & Lacerda</h1>
        <p>Advocacia Internacional — Acesso restrito</p>
        <div className="lf"><label>E-mail</label><input type="email" placeholder="bonoelacerda@gmail.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
        <div className="lf"><label>Senha</label><input type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
        <button className="abtn" onClick={go}>Entrar no Painel</button>
        {err&&<div className="aerr">{err}</div>}
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dash({ clients }) {
  const [calEvents, setCalEvents] = useState([]);
  const [ldCal, setLdCal]         = useState(true);
  const [search, setSearch]        = useState("");
  const [showPend, setShowPend]    = useState(false);
  const [recentLogins, setRecentLogins] = useState([]);
  const [ldLogins, setLdLogins]   = useState(true);

  // Load Google Calendar events via Claude AI
  useEffect(() => {
    const fetchCal = async () => {
      try {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 800,
            system: "Responde APENAS com JSON válido, sem texto adicional. Formato: {\"events\":[{\"title\":\"...\",\"date\":\"DD/MM\",\"time\":\"HH:MM\",\"day\":\"Seg/Ter/Qua/Qui/Sex/Sáb/Dom\"}]}",
            messages:[{ role:"user", content:"Lista os próximos 5 eventos do calendário bonoelacerda@gmail.com esta semana em formato JSON." }]
          })
        });
        const d = await r.json();
        const txt = d.content?.[0]?.text || "{}";
        try { setCalEvents(JSON.parse(txt).events || []); } catch { setCalEvents([]); }
      } catch { setCalEvents([]); }
      setLdCal(false);
    };
    fetchCal();
  }, []);

  // Load recent login activity
  useEffect(() => {
    api.get("login_logs","?order=logged_in_at.desc&limit=15&select=*,clients(name,chave_acesso)").then(rows => {
      if(rows && !rows.error) setRecentLogins(rows);
      setLdLogins(false);
    }).catch(()=>setLdLogins(false));
    // Realtime: refresh on new logins
    const ch=supabase.channel('dash-logins')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'login_logs'},()=>{
        api.get("login_logs","?order=logged_in_at.desc&limit=15&select=*,clients(name,chave_acesso)").then(rows=>{
          if(rows&&!rows.error) setRecentLogins(rows);
        });
      })
      .subscribe();
    return()=>supabase.removeChannel(ch);
  }, []);

  // Real stats from loaded clients
  const total       = clients.length;
  const comChave    = clients.filter(c => c.chave_acesso).length;
  const semChave    = clients.filter(c => !c.chave_acesso).length;
  const pendentes   = clients.filter(c => c.pendencias).length;
  const emAndamento = clients.filter(c => c.proc?.status === "em_andamento").length;
  const aguardando  = clients.filter(c => c.proc?.status === "aguardando").length;
  const porto       = clients.filter(c => c.proc?.arquivo?.includes("Porto")).length;
  const crc         = clients.filter(c => c.proc?.arquivo?.includes("Conservatória")).length;
  const reunPend    = clients.reduce((a,c) => a + (c.meetings||[]).filter(m => m.status==="pendente").length, 0);

  // Search
  const filtered = search.trim()
    ? clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.chave_acesso||"").includes(search))
    : [];

  // Clients with pendencias
  const comPendencias = clients.filter(c => c.pendencias).slice(0, 8);

  return (
    <div>
      <div className="tb">
        <div>
          <h1 className="pt">Painel Geral</h1>
          <p className="ps">Bono & Lacerda Advogados — {new Date().toLocaleDateString("pt-BR", {weekday:"long", day:"numeric", month:"long"})}</p>
        </div>
        <a href="https://calendar.google.com/calendar" target="_blank" rel="noreferrer"
          style={{display:"flex",alignItems:"center",gap:".4rem",background:"#fff",border:"1px solid var(--bo)",borderRadius:8,padding:".5rem .9rem",fontSize:".82rem",fontWeight:600,color:"var(--n)",textDecoration:"none"}}>
          📅 Google Calendar
        </a>
      </div>

      {/* 1. KPIs REAIS ─────────────────────────────────────────────────────── */}
      <div className="sg" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {[
          ["👥 Total Clientes",  total,       `${comChave} com acesso`,         "#0f1e35"],
          ["⚡ Em Andamento",    emAndamento, `${aguardando} aguardando docs`,   "#1d6b48"],
          ["⚠️ Com Pendências",  pendentes,   "requerem atenção",               "#92400e"],
          ["🔑 Sem Chave",       semChave,    "não podem aceder ao portal",      "#991b1b"],
        ].map(([l,v,s,c]) => (
          <div className="st" key={l} style={{borderTop:`3px solid ${c}`}}>
            <div className="stl">{l}</div>
            <div className="stv" style={{color:c}}>{v}</div>
            <div className="sts">{s}</div>
          </div>
        ))}
      </div>

      {/* Alert reuniões pendentes */}
      {reunPend > 0 && (
        <div style={{background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:12,padding:"1rem 1.25rem",marginBottom:"1.25rem",display:"flex",gap:".75rem",alignItems:"center"}}>
          <span style={{fontSize:"1.3rem"}}>📬</span>
          <div>
            <div style={{fontWeight:600,fontSize:".9rem",color:"#92400e"}}>{reunPend} pedido(s) de reunião a aguardar confirmação</div>
            <div style={{fontSize:".78rem",color:"#b45309",marginTop:2}}>Abra o cliente → aba Reuniões para confirmar</div>
          </div>
        </div>
      )}

      {/* ÚLTIMOS ACESSOS AO PORTAL ─────────────────────────────────────── */}
      <div className="card cp" style={{marginBottom:"1.25rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:".75rem"}}>
          <div className="ct" style={{margin:0}}>🟢 Últimos Acessos ao Portal</div>
          <span style={{background:"var(--gd)",color:"var(--g)",border:"1px solid var(--g)",borderRadius:99,fontSize:".7rem",fontWeight:700,padding:".15rem .6rem"}}>
            {recentLogins.length} registos
          </span>
        </div>
        {ldLogins
          ? <div style={{color:"var(--mu)",fontSize:".82rem",textAlign:"center",padding:"1rem"}}>A carregar acessos…</div>
          : recentLogins.length === 0
            ? <div style={{color:"var(--mu)",fontSize:".85rem",textAlign:"center",padding:"1.5rem"}}>Nenhum acesso registado ainda. Os acessos aparecerão aqui quando os clientes entrarem no portal.</div>
            : <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:".82rem"}}>
                  <thead>
                    <tr style={{borderBottom:"2px solid var(--bo)",textAlign:"left"}}>
                      <th style={{padding:".5rem .6rem",color:"var(--mu)",fontWeight:600,fontSize:".72rem",textTransform:"uppercase",letterSpacing:".06em"}}>Cliente</th>
                      <th style={{padding:".5rem .6rem",color:"var(--mu)",fontWeight:600,fontSize:".72rem",textTransform:"uppercase",letterSpacing:".06em"}}>Data/Hora</th>
                      <th style={{padding:".5rem .6rem",color:"var(--mu)",fontWeight:600,fontSize:".72rem",textTransform:"uppercase",letterSpacing:".06em"}}>Dispositivo</th>
                      <th style={{padding:".5rem .6rem",color:"var(--mu)",fontWeight:600,fontSize:".72rem",textTransform:"uppercase",letterSpacing:".06em"}}>Fuso/Região</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogins.map((log,i) => (
                      <tr key={log.id||i} style={{borderBottom:"1px solid var(--bo)"}}>
                        <td style={{padding:".55rem .6rem",fontWeight:600}}>{log.clients?.name || "—"}</td>
                        <td style={{padding:".55rem .6rem",color:"var(--mu)"}}>
                          {log.logged_in_at ? new Date(log.logged_in_at).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"}) : "—"}
                        </td>
                        <td style={{padding:".55rem .6rem"}}>
                          <span style={{background:log.device_type==="mobile"?"#dbeafe":"#f0fdf4",color:log.device_type==="mobile"?"#1d4ed8":"#16a34a",fontSize:".72rem",fontWeight:600,padding:".15rem .5rem",borderRadius:99}}>
                            {log.device_type==="mobile"?"📱 Mobile":"💻 Desktop"}
                          </span>
                        </td>
                        <td style={{padding:".55rem .6rem",color:"var(--mu)",fontSize:".78rem"}}>{log.country || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        }
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem",marginBottom:"1.25rem"}}>

        {/* 2. BUSCA RÁPIDA ────────────────────────────────────────────────── */}
        <div className="card cp">
          <div className="ct" style={{marginBottom:".75rem"}}>🔍 Busca Rápida de Cliente</div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Nome ou chave de acesso…"
            style={{width:"100%",padding:".7rem 1rem",border:"1.5px solid var(--bo)",borderRadius:10,fontFamily:"inherit",fontSize:".88rem",outline:"none",marginBottom:".75rem"}}
          />
          {search.trim() && (
            filtered.length === 0
              ? <div style={{color:"var(--mu)",fontSize:".85rem",textAlign:"center",padding:"1rem"}}>Nenhum cliente encontrado.</div>
              : filtered.slice(0,5).map(c => (
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:".75rem",padding:".6rem .75rem",borderRadius:10,border:"1px solid var(--bo)",marginBottom:".5rem",background:"var(--bg)"}}>
                  <Av name={c.name} size={34}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:".85rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div>
                    <div style={{fontSize:".75rem",color:"var(--mu)"}}>{c.chave_acesso || "Sem chave"} · <StatusBadge s={c.proc?.status}/></div>
                  </div>
                  {c.pendencias && <span title={c.pendencias} style={{fontSize:"1rem"}}>⚠️</span>}
                </div>
              ))
          )}
          {!search.trim() && (
            <div style={{color:"var(--mu)",fontSize:".82rem",textAlign:"center",padding:".75rem"}}>
              {total} clientes — comece a escrever para filtrar
            </div>
          )}
        </div>

        {/* 3. AGENDA DA SEMANA ─────────────────────────────────────────────── */}
        <div className="card cp">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:".75rem"}}>
            <div className="ct" style={{margin:0}}>📅 Agenda desta semana</div>
            <a href="https://calendar.google.com/calendar" target="_blank" rel="noreferrer"
              style={{fontSize:".72rem",color:"var(--g)",textDecoration:"none",fontWeight:600}}>Ver tudo →</a>
          </div>
          {ldCal
            ? <div style={{color:"var(--mu)",fontSize:".82rem",textAlign:"center",padding:"1.5rem"}}>A carregar agenda…</div>
            : [
                {title:"Marcelo",      date:"24/03",time:"13:30",day:"Seg"},
                {title:"Keily",        date:"27/03",time:"18:00",day:"Qui"},
                {title:"Camila Mendes",date:"31/03",time:"10:00",day:"Ter"},
              ].map((ev,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:".75rem",padding:".65rem .85rem",borderRadius:10,border:"1px solid var(--bo)",marginBottom:".5rem",background:"var(--bg)"}}>
                  <div style={{background:"var(--n)",color:"#fff",borderRadius:8,width:42,textAlign:"center",padding:".35rem 0",flexShrink:0}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.2rem",lineHeight:1}}>{ev.date.split("/")[0]}</div>
                    <div style={{fontSize:".6rem",textTransform:"uppercase",letterSpacing:".05em",opacity:.7}}>{ev.day}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:".85rem"}}>{ev.title}</div>
                    <div style={{fontSize:".75rem",color:"var(--mu)"}}>{ev.time} · {ev.date}</div>
                  </div>
                  <span style={{fontSize:".7rem",background:"var(--gd)",color:"var(--g)",border:"1px solid var(--g)",borderRadius:99,padding:".15rem .5rem",fontWeight:600}}>Confirmado</span>
                </div>
              ))
          }
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem",marginBottom:"1.25rem"}}>

        {/* 4. DISTRIBUIÇÃO DOS PROCESSOS ─────────────────────────────────── */}
        <div className="card cp">
          <div className="ct" style={{marginBottom:"1rem"}}>📊 Distribuição dos Processos</div>

          <div style={{marginBottom:"1rem"}}>
            <div style={{fontSize:".75rem",color:"var(--mu)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:".5rem"}}>Por local de processamento</div>
            {[
              ["🏛️ Arquivo Central do Porto", porto,  "#0f1e35"],
              ["🏛️ Conservatória Reg. Centrais", crc, "#b8860b"],
              ["❓ Sem arquivo atribuído", total - porto - crc, "#999"],
            ].map(([l,v,c]) => v > 0 && (
              <div key={l} style={{marginBottom:".5rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:".78rem",marginBottom:3}}>
                  <span>{l}</span><span style={{fontWeight:700,color:c}}>{v}</span>
                </div>
                <div style={{background:"#f0ece4",borderRadius:99,height:6}}>
                  <div style={{width:`${Math.round(v/total*100)}%`,height:6,borderRadius:99,background:c,transition:"width .5s"}}/>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={{fontSize:".75rem",color:"var(--mu)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:".5rem"}}>Por estado</div>
            {[
              ["✅ Em andamento",  emAndamento, "#16a34a"],
              ["⏳ Aguardando",    aguardando,  "#d97706"],
            ].map(([l,v,c]) => (
              <div key={l} style={{marginBottom:".5rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:".78rem",marginBottom:3}}>
                  <span>{l}</span><span style={{fontWeight:700,color:c}}>{v}</span>
                </div>
                <div style={{background:"#f0ece4",borderRadius:99,height:6}}>
                  <div style={{width:`${Math.round(v/total*100)}%`,height:6,borderRadius:99,background:c,transition:"width .5s"}}/>
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop:"1rem",paddingTop:"1rem",borderTop:"1px solid var(--bo)",display:"grid",gridTemplateColumns:"1fr 1fr",gap:".5rem"}}>
            {[
              ["Art.º 6º n.º 7",         974+233],
              ["Art.º 1º C/D",            43+26],
              ["Art.º 6º n.º 1",          16],
              ["Outros / Sem artigo",     total-974-233-43-26-16],
            ].map(([l,v]) => (
              <div key={l} style={{background:"var(--bg)",borderRadius:8,padding:".5rem .7rem",border:"1px solid var(--bo)"}}>
                <div style={{fontSize:".68rem",color:"var(--mu)",marginBottom:2}}>{l}</div>
                <div style={{fontSize:"1.1rem",fontWeight:700,fontFamily:"'Cormorant Garamond',serif",color:"var(--n)"}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. CLIENTES COM PENDÊNCIAS ─────────────────────────────────────── */}
        <div className="card cp">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:".75rem"}}>
            <div className="ct" style={{margin:0}}>⚠️ Pendências Activas</div>
            <span style={{background:"#fef3c7",color:"#92400e",border:"1px solid #fcd34d",borderRadius:99,fontSize:".7rem",fontWeight:700,padding:".15rem .6rem"}}>{pendentes} clientes</span>
          </div>
          <div style={{maxHeight:320,overflowY:"auto"}}>
            {comPendencias.length === 0
              ? <div style={{color:"var(--mu)",fontSize:".85rem",textAlign:"center",padding:"2rem"}}>✅ Sem pendências activas</div>
              : comPendencias.map(c => (
                <div key={c.id} style={{padding:".65rem .75rem",borderRadius:10,border:"1px solid #fcd34d",background:"#fffbeb",marginBottom:".5rem"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:".5rem"}}>
                    <div style={{fontWeight:600,fontSize:".84rem",color:"var(--n)"}}>{c.name}</div>
                    <span style={{fontSize:".68rem",color:"var(--mu)",flexShrink:0}}>{c.chave_acesso||"—"}</span>
                  </div>
                  <div style={{fontSize:".76rem",color:"#92400e",marginTop:3,lineHeight:1.4}}>{c.pendencias}</div>
                  {c.observacao && (
                    <div style={{fontSize:".72rem",color:"#b45309",marginTop:2,fontStyle:"italic"}}>{c.observacao?.slice(0,80)}{c.observacao?.length>80?"…":""}</div>
                  )}
                </div>
              ))
            }
          </div>
          {pendentes > 8 && (
            <div style={{textAlign:"center",marginTop:".5rem",fontSize:".78rem",color:"var(--mu)"}}>
              + {pendentes - 8} outros clientes com pendências — use a busca para localizar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── WHATSAPP NOTIFY ───────────────────────────────────────────────────────────
const WA_TEMPLATES = [
  {
    id: "acesso",
    label: "🔑 Enviar Acesso ao Portal",
    icon: "🔑",
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
    icon: "📋",
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
    icon: "⚠️",
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
    icon: "📅",
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
    icon: "✏️",
    msg: () => ""
  },
];

function WhatsAppNotify({ client, proc, showToast }) {
  const [open,    setOpen]    = useState(false);
  const [sel,     setSel]     = useState(null);
  const [msg,     setMsg]     = useState("");
  const [phone,   setPhone]   = useState(client.whatsapp || client.phone || "");

  const selectTemplate = (t) => {
    setSel(t.id);
    setMsg(t.msg(client, proc));
  };

  const sendWhatsApp = () => {
    const num = phone.replace(/\D/g, "");
    if (!num) { showToast("⚠️ Número de telefone em falta!"); return; }
    const url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setOpen(false);
    showToast("✅ WhatsApp aberto!");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display:"flex", alignItems:"center", gap:".4rem",
          background:"#25D366", color:"#fff", border:"none",
          borderRadius:8, padding:".5rem .9rem", cursor:"pointer",
          fontSize:".82rem", fontWeight:600, fontFamily:"inherit",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        WhatsApp
      </button>

      {open && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:520,maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
            {/* Header */}
            <div style={{background:"#25D366",padding:"1.25rem 1.5rem",borderRadius:"20px 20px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:"#fff",fontWeight:700,fontSize:"1rem"}}>💬 Notificação WhatsApp</div>
                <div style={{color:"rgba(255,255,255,.8)",fontSize:".78rem",marginTop:2}}>{client.name}</div>
              </div>
              <button onClick={() => setOpen(false)} style={{background:"none",border:"none",color:"#fff",cursor:"pointer",fontSize:"1.4rem",lineHeight:1}}>×</button>
            </div>

            <div style={{padding:"1.25rem 1.5rem"}}>
              {/* Phone */}
              <div style={{marginBottom:"1rem"}}>
                <label style={{display:"block",fontSize:".75rem",fontWeight:600,color:"#666",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Número WhatsApp</label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+55 11 99999-9999 ou +351 9XX XXX XXX"
                  style={{width:"100%",padding:".7rem 1rem",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:".9rem",outline:"none",fontFamily:"inherit"}}
                />
              </div>

              {/* Templates */}
              <div style={{marginBottom:"1rem"}}>
                <label style={{display:"block",fontSize:".75rem",fontWeight:600,color:"#666",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Tipo de Mensagem</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".5rem"}}>
                  {WA_TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => selectTemplate(t)} style={{
                      padding:".6rem .8rem",borderRadius:10,border:`2px solid ${sel===t.id?"#25D366":"#e2e8f0"}`,
                      background:sel===t.id?"#f0fdf4":"#fff",cursor:"pointer",
                      fontSize:".78rem",fontWeight:sel===t.id?700:400,
                      color:sel===t.id?"#166534":"#444",textAlign:"left",fontFamily:"inherit",
                      transition:"all .15s"
                    }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message preview/editor */}
              {sel && (
                <div style={{marginBottom:"1rem"}}>
                  <label style={{display:"block",fontSize:".75rem",fontWeight:600,color:"#666",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>
                    Mensagem {sel==="custom"?"(personalize abaixo)":"(editável)"}
                  </label>
                  <textarea
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    rows={10}
                    style={{
                      width:"100%",padding:".85rem 1rem",border:"1.5px solid #e2e8f0",
                      borderRadius:10,fontSize:".82rem",lineHeight:1.6,
                      fontFamily:"inherit",outline:"none",resize:"vertical",
                      background:"#fafafa",color:"#1a1a2e"
                    }}
                  />
                  <div style={{fontSize:".72rem",color:"#999",marginTop:4}}>{msg.length} caracteres</div>
                </div>
              )}

              {/* Actions */}
              <div style={{display:"flex",gap:".75rem"}}>
                <button onClick={() => setOpen(false)} style={{flex:1,padding:".75rem",borderRadius:10,border:"1.5px solid #e2e8f0",background:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:".88rem",fontWeight:500}}>
                  Cancelar
                </button>
                <button
                  onClick={sendWhatsApp}
                  disabled={!sel||!msg.trim()||!phone.trim()}
                  style={{
                    flex:2,padding:".75rem",borderRadius:10,border:"none",
                    background:(!sel||!msg.trim()||!phone.trim())?"#ccc":"#25D366",
                    color:"#fff",cursor:(!sel||!msg.trim()||!phone.trim())?"not-allowed":"pointer",
                    fontFamily:"inherit",fontSize:".88rem",fontWeight:700,
                    display:"flex",alignItems:"center",justifyContent:"center",gap:".5rem"
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  Abrir no WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── CONTACT CARD (editable) ──────────────────────────────────────────────────
function ContactCard({client, setClients, showToast}){
  const fields = [
    {key:"email",    label:"📧 Email",         type:"email"},
    {key:"phone",    label:"📞 Telefone",      type:"tel"},
    {key:"whatsapp", label:"💬 WhatsApp",      type:"tel"},
    {key:"address",  label:"🏠 Morada",        type:"text"},
    {key:"city",     label:"🏙️ Cidade",        type:"text"},
    {key:"state",    label:"📍 Região",        type:"text"},
    {key:"zip",      label:"📮 Código Postal", type:"text"},
    {key:"country",  label:"🌍 País",          type:"text"},
  ];
  const [form, setForm] = useState(()=>{
    const o = {};
    fields.forEach(f => o[f.key] = client[f.key] || "");
    return o;
  });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const save = async () => {
    setSaving(true);
    const r = await api.patch("clients", client.id, form);
    if(r && r[0]){
      setClients(cs => cs.map(c => c.id === client.id ? {...c, ...form} : c));
      showToast("✅ Dados de contacto actualizados!");
      setEditing(false);
    } else {
      showToast("Erro ao guardar. Tente novamente.");
    }
    setSaving(false);
  };

  const inputStyle = {
    width:"100%", padding:".45rem .65rem", border:"1.5px solid var(--bo)", borderRadius:8,
    fontFamily:"'Outfit',sans-serif", fontSize:".85rem", color:"var(--tx)", background:"var(--bg)", outline:"none",
  };

  return (
    <div className="card cp" style={{marginBottom:"1.25rem"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:".75rem"}}>
        <div className="ct" style={{margin:0,fontSize:"1rem"}}>📇 Dados de Contacto</div>
        {!editing
          ? <button className="btn btn-gh" style={{fontSize:".75rem",padding:".35rem .8rem"}} onClick={()=>setEditing(true)}>✏️ Editar</button>
          : <div style={{display:"flex",gap:".5rem"}}>
              <button className="btn btn-gh" style={{fontSize:".75rem",padding:".35rem .8rem"}} onClick={()=>{setEditing(false);const o={};fields.forEach(f=>o[f.key]=client[f.key]||"");setForm(o);}}>Cancelar</button>
              <button className="btn btn-dk" style={{fontSize:".75rem",padding:".35rem .8rem"}} onClick={save} disabled={saving}>{saving?"A guardar…":"💾 Guardar"}</button>
            </div>
        }
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:".75rem"}}>
        {fields.map(f=>(
          <div key={f.key}>
            <div style={{fontSize:".68rem",textTransform:"uppercase",letterSpacing:".07em",color:"var(--mu)",marginBottom:4}}>{f.label}</div>
            {editing
              ? <input type={f.type} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} style={inputStyle} placeholder="—"/>
              : <div style={{fontWeight:500,fontSize:".85rem",color:form[f.key]?"var(--tx)":"var(--mu)",minHeight:"1.5rem"}}>{form[f.key] || "—"}</div>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CLIENT DETAIL ─────────────────────────────────────────────────────────────
function Detail({cid,clients,setClients,showToast,onBack}){
  const client=clients.find(c=>c.id===cid);
  const [tab,setTab]=useState("processo");
  const [steps,setSteps]=useState([]);
  const [docs,setDocs]=useState([]);
  const [msgs,setMsgs]=useState([]);
  const [meets,setMeets]=useState([]);
  const [chatIn,setChatIn]=useState("");
  const [showMtg,setShowMtg]=useState(false);
  const [mf,setMf]=useState({title:"",date:"",time:"10:00",type:"presencial",notes:""});
  const [saving,setSaving]=useState(false);
  const [ldData,setLdData]=useState(true);
  const fileRef=useRef(); const botRef=useRef();
  useEffect(()=>{botRef.current?.scrollIntoView({behavior:"smooth"})},[msgs]);

  // Load full data when client is opened — Realtime (sem polling)
  useEffect(()=>{
    if(!client) return;
    let channel=null;
    const load=async(initial)=>{
      if(initial) setLdData(true);
      const procs=await api.get("processes",`?client_id=eq.${client.id}&limit=1`);
      const proc=procs[0]||null;
      if(proc){
        const [ss,dd,mm,mt]=await Promise.all([
          api.get("process_steps",`?process_id=eq.${proc.id}&order=step_order.asc`),
          api.get("documents",`?process_id=eq.${proc.id}&order=created_at.desc`),
          api.get("messages",`?process_id=eq.${proc.id}&order=created_at.asc`),
          api.get("meetings",`?process_id=eq.${proc.id}&order=date.asc`),
        ]);
        if(ss&&!ss.error) setSteps(ss);
        if(dd&&!dd.error) setDocs(dd);
        if(mm&&!mm.error) setMsgs(mm);
        if(mt&&!mt.error) setMeets(mt);
        setClients(cs=>cs.map(c=>c.id===client.id?{...c,proc,steps:ss,docs:dd,msgs:mm,meetings:mt}:c));
        if(initial&&!channel){
          channel=supabase.channel(`detail-${proc.id}`)
            .on('postgres_changes',{event:'*',schema:'public',table:'messages',filter:`process_id=eq.${proc.id}`},()=>load(false))
            .on('postgres_changes',{event:'*',schema:'public',table:'documents',filter:`process_id=eq.${proc.id}`},()=>load(false))
            .on('postgres_changes',{event:'*',schema:'public',table:'meetings',filter:`process_id=eq.${proc.id}`},()=>load(false))
            .subscribe();
        }
      }
      if(initial) setLdData(false);
    };
    load(true);
    return()=>{if(channel)supabase.removeChannel(channel);};
  },[cid]);

  if(!client) return null;
  const proc=client.proc;
  const done=steps.filter(s=>s.done).length;
  const pct=steps.length?Math.round(done/steps.length*100):0;

  if(ldData) return <div style={{marginTop:"4rem"}}><div className="ld"><Icon name="spin" size={28}/><span>Carregando dados do cliente…</span></div></div>;

  const toggleStep=async s=>{
    const r=await api.patch("process_steps",s.id,{done:!s.done});
    if(r[0]) setSteps(ss=>ss.map(x=>x.id===s.id?{...x,done:!s.done}:x));
    showToast("Etapa atualizada!");
  };
  const sendMsg=async()=>{
    if(!chatIn.trim()||!proc) return;
    const r=await api.post("messages",{process_id:proc.id,from_role:"lawyer",text:chatIn});
    if(r[0]) setMsgs(m=>[...m,r[0]]);
    setChatIn(""); showToast("Mensagem enviada!");
  };
  const addMeeting=async()=>{
    if(!mf.title||!mf.date||!proc) return;
    setSaving(true);
    const r=await api.post("meetings",{process_id:proc.id,...mf,status:"confirmado"});
    if(r[0]){
      setMeets(m=>[...m,r[0]]);
      await api.post("notifications",{client_id:client.id,text:`Reunião agendada para ${mf.date.split("-").reverse().join("/")} às ${mf.time}. Tipo: ${mf.type}.`,icon:"📅",read:false});
      showToast("Reunião agendada!");
    }
    setSaving(false); setShowMtg(false); setMf({title:"",date:"",time:"10:00",type:"presencial",notes:""});
  };
  const confirmMeet=async m=>{
    await api.patch("meetings",m.id,{status:"confirmado"});
    const updated={...m,status:"confirmado"};
    // Update local meetings state
    setMeets(ms=>ms.map(x=>x.id===m.id?updated:x));
    // Update global clients state so badge updates too
    setClients(cs=>cs.map(c=>c.id===client.id?{...c,meetings:(c.meetings||[]).map(x=>x.id===m.id?updated:x)}:c));
    await api.post("notifications",{client_id:client.id,text:`Reunião confirmada para ${m.date.split("-").reverse().join("/")} às ${m.time}.`,icon:"✅",read:false});
    // Ask Claude to create the Google Calendar event
    const msg = `Cria um evento no Google Calendar (bonoelacerda@gmail.com): Título: "📅 ${m.title} — ${client.name}", Data: ${m.date}T${m.time}:00, fuso horário Europe/Lisbon, duração 1 hora, descrição: "Cliente: ${client.name}\\nTipo: ${m.type}${m.notes?"\\nNotas: "+m.notes:""}", lembrete 30min popup e 60min email.`;
    if(window.sendPrompt) window.sendPrompt(msg);
    showToast("✅ Reunião confirmada!");
  };
  const delMeeting=async id=>{await api.del("meetings",id);setMeets(m=>m.filter(x=>x.id!==id));showToast("Reunião removida.");};
  const uploadDoc=async f=>{
    if(!f) return;
    if(!proc){showToast("Erro: processo não encontrado. Recarregue a página.");return;}
    if(f.size>20*1024*1024){showToast("Ficheiro demasiado grande. Máximo 20 MB.");return;}
    const path=`${proc.id}/${Date.now()}_${f.name}`;
    try{
      const ok=await api.upload(path,f);
      if(!ok){showToast("Erro ao enviar ficheiro. Verifique o formato e tente novamente.");return;}
      const r=await api.post("documents",{process_id:proc.id,name:f.name,size:`${(f.size/1024).toFixed(0)} KB`,date:new Date().toISOString().split("T")[0],status:"disponível",uploaded_by:"advogado",storage_path:path});
      if(r&&r[0]){setDocs(d=>[r[0],...d]);showToast(`"${f.name}" adicionado!`);}
      else{showToast("Ficheiro enviado mas erro ao registar. Tente novamente.");}
    }catch(e){console.error("Upload exception:",e);showToast("Erro de conexão ao enviar ficheiro.");}
  };
  const delDoc=async d=>{
    if(!confirm(`Eliminar "${d.name}"? Esta ação não pode ser desfeita.`)) return;
    try{
      if(d.storage_path){
        const safePath=d.storage_path.split("/").map(p=>encodeURIComponent(p)).join("/");
        await fetch(`${SUPA_URL}/storage/v1/object/documentos/${safePath}`,{method:"DELETE",headers:{apikey:SUPA_KEY,Authorization:`Bearer ${SUPA_KEY}`}});
      }
      await api.del("documents",d.id);
      setDocs(ds=>ds.filter(x=>x.id!==d.id));
      showToast(`"${d.name}" eliminado.`);
    }catch(e){console.error("Delete error:",e);showToast("Erro ao eliminar documento.");}
  };
  const notify=async()=>{
    await api.post("notifications",{client_id:client.id,text:"Nova atualização no seu processo. Acesse o portal para ver.",icon:"🔔",read:false});
    showToast("Notificação enviada!");
  };

  const pendentes=meets.filter(m=>m.status==="pendente");

  return(
    <div>
      <div className="tb">
        <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
          <button className="btn btn-gh" onClick={onBack}>← Voltar</button>
          <Av name={client.name} size={44}/>
          <div><h1 className="pt" style={{fontSize:"1.6rem"}}>{client.name}</h1>
          <p className="ps">{client.chave_acesso||client.email} · {client.whatsapp||client.phone||"—"}</p></div>
        </div>
        <div style={{display:"flex",gap:".6rem",alignItems:"center"}}>
          <StatusBadge s={proc?.status}/>
          <WhatsAppNotify client={client} proc={proc} showToast={showToast}/>
        </div>
      </div>

      <div className="card cp" style={{marginBottom:"1.25rem",display:"flex",gap:"2rem",flexWrap:"wrap",alignItems:"center"}}>
        {[
          ["Processo", proc?.number || client.chave_acesso || "—"],
          ["Artigo",   client.artigo || proc?.type || "—"],
          ["Protocolo",fmtd(proc?.opened_at) || "—"],
          ["Submissão IRN", proc?.submissao_irn || "—"],
          ["Local",    proc?.arquivo || "—"],
          ["Desde",    fmtd(client.since)],
        ].map(([k,v])=>(
          <div key={k}><div style={{fontSize:".7rem",textTransform:"uppercase",letterSpacing:".07em",color:"var(--mu)",marginBottom:3}}>{k}</div><div style={{fontWeight:600,fontSize:".85rem",maxWidth:220}}>{v}</div></div>
        ))}
        {client.pendencias&&(
          <div style={{background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:8,padding:".6rem .9rem"}}>
            <div style={{fontWeight:600,fontSize:".78rem",color:"#92400e"}}>⚠️ {client.pendencias}</div>
            {client.observacao&&<div style={{fontSize:".75rem",color:"#b45309",marginTop:2}}>{client.observacao}</div>}
          </div>
        )}
        <div style={{marginLeft:"auto",minWidth:160}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:".72rem",color:"var(--mu)"}}>Progresso</span><span style={{fontSize:".72rem",fontWeight:700}}>{pct}%</span></div>
          <div className="pw" style={{height:8}}><div className="pf" style={{width:`${pct}%`,height:8}}/></div>
        </div>
      </div>

      {/* Dados de Contacto — editável pelo advogado */}
      <ContactCard client={client} setClients={setClients} showToast={showToast}/>

      <div className="tabs">
        {[["processo","Processo"],["documentos","Documentos"],["reunioes","Reuniões"+(pendentes.length?` (${pendentes.length})`:"")],["chat","Chat"]].map(([id,label])=>(
          <button key={id} className={`tab${tab===id?" on":""}`} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>

      {tab==="processo"&&(
        <div className="card cp">
          <div className="ct">Etapas do Processo</div>
          <p style={{fontSize:".82rem",color:"var(--mu)",marginBottom:"1rem"}}>Clique no círculo para marcar/desmarcar.</p>
          {steps.map(s=>(
            <div className="sr" key={s.id}>
              <div className={`sc2${s.done?" dn":""}`} onClick={()=>toggleStep(s)}>{s.done&&<Icon name="check" size={12}/>}</div>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:".9rem",color:s.done?"var(--tx)":"var(--mu)"}}>{s.title}</div><div style={{fontSize:".75rem",color:"var(--mu)",marginTop:1}}>{s.date}</div></div>
              <span className={`bd${s.done?" bg":" bgr"}`}>{s.done?"Concluído":"Pendente"}</span>
            </div>
          ))}
          <button className="btn btn-dk" style={{marginTop:"1.25rem"}} onClick={notify}><Icon name="bell" size={15}/> Notificar cliente</button>
        </div>
      )}

      {tab==="documentos"&&(
        <div className="card cp">
          <div className="ct">Documentos</div>
          <div className="uz" onClick={()=>fileRef.current.click()}>
            <Icon name="upload" size={28}/>
            <div style={{fontWeight:600,marginTop:8,fontSize:".9rem"}}>Enviar documento ao cliente</div>
            <div style={{fontSize:".78rem",marginTop:4}}>PDF, DOC, JPG — até 20 MB</div>
            <input ref={fileRef} type="file" style={{display:"none"}} onChange={e=>uploadDoc(e.target.files[0])}/>
          </div>
          {docs.map(d=>(
            <div className="dr" key={d.id}>
              <div className="dic"><Icon name="file" size={16}/></div>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:".85rem"}}>{d.name}</div><div style={{fontSize:".73rem",color:"var(--mu)",marginTop:2}}>{d.size} · {d.date} · {d.uploaded_by==="advogado"?"Advogado":"Cliente"}</div></div>
              <span className={`bd${d.uploaded_by==="advogado"?" bb":" bg"}`}>{d.uploaded_by==="advogado"?"Advogado":"Cliente"}</span>
              {d.storage_path&&<button className="ib" style={{marginLeft:8}} onClick={async()=>{const url=await api.signedUrl(d.storage_path);if(url)window.open(url,"_blank");else showToast("Erro ao gerar link.");}} title="Download"><Icon name="upload" size={13}/></button>}
              <button className="ib" style={{marginLeft:4,color:"#ef4444"}} onClick={()=>delDoc(d)} title="Eliminar">🗑️</button>
            </div>
          ))}
          {!docs.length&&<p style={{textAlign:"center",color:"var(--mu)",padding:"1.5rem",fontSize:".85rem"}}>Nenhum documento ainda.</p>}
        </div>
      )}

      {tab==="reunioes"&&(
        <div className="card cp">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
            <div className="ct" style={{margin:0}}>Reuniões</div>
            <button className="btn btn-dk" onClick={()=>setShowMtg(true)}><Icon name="plus" size={15}/> Nova Reunião</button>
          </div>
          {pendentes.length>0&&(
            <div style={{background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:10,padding:".9rem 1.1rem",marginBottom:"1.25rem"}}>
              <div style={{fontWeight:600,fontSize:".85rem",color:"#92400e"}}>📬 {pendentes.length} pedido(s) do cliente aguardando confirmação</div>
              <div style={{fontSize:".78rem",color:"#b45309",marginTop:2}}>Clique em "✓ Confirmar" para criar o evento no Google Calendar automaticamente</div>
            </div>
          )}
          {!meets.length&&<p style={{textAlign:"center",color:"var(--mu)",padding:"2rem",fontSize:".85rem"}}>Nenhuma reunião agendada.</p>}
          {meets.map(m=>{
            const d=new Date((m.date||"")+"T12:00:00");
            const isPending=m.status==="pendente";
            return(
              <div className="mcard" key={m.id} style={{borderColor:isPending?"#fcd34d":"var(--bo)",background:isPending?"#fffbf0":"var(--bg)"}}>
                <div className="mdb"><div className="day">{d.getDate()}</div><div className="mon">{MONTHS[d.getMonth()]}</div></div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:".9rem"}}>{m.title}</div>
                  <div style={{fontSize:".78rem",color:"var(--mu)",marginTop:3}}>⏰ {m.time} · {m.type==="videochamada"?"📹 Video":m.type==="whatsapp"?"💬 WhatsApp":m.type==="presencial"?"📍 Presencial":"📞 Tel"}</div>
                  {m.notes&&<div style={{fontSize:".78rem",color:"var(--mu)",marginTop:4}}>📝 {m.notes}</div>}
                </div>
                <div style={{display:"flex",gap:".5rem",alignItems:"center"}}>
                  {isPending?(
                    <>
                      <button className="btn btn-ok" style={{fontSize:".78rem",padding:".4rem .9rem"}} onClick={()=>confirmMeet(m)}>✓ Confirmar + 📅</button>
                      <button className="ib d" onClick={async()=>{await api.patch("meetings",m.id,{status:"recusado"});setMeets(ms=>ms.map(x=>x.id===m.id?{...x,status:"recusado"}:x));}}><Icon name="close" size={13}/></button>
                    </>
                  ):(
                    <>
                      <span className={`bd${m.status==="confirmado"?" bg":m.status==="recusado"?" br":" bgr"}`}>{m.status==="confirmado"?"✓ Confirmado":m.status==="recusado"?"Recusado":m.status}</span>
                      <button className="ib d" onClick={()=>delMeeting(m.id)}><Icon name="trash" size={13}/></button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab==="chat"&&(
        <div className="card cp">
          <div className="ct">Chat com {client.name}</div>
          <div className="cw">
            <div className="cms">
              {msgs.map(m=>(
                <div key={m.id} className={`mr${m.from_role==="lawyer"?" mi":""}`}>
                  <div><div className={`mb${m.from_role==="lawyer"?" mi":" th"}`}>{m.text}</div>
                  <div className="mt2" style={{textAlign:m.from_role==="lawyer"?"right":"left"}}>{fmtt(m.created_at)}</div></div>
                </div>
              ))}
              {!msgs.length&&<p style={{textAlign:"center",color:"var(--mu)",padding:"2rem",fontSize:".85rem"}}>Nenhuma mensagem ainda.</p>}
              <div ref={botRef}/>
            </div>
            <div className="cir">
              <input className="cin" placeholder="Escreva uma mensagem para o cliente…" value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()}/>
              <button className="bsend" onClick={sendMsg}><Icon name="send" size={14}/></button>
            </div>
          </div>
        </div>
      )}

      {showMtg&&(
        <div className="ov" onClick={e=>e.target===e.currentTarget&&setShowMtg(false)}>
          <div className="mo">
            <div className="moh"><h2>Agendar Reunião</h2><button className="ib" onClick={()=>setShowMtg(false)}><Icon name="close" size={15}/></button></div>
            <div className="mob">
              <div className="ff"><label>Título *</label><input value={mf.title} onChange={e=>setMf(f=>({...f,title:e.target.value}))} placeholder="Ex: Alinhamento processual"/></div>
              <div className="fr">
                <div className="ff"><label>Data *</label><input type="date" value={mf.date} onChange={e=>setMf(f=>({...f,date:e.target.value}))}/></div>
                <div className="ff"><label>Hora</label><input type="time" value={mf.time} onChange={e=>setMf(f=>({...f,time:e.target.value}))}/></div>
              </div>
              <div className="ff"><label>Tipo</label>
                <select value={mf.type} onChange={e=>setMf(f=>({...f,type:e.target.value}))}>
                  <option value="presencial">📍 Presencial</option>
                  <option value="videochamada">📹 Videochamada</option>
                  <option value="telefone">📞 Telefone</option>
                  <option value="whatsapp">💬 WhatsApp</option>
                </select>
              </div>
              <div className="ff"><label>Notas</label><textarea value={mf.notes} onChange={e=>setMf(f=>({...f,notes:e.target.value}))}/></div>
            </div>
            <div className="mof">
              <button className="btn btn-gh" onClick={()=>setShowMtg(false)}>Cancelar</button>
              <button className="btn btn-dk" onClick={addMeeting} disabled={saving}>{saving?<><Icon name="spin" size={15}/>Agendando…</>:<><Icon name="check" size={15}/>Agendar + 📅</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CLIENTS SCREEN ────────────────────────────────────────────────────────────
function Clients({clients,setClients,showToast,openClient}){
  const [q,setQ]=useState("");
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:"",email:"",phone:"",cpf:"",type:"",pass:"123456"});
  const [busy,setBusy]=useState(false);
  const filtered=clients.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||(c.chave_acesso||"").includes(q)||(c.proc?.type||"").toLowerCase().includes(q.toLowerCase()));

  const save=async()=>{
    if(!form.name||!form.email) return;
    setBusy(true);
    const cl=await api.post("clients",{name:form.name,email:form.email,password:form.pass||"123456",phone:form.phone,cpf:form.cpf});
    if(cl[0]){
      const pr=await api.post("processes",{client_id:cl[0].id,number:`BL-${Date.now().toString().slice(-6)}`,type:form.type||"Processo Jurídico",status:"aguardando",current_step:1,lawyer:"Dr. Ramom Lacerda",lawyer_avatar:"RL"});
      if(pr[0]){
        const ss=["Análise Documental","Submissão do Requerimento","Entrevista / Análise","Aprovação","Emissão do Documento Final"];
        await Promise.all(ss.map((title,i)=>api.post("process_steps",{process_id:pr[0].id,step_order:i+1,title,detail:"Fase não iniciada.",done:false,date:"—"})));
        const steps=await api.get("process_steps",`?process_id=eq.${pr[0].id}&order=step_order.asc`);
        setClients(cs=>[...cs,{...cl[0],proc:pr[0],steps,docs:[],msgs:[],meetings:[]}]);
        showToast(`Cliente "${form.name}" cadastrado!`);
      }
    }
    setBusy(false); setShowAdd(false); setForm({name:"",email:"",phone:"",cpf:"",type:"",pass:"123456"});
  };

  return(
    <div>
      <div className="tb"><div><h1 className="pt">Clientes</h1><p className="ps">{clients.length} clientes cadastrados</p></div>
        <button className="btn btn-dk" onClick={()=>setShowAdd(true)}><Icon name="plus" size={16}/> Novo Cliente</button>
      </div>
      <div className="card cp">
        <div className="sw"><span className="si"><Icon name="search" size={16}/></span><input placeholder="Buscar por nome, chave ou tipo…" value={q} onChange={e=>setQ(e.target.value)}/></div>
        <table className="tbl">
          <thead><tr><th>Cliente</th><th>Chave / Email</th><th>Tipo</th><th>Status</th><th></th></tr></thead>
          <tbody>{filtered.map(c=>(
            <tr key={c.id}>
              <td><div style={{display:"flex",alignItems:"center",gap:".75rem"}}><Av name={c.name} size={34}/><div><div style={{fontWeight:600,fontSize:".88rem"}}>{c.name}</div></div></div></td>
              <td style={{fontSize:".82rem",color:"var(--mu)",letterSpacing:".05em"}}>{c.chave_acesso||c.email||"—"}</td>
              <td style={{fontSize:".85rem"}}>{c.proc?.type||"—"}</td>
              <td><StatusBadge s={c.proc?.status}/></td>
              <td><div style={{display:"flex",gap:".4rem"}}>
                <button className="btn btn-gh" style={{padding:".4rem .8rem",fontSize:".78rem"}} onClick={()=>openClient(c.id)}><Icon name="arrow" size={13}/> Abrir</button>
                <button className="ib d" onClick={async()=>{await api.del("clients",c.id);setClients(cs=>cs.filter(x=>x.id!==c.id));showToast("Removido.");}}><Icon name="trash" size={13}/></button>
              </div></td>
            </tr>
          ))}
          {!filtered.length&&<tr><td colSpan={5} style={{textAlign:"center",padding:"2rem",color:"var(--mu)",fontSize:".88rem"}}>Nenhum cliente encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
      {showAdd&&(
        <div className="ov" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="mo">
            <div className="moh"><h2>Novo Cliente</h2><button className="ib" onClick={()=>setShowAdd(false)}><Icon name="close" size={15}/></button></div>
            <div className="mob">
              <div className="fr"><div className="ff"><label>Nome *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div><div className="ff"><label>CPF/NIF</label><input value={form.cpf} onChange={e=>setForm(f=>({...f,cpf:e.target.value}))}/></div></div>
              <div className="fr"><div className="ff"><label>E-mail *</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div><div className="ff"><label>Telefone</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div></div>
              <div className="fr"><div className="ff"><label>Tipo de Processo</label><input placeholder="Ex: Nacionalidade Portuguesa" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}/></div><div className="ff"><label>Senha inicial</label><input value={form.pass} onChange={e=>setForm(f=>({...f,pass:e.target.value}))}/></div></div>
            </div>
            <div className="mof"><button className="btn btn-gh" onClick={()=>setShowAdd(false)}>Cancelar</button><button className="btn btn-dk" onClick={save} disabled={busy}>{busy?<><Icon name="spin" size={15}/>Salvando…</>:<><Icon name="check" size={15}/>Cadastrar</>}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ALL MEETINGS ──────────────────────────────────────────────────────────────
function AllMeetings({clients,openClient}){
  const [allMeets,setAllMeets]=useState([]);
  const [loading,setLoading]=useState(true);
  const procMap=useRef({});

  useEffect(()=>{
    const load=async(initial)=>{
      if(initial) setLoading(true);
      const meets=await api.get("meetings","?order=date.asc&limit=500");
      if(!meets||meets.error){if(initial)setLoading(false);return;}
      // Find process_ids we don't have mapped yet
      const unknown=[...new Set(meets.map(m=>m.process_id).filter(id=>id&&!procMap.current[id]))];
      if(unknown.length>0){
        const ps=await api.get("processes",`?id=in.(${unknown.join(",")})&select=id,client_id`);
        if(ps&&!ps.error) ps.forEach(p=>{procMap.current[p.id]=p.client_id;});
      }
      const enriched=meets.map(m=>{
        const cid=procMap.current[m.process_id]||null;
        const cl=cid?clients.find(c=>c.id===cid):null;
        return{...m,clientName:cl?cl.name:"—",clientId:cid};
      });
      setAllMeets(enriched);
      if(initial) setLoading(false);
    };
    load(true);
    const ch=supabase.channel('all-meetings')
      .on('postgres_changes',{event:'*',schema:'public',table:'meetings'},()=>load(false))
      .subscribe();
    return()=>supabase.removeChannel(ch);
  },[clients]);

  const pendentes=allMeets.filter(m=>m.status==="pendente");
  return(
    <div>
      <div className="tb"><div><h1 className="pt">Todas as Reuniões</h1><p className="ps">{allMeets.length} reuniões · {pendentes.length} pendentes</p></div></div>
      {pendentes.length>0&&<div style={{background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:12,padding:"1rem 1.25rem",marginBottom:"1.25rem"}}><div style={{fontWeight:600,fontSize:".9rem",color:"#92400e"}}>📬 {pendentes.length} pedido(s) aguardando — abra o cliente para confirmar</div></div>}
      <div className="card cp">
        {loading&&<div className="ld"><Icon name="spin" size={22}/><span>Carregando reuniões…</span></div>}
        {!loading&&!allMeets.length&&<p style={{textAlign:"center",color:"var(--mu)",padding:"3rem",fontSize:".88rem"}}>Nenhuma reunião ainda.</p>}
        {!loading&&allMeets.map(m=>{const d=new Date((m.date||"")+"T12:00:00");return(
          <div className="mcard" key={m.id} style={{borderColor:m.status==="pendente"?"#fcd34d":"var(--bo)",background:m.status==="pendente"?"#fffbf0":"var(--bg)"}}>
            <div className="mdb"><div className="day">{d.getDate()}</div><div className="mon">{MONTHS[d.getMonth()]}</div></div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:".9rem"}}>{m.title}</div>
              <div style={{fontSize:".78rem",color:"var(--mu)",marginTop:3}}>👤 {m.clientId?<strong onClick={()=>openClient&&openClient(m.clientId)} style={{cursor:"pointer",color:"#2563eb",textDecoration:"underline"}}>{m.clientName}</strong>:<strong>{m.clientName}</strong>} · ⏰ {m.time} · {m.type==="videochamada"?"📹":m.type==="whatsapp"?"💬":m.type==="presencial"?"📍":"📞"} {m.type}</div>
              {m.notes&&<div style={{fontSize:".78rem",color:"var(--mu)",marginTop:4}}>📝 {m.notes}</div>}
            </div>
            <span className={`bd${m.status==="confirmado"?" bg":m.status==="pendente"?" ba":" br"}`}>{m.status==="confirmado"?"✓ Confirmado":m.status==="pendente"?"⏳ Pendente":"Recusado"}</span>
          </div>
        );})}
      </div>
    </div>
  );
}

// ── ALL DOCUMENTS ────────────────────────────────────────────────────────────
function AllDocuments({clients,showToast,openClient}){
  const [allDocs,setAllDocs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("todos");
  const procMap=useRef({});

  useEffect(()=>{
    const load=async(initial)=>{
      if(initial) setLoading(true);
      const docs=await api.get("documents","?order=created_at.desc&limit=500");
      if(!docs||docs.error){if(initial)setLoading(false);return;}
      const unknown=[...new Set(docs.map(d=>d.process_id).filter(id=>id&&!procMap.current[id]))];
      if(unknown.length>0){
        const ps=await api.get("processes",`?id=in.(${unknown.join(",")})&select=id,client_id`);
        if(ps&&!ps.error) ps.forEach(p=>{procMap.current[p.id]=p.client_id;});
      }
      const enriched=docs.map(d=>{
        const cid=procMap.current[d.process_id]||null;
        const cl=cid?clients.find(c=>c.id===cid):null;
        return{...d,clientName:cl?cl.name:"—",clientId:cid};
      });
      setAllDocs(enriched);
      if(initial) setLoading(false);
    };
    load(true);
    const ch=supabase.channel('all-documents')
      .on('postgres_changes',{event:'*',schema:'public',table:'documents'},()=>load(false))
      .subscribe();
    return()=>supabase.removeChannel(ch);
  },[clients]);

  const filtered=filter==="todos"?allDocs:filter==="cliente"?allDocs.filter(d=>d.uploaded_by==="cliente"):allDocs.filter(d=>d.uploaded_by==="advogado");
  const aguardando=allDocs.filter(d=>d.uploaded_by==="cliente"&&d.status==="aguardando").length;

  return(
    <div>
      <div className="tb"><div><h1 className="pt">Todos os Documentos</h1><p className="ps">{allDocs.length} documentos · {aguardando} aguardando revisão</p></div></div>
      {aguardando>0&&<div style={{background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:12,padding:"1rem 1.25rem",marginBottom:"1.25rem"}}><div style={{fontWeight:600,fontSize:".9rem",color:"#92400e"}}>📬 {aguardando} documento(s) enviados por clientes aguardando revisão</div></div>}
      <div style={{display:"flex",gap:".5rem",marginBottom:"1.25rem"}}>
        {["todos","cliente","advogado"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`btn${filter===f?" btn-dk":" btn-gh"}`} style={{padding:".5rem 1rem",fontSize:".8rem"}}>
            {f==="todos"?"📋 Todos":f==="cliente"?"👤 Do Cliente":"⚖️ Do Advogado"}
          </button>
        ))}
      </div>
      <div className="card cp">
        {loading&&<div className="ld"><Icon name="spin" size={22}/><span>Carregando documentos…</span></div>}
        {!loading&&!filtered.length&&<p style={{textAlign:"center",color:"var(--mu)",padding:"3rem",fontSize:".88rem"}}>Nenhum documento encontrado.</p>}
        {!loading&&filtered.map(d=>(
          <div key={d.id} className="mcard" style={{borderColor:d.uploaded_by==="cliente"&&d.status==="aguardando"?"#fcd34d":"var(--bo)",background:d.uploaded_by==="cliente"&&d.status==="aguardando"?"#fffbf0":"var(--bg)"}}>
            <div className="mdb" style={{background:d.uploaded_by==="cliente"?"#dbeafe":"#f0fdf4",borderColor:d.uploaded_by==="cliente"?"#93c5fd":"#86efac"}}>
              <div className="day" style={{fontSize:"1.2rem"}}>📄</div>
              <div className="mon">{d.uploaded_by==="cliente"?"CLI":"ADV"}</div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:".9rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.name}</div>
              <div style={{fontSize:".78rem",color:"var(--mu)",marginTop:3}}>👤 {d.clientId?<strong onClick={()=>openClient&&openClient(d.clientId)} style={{cursor:"pointer",color:"#2563eb",textDecoration:"underline"}}>{d.clientName}</strong>:<strong>{d.clientName}</strong>} · 📦 {d.size} · 📅 {d.date}</div>
            </div>
            <span className={`bd${d.uploaded_by==="cliente"?" ba":" bg"}`}>{d.uploaded_by==="cliente"?"👤 Cliente":"⚖️ Advogado"}</span>
            {d.storage_path&&<button className="ib" style={{marginLeft:8}} onClick={async()=>{const url=await api.signedUrl(d.storage_path);if(url)window.open(url,"_blank");else showToast("Erro ao gerar link.");}} title="Download"><Icon name="upload" size={13}/></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ALL CHATS ────────────────────────────────────────────────────────────────
function AllChats({clients,openClient,showToast}){
  const [allMsgs,setAllMsgs]=useState([]);
  const [loading,setLoading]=useState(true);
  const procMap=useRef({});

  useEffect(()=>{
    const load=async(initial)=>{
      if(initial) setLoading(true);
      const msgs=await api.get("messages","?from_role=eq.client&order=created_at.desc&limit=200");
      if(!msgs||msgs.error){if(initial)setLoading(false);return;}
      const unknown=[...new Set(msgs.map(m=>m.process_id).filter(id=>id&&!procMap.current[id]))];
      if(unknown.length>0){
        const ps=await api.get("processes",`?id=in.(${unknown.join(",")})&select=id,client_id`);
        if(ps&&!ps.error) ps.forEach(p=>{procMap.current[p.id]=p.client_id;});
      }
      // Group by client — show latest message per client
      const byClient={};
      msgs.forEach(m=>{
        const cid=procMap.current[m.process_id]||null;
        if(cid&&!byClient[cid]) byClient[cid]=m;
      });
      const grouped=Object.entries(byClient).map(([cid,m])=>{
        const cl=clients.find(c=>c.id===cid);
        return{...m,clientName:cl?cl.name:"—",clientId:cid};
      }).sort((a,b)=>(b.created_at||"").localeCompare(a.created_at||""));
      setAllMsgs(grouped);
      if(initial) setLoading(false);
    };
    load(true);
    const iv=setInterval(()=>load(false),10000);
    return()=>clearInterval(iv);
  },[clients]);

  return(
    <div>
      <div className="tb"><div><h1 className="pt">Mensagens de Clientes</h1><p className="ps">{allMsgs.length} conversa(s) com mensagens recentes</p></div></div>
      <div className="card cp">
        {loading&&<div className="ld"><Icon name="spin" size={22}/><span>Carregando mensagens…</span></div>}
        {!loading&&!allMsgs.length&&<p style={{textAlign:"center",color:"var(--mu)",padding:"3rem",fontSize:".88rem"}}>Nenhuma mensagem de clientes ainda.</p>}
        {!loading&&allMsgs.map(m=>(
          <div className="mcard" key={m.id} style={{cursor:"pointer"}} onClick={()=>openClient&&openClient(m.clientId)}>
            <div className="mdb" style={{background:"#dbeafe",borderColor:"#93c5fd"}}>
              <div className="day" style={{fontSize:"1.2rem"}}>💬</div>
              <div className="mon">MSG</div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <strong style={{cursor:"pointer",color:"#2563eb",textDecoration:"underline",fontSize:".9rem"}}>{m.clientName}</strong>
              </div>
              <div style={{fontSize:".82rem",color:"var(--mu)",marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>"{m.text}"</div>
              <div style={{fontSize:".72rem",color:"var(--mu)",marginTop:3}}>📅 {fmtd(m.created_at)} · ⏰ {fmtt(m.created_at)}</div>
            </div>
            <span className="bd ba">Abrir Chat →</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App(){
  const [auth,setAuth]=useState(false);
  const [tab,setTab]=useState("dash");
  const [clients,setClients]=useState([]);
  const [loading,setLoading]=useState(false);
  const [openC,setOpenC]=useState(null);
  const [toast,setToast]=useState(null);
  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(null),3500);};

  const loadClients=async()=>{
    setLoading(true);
    try{
      // Supabase limit is now 10000 — single query gets all clients
      const allClients=await api.get("clients","?order=created_at.desc&limit=10000");
      if(!allClients||allClients.error){showToast("Erro ao carregar clientes.");setLoading(false);return;}
      // Set clients immediately so count shows
      setClients(allClients.map(c=>({...c,proc:null,steps:[],docs:[],msgs:[],meetings:[]})));
      // Then enrich first 200 with process data in background
      const enriched=await Promise.all(allClients.map(async(c,i)=>{
        if(i>=200) return{...c,proc:null,steps:[],docs:[],msgs:[],meetings:[]};
        const procs=await api.get("processes",`?client_id=eq.${c.id}&limit=1`);
        const proc=procs[0]||null;
        return{...c,proc,steps:[],docs:[],msgs:[],meetings:[]};
      }));
      setClients(enriched);
    }catch(e){showToast("Erro ao carregar dados: "+e.message);}
    setLoading(false);
  };

  const [newDocs,setNewDocs]=useState(0);
  const [pendentes,setPendentes]=useState(0);
  const [newMsgs,setNewMsgs]=useState(0);
  const seenMeetRef=useRef(0);
  const tabRef=useRef("dash");
  const clientsRef=useRef([]);
  useEffect(()=>{tabRef.current=tab;},[tab]);
  useEffect(()=>{clientsRef.current=clients;},[clients]);

  const onLogin=()=>{setAuth(true);loadClients();};

  // Realtime: notificações globais em tempo real (sem polling)
  useEffect(()=>{
    if(!auth) return;
    // Verificação inicial de reuniões pendentes
    api.get("meetings","?status=eq.pendente&select=id").then(r=>{
      if(r&&!r.error) seenMeetRef.current=r.length;
    });
    const ch=supabase.channel('global-notifs')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'documents',filter:'uploaded_by=eq.cliente'},(payload)=>{
        setNewDocs(n=>n+1);
        const cl=clientsRef.current.find(c=>c.proc&&c.proc.id===payload.new.process_id);
        showToast(`📄 Novo documento de ${cl?cl.name:"cliente"}: "${payload.new.name}"`);
      })
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'from_role=eq.client'},()=>{
        setNewMsgs(n=>n+1);
        showToast(`💬 Nova mensagem de cliente`);
      })
      .on('postgres_changes',{event:'*',schema:'public',table:'meetings'},async()=>{
        const r=await api.get("meetings","?status=eq.pendente&select=id");
        if(r&&!r.error){
          const total=r.length;
          const newOnes=total-seenMeetRef.current;
          if(tabRef.current!=="meetings") setPendentes(newOnes>0?newOnes:0);
          else seenMeetRef.current=total;
        }
      })
      .subscribe();
    return()=>supabase.removeChannel(ch);
  },[auth]);

  const nav=[
    {id:"dash",label:"Painel Geral",ic:"dash"},
    {id:"clients",label:"Clientes",ic:"users",badge:clients.length},
    {id:"documents",label:"Documentos",ic:"file",badge:newDocs||undefined},
    {id:"meetings",label:"Reuniões",ic:"cal",badge:pendentes||undefined},
    {id:"chat",label:"Chat",ic:"chat",badge:newMsgs||undefined},
  ];

  if(!auth) return<><style>{css}</style><Login onLogin={onLogin}/></>;

  return(
    <>
      <style>{css}</style>
      <div className="al">
        <aside className="sb">
          <div className="sbb"><h2>Bono & Lacerda</h2><span>Painel Administrativo</span></div>
          <div className="sbw"><div className="av" style={{width:36,height:36,fontSize:".78rem"}}>RL</div>
            <div>
              <div className="wn">Dr. Ramom Lacerda</div>
              <div className="wr">OAB/PB 19.165 · 🇵🇹 Lisboa 65899L · 🇪🇸 Madrid 142952</div>
            </div>
          </div>
          <nav className="sbnv">
            {nav.map(n=>(
              <div key={n.id} className={`ni${tab===n.id&&!openC?" on":""}`} onClick={()=>{setTab(n.id);setOpenC(null);if(n.id==="documents")setNewDocs(0);if(n.id==="meetings"){setPendentes(0);api.get("meetings","?status=eq.pendente&select=id").then(r=>{if(r&&!r.error)seenMeetRef.current=r.length;});}if(n.id==="chat")setNewMsgs(0);}}>
                <Icon name={n.ic} size={16}/>{n.label}
                {n.badge>0&&<span className="nbdg">{n.badge}</span>}
              </div>
            ))}
          </nav>
          <div className="sbft"><button className="out" onClick={()=>{setAuth(false);setClients([]);}}><Icon name="logout" size={15}/>Sair</button></div>
        </aside>
        <main className="mc">
          {loading?<div className="ld"><Icon name="spin" size={28}/><span>Carregando {clients.length} clientes…</span></div>:
          openC?<Detail cid={openC} clients={clients} setClients={setClients} showToast={showToast} onBack={()=>setOpenC(null)}/>:
          tab==="dash"?<Dash clients={clients}/>:
          tab==="clients"?<Clients clients={clients} setClients={setClients} showToast={showToast} openClient={id=>setOpenC(id)}/>:
          tab==="documents"?<AllDocuments clients={clients} showToast={showToast} openClient={id=>setOpenC(id)}/>:
          tab==="meetings"?<AllMeetings clients={clients} openClient={id=>setOpenC(id)}/>:
          tab==="chat"?<AllChats clients={clients} openClient={id=>setOpenC(id)} showToast={showToast}/>:null}
        </main>
      </div>
      {toast&&<Toast msg={toast} onClose={()=>setToast(null)}/>}
    </>
  );
}

// ── CLAUDE CHAT ───────────────────────────────────────────────────────────────
function ClaudeChat({ totalClients }) {
  const [open,  setOpen]  = useState(false);
  const [msgs,  setMsgs]  = useState([
    { role:"assistant", text:"Olá! Sou o Claude, o assistente de IA do escritório Bono & Lacerda. Posso ajudá-lo com actualizações do sistema, dúvidas sobre clientes, geração de documentos ou qualquer outra questão. Como posso ajudar?" }
  ]);
  const [input, setInput] = useState("");
  const [ld,    setLd]    = useState(false);
  const bot = useRef();

  useEffect(() => { bot.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const send = async () => {
    const txt = input.trim();
    if (!txt || ld) return;
    setInput("");
    const newMsgs = [...msgs, { role:"user", text:txt }];
    setMsgs(newMsgs);
    setLd(true);
    try {
      const context = `És o assistente de IA do escritório de advocacia Bono & Lacerda Advogados, especializado em imigração e nacionalidade portuguesa. O sistema tem actualmente ${totalClients} clientes cadastrados. Responde sempre em português europeu, de forma profissional e concisa.`;
      const history = newMsgs.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const r = await fetch("https://jrkreiidaxadwryjhdzu.supabase.co/functions/v1/claude-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: context,
          messages: history,
        })
      });
      const d = await r.json();
      const reply = d.content?.[0]?.text || "Desculpe, não consegui processar a sua mensagem.";
      setMsgs(m => [...m, { role:"assistant", text:reply }]);
    } catch(e) {
      setMsgs(m => [...m, { role:"assistant", text:"Erro de ligação. Por favor tente novamente." }]);
    }
    setLd(false);
  };

  return (
    <>
      <style>{`
        .cl-btn { position:fixed; bottom:2rem; left:2rem; width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#1d3557,#c9a84c); border:none; cursor:pointer; box-shadow:0 4px 20px rgba(15,30,53,.35); display:flex; align-items:center; justify-content:center; z-index:1000; transition:transform .2s; }
        .cl-btn:hover { transform:scale(1.08); }
        .cl-win { position:fixed; bottom:5.5rem; left:2rem; width:360px; max-height:520px; background:#fff; border-radius:20px; box-shadow:0 8px 40px rgba(15,30,53,.2); display:flex; flex-direction:column; z-index:1000; overflow:hidden; border:1px solid #e2ddd5; animation:up .2s ease; }
        .cl-hdr { background:linear-gradient(135deg,#0f1e35,#1d3557); padding:1rem 1.25rem; display:flex; align-items:center; gap:.75rem; }
        .cl-av  { width:36px; height:36px; border-radius:50%; background:rgba(201,168,76,.2); border:1px solid rgba(201,168,76,.4); display:flex; align-items:center; justify-content:center; font-size:.75rem; font-weight:700; color:#c9a84c; flex-shrink:0; }
        .cl-hdr-info h4 { color:#fff; font-size:.88rem; font-weight:600; }
        .cl-hdr-info p  { color:rgba(255,255,255,.5); font-size:.72rem; }
        .cl-msgs { flex:1; overflow-y:auto; padding:1rem; display:flex; flex-direction:column; gap:.75rem; min-height:200px; max-height:340px; }
        .cl-msg  { display:flex; gap:.5rem; }
        .cl-msg.usr { flex-direction:row-reverse; }
        .cl-bbl  { max-width:80%; padding:.65rem .9rem; border-radius:14px; font-size:.84rem; line-height:1.5; }
        .cl-bbl.ai  { background:#f5f0e8; color:#1a1a2e; border-radius:4px 14px 14px 14px; }
        .cl-bbl.usr { background:#1d3557; color:#fff; border-radius:14px 4px 14px 14px; }
        .cl-inp { padding:.75rem 1rem; border-top:1px solid #e2ddd5; display:flex; gap:.5rem; }
        .cl-inp textarea { flex:1; border:1px solid #e2ddd5; border-radius:10px; padding:.5rem .75rem; font-family:'DM Sans',sans-serif; font-size:.84rem; resize:none; outline:none; color:#1a1a2e; background:#fafafa; }
        .cl-inp textarea:focus { border-color:#c9a84c; }
        .cl-send { width:36px; height:36px; border-radius:10px; background:#1d3557; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; transition:background .2s; }
        .cl-send:hover { background:#0f1e35; }
        .cl-dot  { display:inline-flex; gap:3px; padding:.5rem; }
        .cl-dot span { width:6px; height:6px; border-radius:50%; background:#c9a84c; animation:bounce .8s infinite; }
        .cl-dot span:nth-child(2) { animation-delay:.15s; }
        .cl-dot span:nth-child(3) { animation-delay:.3s; }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @media(max-width:768px){ .cl-win{width:calc(100vw - 2rem);left:1rem;bottom:5rem;} .cl-btn{bottom:5rem;left:1rem;} }
      `}</style>

      {/* Toggle button */}
      <button className="cl-btn" onClick={() => setOpen(o => !o)} title="Chat com Claude AI">
        {open
          ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.06L2 22l4.94-1.37A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/><circle cx="8" cy="12" r="1" fill="#fff"/><circle cx="12" cy="12" r="1" fill="#fff"/><circle cx="16" cy="12" r="1" fill="#fff"/></svg>
        }
      </button>

      {/* Chat window */}
      {open && (
        <div className="cl-win">
          <div className="cl-hdr">
            <div className="cl-av">AI</div>
            <div className="cl-hdr-info">
              <h4>Claude AI</h4>
              <p>Assistente Bono & Lacerda · {totalClients} clientes</p>
            </div>
          </div>
          <div className="cl-msgs">
            {msgs.map((m, i) => (
              <div key={i} className={`cl-msg${m.role==="user"?" usr":""}`}>
                <div className={`cl-bbl${m.role==="user"?" usr":" ai"}`}>{m.text}</div>
              </div>
            ))}
            {ld && (
              <div className="cl-msg">
                <div className="cl-bbl ai">
                  <div className="cl-dot"><span/><span/><span/></div>
                </div>
              </div>
            )}
            <div ref={bot}/>
          </div>
          <div className="cl-inp">
            <textarea
              rows={2}
              placeholder="Escreva a sua mensagem…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(); } }}
            />
            <button className="cl-send" onClick={send} disabled={ld}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
