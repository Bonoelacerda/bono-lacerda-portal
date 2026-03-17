import { useState, useEffect, useRef } from "react";

const SUPA_URL = "https://jrkreiidaxadwryjhdzu.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impya3JlaWlkYXhhZHdyeWpoZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3Nzk3NTIsImV4cCI6MjA4OTM1NTc1Mn0.37Izlz1YVZlZadgXiL5xZC8ZofT3tob1VGPUr5m19jM";
const H = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json" };

const db = {
  get: (t, q="") => fetch(`${SUPA_URL}/rest/v1/${t}${q}`, { headers: H }).then(r => r.json()),
  post: (t, b) => fetch(`${SUPA_URL}/rest/v1/${t}`, { method:"POST", headers:{...H, Prefer:"return=representation"}, body:JSON.stringify(b) }).then(r => r.json()),
  patch: (t, id, b) => fetch(`${SUPA_URL}/rest/v1/${t}?id=eq.${id}`, { method:"PATCH", headers:{...H, Prefer:"return=representation"}, body:JSON.stringify(b) }).then(r => r.json()),
};

const MO = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes rin{from{transform:translateX(80px);opacity:0}to{transform:translateX(0);opacity:1}}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--n:#0f1e35;--nl:#1d3557;--g:#c9a84c;--gd:rgba(201,168,76,.12);--cr:#f5f0e8;--cd:#ede6d8;--tx:#1a1a2e;--mu:#6b7b9a;--bo:#e2ddd5;--ok:#16a34a;--er:#dc2626;--sh:0 4px 24px rgba(15,30,53,.10)}
body{font-family:'DM Sans',sans-serif;background:var(--cr);color:var(--tx);min-height:100vh}
/* LOGIN */
.lw{min-height:100vh;display:flex}
.ll{width:42%;background:var(--n);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:3rem;position:relative;overflow:hidden}
.ll::before{content:'';position:absolute;width:400px;height:400px;border-radius:50%;border:1px solid rgba(201,168,76,.15);top:-100px;left:-100px}
.ll::after{content:'';position:absolute;width:300px;height:300px;border-radius:50%;border:1px solid rgba(201,168,76,.10);bottom:-80px;right:-80px}
.logo{display:flex;flex-direction:column;align-items:center;gap:1rem;z-index:1}
.logo-ic{width:64px;height:64px;background:var(--gd);border:1px solid var(--g);border-radius:16px;display:flex;align-items:center;justify-content:center;color:var(--g)}
.logo h1{font-family:'Playfair Display',serif;color:#fff;font-size:1.8rem;text-align:center;line-height:1.2}
.logo p{color:rgba(255,255,255,.5);font-size:.85rem;letter-spacing:.1em;text-transform:uppercase;text-align:center}
.ltag{margin-top:3rem;color:rgba(255,255,255,.35);font-size:.8rem;text-align:center;line-height:1.8;z-index:1}
.lr{flex:1;display:flex;align-items:center;justify-content:center;padding:3rem}
.lc{width:100%;max-width:400px;animation:up .4s ease}
.lc h2{font-family:'Playfair Display',serif;font-size:2rem;color:var(--n);margin-bottom:.4rem}
.lc>p{color:var(--mu);margin-bottom:2rem;font-size:.9rem}
.fg{margin-bottom:1.2rem}
.fg label{display:block;font-size:.8rem;font-weight:600;color:var(--n);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem}
.fg input{width:100%;padding:.85rem 1rem;border:1.5px solid var(--bo);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.95rem;background:#fff;color:var(--tx);transition:border-color .2s;outline:none}
.fg input:focus{border-color:var(--g)}
.btnp{width:100%;padding:.9rem;background:var(--n);color:#fff;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.95rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.5rem;transition:background .2s}
.btnp:hover{background:var(--nl)}
.btnp:disabled{opacity:.7;cursor:not-allowed}
.errmsg{color:var(--er);font-size:.82rem;margin-top:.8rem;text-align:center}
/* LAYOUT */
.al{display:flex;min-height:100vh}
.sb{width:260px;background:var(--n);display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:100}
.sbl{padding:1.8rem 1.5rem 1.4rem;border-bottom:1px solid rgba(255,255,255,.07)}
.sbl h2{font-family:'Playfair Display',serif;color:#fff;font-size:1.1rem;line-height:1.3}
.sbl span{color:var(--g);font-size:.75rem;display:block;letter-spacing:.08em}
.sbu{padding:1.2rem 1.5rem;display:flex;align-items:center;gap:.75rem;border-bottom:1px solid rgba(255,255,255,.07)}
.av{width:38px;height:38px;border-radius:50%;background:var(--g);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;color:var(--n);flex-shrink:0}
.av.sm{width:30px;height:30px;font-size:.7rem}
.av.lg{width:48px;height:48px;font-size:1rem}
.sbn{font-size:.88rem;font-weight:600;color:#fff}
.sbs{font-size:.75rem;color:rgba(255,255,255,.4)}
.sbnav{flex:1;padding:1rem 0}
.ni{display:flex;align-items:center;gap:.75rem;padding:.75rem 1.5rem;color:rgba(255,255,255,.55);font-size:.88rem;font-weight:500;cursor:pointer;transition:all .15s;border-left:3px solid transparent}
.ni:hover{color:#fff;background:rgba(255,255,255,.04)}
.ni.on{color:var(--g);border-left-color:var(--g);background:rgba(201,168,76,.07)}
.sbf{padding:1rem 1.5rem 1.5rem;border-top:1px solid rgba(255,255,255,.07)}
.out{display:flex;align-items:center;gap:.6rem;color:rgba(255,255,255,.4);font-size:.85rem;cursor:pointer;background:none;border:none;font-family:'DM Sans',sans-serif}
.out:hover{color:rgba(255,255,255,.8)}
.mc{margin-left:260px;flex:1;padding:2.5rem;min-height:100vh;animation:up .3s ease}
/* PAGE */
.ph h1{font-family:'Playfair Display',serif;font-size:1.75rem;color:var(--n)}
.ph p{color:var(--mu);font-size:.9rem;margin-top:.25rem;margin-bottom:2rem}
.card{background:#fff;border-radius:16px;padding:1.5rem;box-shadow:var(--sh);border:1px solid var(--bo)}
.ct{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--n);margin-bottom:1rem}
/* STAT */
.dg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.25rem;margin-bottom:1.5rem}
.sc{background:#fff;border-radius:14px;padding:1.25rem 1.5rem;border:1px solid var(--bo);box-shadow:var(--sh)}
.sl{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:var(--mu);margin-bottom:.4rem}
.sv{font-family:'Playfair Display',serif;font-size:1.5rem;color:var(--n)}
.ss{font-size:.78rem;color:var(--mu);margin-top:.2rem}
.pb{background:var(--cd);border-radius:99px;height:6px;margin-top:.5rem}
.pbf{height:6px;border-radius:99px;background:linear-gradient(90deg,var(--n),var(--g));transition:width .5s}
/* BADGES */
.bd{display:inline-block;padding:.2rem .65rem;border-radius:20px;font-size:.72rem;font-weight:600}
.bg{background:#e8faf2;color:#1a8a4a} .ba{background:var(--gd);color:#7a6020} .bb{background:#e8f0ff;color:#2952c5}
/* TIMELINE */
.tl{position:relative;padding-left:2rem}
.tl::before{content:'';position:absolute;left:10px;top:0;bottom:0;width:2px;background:var(--cd)}
.ti{position:relative;padding-bottom:1.75rem}
.ti:last-child{padding-bottom:0}
.td{position:absolute;left:-2rem;top:2px;width:22px;height:22px;border-radius:50%;border:2px solid var(--bo);background:#fff;display:flex;align-items:center;justify-content:center}
.td.dn{background:var(--n);border-color:var(--n);color:#fff}
.td.ac{background:var(--g);border-color:var(--g);box-shadow:0 0 0 4px rgba(201,168,76,.2)}
.tit{font-weight:600;font-size:.9rem;color:var(--n)}
.tit.mu{color:var(--mu);font-weight:400}
.tdt{font-size:.78rem;color:var(--mu);margin-top:.15rem}
.tde{font-size:.82rem;color:var(--mu);margin-top:.3rem;background:var(--cr);padding:.5rem .75rem;border-radius:6px}
/* DOCS */
.dl{display:flex;flex-direction:column;gap:.75rem}
.dit{display:flex;align-items:center;gap:1rem;padding:1rem 1.25rem;background:var(--cr);border-radius:10px;border:1px solid var(--bo)}
.dic{width:38px;height:38px;background:var(--n);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--g);flex-shrink:0}
.dn2{font-weight:600;font-size:.88rem;color:var(--n);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dm{font-size:.75rem;color:var(--mu);margin-top:.1rem}
.ib{width:32px;height:32px;border-radius:8px;border:1.5px solid var(--bo);background:#fff;display:flex;align-items:center;justify-content:center;color:var(--mu);cursor:pointer;transition:all .15s}
.ib:hover{border-color:var(--g);color:var(--g)}
.uz{border:2px dashed var(--bo);border-radius:12px;padding:2.5rem;text-align:center;cursor:pointer;transition:all .2s;color:var(--mu)}
.uz:hover{border-color:var(--g);background:var(--gd);color:var(--n)}
.uz h3{font-size:.95rem;font-weight:600;margin:.75rem 0 .3rem}
.uz p{font-size:.8rem}
/* NOTIFS */
.nl2{display:flex;flex-direction:column;gap:.75rem}
.ni2{display:flex;gap:1rem;padding:1rem 1.25rem;border-radius:12px;border:1px solid var(--bo);background:#fff}
.ni2.u{background:#fffbf0;border-color:rgba(201,168,76,.3)}
.ntx{font-size:.88rem;color:var(--n);font-weight:500}
.ntm{font-size:.75rem;color:var(--mu);margin-top:.2rem}
.ud{width:8px;height:8px;background:var(--g);border-radius:50%;flex-shrink:0;margin-top:6px}
/* CHAT */
.cw{display:flex;flex-direction:column;height:calc(100vh - 230px);min-height:380px}
.che{display:flex;align-items:center;gap:.75rem;padding-bottom:1rem;border-bottom:1px solid var(--bo);margin-bottom:1rem}
.chi h3{font-weight:600;font-size:.92rem;color:var(--n)}
.chi p{font-size:.75rem;color:var(--ok)}
.cms{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:.9rem;padding-right:.25rem}
.mr{display:flex;gap:.6rem;align-items:flex-end}
.mr.mi{flex-direction:row-reverse}
.mb{max-width:68%;padding:.75rem 1rem;border-radius:16px;font-size:.88rem;line-height:1.5}
.mb.th{background:var(--cr);color:var(--tx);border-bottom-left-radius:4px}
.mb.mi{background:var(--n);color:#fff;border-bottom-right-radius:4px}
.mtime{font-size:.7rem;color:var(--mu);margin-top:.2rem}
.cir{display:flex;gap:.75rem;padding-top:1rem;border-top:1px solid var(--bo)}
.cin{flex:1;padding:.75rem 1rem;border:1.5px solid var(--bo);border-radius:12px;font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;resize:none;color:var(--tx)}
.cin:focus{border-color:var(--g)}
.bsend{width:44px;height:44px;background:var(--n);border:none;border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--g);cursor:pointer;flex-shrink:0}
.bsend:hover{background:var(--nl)}
/* MEETINGS */
.mcard{border:1px solid var(--bo);border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;gap:1rem;margin-bottom:.75rem;background:var(--cr)}
.mdb{background:var(--n);color:#fff;border-radius:10px;width:52px;text-align:center;padding:.5rem 0;flex-shrink:0}
.mdb .day{font-family:'Playfair Display',serif;font-size:1.6rem;line-height:1}
.mdb .mon{font-size:.65rem;text-transform:uppercase;letter-spacing:.06em;opacity:.7;margin-top:2px}
/* UTILS */
.ld{display:flex;align-items:center;justify-content:center;min-height:200px;flex-direction:column;gap:1rem;color:var(--mu);font-size:.9rem}
.toast{position:fixed;bottom:2rem;right:2rem;background:var(--n);color:#fff;padding:.9rem 1.4rem;border-radius:12px;font-size:.88rem;z-index:9999;box-shadow:0 12px 48px rgba(15,30,53,.16);display:flex;align-items:center;gap:.6rem;border-left:3px solid var(--g);animation:rin .3s ease}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--bo);border-radius:99px}
`;

function Ic({ n, s=20 }) {
  const icons = {
    home:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    file:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
    bell:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    chat:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    logout:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    upload:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16,16 12,12 8,16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    send:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>,
    check:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
    scale:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 7l4 4-4 4"/><path d="M21 7l-4 4 4 4"/><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="15" x2="21" y2="15"/></svg>,
    cal:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    spin:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
    eye:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    dl:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  };
  return icons[n] || null;
}

const ini = n => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
const fmt = ts => ts ? new Date(ts).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) : '';
const fmtd = ts => ts ? new Date(ts).toLocaleDateString('pt-BR') : '';

function Toast({msg, onClose}) {
  useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t)},[]);
  return <div className="toast">✓ {msg}</div>;
}
const Spin = ({text="Carregando…"}) => <div className="ld"><Ic n="spin" s={28}/><span>{text}</span></div>;

// ── LOGIN ──────────────────────────────────────────────────────────────────────
function Login({onLogin}) {
  const [chave, setChave] = useState('');
  const [err,   setErr]   = useState('');
  const [busy,  setBusy]  = useState(false);

  // Format chave automatically as XXXX-XXXX-XXXX
  const handleChave = (val) => {
    const digits = val.replace(/[^0-9a-zA-Z]/g,'');
    let fmt = digits;
    if(digits.length > 4)  fmt = digits.slice(0,4) + '-' + digits.slice(4);
    if(digits.length > 8)  fmt = digits.slice(0,4) + '-' + digits.slice(4,8) + '-' + digits.slice(8,12);
    setChave(fmt);
  };

  const go = async () => {
    const chaveClean = chave.trim();
    if(!chaveClean) { setErr('Por favor insira a sua chave de acesso.'); return; }
    setBusy(true); setErr('');
    try {
      const rows = await db.get('clients', `?chave_acesso=eq.${encodeURIComponent(chaveClean)}&select=*`);
      if(rows.length > 0) {
        onLogin(rows[0]);
      } else {
        setErr('Chave de acesso não encontrada. Verifique e tente novamente.');
      }
    } catch { setErr('Erro de conexão. Tente novamente.'); }
    setBusy(false);
  };

  return (
    <div className="lw">
      <div className="ll">
        <div className="logo">
          <div className="logo-ic"><Ic n="scale" s={28}/></div>
          <h1>Bono & Lacerda<br/>Advogados</h1>
          <p>Portal do Cliente</p>
        </div>
        <p className="ltag">Advocacia Internacional<br/>Migração · Nacionalidade · Empresarial</p>
      </div>
      <div className="lr">
        <div className="lc">
          <h2>Bem-vindo</h2>
          <p>Insira a sua chave de acesso para acompanhar o seu processo.</p>
          <div className="fg">
            <label>Chave de Acesso</label>
            <input
              placeholder="XXXX-XXXX-XXXX"
              value={chave}
              onChange={e=>handleChave(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&go()}
              maxLength={14}
              style={{fontSize:'1.2rem',letterSpacing:'.15em',textAlign:'center',fontWeight:600}}
            />
          </div>
          <p style={{fontSize:'.78rem',color:'var(--mu)',textAlign:'center',marginBottom:'1rem',marginTop:'-.5rem'}}>
            A sua chave foi enviada pelo escritório Bono & Lacerda
          </p>
          <button className="btnp" onClick={go} disabled={busy}>
            {busy?<><Ic n="spin" s={16}/>A verificar…</>:'Aceder ao Portal'}
          </button>
          {err&&<p className="errmsg">{err}</p>}
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────────
function Dashboard({client,proc,steps}) {
  const done = steps.filter(s=>s.done).length;
  const pct  = steps.length ? Math.round(done/steps.length*100) : 0;
  const firstName = client.name.split(' ')[0];

  // If no process yet, show a friendly waiting screen
  if(!proc) return (
    <div>
      <div className="ph"><h1>Olá, {firstName}! 👋</h1><p>O seu processo está a ser preparado.</p></div>
      <div className="card" style={{padding:'2.5rem',textAlign:'center'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>⏳</div>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:'var(--n)',marginBottom:'.75rem'}}>
          Processo em preparação
        </div>
        <p style={{color:'var(--mu)',fontSize:'.9rem',lineHeight:1.7,maxWidth:400,margin:'0 auto'}}>
          O escritório Bono & Lacerda está a preparar o seu processo.<br/>
          Em breve terá acesso a todas as informações aqui.
        </p>
        {client.pendencias && (
          <div style={{marginTop:'1.5rem',background:'#fef3c7',border:'1px solid #fcd34d',borderRadius:12,padding:'1rem 1.5rem',display:'inline-block',textAlign:'left'}}>
            <div style={{fontWeight:600,fontSize:'.85rem',color:'#92400e',marginBottom:4}}>⚠️ Pendência identificada</div>
            <div style={{fontSize:'.82rem',color:'#92400e'}}>{client.pendencias}</div>
            {client.observacao && <div style={{fontSize:'.78rem',color:'#b45309',marginTop:4}}>{client.observacao}</div>}
          </div>
        )}
        <div style={{marginTop:'2rem',fontSize:'.82rem',color:'var(--mu)'}}>
          📞 +351 933 912 776 · ✉️ bonoelacerda@gmail.com
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="ph"><h1>Olá, {firstName}! 👋</h1><p>Acompanhe o andamento do seu processo.</p></div>
      <div className="dg">
        <div className="sc">
          <div className="sl">Chave de Acesso</div>
          <div className="sv" style={{fontSize:'.95rem',marginTop:4,letterSpacing:'.08em'}}>{client.chave_acesso}</div>
          <div className="ss">{proc.type}</div>
        </div>
        <div className="sc">
          <div className="sl">Progresso</div>
          <div className="sv">{pct}%</div>
          <div className="pb"><div className="pbf" style={{width:`${pct}%`}}/></div>
          <div className="ss" style={{marginTop:6}}>{done} de {steps.length} etapas</div>
        </div>
        <div className="sc">
          <div className="sl">Última Atualização</div>
          <div className="sv" style={{fontSize:'1rem',marginTop:4}}>{fmtd(proc.last_update)}</div>
          <div style={{marginTop:6}}>
            <span className={`bd ${proc.status==='aguardando'?'ba':proc.status==='concluido'?'bg':'bb'}`}>
              {proc.status==='aguardando'?'Aguardando':proc.status==='concluido'?'Concluído':'Em andamento'}
            </span>
          </div>
        </div>
      </div>

      {/* Pendência alert */}
      {client.pendencias && (
        <div style={{background:'#fef3c7',border:'1px solid #fcd34d',borderRadius:12,padding:'1rem 1.5rem',marginBottom:'1.25rem',display:'flex',gap:'1rem',alignItems:'flex-start'}}>
          <div style={{fontSize:'1.3rem',flexShrink:0}}>⚠️</div>
          <div>
            <div style={{fontWeight:600,fontSize:'.88rem',color:'#92400e'}}>Pendência no seu processo</div>
            <div style={{fontSize:'.82rem',color:'#92400e',marginTop:3}}>{client.pendencias}</div>
            {client.observacao && <div style={{fontSize:'.78rem',color:'#b45309',marginTop:4}}>{client.observacao}</div>}
          </div>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:'1.25rem'}}>
        <div className="card">
          <div className="ct">Etapas do Processo</div>
          <div className="tl">
            {steps.map(s=>{
              const isA=s.step_order===proc.current_step, isDn=s.done&&!isA;
              return (
                <div key={s.id} className="ti">
                  <div className={`td${isA?' ac':isDn?' dn':''}`}>{isDn&&<Ic n="check" s={11}/>}</div>
                  <div className={`tit${!s.done?' mu':''}`}>{s.title}</div>
                  <div className="tdt">{s.date}</div>
                  {(s.done||isA)&&<div className="tde">{s.detail}</div>}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
          <div className="card">
            <div className="ct">Seu Advogado</div>
            <div style={{display:'flex',alignItems:'center',gap:'.85rem'}}>
              <div className="av lg" style={{background:'#1d3557',color:'#c9a84c'}}>{proc.lawyer_avatar}</div>
              <div>
                <div style={{fontWeight:600,fontSize:'.92rem'}}>{proc.lawyer}</div>
                <div style={{fontSize:'.78rem',color:'var(--mu)',marginTop:2}}>OAB/PB 19.165 · Lisboa 65899L</div>
                <div style={{fontSize:'.75rem',color:'var(--ok)',marginTop:3}}>● Online agora</div>
              </div>
            </div>
          </div>
          {client.artigo && (
            <div className="card">
              <div className="ct">Artigo do Processo</div>
              <div style={{fontSize:'1.1rem',fontWeight:700,color:'var(--n)'}}>{client.artigo}</div>
              <div style={{fontSize:'.78rem',color:'var(--mu)',marginTop:4}}>Nacionalidade Portuguesa</div>
            </div>
          )}
          <div className="card">
            <div className="ct">Escritório</div>
            <div style={{fontSize:'.82rem',color:'var(--mu)',lineHeight:1.9}}>
              📍 Av João XXI, 72B, LJ E38<br/>1000-219 Lisboa, Portugal<br/>
              📞 +351 933 912 776<br/>
              ✉️ bonoelacerda@gmail.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DOCUMENTS ──────────────────────────────────────────────────────────────────
function Docs({proc, toast}) {
  const [docs,setDocs]=useState([]);
  const [ld,setLd]=useState(true);
  const ref=useRef();

  useEffect(()=>{
    if(!proc) return;
    db.get('documents',`?process_id=eq.${proc.id}&order=created_at.desc`).then(setDocs).finally(()=>setLd(false));
  },[proc]);

  const upload = async f => {
    if(!f) return;
    const row={process_id:proc.id,name:f.name,size:`${(f.size/1024).toFixed(0)} KB`,date:new Date().toISOString().split('T')[0],status:'aguardando',uploaded_by:'cliente'};
    const saved=await db.post('documents',row);
    if(saved[0]){setDocs(d=>[saved[0],...d]);toast(`"${f.name}" enviado com sucesso!`);}
  };

  const badge=s=>s==='aprovado'?<span className="bd bg">Aprovado</span>:s==='aguardando'?<span className="bd ba">Aguardando</span>:<span className="bd bb">Disponível</span>;

  return (
    <div>
      <div className="ph"><h1>Documentos</h1><p>Envie e visualize documentos do seu processo.</p></div>
      <div className="card" style={{marginBottom:'1.25rem'}}>
        <div className="ct">Enviar Documento</div>
        <div className="uz" onClick={()=>ref.current.click()}>
          <Ic n="upload" s={32}/><h3>Arraste um arquivo ou clique para selecionar</h3><p>PDF, DOC, JPG, PNG — até 20 MB</p>
          <input ref={ref} type="file" style={{display:'none'}} onChange={e=>upload(e.target.files[0])}/>
        </div>
      </div>
      <div className="card">
        <div className="ct">Todos os Documentos</div>
        {ld?<Spin/>:<div className="dl">
          {docs.map(d=>(
            <div key={d.id} className="dit">
              <div className="dic"><Ic n="file" s={18}/></div>
              <div style={{flex:1,minWidth:0}}><div className="dn2">{d.name}</div><div className="dm">{d.size} · {d.date} · {d.uploaded_by==='cliente'?'Enviado por você':'Enviado pelo advogado'}</div></div>
              <div style={{marginRight:8}}>{badge(d.status)}</div>
              <div style={{display:'flex',gap:'.4rem'}}><button className="ib"><Ic n="eye" s={14}/></button><button className="ib"><Ic n="dl" s={14}/></button></div>
            </div>
          ))}
          {!docs.length&&<p style={{textAlign:'center',color:'var(--mu)',padding:'2rem',fontSize:'.88rem'}}>Nenhum documento ainda.</p>}
        </div>}
      </div>
    </div>
  );
}

// ── NOTIFICATIONS ──────────────────────────────────────────────────────────────
function Notifs({client}) {
  const [ns,setNs]=useState([]);
  const [ld,setLd]=useState(true);

  useEffect(()=>{
    db.get('notifications',`?client_id=eq.${client.id}&order=created_at.desc`).then(setNs).finally(()=>setLd(false));
  },[]);

  const markAll=async()=>{
    await Promise.all(ns.filter(n=>!n.read).map(n=>db.patch('notifications',n.id,{read:true})));
    setNs(ns=>ns.map(n=>({...n,read:true})));
  };

  return (
    <div>
      <div className="ph"><h1>Notificações</h1><p>Atualizações do seu processo.</p></div>
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <div className="ct" style={{margin:0}}>Todas as notificações</div>
          <button onClick={markAll} style={{fontSize:'.8rem',color:'var(--g)',background:'none',border:'none',cursor:'pointer',fontFamily:'DM Sans'}}>Marcar todas como lidas</button>
        </div>
        {ld?<Spin/>:<div className="nl2">
          {ns.map(n=>(
            <div key={n.id} className={`ni2${!n.read?' u':''}`}>
              <div style={{fontSize:'1.3rem'}}>{n.icon}</div>
              <div style={{flex:1}}><div className="ntx">{n.text}</div><div className="ntm">{fmtd(n.created_at)}</div></div>
              {!n.read&&<div className="ud"/>}
            </div>
          ))}
          {!ns.length&&<p style={{textAlign:'center',color:'var(--mu)',padding:'2rem',fontSize:'.88rem'}}>Nenhuma notificação.</p>}
        </div>}
      </div>
    </div>
  );
}

// ── MEETINGS ───────────────────────────────────────────────────────────────────
function Meetings({proc}) {
  const [ms,setMs]=useState([]);
  const [ld,setLd]=useState(true);

  useEffect(()=>{
    if(!proc) return;
    db.get('meetings',`?process_id=eq.${proc.id}&order=date.asc`).then(setMs).finally(()=>setLd(false));
  },[proc]);

  return (
    <div>
      <div className="ph"><h1>Reuniões</h1><p>Reuniões agendadas com seu advogado.</p></div>
      <div className="card">
        <div className="ct">Próximas Reuniões</div>
        {ld?<Spin/>:ms.length===0?<p style={{textAlign:'center',color:'var(--mu)',padding:'2rem',fontSize:'.88rem'}}>Nenhuma reunião agendada.</p>:
          ms.map(m=>{
            const d=new Date(m.date+'T12:00:00');
            return (
              <div className="mcard" key={m.id}>
                <div className="mdb"><div className="day">{d.getDate()}</div><div className="mon">{MO[d.getMonth()]}</div></div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:'.9rem'}}>{m.title}</div>
                  <div style={{fontSize:'.78rem',color:'var(--mu)',marginTop:3}}>⏰ {m.time} · {m.type==='videochamada'?'📹 Videochamada':'📍 Presencial'}</div>
                  {m.notes&&<div style={{fontSize:'.78rem',color:'var(--mu)',marginTop:4}}>📝 {m.notes}</div>}
                </div>
                <span className="bd bg">{m.status}</span>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

// ── CHAT ───────────────────────────────────────────────────────────────────────
function Chat({client,proc}) {
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState('');
  const [ld,setLd]=useState(true);
  const bot=useRef();

  useEffect(()=>{
    if(!proc) return;
    db.get('messages',`?process_id=eq.${proc.id}&order=created_at.asc`).then(setMsgs).finally(()=>setLd(false));
  },[proc]);

  useEffect(()=>{bot.current?.scrollIntoView({behavior:'smooth'})},[msgs]);

  const send=async()=>{
    if(!input.trim()||!proc) return;
    const saved=await db.post('messages',{process_id:proc.id,from_role:'client',text:input});
    if(saved[0]) setMsgs(m=>[...m,saved[0]]);
    setInput('');
  };

  return (
    <div>
      <div className="ph"><h1>Chat</h1><p>Converse diretamente com seu advogado.</p></div>
      <div className="card">
        <div className="cw">
          <div className="che">
            <div className="av" style={{background:'#1d3557',color:'#c9a84c'}}>{proc?.lawyer_avatar||'RL'}</div>
            <div className="chi"><h3>{proc?.lawyer||'Dr. Ramom Lacerda'}</h3><p>● Bono & Lacerda Advogados</p></div>
          </div>
          {ld?<Spin/>:<div className="cms">
            {msgs.map(m=>(
              <div key={m.id} className={`mr${m.from_role==='client'?' mi':''}`}>
                {m.from_role!=='client'&&<div className="av sm" style={{background:'#1d3557',color:'#c9a84c'}}>{proc?.lawyer_avatar||'RL'}</div>}
                <div>
                  <div className={`mb${m.from_role==='client'?' mi':' th'}`}>{m.text}</div>
                  <div className="mtime" style={{textAlign:m.from_role==='client'?'right':'left'}}>{fmt(m.created_at)}</div>
                </div>
              </div>
            ))}
            {!msgs.length&&<p style={{textAlign:'center',color:'var(--mu)',padding:'2rem',fontSize:'.88rem'}}>Nenhuma mensagem ainda. Diga olá!</p>}
            <div ref={bot}/>
          </div>}
          <div className="cir">
            <textarea className="cin" rows={1} placeholder="Digite sua mensagem…" value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}/>
            <button className="bsend" onClick={send}><Ic n="send" s={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── APP ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [client,setClient]=useState(null);
  const [proc,setProc]=useState(null);
  const [steps,setSteps]=useState([]);
  const [tab,setTab]=useState('home');
  const [toast,setToast]=useState(null);
  const [loading,setLoading]=useState(false);

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(null),3500);};

  const onLogin=async c=>{
    setClient(c); setLoading(true);
    const ps=await db.get('processes',`?client_id=eq.${c.id}&limit=1`);
    if(ps[0]){
      setProc(ps[0]);
      const ss=await db.get('process_steps',`?process_id=eq.${ps[0].id}&order=step_order.asc`);
      setSteps(ss);
    }
    setLoading(false);
  };

  const nav=[
    {id:'home',label:'Visão Geral',ic:'home'},
    {id:'docs',label:'Documentos',ic:'file'},
    {id:'meetings',label:'Reuniões',ic:'cal'},
    {id:'notifs',label:'Notificações',ic:'bell'},
    {id:'chat',label:'Chat',ic:'chat'},
  ];

  if(!client) return <><style>{css}</style><Login onLogin={onLogin}/></>;

  return (
    <>
      <style>{css}</style>
      <div className="al">
        <aside className="sb">
          <div className="sbl"><h2>Bono & Lacerda</h2><span>Portal do Cliente</span></div>
          <div className="sbu">
            <div className="av">{ini(client.name)}</div>
            <div><div className="sbn">{client.name}</div><div className="sbs">{client.email}</div></div>
          </div>
          <nav className="sbnav">
            {nav.map(n=>(
              <div key={n.id} className={`ni${tab===n.id?' on':''}`} onClick={()=>setTab(n.id)}>
                <Ic n={n.ic} s={17}/>{n.label}
              </div>
            ))}
          </nav>
          <div className="sbf">
            <button className="out" onClick={()=>{setClient(null);setProc(null);setSteps([]);}}><Ic n="logout" s={16}/>Sair</button>
          </div>
        </aside>
        <main className="mc">
          {loading?<Spin text="Carregando seu processo…"/>:<>
            {tab==='home'&&<Dashboard client={client} proc={proc} steps={steps}/>}
            {tab==='docs'&&<Docs proc={proc} toast={showToast}/>}
            {tab==='meetings'&&<Meetings proc={proc}/>}
            {tab==='notifs'&&<Notifs client={client}/>}
            {tab==='chat'&&<Chat client={client} proc={proc}/>}
          </>}
        </main>
      </div>
      {toast&&<Toast msg={toast} onClose={()=>setToast(null)}/>}
    </>
  );
}
