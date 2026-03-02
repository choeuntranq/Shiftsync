import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY)

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const GRADS = ['linear-gradient(135deg,#E85D3A,#F08060)','linear-gradient(135deg,#7C6FCD,#A99BE0)','linear-gradient(135deg,#2DA882,#4DC9A0)','linear-gradient(135deg,#D4920A,#F0B83A)','linear-gradient(135deg,#2E7DD1,#5BA0EC)','linear-gradient(135deg,#C44E8A,#E07DB0)']
const avi  = n => { let h=0; for(let c of (n||'')) h=c.charCodeAt(0)+((h<<5)-h); return GRADS[Math.abs(h)%GRADS.length] }
const ini  = n => (n||'?').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()
const getMonday = d => { const r=new Date(d),day=r.getDay(); r.setDate(r.getDate()+(day===0?-6:1-day)); r.setHours(0,0,0,0); return r }
const addDays   = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r }
const fmtDate   = d => d.toLocaleDateString('en-US',{month:'short',day:'numeric'})
const fmtDay    = d => d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})
const wKey      = d => d.toISOString().slice(0,10)
const fmtAgo    = ts => { const s=Math.floor((Date.now()-new Date(ts))/1000); return s<60?'just now':s<3600?`${Math.floor(s/60)}m ago`:s<86400?`${Math.floor(s/3600)}h ago`:new Date(ts).toLocaleDateString('en-US',{month:'short',day:'numeric'}) }

// ── THEME ─────────────────────────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState(() => typeof window!=='undefined' ? (localStorage.getItem('sm_theme')||'light') : 'light')
  useEffect(() => { document.documentElement.setAttribute('data-theme',theme); localStorage.setItem('sm_theme',theme) }, [theme])
  return { theme, toggle: ()=>setTheme(t=>t==='light'?'dark':'light') }
}

// ── ICONS ─────────────────────────────────────────────────────────────────────
const P = {
  cal:"M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  users:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  msg:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  cog:"M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  plus:"M12 5v14M5 12h14",
  check:"M20 6 9 17l-5-5",
  x:"M18 6 6 18M6 6l12 12",
  zap:"M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  send:"M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z",
  sliders:"M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  trash:"M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  logout:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  clock:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  sun:"M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
  moon:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  repeat:"M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3",
  bell:"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  chevD:"M6 9l6 6 6-6",chevL:"M15 18l-6-6 6-6",chevR:"M9 18l6-6-6-6",
  inbox:"M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
  copy:"M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M16 4h2a2 2 0 0 1 2 2v4M21 14H11",
  grid:"M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  alert:"M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  building:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
}
const Ic = ({p,s=17,c='currentColor'}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={p}/></svg>
)

// ── LOGO ──────────────────────────────────────────────────────────────────────
function Logo({ size=36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#E85D3A"/><stop offset="100%" stopColor="#D4920A"/></linearGradient></defs>
      <rect width="36" height="36" rx="9" fill="url(#lg)"/>
      <rect x="7" y="11" width="22" height="2.5" rx="1.25" fill="white" opacity="0.95"/>
      <rect x="7" y="17" width="15" height="2.5" rx="1.25" fill="white" opacity="0.75"/>
      <rect x="7" y="23" width="18" height="2.5" rx="1.25" fill="white" opacity="0.55"/>
      <circle cx="27" cy="24.5" r="4.5" fill="rgba(255,255,255,0.18)"/>
      <path d="M25 24.5L26.5 26L29 23" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
:root{
  --bg:#F5F4F0;--s:#FFFFFF;--s2:#EFEDE8;--s3:#E5E2DB;
  --b:rgba(0,0,0,0.07);--b2:rgba(0,0,0,0.12);
  --a:#E85D3A;--g:#D4920A;--pu:#7C6FCD;--gr:#2DA882;--re:#D94F4F;--bl:#2E7DD1;
  --t:#1C1917;--t2:#6B6560;--t3:#A8A29E;
  color-scheme:light;
}
[data-theme="dark"]{
  --bg:#111110;--s:#1C1B19;--s2:#252420;--s3:#2E2C28;
  --b:rgba(255,255,255,0.07);--b2:rgba(255,255,255,0.13);
  --t:#F2EFE9;--t2:#A8A29E;--t3:#6B6560;
  color-scheme:dark;
}
body{font-family:'Nunito',sans-serif;background:var(--bg);color:var(--t);-webkit-font-smoothing:antialiased;font-size:14px;}
input,select,textarea,button{font-family:inherit;}
.app{display:flex;height:100vh;overflow:hidden;}
.sidebar{width:216px;background:var(--s);border-right:1px solid var(--b);display:flex;flex-direction:column;flex-shrink:0;transition:width .2s;overflow:hidden;}
.sidebar.off{width:0;border:none;}
.logo-wrap{padding:16px 14px 12px;border-bottom:1px solid var(--b);display:flex;align-items:center;gap:9px;flex-shrink:0;}
.logo-name{font-size:17px;font-weight:800;background:linear-gradient(130deg,var(--a),var(--g));-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap;letter-spacing:-.2px;}
.logo-sub{font-size:9px;color:var(--t3);letter-spacing:.8px;text-transform:uppercase;white-space:nowrap;margin-top:1px;}
nav{flex:1;padding:8px 7px;display:flex;flex-direction:column;gap:1px;overflow-y:auto;}
.ni{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;font-size:13px;font-weight:600;color:var(--t2);cursor:pointer;border:none;background:none;width:100%;text-align:left;transition:all .12s;white-space:nowrap;}
.ni:hover{background:var(--s2);color:var(--t);}
.ni.on{background:rgba(232,93,58,.1);color:var(--a);}
.ni-badge{margin-left:auto;background:var(--a);color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:20px;min-width:18px;text-align:center;line-height:16px;}
.side-foot{padding:8px 7px;border-top:1px solid var(--b);}
.upill{display:flex;align-items:center;gap:7px;padding:7px 9px;background:var(--s2);border-radius:8px;}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.topbar{padding:13px 20px;border-bottom:1px solid var(--b);display:flex;align-items:center;gap:10px;flex-shrink:0;background:var(--s);}
.page-title{font-size:17px;font-weight:800;letter-spacing:-.2px;}
.page-sub{font-size:11px;color:var(--t3);margin-top:1px;}
.body{flex:1;overflow-y:auto;padding:20px;}
.hbtn{display:flex;flex-direction:column;gap:4px;background:none;border:none;cursor:pointer;padding:3px;}
.hbar{display:block;width:17px;height:2px;background:var(--t2);border-radius:1px;transition:all .2s;}
.av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0;}
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .12s;white-space:nowrap;}
.btn:disabled{opacity:.45;cursor:not-allowed;}
.pr{background:var(--a);color:#fff;}.pr:hover:not(:disabled){filter:brightness(1.08);}
.se{background:var(--s2);color:var(--t);border:1px solid var(--b2);}.se:hover:not(:disabled){background:var(--s3);}
.gh{background:transparent;color:var(--t2);border:1px solid var(--b2);}.gh:hover:not(:disabled){background:var(--s2);color:var(--t);}
.ic{padding:6px;border-radius:7px;}
.btn-gr{background:rgba(45,168,130,.12);color:var(--gr);border:1px solid rgba(45,168,130,.22);}.btn-gr:hover{background:rgba(45,168,130,.2);}
.btn-re{background:rgba(217,79,79,.1);color:var(--re);border:1px solid rgba(217,79,79,.18);}.btn-re:hover{background:rgba(217,79,79,.18);}
.fg{margin-bottom:13px;}
.lbl{display:block;font-size:11px;font-weight:700;color:var(--t2);margin-bottom:4px;letter-spacing:.3px;text-transform:uppercase;}
.fi{width:100%;padding:8px 11px;background:var(--s2);border:1px solid var(--b2);border-radius:8px;color:var(--t);font-size:13px;outline:none;transition:border .12s;font-weight:500;}
.fi:focus{border-color:var(--a);background:var(--s);}
select.fi{cursor:pointer;}
textarea.fi{resize:vertical;min-height:64px;}
.card{background:var(--s);border:1px solid var(--b);border-radius:12px;padding:16px;}
.ct{font-size:10px;font-weight:800;color:var(--t3);letter-spacing:.7px;text-transform:uppercase;margin-bottom:12px;}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(3px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;}
.modal{background:var(--s);border:1px solid var(--b2);border-radius:14px;padding:22px;width:500px;max-width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.15);}
.modal-title{font-size:17px;font-weight:800;margin-bottom:16px;letter-spacing:-.2px;}
.ma{display:flex;gap:7px;justify-content:flex-end;margin-top:16px;}
.badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:100px;font-size:11px;font-weight:700;}
.badge-pending{background:rgba(212,146,10,.12);color:var(--g);}
.badge-approved{background:rgba(45,168,130,.12);color:var(--gr);}
.badge-denied{background:rgba(217,79,79,.1);color:var(--re);}
.badge-invited{background:rgba(124,111,205,.12);color:var(--pu);}
.badge-draft{background:rgba(0,0,0,.06);color:var(--t2);}
.bfoh{background:rgba(232,93,58,.1);color:var(--a);border-radius:5px;padding:1px 7px;font-size:11px;font-weight:700;}
.bboh{background:rgba(124,111,205,.1);color:var(--pu);border-radius:5px;padding:1px 7px;font-size:11px;font-weight:700;}
.err-box{background:rgba(217,79,79,.08);border:1px solid rgba(217,79,79,.18);border-radius:8px;padding:9px 12px;font-size:13px;color:var(--re);margin-bottom:12px;}
.rest-switch-btn{width:100%;background:var(--s2);border:1px solid var(--b);border-radius:9px;padding:9px 10px;cursor:pointer;display:flex;align-items:center;gap:9px;text-align:left;margin-bottom:6px;transition:all .12s;}
.rest-switch-btn:hover{background:var(--s3);}
::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-thumb{background:var(--s3);border-radius:2px;}
/* Schedule drag styles */
.shift-cell{min-height:48px;padding:4px;border-radius:8px;transition:background .12s;}
.shift-cell.drag-over{background:rgba(232,93,58,.1);outline:2px dashed var(--a);}
.emp-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 7px 3px 4px;border-radius:6px;background:var(--s2);border:1px solid var(--b);font-size:12px;font-weight:600;cursor:grab;user-select:none;transition:all .12s;white-space:nowrap;}
.emp-chip:hover{background:var(--s3);border-color:var(--b2);}
.emp-chip.dragging{opacity:.4;cursor:grabbing;}
.emp-chip .chip-av{width:20px;height:20px;font-size:9px;}
.emp-chip .chip-x{opacity:0;width:14px;height:14px;border-radius:3px;display:flex;align-items:center;justify-content:center;background:rgba(217,79,79,.15);color:var(--re);transition:opacity .1s;flex-shrink:0;}
.emp-chip:hover .chip-x{opacity:1;}
.add-emp-btn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;border:1.5px dashed var(--b2);background:transparent;color:var(--t3);cursor:pointer;font-size:16px;transition:all .12s;flex-shrink:0;}
.add-emp-btn:hover{border-color:var(--a);color:var(--a);background:rgba(232,93,58,.06);}
/* Restaurant switcher dropdown */
.rest-dd{position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--s);border:1px solid var(--b2);border-radius:10px;z-index:100;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.12);}
.rest-dd-item{padding:9px 12px;cursor:pointer;display:flex;align-items:center;gap:9px;font-size:13px;font-weight:600;transition:background .1s;}
.rest-dd-item:hover{background:var(--s2);}
/* Auth layout */
.auth-wrap{min-height:100vh;display:flex;}
.auth-left{width:400px;flex-shrink:0;background:var(--s);border-right:1px solid var(--b);display:flex;flex-direction:column;justify-content:space-between;padding:40px 36px;}
.auth-right{flex:1;display:flex;align-items:center;justify-content:center;padding:36px;}
.auth-form{width:100%;max-width:360px;}
.auth-title{font-size:24px;font-weight:800;margin-bottom:5px;letter-spacing:-.3px;}
.auth-sub{font-size:13px;color:var(--t2);margin-bottom:24px;font-weight:500;}
@media(max-width:600px){.auth-left{display:none;}.auth-right{padding:20px;}}
/* Settings panel */
.settings-section{background:var(--s);border:1px solid var(--b);border-radius:12px;padding:18px;margin-bottom:14px;}
.settings-title{font-size:14px;font-weight:800;margin-bottom:14px;letter-spacing:-.1px;}
`

// ── AUTH CONTEXT ──────────────────────────────────────────────────────────────
const AuthCtx = createContext(null)
const useAuth = () => useContext(AuthCtx)

function AuthProvider({ children }) {
  const [user,setUser]=useState(null)
  const [profile,setProfile]=useState(null)
  const [restaurants,setRestaurants]=useState([])
  const [activeRest,setActiveRestState]=useState(null)
  const [membership,setMembership]=useState(null)
  const [loading,setLoading]=useState(true)

  const loadUser = async u => {
    if (!u) { setProfile(null);setRestaurants([]);setActiveRestState(null);setMembership(null);return }
    let {data:prof} = await sb.from('profiles').select('*').eq('id',u.id).single()
    if (!prof) {
      const {data:ins} = await sb.from('profiles').insert({
        id:u.id, name:u.user_metadata?.name||u.email.split('@')[0], email:u.email
      }).select().single()
      prof = ins
    }
    setProfile(prof)
    const {data:mems} = await sb.from('restaurant_members')
      .select('*,restaurant:restaurants(*)').eq('profile_id',u.id).neq('status','inactive')
    const rests = (mems||[]).map(m=>m.restaurant).filter(Boolean)
    setRestaurants(rests)
    const stored = localStorage.getItem('sm_rest')
    const active = rests.find(r=>r.id===stored)||rests[0]||null
    setActiveRestState(active)
    if (active) setMembership((mems||[]).find(m=>m.restaurant_id===active.id)||null)
  }

  const switchRest = async rest => {
    setActiveRestState(rest); localStorage.setItem('sm_rest',rest.id)
    const {data:mem} = await sb.from('restaurant_members').select('*').eq('profile_id',user.id).eq('restaurant_id',rest.id).single()
    setMembership(mem||null)
  }

  const reloadAll = () => loadUser(user)

  useEffect(()=>{
    sb.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user??null); loadUser(session?.user??null).finally(()=>setLoading(false))
    })
    const {data:{subscription}} = sb.auth.onAuthStateChange((_e,session)=>{
      setUser(session?.user??null); loadUser(session?.user??null)
    })
    return ()=>subscription.unsubscribe()
  },[])

  const signIn  = (e,p) => sb.auth.signInWithPassword({email:e,password:p})
  const signUp  = (e,p,n) => sb.auth.signUp({email:e,password:p,options:{data:{name:n},emailRedirectTo:window.location.origin}})
  const signOut = async () => { await sb.auth.signOut(); setUser(null);setProfile(null);setRestaurants([]);setActiveRestState(null);setMembership(null) }
  const role      = membership?.role_level||'employee'
  const isOwner   = role==='owner'
  const isManager = role==='manager'||isOwner

  return (
    <AuthCtx.Provider value={{user,profile,restaurants,activeRest,membership,loading,signIn,signUp,signOut,switchRest,reloadAll,isOwner,isManager,role}}>
      {children}
    </AuthCtx.Provider>
  )
}

// ── AUTH LAYOUT ───────────────────────────────────────────────────────────────
function AuthLayout({title,subtitle,children}) {
  const t = typeof window!=='undefined'?(localStorage.getItem('sm_theme')||'light'):'light'
  const ACSS=`.feat{display:flex;align-items:center;gap:10px;margin-bottom:12px;}.feat-icon{width:30px;height:30px;border-radius:8px;background:var(--s2);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}`
  return (
    <div className="auth-wrap" data-theme={t} style={{background:'var(--bg)'}}>
      <style>{CSS}{ACSS}</style>
      <div className="auth-left">
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Logo size={32}/>
          <div><div className="logo-name">ShiftMise</div><div className="logo-sub">Restaurant Scheduling</div></div>
        </div>
        <div>
          <div style={{fontSize:28,fontWeight:800,lineHeight:1.2,marginBottom:12,letterSpacing:'-.4px'}}>
            Scheduling<br/><span style={{background:'linear-gradient(130deg,var(--a),var(--g))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>that flows.</span>
          </div>
          <div style={{fontSize:13,color:'var(--t2)',lineHeight:1.7,marginBottom:20,fontWeight:500}}>Build schedules, manage shift trades, and keep your whole team in sync.</div>
          {[['⚡','Auto-Fill','Fill the week in one click'],['🔄','Shift Trading','Swaps with manager approval'],['📋','Templates','Reuse patterns week to week'],['💬','Team Chat','FOH & BOH connected']].map(([ico,lbl,desc])=>(
            <div className="feat" key={lbl}>
              <div className="feat-icon">{ico}</div>
              <div><div style={{fontSize:13,fontWeight:700}}>{lbl}</div><div style={{fontSize:11,color:'var(--t3)'}}>{desc}</div></div>
            </div>
          ))}
        </div>
        <div style={{fontSize:11,color:'var(--t3)'}}>© {new Date().getFullYear()} ShiftMise</div>
      </div>
      <div className="auth-right">
        <div className="auth-form">
          <div className="auth-title">{title}</div>
          <div className="auth-sub">{subtitle}</div>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage() {
  const {signIn}=useAuth()
  const [email,setEmail]=useState(''); const [pw,setPw]=useState(''); const [err,setErr]=useState(''); const [busy,setBusy]=useState(false)
  const [mode,setMode]=useState('login') // login | forgot
  const [resetSent,setResetSent]=useState(false)

  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr('')
    if(mode==='forgot'){
      const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin})
      if(error){setErr(error.message);setBusy(false);return}
      setResetSent(true); setBusy(false); return
    }
    const {error}=await signIn(email,pw)
    if(error){setErr(error.message);setBusy(false)}
  }

  if(resetSent) return (
    <AuthLayout title="Check your email." subtitle="A password reset link is on its way.">
      <div style={{textAlign:'center',padding:'20px 0'}}>
        <div style={{fontSize:40,marginBottom:12}}>📬</div>
        <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>Reset link sent!</div>
        <div style={{fontSize:13,color:'var(--t2)',fontWeight:500,marginBottom:20}}>Check {email} and click the link to reset your password.</div>
        <button className="btn se" style={{width:'100%',justifyContent:'center'}} onClick={()=>{setMode('login');setResetSent(false)}}>Back to Sign In</button>
      </div>
    </AuthLayout>
  )

  return (
    <AuthLayout title={mode==='forgot'?'Reset your password.':'Welcome back.'} subtitle={mode==='forgot'?"Enter your email and we'll send a reset link.":'Sign in to manage your team.'}>
      <form onSubmit={submit}>
        <div className="fg"><label className="lbl">Email</label><input className="fi" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@restaurant.com" autoFocus/></div>
        {mode==='login'&&<div className="fg"><label className="lbl">Password</label><input className="fi" type="password" value={pw} onChange={e=>setPw(e.target.value)} required placeholder="••••••••"/></div>}
        {err&&<div className="err-box">{err}</div>}
        <button type="submit" className="btn pr" style={{width:'100%',justifyContent:'center',padding:'10px'}} disabled={busy}>
          {busy?(mode==='forgot'?'Sending…':'Signing in…'):(mode==='forgot'?'Send Reset Link':'Sign In')}
        </button>
      </form>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:14}}>
        {mode==='login'
          ? <button className="btn gh" style={{fontSize:12,border:'none',padding:'4px 0',color:'var(--t3)'}} onClick={()=>setMode('forgot')}>Forgot password?</button>
          : <button className="btn gh" style={{fontSize:12,border:'none',padding:'4px 0',color:'var(--t3)'}} onClick={()=>setMode('login')}>← Back to sign in</button>
        }
      </div>
      {mode==='login'&&(
        <div style={{marginTop:12,borderTop:'1px solid var(--b)',paddingTop:14}}>
          <a href="/signup" style={{textDecoration:'none'}}>
            <button type="button" className="btn se" style={{width:'100%',justifyContent:'center',padding:'10px',fontSize:13}}>Create an account</button>
          </a>
        </div>
      )}
    </AuthLayout>
  )
}

// ── SIGNUP PAGE ───────────────────────────────────────────────────────────────
function SignupPage() {
  const {signUp}=useAuth()
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [pw,setPw]=useState('')
  const [pw2,setPw2]=useState('')
  const [err,setErr]=useState('')
  const [busy,setBusy]=useState(false)
  const [done,setDone]=useState(false)

  const submit = async e => {
    e.preventDefault()
    if(pw!==pw2){setErr("Passwords don't match");return}
    if(pw.length<6){setErr('Minimum 6 characters');return}
    setBusy(true);setErr('')
    const {error}=await signUp(email,pw,name)
    if(error){setErr(error.message);setBusy(false);return}
    setDone(true)
  }

  if(done) return (
    <AuthLayout title="Check your email." subtitle="Confirm your address to finish signing up.">
      <div style={{textAlign:'center',padding:'20px 0'}}>
        <div style={{fontSize:40,marginBottom:12}}>📬</div>
        <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>Almost there!</div>
        <div style={{fontSize:13,color:'var(--t2)',fontWeight:500,marginBottom:20}}>We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</div>
        <a href="/" style={{display:'block'}}><button className="btn se" style={{width:'100%',justifyContent:'center'}}>Back to Sign In</button></a>
      </div>
    </AuthLayout>
  )

  return (
    <AuthLayout title="Create your account." subtitle="Start your 14-day free trial. No credit card required.">
      <form onSubmit={submit}>
        <div className="fg"><label className="lbl">Full Name</label><input className="fi" value={name} onChange={e=>setName(e.target.value)} required placeholder="Your full name" autoFocus/></div>
        <div className="fg"><label className="lbl">Email</label><input className="fi" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@restaurant.com"/></div>
        <div className="fg"><label className="lbl">Password</label><input className="fi" type="password" value={pw} onChange={e=>setPw(e.target.value)} required placeholder="At least 6 characters"/></div>
        <div className="fg"><label className="lbl">Confirm Password</label><input className="fi" type="password" value={pw2} onChange={e=>setPw2(e.target.value)} required placeholder="Repeat password"/></div>
        {err&&<div className="err-box">{err}</div>}
        <button type="submit" className="btn pr" style={{width:'100%',justifyContent:'center',padding:'10px'}} disabled={busy||!name||!email||!pw||!pw2}>
          {busy?'Creating account…':'Create Account'}
        </button>
      </form>
      <p style={{textAlign:'center',fontSize:12,color:'var(--t3)',marginTop:14,fontWeight:600}}>
        Already have an account? <a href="/" style={{color:'var(--a)',textDecoration:'none',fontWeight:700}}>Sign in →</a>
      </p>
    </AuthLayout>
  )
}

// ── SET PASSWORD ──────────────────────────────────────────────────────────────
function SetPasswordPage() {
  const [pw,setPw]=useState(''); const [pw2,setPw2]=useState(''); const [err,setErr]=useState(''); const [done,setDone]=useState(false); const [busy,setBusy]=useState(false)
  const submit = async e => {
    e.preventDefault(); if(pw!==pw2){setErr("Passwords don't match");return} if(pw.length<6){setErr('Minimum 6 characters');return}
    setBusy(true);setErr(''); const {error}=await sb.auth.updateUser({password:pw})
    if(error){setErr(error.message);setBusy(false);return}
    setDone(true); setTimeout(()=>window.location.href='/',1500)
  }
  return (
    <AuthLayout title="Set your password." subtitle="Finish setting up your account.">
      <div style={{background:'rgba(45,168,130,.08)',border:'1px solid rgba(45,168,130,.18)',borderRadius:9,padding:'11px 13px',marginBottom:18,fontSize:13,color:'var(--gr)',fontWeight:700}}>👋 You've been invited to ShiftMise!</div>
      {done ? <div style={{textAlign:'center',padding:'20px 0'}}><div style={{fontSize:32,marginBottom:8}}>✓</div><div style={{fontWeight:700,color:'var(--gr)'}}>Password set! Redirecting…</div></div>
        : <form onSubmit={submit}>
            <div className="fg"><label className="lbl">New Password</label><input className="fi" type="password" value={pw} onChange={e=>setPw(e.target.value)} required placeholder="At least 6 characters" autoFocus/></div>
            <div className="fg"><label className="lbl">Confirm Password</label><input className="fi" type="password" value={pw2} onChange={e=>setPw2(e.target.value)} required placeholder="Repeat password"/></div>
            {err&&<div className="err-box">{err}</div>}
            <button type="submit" className="btn pr" style={{width:'100%',justifyContent:'center',padding:'10px'}} disabled={busy}>{busy?'Saving…':'Set Password & Sign In'}</button>
          </form>}
    </AuthLayout>
  )
}

// ── ONBOARDING ────────────────────────────────────────────────────────────────
function OnboardingPage() {
  const {user,reloadAll}=useAuth()
  const [name,setName]=useState(''); const [busy,setBusy]=useState(false); const [err,setErr]=useState('')
  const create = async e => {
    e.preventDefault(); if(!name.trim())return; setBusy(true);setErr('')
    const {data:rest,error}=await sb.from('restaurants').insert({name:name.trim(),owner_id:user.id}).select().single()
    if(error){setErr(error.message);setBusy(false);return}
    await sb.from('restaurant_members').insert({restaurant_id:rest.id,profile_id:user.id,role_level:'owner',status:'active'})
    await reloadAll()
  }
  return (
    <AuthLayout title="Create your restaurant." subtitle="Set up your first location to get started.">
      <form onSubmit={create}>
        <div style={{fontSize:26,textAlign:'center',marginBottom:16}}>🍽️</div>
        <div className="fg"><label className="lbl">Restaurant Name</label><input className="fi" value={name} onChange={e=>setName(e.target.value)} required placeholder="e.g. Joto Sushi West Loop" autoFocus/></div>
        <div style={{background:'rgba(232,93,58,.07)',border:'1px solid rgba(232,93,58,.14)',borderRadius:9,padding:'11px 13px',marginBottom:16,fontSize:12,color:'var(--t2)',fontWeight:500}}>
          <div style={{fontWeight:800,color:'var(--a)',marginBottom:2}}>✨ 14-day free trial</div>
          No credit card required to start.
        </div>
        {err&&<div className="err-box">{err}</div>}
        <button type="submit" className="btn pr" style={{width:'100%',justifyContent:'center',padding:'10px'}} disabled={!name.trim()||busy}>{busy?'Setting up…':'Create Restaurant & Start Trial'}</button>
      </form>
    </AuthLayout>
  )
}

// ── RESTAURANT SWITCHER ───────────────────────────────────────────────────────
function RestaurantSwitcher({onAdd}) {
  const {restaurants,activeRest,switchRest}=useAuth()
  const [open,setOpen]=useState(false)
  const ref=useRef()
  useEffect(()=>{ const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)}; document.addEventListener('mousedown',h); return ()=>document.removeEventListener('mousedown',h) },[])
  if (!activeRest) return null
  return (
    <div style={{position:'relative',marginBottom:6}} ref={ref}>
      <button className="rest-switch-btn" onClick={()=>setOpen(o=>!o)}>
        <div style={{width:26,height:26,borderRadius:7,background:'linear-gradient(135deg,var(--a),var(--g))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'white',flexShrink:0}}>{activeRest.name[0].toUpperCase()}</div>
        <div style={{flex:1,overflow:'hidden'}}><div style={{fontWeight:700,fontSize:12,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{activeRest.name}</div><div style={{fontSize:10,color:'var(--t3)',textTransform:'capitalize'}}>{activeRest.plan}·{activeRest.subscription_status}</div></div>
        <Ic p={P.chevD} s={13} c="var(--t3)"/>
      </button>
      {open&&(
        <div className="rest-dd">
          {restaurants.map(r=>(
            <div key={r.id} className="rest-dd-item" onClick={()=>{switchRest(r);setOpen(false)}}>
              <div style={{width:22,height:22,borderRadius:5,background:'linear-gradient(135deg,var(--a),var(--g))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'white'}}>{r.name[0].toUpperCase()}</div>
              <span style={{flex:1}}>{r.name}</span>
              {r.id===activeRest.id&&<Ic p={P.check} s={13} c="var(--gr)"/>}
            </div>
          ))}
          <div style={{padding:'6px 7px',borderTop:'1px solid var(--b)'}}>
            <button className="btn se" style={{width:'100%',justifyContent:'center',fontSize:12}} onClick={()=>{onAdd();setOpen(false)}}><Ic p={P.plus} s={13}/>Add Restaurant</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── ADD RESTAURANT MODAL ──────────────────────────────────────────────────────
function AddRestaurantModal({onClose}) {
  const {user,reloadAll,switchRest}=useAuth()
  const [name,setName]=useState(''); const [busy,setBusy]=useState(false); const [err,setErr]=useState('')
  const create = async () => {
    if(!name.trim())return; setBusy(true);setErr('')
    const {data:rest,error}=await sb.from('restaurants').insert({name:name.trim(),owner_id:user.id}).select().single()
    if(error){setErr(error.message);setBusy(false);return}
    await sb.from('restaurant_members').insert({restaurant_id:rest.id,profile_id:user.id,role_level:'owner',status:'active'})
    await reloadAll(); switchRest(rest); onClose()
  }
  return (
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">Add Restaurant</div>
        <div className="fg"><label className="lbl">Restaurant Name</label><input className="fi" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. My Second Location" autoFocus onKeyDown={e=>e.key==='Enter'&&create()}/></div>
        <div style={{background:'rgba(232,93,58,.07)',border:'1px solid rgba(232,93,58,.14)',borderRadius:8,padding:'10px 12px',fontSize:12,color:'var(--t2)',marginBottom:4,fontWeight:500}}>Each restaurant gets its own 14-day free trial.</div>
        {err&&<div className="err-box">{err}</div>}
        <div className="ma"><button className="btn se" onClick={onClose}>Cancel</button><button className="btn pr" onClick={create} disabled={!name.trim()||busy}>{busy?'Creating…':'Create'}</button></div>
      </div>
    </div>
  )
}

// ── SCHEDULE VIEW ─────────────────────────────────────────────────────────────
function ScheduleView({rid,roles,employees,availability,shiftBlocks,requirements,setRequirements,openDays}) {
  const {isManager}=useAuth()
  const [weekStart,setWeekStart]=useState(()=>getMonday(new Date()))
  const [schedule,setSchedule]=useState({})
  const [status,setStatus]=useState('draft')
  const [saving,setSaving]=useState(false)
  const [dragState,setDragState]=useState(null) // {empId, fromKey, copyMode}
  const [dragOver,setDragOver]=useState(null)
  const [copyEmp,setCopyEmp]=useState(null) // emp being copied
  const [showReqEditor,setShowReqEditor]=useState(false)
  const weekDays = DAYS.filter(d=>openDays[d]!==false)
  const viewMon=weekStart, viewSun=addDays(weekStart,6)

  useEffect(()=>{
    if(!rid)return
    setSchedule({});setStatus('draft')
    sb.from('schedules').select('*').eq('restaurant_id',rid).eq('week_start',wKey(weekStart)).single()
      .then(({data})=>{ if(data){setSchedule(data.shifts||{});setStatus(data.status)} })
  },[rid,weekStart])

  const persist = async s => {
    await sb.from('schedules').upsert({restaurant_id:rid,week_start:wKey(weekStart),shifts:s,status,updated_at:new Date().toISOString()},{onConflict:'restaurant_id,week_start'})
  }

  const removeEmp = async (key, empId) => {
    const next = {...schedule,[key]:(schedule[key]||[]).filter(x=>x!==empId)}
    setSchedule(next); await persist(next)
  }

  const addEmp = async (key, empId) => {
    if ((schedule[key]||[]).includes(empId)) return
    const next = {...schedule,[key]:[...(schedule[key]||[]),empId]}
    setSchedule(next); await persist(next)
  }

  // Drag handlers
  const onDragStart = (e, empId, fromKey) => {
    const copyMode = e.altKey || e.metaKey
    setDragState({empId,fromKey,copyMode})
    e.dataTransfer.effectAllowed = copyMode ? 'copy' : 'move'
    setCopyEmp(copyMode ? empId : null)
  }

  const onDragOver = (e, key) => { e.preventDefault(); setDragOver(key); e.dataTransfer.dropEffect=dragState?.copyMode?'copy':'move' }
  const onDragLeave = () => setDragOver(null)

  const onDrop = async (e, toKey) => {
    e.preventDefault(); setDragOver(null)
    if (!dragState || toKey===dragState.fromKey) { setDragState(null); setCopyEmp(null); return }
    const {empId,fromKey,copyMode} = dragState
    let next = {...schedule}
    if (!copyMode) next = {...next,[fromKey]:(next[fromKey]||[]).filter(x=>x!==empId)}
    if (!(next[toKey]||[]).includes(empId)) next = {...next,[toKey]:[...(next[toKey]||[]),empId]}
    setSchedule(next); setDragState(null); setCopyEmp(null); await persist(next)
  }

  const onDragEnd = () => { setDragState(null); setDragOver(null); setCopyEmp(null) }

  // Touch drag for mobile
  const touchDrag = useRef(null)
  const onTouchStart = (e, empId, fromKey) => {
    touchDrag.current = {empId, fromKey, startX:e.touches[0].clientX, startY:e.touches[0].clientY}
  }

  const autoFill = async () => {
    setSaving(true)
    const newS = {...schedule}
    shiftBlocks.forEach(block=>{
      weekDays.forEach(day=>{
        if(!availability[day])return
        const avail=Object.keys(availability[day]).filter(id=>availability[day][id])
        ;['FOH','BOH'].forEach(sec=>{
          ;(roles[sec]||[]).forEach(role=>{
            const key=`${day}__${block.id}__${sec}__${role}`
            const req=requirements[`${block.id}__${sec}__${role}`]||0
            if(!req)return
            const filled=newS[key]||[]
            const pool=employees.filter(e=>e.section===sec&&(e.roles||[]).includes(role)&&avail.includes(e.id)&&!filled.includes(e.id))
            newS[key]=[...filled,...pool.slice(0,Math.max(0,req-filled.length))]
          })
        })
      })
    })
    setSchedule(newS); await persist(newS); setSaving(false)
  }

  const publish = async () => {
    setSaving(true)
    await sb.from('schedules').upsert({restaurant_id:rid,week_start:wKey(weekStart),shifts:schedule,status:'published',updated_at:new Date().toISOString()},{onConflict:'restaurant_id,week_start'})
    setStatus('published'); setSaving(false)
  }

  const clearWeek = async () => { setSchedule({}); await persist({}) }

  const empById = id => employees.find(e=>e.id===id)

  return (
    <div>
      {/* Toolbar */}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:18,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:4,background:'var(--s)',border:'1px solid var(--b2)',borderRadius:9,padding:'4px 8px'}}>
          <button className="btn ic gh" style={{padding:'4px 5px'}} onClick={()=>setWeekStart(d=>addDays(d,-7))}><Ic p={P.chevL} s={14}/></button>
          <span style={{fontSize:13,fontWeight:700,minWidth:150,textAlign:'center'}}>{fmtDate(viewMon)} – {fmtDate(viewSun)}</span>
          <button className="btn ic gh" style={{padding:'4px 5px'}} onClick={()=>setWeekStart(d=>addDays(d,7))}><Ic p={P.chevR} s={14}/></button>
        </div>
        <button className="btn se" style={{fontSize:12}} onClick={()=>setWeekStart(getMonday(new Date()))}>Today</button>
        <span className={`badge ${status==='published'?'badge-approved':'badge-draft'}`} style={{padding:'5px 10px'}}>
          {status==='published'?'✓ Published':'Draft'}
        </span>
        {isManager&&(
          <div style={{marginLeft:'auto',display:'flex',gap:6,flexWrap:'wrap'}}>
            {copyEmp&&<span style={{fontSize:12,color:'var(--a)',fontWeight:700,alignSelf:'center'}}>⌥ Copy mode — drop on a cell</span>}
            <button className="btn gh" style={{fontSize:12}} onClick={()=>setShowReqEditor(o=>!o)}><Ic p={P.sliders} s={13}/>Requirements</button>
            <button className="btn se" style={{fontSize:12}} onClick={clearWeek}><Ic p={P.trash} s={13}/>Clear</button>
            <button className="btn se" style={{fontSize:12}} onClick={autoFill} disabled={saving}><Ic p={P.zap} s={13}/>Auto-Fill</button>
            <button className="btn pr" style={{fontSize:12}} onClick={publish} disabled={saving||status==='published'}><Ic p={P.check} s={13}/>Publish</button>
          </div>
        )}
      </div>

      <div style={{fontSize:11,color:'var(--t3)',marginBottom:12,fontWeight:600}}>
        💡 Drag employees to move • Hold <kbd style={{background:'var(--s2)',border:'1px solid var(--b2)',borderRadius:3,padding:'0 4px',fontSize:10}}>Alt</kbd> while dragging to copy
      </div>

      {/* Schedule Grid — one card per shift block */}
      {shiftBlocks.map(block=>(
        <div key={block.id} className="card" style={{marginBottom:14,overflowX:'auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
            <div style={{width:10,height:10,borderRadius:3,background:block.color,flexShrink:0}}/>
            <span style={{fontWeight:800,fontSize:14}}>{block.name}</span>
            <span style={{fontSize:12,color:'var(--t3)',fontWeight:600}}>{block.start} – {block.end}</span>
          </div>
          <table style={{width:'100%',borderCollapse:'separate',borderSpacing:'0 4px',minWidth:Math.max(500,weekDays.length*100+140)}}>
            <thead>
              <tr>
                <th style={{padding:'4px 8px',fontSize:10,fontWeight:800,color:'var(--t3)',textAlign:'left',width:130,textTransform:'uppercase',letterSpacing:'.5px'}}>Role</th>
                {weekDays.map(d=>(
                  <th key={d} style={{padding:'4px 8px',fontSize:10,fontWeight:800,color:'var(--t3)',textAlign:'center',textTransform:'uppercase',letterSpacing:'.5px'}}>
                    {d.slice(0,3)}
                    <div style={{fontSize:10,fontWeight:600,color:'var(--t3)',textTransform:'none',letterSpacing:0}}>{fmtDate(addDays(weekStart,DAYS.indexOf(d)))}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['FOH','BOH'].map(sec=>(roles[sec]||[]).map(role=>{
                const reqCount=requirements[`${block.id}__${sec}__${role}`]||0
                if(!reqCount&&!isManager)return null
                return (
                  <tr key={`${sec}-${role}`}>
                    <td style={{padding:'6px 8px',verticalAlign:'middle'}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <span className={sec==='FOH'?'bfoh':'bboh'}>{sec}</span>
                        <span style={{fontSize:13,fontWeight:700}}>{role}</span>
                        {reqCount>0&&<span style={{fontSize:10,color:'var(--t3)',fontWeight:700,marginLeft:'auto'}}>×{reqCount}</span>}
                      </div>
                    </td>
                    {weekDays.map(day=>{
                      const key=`${day}__${block.id}__${sec}__${role}`
                      const filled=schedule[key]||[]
                      const isDragOver=dragOver===key
                      const isMet=reqCount>0&&filled.length>=reqCount
                      return (
                        <td key={day} style={{padding:'4px'}}>
                          <div
                            className={`shift-cell${isDragOver?' drag-over':''}`}
                            style={{background:isMet?'rgba(45,168,130,.06)':filled.length>0?'rgba(0,0,0,.02)':'transparent',minHeight:44,display:'flex',flexWrap:'wrap',gap:3,alignContent:'flex-start',padding:4}}
                            onDragOver={e=>isManager&&onDragOver(e,key)}
                            onDragLeave={onDragLeave}
                            onDrop={e=>isManager&&onDrop(e,key)}
                          >
                            {filled.map(eid=>{
                              const emp=empById(eid)
                              if(!emp)return null
                              return (
                                <div key={eid} className={`emp-chip${dragState?.empId===eid&&dragState?.fromKey===key&&!dragState?.copyMode?' dragging':''}`}
                                  draggable={isManager}
                                  onDragStart={e=>isManager&&onDragStart(e,eid,key)}
                                  onDragEnd={onDragEnd}
                                  onTouchStart={e=>isManager&&onTouchStart(e,eid,key)}
                                  title={`${emp.name} — drag to move, Alt+drag to copy`}>
                                  <div className="av chip-av" style={{background:avi(emp.name)}}>{ini(emp.name)}</div>
                                  <span style={{maxWidth:70,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{emp.name.split(' ')[0]}</span>
                                  {isManager&&<div className="chip-x" onClick={e=>{e.stopPropagation();removeEmp(key,eid)}}><Ic p={P.x} s={9}/></div>}
                                </div>
                              )
                            })}
                            {isManager&&(
                              <div style={{position:'relative'}}>
                                <select style={{opacity:0,position:'absolute',inset:0,width:'100%',height:'100%',cursor:'pointer'}}
                                  value="" onChange={e=>e.target.value&&addEmp(key,e.target.value)}>
                                  <option value="">Add…</option>
                                  {employees.filter(e=>e.section===sec&&(e.roles||[]).includes(role)&&!filled.includes(e.id)).map(e=>(
                                    <option key={e.id} value={e.id}>{e.name}{availability[day]?.[e.id]?'':' (unavail)'}</option>
                                  ))}
                                </select>
                                <button className="add-emp-btn">+</button>
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              }))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Requirements editor */}
      {isManager&&showReqEditor&&(
        <div className="card">
          <div className="ct">Shift Requirements — staff needed per role per block</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:8}}>
            {shiftBlocks.map(block=>['FOH','BOH'].map(sec=>(roles[sec]||[]).map(role=>{
              const k=`${block.id}__${sec}__${role}`
              return (
                <div key={k} style={{display:'flex',alignItems:'center',gap:8,background:'var(--s2)',borderRadius:8,padding:'8px 10px'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:'var(--t3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.3px'}}>{block.name} · {sec}</div>
                    <div style={{fontSize:13,fontWeight:700}}>{role}</div>
                  </div>
                  <input type="number" min="0" max="20" value={requirements[k]||0}
                    style={{width:42,padding:'4px 6px',textAlign:'center',borderRadius:6,border:'1px solid var(--b2)',background:'var(--s)',color:'var(--t)',fontSize:13,fontWeight:700}}
                    onChange={async e=>{
                      const nr={...requirements,[k]:+e.target.value}
                      setRequirements(nr)
                      await sb.from('shift_requirements').upsert({restaurant_id:rid,requirements:nr},{onConflict:'restaurant_id'})
                    }}/>
                </div>
              )
            })))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── EMPLOYEES VIEW ────────────────────────────────────────────────────────────
function EmployeesView({rid,employees,setEmployees,roles}) {
  const {isManager,user}=useAuth()
  const [showInvite,setShowInvite]=useState(false)
  const [search,setSearch]=useState('')
  const [editEmp,setEditEmp]=useState(null)
  const [delConfirm,setDelConfirm]=useState(null)
  const [form,setForm]=useState({name:'',email:'',phone:'',section:'FOH',roles:[],role_level:'employee'})
  const [busy,setBusy]=useState(false)
  const [err,setErr]=useState('')

  const reload = async () => {
    const {data:mems}=await sb.from('restaurant_members').select('*,profile:profiles(*)').eq('restaurant_id',rid).neq('status','inactive')
    setEmployees((mems||[]).map(m=>({...m.profile,role_level:m.role_level,section:m.section,roles:m.roles,member_id:m.id,status:m.status})))
  }

  const invite = async () => {
    setBusy(true);setErr('')
    const {error}=await sb.auth.signInWithOtp({email:form.email,options:{shouldCreateUser:true,data:{name:form.name},emailRedirectTo:window.location.origin}})
    if(error){setErr(error.message);setBusy(false);return}
    let {data:existing}=await sb.from('profiles').select('id').eq('email',form.email).single()
    let pid=existing?.id
    if(!pid){pid=crypto.randomUUID(); await sb.from('profiles').insert({id:pid,name:form.name,email:form.email})}
    await sb.from('restaurant_members').upsert({restaurant_id:rid,profile_id:pid,role_level:form.role_level,section:form.section,roles:form.roles,status:'invited'},{onConflict:'restaurant_id,profile_id'})
    await reload(); setShowInvite(false); setForm({name:'',email:'',phone:'',section:'FOH',roles:[],role_level:'employee'}); setBusy(false)
  }

  const saveEdit = async () => {
    if(!editEmp)return; setBusy(true)
    await sb.from('profiles').update({name:editEmp.name,phone:editEmp.phone}).eq('id',editEmp.id)
    await sb.from('restaurant_members').update({role_level:editEmp.role_level,section:editEmp.section,roles:editEmp.roles}).eq('id',editEmp.member_id)
    await reload(); setEditEmp(null); setBusy(false)
  }

  const deleteEmp = async emp => {
    await sb.from('restaurant_members').update({status:'inactive'}).eq('id',emp.member_id)
    await reload(); setDelConfirm(null)
  }

  const toggleRole = (r,arr,setter) => setter(arr.includes(r)?arr.filter(x=>x!==r):[...arr,r])

  const filtered=employees.filter(e=>e.name?.toLowerCase().includes(search.toLowerCase())||e.email?.toLowerCase().includes(search.toLowerCase()))
  const ECSS=`.empg{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;}.ecard{background:var(--s);border:1px solid var(--b);border-radius:11px;padding:14px;transition:all .12s;}.ecard:hover{border-color:var(--b2);}`

  return (
    <div>
      <style>{ECSS}</style>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        <input className="fi" style={{maxWidth:260,marginBottom:0}} placeholder="Search employees…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <span style={{fontSize:13,color:'var(--t3)',fontWeight:600}}>{employees.length} staff</span>
        {isManager&&<button className="btn pr" style={{marginLeft:'auto',fontSize:12}} onClick={()=>setShowInvite(true)}><Ic p={P.plus} s={13}/>Invite Employee</button>}
      </div>
      <div className="empg">
        {filtered.map(emp=>(
          <div key={emp.id} className="ecard">
            <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:10}}>
              <div className="av" style={{background:avi(emp.name),width:36,height:36,fontSize:13}}>{ini(emp.name)}</div>
              <div style={{flex:1,overflow:'hidden'}}>
                <div style={{fontWeight:700,fontSize:14,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{emp.name}</div>
                <div style={{fontSize:11,color:'var(--t3)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{emp.email}</div>
              </div>
              {isManager&&(
                <div style={{display:'flex',gap:4}}>
                  <button className="btn ic gh" style={{padding:'4px'}} onClick={()=>setEditEmp({...emp})}><Ic p={P.edit} s={13}/></button>
                  <button className="btn ic btn-re" style={{padding:'4px'}} onClick={()=>setDelConfirm(emp)}><Ic p={P.trash} s={13}/></button>
                </div>
              )}
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              <span className={emp.section==='FOH'?'bfoh':'bboh'}>{emp.section}</span>
              <span className={`badge ${emp.status==='active'?'badge-approved':'badge-invited'}`}>{emp.status}</span>
              <span className="badge" style={{background:'rgba(0,0,0,.06)',color:'var(--t2)'}}>{emp.role_level}</span>
              {(emp.roles||[]).map(r=><span key={r} className="badge" style={{background:'var(--s2)',color:'var(--t2)'}}>{r}</span>)}
            </div>
            {emp.phone&&<div style={{fontSize:11,color:'var(--t3)',marginTop:6,fontWeight:600}}>{emp.phone}</div>}
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInvite&&(
        <div className="ov" onClick={e=>e.target===e.currentTarget&&setShowInvite(false)}>
          <div className="modal">
            <div className="modal-title">Invite Employee</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div className="fg"><label className="lbl">Full Name</label><input className="fi" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Jane Smith"/></div>
              <div className="fg"><label className="lbl">Email</label><input className="fi" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="jane@email.com"/></div>
              <div className="fg"><label className="lbl">Phone</label><input className="fi" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="(312) 555-0000"/></div>
              <div className="fg"><label className="lbl">Section</label><select className="fi" value={form.section} onChange={e=>setForm(f=>({...f,section:e.target.value,roles:[]}))}><option>FOH</option><option>BOH</option></select></div>
              <div className="fg"><label className="lbl">Role Level</label><select className="fi" value={form.role_level} onChange={e=>setForm(f=>({...f,role_level:e.target.value}))}><option value="employee">Employee</option><option value="manager">Manager</option><option value="owner">Owner</option></select></div>
            </div>
            <div className="fg"><label className="lbl">Positions</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:4}}>
                {(roles[form.section]||[]).map(r=>(
                  <button key={r} type="button" className={`btn ${form.roles.includes(r)?'pr':'se'}`} style={{fontSize:12,padding:'4px 10px'}}
                    onClick={()=>setForm(f=>({...f,roles:f.roles.includes(r)?f.roles.filter(x=>x!==r):[...f.roles,r]}))}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {err&&<div className="err-box">{err}</div>}
            <div className="ma">
              <button className="btn se" onClick={()=>setShowInvite(false)}>Cancel</button>
              <button className="btn pr" onClick={invite} disabled={!form.name||!form.email||busy}>{busy?'Sending…':'Send Invite'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editEmp&&(
        <div className="ov" onClick={e=>e.target===e.currentTarget&&setEditEmp(null)}>
          <div className="modal">
            <div className="modal-title">Edit Employee</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div className="fg"><label className="lbl">Full Name</label><input className="fi" value={editEmp.name} onChange={e=>setEditEmp(f=>({...f,name:e.target.value}))}/></div>
              <div className="fg"><label className="lbl">Phone</label><input className="fi" value={editEmp.phone||''} onChange={e=>setEditEmp(f=>({...f,phone:e.target.value}))}/></div>
              <div className="fg"><label className="lbl">Section</label><select className="fi" value={editEmp.section||'FOH'} onChange={e=>setEditEmp(f=>({...f,section:e.target.value,roles:[]}))}>  <option>FOH</option><option>BOH</option></select></div>
              <div className="fg"><label className="lbl">Role Level</label><select className="fi" value={editEmp.role_level} onChange={e=>setEditEmp(f=>({...f,role_level:e.target.value}))}><option value="employee">Employee</option><option value="manager">Manager</option><option value="owner">Owner</option></select></div>
            </div>
            <div className="fg"><label className="lbl">Positions</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:4}}>
                {(roles[editEmp.section||'FOH']||[]).map(r=>(
                  <button key={r} type="button" className={`btn ${(editEmp.roles||[]).includes(r)?'pr':'se'}`} style={{fontSize:12,padding:'4px 10px'}}
                    onClick={()=>setEditEmp(f=>({...f,roles:(f.roles||[]).includes(r)?(f.roles||[]).filter(x=>x!==r):[...(f.roles||[]),r]}))}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="ma">
              <button className="btn se" onClick={()=>setEditEmp(null)}>Cancel</button>
              <button className="btn pr" onClick={saveEdit} disabled={busy}>{busy?'Saving…':'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delConfirm&&(
        <div className="ov" onClick={e=>e.target===e.currentTarget&&setDelConfirm(null)}>
          <div className="modal" style={{maxWidth:360}}>
            <div className="modal-title">Remove Employee?</div>
            <p style={{fontSize:13,color:'var(--t2)',marginBottom:16,fontWeight:500}}>This will remove <strong>{delConfirm.name}</strong> from this restaurant. They can be re-invited later.</p>
            <div className="ma">
              <button className="btn se" onClick={()=>setDelConfirm(null)}>Cancel</button>
              <button className="btn btn-re" onClick={()=>deleteEmp(delConfirm)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── AVAILABILITY VIEW ─────────────────────────────────────────────────────────
function AvailabilityView({rid,employees,availability}) {
  const {user,isManager}=useAuth()
  const [myAvail,setMyAvail]=useState([])
  const [busy,setBusy]=useState(false)

  useEffect(()=>{
    if(!rid)return
    sb.from('availability').select('standing_days').eq('restaurant_id',rid).eq('employee_id',user.id).single()
      .then(({data})=>setMyAvail(data?.standing_days||[]))
  },[rid])

  const toggleDay = async day => {
    const next=myAvail.includes(day)?myAvail.filter(d=>d!==day):[...myAvail,day]
    setMyAvail(next); setBusy(true)
    await sb.from('availability').upsert({restaurant_id:rid,employee_id:user.id,standing_days:next},{onConflict:'restaurant_id,employee_id'})
    setBusy(false)
  }

  return (
    <div>
      <div className="card" style={{marginBottom:14}}>
        <div className="ct">My Availability</div>
        <p style={{fontSize:13,color:'var(--t2)',marginBottom:14,fontWeight:500}}>Select the days you're generally available to work.</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
          {DAYS.map(d=>(
            <button key={d} className={`btn ${myAvail.includes(d)?'pr':'se'}`} style={{fontSize:13,padding:'8px 14px'}} onClick={()=>toggleDay(d)}>
              {d.slice(0,3)}
            </button>
          ))}
        </div>
        {busy&&<div style={{fontSize:12,color:'var(--t3)',marginTop:10,fontWeight:600}}>Saving…</div>}
      </div>
      {isManager&&(
        <div className="card">
          <div className="ct">Team Availability Overview</div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:500}}>
              <thead><tr>
                <th style={{padding:'6px 10px',fontSize:10,fontWeight:800,color:'var(--t3)',textAlign:'left',textTransform:'uppercase',letterSpacing:'.5px'}}>Employee</th>
                {DAYS.map(d=><th key={d} style={{padding:'6px 8px',fontSize:10,fontWeight:800,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.5px',textAlign:'center'}}>{d.slice(0,3)}</th>)}
              </tr></thead>
              <tbody>
                {employees.map(emp=>(
                  <tr key={emp.id} style={{borderTop:'1px solid var(--b)'}}>
                    <td style={{padding:'8px 10px',fontWeight:600,fontSize:13}}>{emp.name}</td>
                    {DAYS.map(d=>(
                      <td key={d} style={{padding:'8px',textAlign:'center'}}>
                        {availability[d]?.[emp.id]
                          ? <span style={{color:'var(--gr)',fontWeight:700,fontSize:14}}>✓</span>
                          : <span style={{color:'var(--b2)',fontSize:12}}>–</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── REQUESTS VIEW (Time off + Shift Trades) ───────────────────────────────────
function RequestsView({rid,employees}) {
  const {user,isManager}=useAuth()
  const [tab,setTab]=useState('timeoff') // timeoff | trades
  const [requests,setRequests]=useState([])
  const [trades,setTrades]=useState([])
  const [showNewReq,setShowNewReq]=useState(false)
  const [form,setForm]=useState({type:'time-off',dates:'',reason:''})
  const [busy,setBusy]=useState(false)

  const loadRequests = async () => {
    const {data}=await sb.from('time_off_requests').select('*,employee:profiles(name,email)').eq('restaurant_id',rid).order('created_at',{ascending:false})
    setRequests(data||[])
  }
  const loadTrades = async () => {
    const {data}=await sb.from('shift_trades').select('*,requester:profiles!shift_trades_requester_id_fkey(name),claimed:profiles!shift_trades_claimed_by_fkey(name)').eq('restaurant_id',rid).order('created_at',{ascending:false})
    setTrades(data||[])
  }

  useEffect(()=>{ if(!rid)return; loadRequests(); loadTrades() },[rid])

  const submitRequest = async () => {
    if(!form.dates.trim())return; setBusy(true)
    await sb.from('time_off_requests').insert({restaurant_id:rid,employee_id:user.id,type:form.type,dates:form.dates,reason:form.reason})
    setShowNewReq(false); setForm({type:'time-off',dates:'',reason:''}); setBusy(false); loadRequests()
  }

  const reviewRequest = async (id, status) => {
    await sb.from('time_off_requests').update({status,reviewed_by:user.id,reviewed_at:new Date().toISOString()}).eq('id',id)
    loadRequests()
  }

  const claimTrade = async trade => {
    await sb.from('shift_trades').update({claimed_by:user.id,status:'accepted'}).eq('id',trade.id)
    loadTrades()
  }

  const reviewTrade = async (id, status) => {
    await sb.from('shift_trades').update({status,reviewed_by:user.id,reviewed_at:new Date().toISOString()}).eq('id',id)
    loadTrades()
  }

  const myRequests=requests.filter(r=>r.employee_id===user.id)
  const pendingRequests=requests.filter(r=>r.status==='pending')
  const pendingTrades=trades.filter(t=>t.status==='pending'||t.status==='accepted')

  return (
    <div>
      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:16,background:'var(--s)',border:'1px solid var(--b)',borderRadius:10,padding:4,width:'fit-content'}}>
        {[['timeoff','Time Off'],['trades','Shift Trades']].map(([id,lbl])=>(
          <button key={id} className={`btn ${tab===id?'pr':'gh'}`} style={{fontSize:13,border:'none'}} onClick={()=>setTab(id)}>{lbl}
            {id==='timeoff'&&pendingRequests.length>0&&isManager&&<span className="ni-badge" style={{marginLeft:6}}>{pendingRequests.length}</span>}
            {id==='trades'&&pendingTrades.length>0&&<span className="ni-badge" style={{marginLeft:6}}>{pendingTrades.length}</span>}
          </button>
        ))}
      </div>

      {tab==='timeoff'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:600,color:'var(--t2)'}}>{isManager?`${pendingRequests.length} pending requests`:'Submit and track your time off requests'}</div>
            <button className="btn pr" style={{fontSize:12}} onClick={()=>setShowNewReq(true)}><Ic p={P.plus} s={13}/>New Request</button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {(isManager?requests:myRequests).map(req=>(
              <div key={req.id} className="card" style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                <div style={{flex:1,minWidth:200}}>
                  {isManager&&<div style={{fontWeight:700,fontSize:13}}>{req.employee?.name}</div>}
                  <div style={{fontWeight:700,fontSize:13,color:'var(--t)'}}>{req.type==='time-off'?'🏖️ Time Off':'📅 Request Off'} — {req.dates}</div>
                  {req.reason&&<div style={{fontSize:12,color:'var(--t2)',marginTop:2,fontWeight:500}}>{req.reason}</div>}
                  <div style={{fontSize:11,color:'var(--t3)',marginTop:3,fontWeight:600}}>{fmtAgo(req.created_at)}</div>
                </div>
                <span className={`badge badge-${req.status}`}>{req.status}</span>
                {isManager&&req.status==='pending'&&(
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn btn-gr" style={{fontSize:12}} onClick={()=>reviewRequest(req.id,'approved')}><Ic p={P.check} s={13}/>Approve</button>
                    <button className="btn btn-re" style={{fontSize:12}} onClick={()=>reviewRequest(req.id,'denied')}><Ic p={P.x} s={13}/>Deny</button>
                  </div>
                )}
              </div>
            ))}
            {(isManager?requests:myRequests).length===0&&<div style={{textAlign:'center',padding:'32px',color:'var(--t3)',fontWeight:600,fontSize:13}}>No requests yet</div>}
          </div>
        </div>
      )}

      {tab==='trades'&&(
        <div>
          <div style={{fontSize:13,fontWeight:600,color:'var(--t2)',marginBottom:14}}>
            {isManager?'Review trade requests':'View open shifts and trade requests'}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {trades.map(trade=>(
              <div key={trade.id} className="card" style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                <div style={{flex:1,minWidth:200}}>
                  <div style={{fontWeight:700,fontSize:13,display:'flex',alignItems:'center',gap:6}}>
                    {trade.is_auction?<span className="badge badge-auction">🔔 Auction</span>:<span className="badge badge-pending">🔄 Trade Request</span>}
                  </div>
                  <div style={{fontSize:13,color:'var(--t)',marginTop:4,fontWeight:600}}>{trade.requester?.name} · {trade.shift_day} {trade.shift_block_id} shift</div>
                  <div style={{fontSize:12,color:'var(--t2)',fontWeight:500}}>{trade.shift_role} ({trade.shift_section})</div>
                  {trade.claimed&&<div style={{fontSize:12,color:'var(--gr)',marginTop:2,fontWeight:600}}>Claimed by {trade.claimed?.name}</div>}
                  <div style={{fontSize:11,color:'var(--t3)',marginTop:3,fontWeight:600}}>{fmtAgo(trade.created_at)}</div>
                </div>
                <span className={`badge badge-${trade.status}`}>{trade.status}</span>
                {!isManager&&trade.is_auction&&trade.status==='pending'&&trade.requester_id!==user.id&&!trade.claimed_by&&(
                  <button className="btn btn-gr" style={{fontSize:12}} onClick={()=>claimTrade(trade)}><Ic p={P.check} s={13}/>Claim Shift</button>
                )}
                {isManager&&(trade.status==='pending'||trade.status==='accepted')&&(
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn btn-gr" style={{fontSize:12}} onClick={()=>reviewTrade(trade.id,'approved')}><Ic p={P.check} s={13}/>Approve</button>
                    <button className="btn btn-re" style={{fontSize:12}} onClick={()=>reviewTrade(trade.id,'denied')}><Ic p={P.x} s={13}/>Deny</button>
                  </div>
                )}
              </div>
            ))}
            {trades.length===0&&<div style={{textAlign:'center',padding:'32px',color:'var(--t3)',fontWeight:600,fontSize:13}}>No shift trades yet</div>}
          </div>
        </div>
      )}

      {showNewReq&&(
        <div className="ov" onClick={e=>e.target===e.currentTarget&&setShowNewReq(false)}>
          <div className="modal" style={{maxWidth:420}}>
            <div className="modal-title">New Request</div>
            <div className="fg"><label className="lbl">Type</label>
              <select className="fi" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                <option value="time-off">Time Off (vacation, sick, etc.)</option>
                <option value="request-off">Request Off (prefer not to work)</option>
              </select>
            </div>
            <div className="fg"><label className="lbl">Dates</label><input className="fi" value={form.dates} onChange={e=>setForm(f=>({...f,dates:e.target.value}))} placeholder="e.g. March 15-17 or every Sunday in April"/></div>
            <div className="fg"><label className="lbl">Reason (optional)</label><textarea className="fi" value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} placeholder="Any details for your manager…"/></div>
            <div className="ma">
              <button className="btn se" onClick={()=>setShowNewReq(false)}>Cancel</button>
              <button className="btn pr" onClick={submitRequest} disabled={!form.dates.trim()||busy}>{busy?'Submitting…':'Submit Request'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── CHAT VIEW ─────────────────────────────────────────────────────────────────
function ChatView({rid,employees}) {
  const {user,profile}=useAuth()
  const [channels,setChannels]=useState([])
  const [active,setActive]=useState(null)
  const [messages,setMessages]=useState([])
  const [msg,setMsg]=useState('')
  const bottomRef=useRef()

  useEffect(()=>{
    if(!rid)return
    sb.from('channels').select('*').eq('restaurant_id',rid).order('name')
      .then(({data})=>{ setChannels(data||[]); if(data?.[0])setActive(data[0]) })
  },[rid])

  useEffect(()=>{
    if(!active||!rid)return
    sb.from('messages').select('*,sender:profiles(name)').eq('channel_id',active.id).eq('restaurant_id',rid).order('created_at')
      .then(({data})=>setMessages(data||[]))
    const sub=sb.channel(`chat:${active.id}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`channel_id=eq.${active.id}`},p=>{
      setMessages(prev=>[...prev,p.new])
    }).subscribe()
    return ()=>sb.removeChannel(sub)
  },[active,rid])

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}) },[messages])

  const send = async e => {
    e?.preventDefault(); if(!msg.trim()||!active)return
    const txt=msg.trim(); setMsg('')
    await sb.from('messages').insert({restaurant_id:rid,channel_id:active.id,sender_id:user.id,text:txt})
  }

  return (
    <div style={{display:'flex',flex:1,overflow:'hidden',height:'100%'}}>
      <div style={{width:160,background:'var(--s)',borderRight:'1px solid var(--b)',padding:10,display:'flex',flexDirection:'column',gap:2,flexShrink:0}}>
        <div className="ct" style={{padding:'4px 8px',marginBottom:6}}>Channels</div>
        {channels.map(c=>(
          <button key={c.id} className={`ni ${active?.id===c.id?'on':''}`} style={{fontSize:12,padding:'7px 9px'}} onClick={()=>setActive(c)}>
            # {c.name}
          </button>
        ))}
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{padding:'12px 16px',borderBottom:'1px solid var(--b)',fontWeight:700,fontSize:14,background:'var(--s)'}}>
          # {active?.name}
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:8}}>
          {messages.map((m,i)=>{
            const isMe=m.sender_id===user.id
            const prev=messages[i-1]
            const showName=!prev||prev.sender_id!==m.sender_id
            return (
              <div key={m.id} style={{display:'flex',gap:8,alignItems:'flex-end',flexDirection:isMe?'row-reverse':'row'}}>
                {!isMe&&showName&&<div className="av" style={{background:avi(m.sender?.name||'?'),width:28,height:28,fontSize:10,flexShrink:0}}>{ini(m.sender?.name||'?')}</div>}
                {!isMe&&!showName&&<div style={{width:28,flexShrink:0}}/>}
                <div style={{maxWidth:'70%'}}>
                  {showName&&!isMe&&<div style={{fontSize:11,fontWeight:700,color:'var(--t3)',marginBottom:2,marginLeft:4}}>{m.sender?.name}</div>}
                  <div style={{background:isMe?'var(--a)':'var(--s)',color:isMe?'#fff':'var(--t)',padding:'8px 12px',borderRadius:isMe?'12px 12px 4px 12px':'12px 12px 12px 4px',fontSize:13,fontWeight:500,border:isMe?'none':'1px solid var(--b)',lineHeight:1.4}}>
                    {m.text}
                  </div>
                  <div style={{fontSize:10,color:'var(--t3)',marginTop:2,textAlign:isMe?'right':'left',fontWeight:600}}>{fmtAgo(m.created_at)}</div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef}/>
        </div>
        <div style={{padding:'10px 14px',borderTop:'1px solid var(--b)',background:'var(--s)',display:'flex',gap:8}}>
          <input className="fi" style={{flex:1}} value={msg} onChange={e=>setMsg(e.target.value)} placeholder={`Message #${active?.name||''}…`} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send(e)}/>
          <button className="btn pr ic" onClick={send} disabled={!msg.trim()}><Ic p={P.send} s={15}/></button>
        </div>
      </div>
    </div>
  )
}

// ── SETTINGS VIEW ─────────────────────────────────────────────────────────────
function SettingsView({rid,roles,setRoles,shiftBlocks,setShiftBlocks,openDays,setOpenDays,theme,toggleTheme}) {
  const {isOwner}=useAuth()
  const [newRole,setNewRole]=useState(''); const [newRoleSec,setNewRoleSec]=useState('FOH')
  const [newBlock,setNewBlock]=useState({name:'',start:'11:00',end:'15:00',color:'#2DA882'})
  const [showBlock,setShowBlock]=useState(false)

  const save = updates => sb.from('restaurant_settings').update(updates).eq('restaurant_id',rid)

  const addRole = () => {
    if(!newRole.trim())return
    const u={...roles,[newRoleSec]:[...(roles[newRoleSec]||[]),newRole.trim()]}
    setRoles(u); setNewRole(''); save({foh_roles:u.FOH,boh_roles:u.BOH})
  }
  const removeRole = (sec,r) => { const u={...roles,[sec]:roles[sec].filter(x=>x!==r)}; setRoles(u); save({foh_roles:u.FOH,boh_roles:u.BOH}) }
  const toggleDay = day => { const u={...openDays,[day]:!openDays[day]}; setOpenDays(u); save({open_days:u}) }
  const addBlock = () => {
    if(!newBlock.name.trim())return
    const u=[...shiftBlocks,{id:`block-${Date.now()}`,...newBlock}]
    setShiftBlocks(u); save({shift_blocks:u}); setNewBlock({name:'',start:'11:00',end:'15:00',color:'#2DA882'}); setShowBlock(false)
  }
  const removeBlock = id => { const u=shiftBlocks.filter(b=>b.id!==id); setShiftBlocks(u); save({shift_blocks:u}) }

  return (
    <div style={{maxWidth:640}}>
      {/* Appearance */}
      <div className="settings-section">
        <div className="settings-title">Appearance</div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:13,fontWeight:700}}>Theme</div>
            <div style={{fontSize:12,color:'var(--t2)',fontWeight:500,marginTop:2}}>Currently in {theme} mode</div>
          </div>
          <button className="btn se" onClick={toggleTheme}>
            <Ic p={theme==='light'?P.moon:P.sun} s={14}/>{theme==='light'?'Switch to Dark':'Switch to Light'}
          </button>
        </div>
      </div>

      {/* Open Days */}
      <div className="settings-section">
        <div className="settings-title">Open Days</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
          {DAYS.map(d=>(
            <button key={d} className={`btn ${openDays[d]!==false?'pr':'se'}`} style={{fontSize:12,padding:'6px 12px'}} onClick={()=>toggleDay(d)}>
              {d.slice(0,3)}
            </button>
          ))}
        </div>
      </div>

      {/* Shift Blocks */}
      <div className="settings-section">
        <div className="settings-title">Shift Blocks</div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
          {shiftBlocks.map(block=>(
            <div key={block.id} style={{display:'flex',alignItems:'center',gap:10,background:'var(--s2)',borderRadius:8,padding:'9px 12px'}}>
              <div style={{width:12,height:12,borderRadius:3,background:block.color,flexShrink:0}}/>
              <span style={{fontWeight:700,fontSize:13,flex:1}}>{block.name}</span>
              <span style={{fontSize:12,color:'var(--t2)',fontWeight:600}}>{block.start} – {block.end}</span>
              {isOwner&&<button className="btn ic btn-re" style={{padding:'3px'}} onClick={()=>removeBlock(block.id)}><Ic p={P.trash} s={12}/></button>}
            </div>
          ))}
        </div>
        {isOwner&&(showBlock ? (
          <div style={{background:'var(--s2)',borderRadius:9,padding:12}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:8,alignItems:'end'}}>
              <div className="fg" style={{marginBottom:0}}><label className="lbl">Name</label><input className="fi" value={newBlock.name} onChange={e=>setNewBlock(b=>({...b,name:e.target.value}))} placeholder="e.g. Brunch"/></div>
              <div className="fg" style={{marginBottom:0}}><label className="lbl">Start</label><input className="fi" type="time" value={newBlock.start} onChange={e=>setNewBlock(b=>({...b,start:e.target.value}))}/></div>
              <div className="fg" style={{marginBottom:0}}><label className="lbl">End</label><input className="fi" type="time" value={newBlock.end} onChange={e=>setNewBlock(b=>({...b,end:e.target.value}))}/></div>
              <input type="color" value={newBlock.color} onChange={e=>setNewBlock(b=>({...b,color:e.target.value}))} style={{width:36,height:36,border:'1px solid var(--b2)',borderRadius:7,cursor:'pointer',padding:2}}/>
            </div>
            <div style={{display:'flex',gap:7,marginTop:10}}>
              <button className="btn se" style={{fontSize:12}} onClick={()=>setShowBlock(false)}>Cancel</button>
              <button className="btn pr" style={{fontSize:12}} onClick={addBlock} disabled={!newBlock.name.trim()}>Add Block</button>
            </div>
          </div>
        ) : (
          <button className="btn se" style={{fontSize:12}} onClick={()=>setShowBlock(true)}><Ic p={P.plus} s={13}/>Add Shift Block</button>
        ))}
      </div>

      {/* Roles */}
      {['FOH','BOH'].map(sec=>(
        <div key={sec} className="settings-section">
          <div className="settings-title">{sec} Roles</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
            {(roles[sec]||[]).map(r=>(
              <div key={r} style={{display:'flex',alignItems:'center',gap:4,background:'var(--s2)',border:'1px solid var(--b)',borderRadius:7,padding:'4px 8px 4px 10px',fontSize:13,fontWeight:600}}>
                {r}
                {isOwner&&<button style={{background:'none',border:'none',cursor:'pointer',color:'var(--t3)',display:'flex',alignItems:'center',padding:'0 0 0 2px'}} onClick={()=>removeRole(sec,r)}><Ic p={P.x} s={12}/></button>}
              </div>
            ))}
          </div>
          {isOwner&&(
            <div style={{display:'flex',gap:7}}>
              <input className="fi" style={{flex:1}} placeholder={`New ${sec} role…`} value={newRoleSec===sec?newRole:''} onFocus={()=>setNewRoleSec(sec)} onChange={e=>setNewRole(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addRole()}/>
              <button className="btn pr" style={{fontSize:12}} onClick={addRole} disabled={!newRole.trim()||newRoleSec!==sec}><Ic p={P.plus} s={13}/>Add</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── SHIFT TEMPLATES VIEW ──────────────────────────────────────────────────────
function ShiftTemplatesView({rid,roles,shiftBlocks,requirements,setRequirements,openDays}) {
  const [templates,setTemplates]=useState([])
  const [showNew,setShowNew]=useState(false)
  const [form,setForm]=useState({name:'',days:[],shiftBlockId:'',roleCounts:{}})

  const load = () => sb.from('shift_templates').select('*').eq('restaurant_id',rid).order('created_at').then(({data})=>setTemplates(data||[]))
  useEffect(()=>{ if(rid)load() },[rid])

  const save = async () => {
    if(!form.name||!form.shiftBlockId||!form.days.length)return
    await sb.from('shift_templates').insert({restaurant_id:rid,name:form.name,days:form.days,shift_block_id:form.shiftBlockId,role_counts:form.roleCounts})
    setShowNew(false); setForm({name:'',days:[],shiftBlockId:'',roleCounts:{}}); load()
  }

  const apply = async tmpl => {
    const nr={...requirements}
    ;['FOH','BOH'].forEach(sec=>{
      ;(roles[sec]||[]).forEach(role=>{
        const k=`${tmpl.shift_block_id}__${sec}__${role}`
        const count=tmpl.role_counts?.[`${sec}__${role}`]||0
        if(count>0) nr[k]=count
      })
    })
    setRequirements(nr)
    await sb.from('shift_requirements').upsert({restaurant_id:rid,requirements:nr},{onConflict:'restaurant_id'})
  }

  const del = async id => { await sb.from('shift_templates').delete().eq('id',id); load() }

  const toggleDay = d => setForm(f=>({...f,days:f.days.includes(d)?f.days.filter(x=>x!==d):[...f.days,d]}))
  const weekDays = DAYS.filter(d=>openDays[d]!==false)
  const selectedBlock = shiftBlocks.find(b=>b.form?.shiftBlockId===b.id)

  return (
    <div>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:14}}>
        <button className="btn pr" style={{fontSize:12}} onClick={()=>setShowNew(true)}><Ic p={P.plus} s={13}/>New Template</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>
        {templates.map(tmpl=>(
          <div key={tmpl.id} className="card">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div style={{fontWeight:800,fontSize:14}}>{tmpl.name}</div>
              <button className="btn ic btn-re" style={{padding:'3px'}} onClick={()=>del(tmpl.id)}><Ic p={P.trash} s={12}/></button>
            </div>
            <div style={{fontSize:12,color:'var(--t2)',marginBottom:8,fontWeight:600}}>
              {shiftBlocks.find(b=>b.id===tmpl.shift_block_id)?.name||tmpl.shift_block_id} · {(tmpl.days||[]).map(d=>d.slice(0,3)).join(', ')}
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
              {Object.entries(tmpl.role_counts||{}).filter(([,v])=>v>0).map(([k,v])=>(
                <span key={k} className="badge" style={{background:'var(--s2)',color:'var(--t2)'}}>{k.split('__')[1]} ×{v}</span>
              ))}
            </div>
            <button className="btn se" style={{width:'100%',justifyContent:'center',fontSize:12}} onClick={()=>apply(tmpl)}>
              <Ic p={P.zap} s={13}/>Apply to Requirements
            </button>
          </div>
        ))}
        {templates.length===0&&<div style={{color:'var(--t3)',fontWeight:600,fontSize:13,padding:'24px 0'}}>No templates yet. Create one to save your shift patterns.</div>}
      </div>

      {showNew&&(
        <div className="ov" onClick={e=>e.target===e.currentTarget&&setShowNew(false)}>
          <div className="modal">
            <div className="modal-title">New Shift Template</div>
            <div className="fg"><label className="lbl">Template Name</label><input className="fi" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Lunch Weekdays"/></div>
            <div className="fg"><label className="lbl">Shift Block</label>
              <select className="fi" value={form.shiftBlockId} onChange={e=>setForm(f=>({...f,shiftBlockId:e.target.value}))}>
                <option value="">Select…</option>
                {shiftBlocks.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="fg"><label className="lbl">Days</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:4}}>
                {weekDays.map(d=>(
                  <button key={d} type="button" className={`btn ${form.days.includes(d)?'pr':'se'}`} style={{fontSize:12,padding:'5px 11px'}} onClick={()=>toggleDay(d)}>{d.slice(0,3)}</button>
                ))}
              </div>
            </div>
            {form.shiftBlockId&&(
              <div className="fg"><label className="lbl">Staff Count per Role</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:4}}>
                  {['FOH','BOH'].map(sec=>(roles[sec]||[]).map(role=>(
                    <div key={`${sec}-${role}`} style={{display:'flex',alignItems:'center',gap:8,background:'var(--s2)',borderRadius:7,padding:'7px 10px'}}>
                      <span className={sec==='FOH'?'bfoh':'bboh'}>{sec}</span>
                      <span style={{fontSize:12,fontWeight:700,flex:1}}>{role}</span>
                      <input type="number" min="0" max="20" value={form.roleCounts[`${sec}__${role}`]||0}
                        style={{width:38,padding:'3px 5px',textAlign:'center',borderRadius:5,border:'1px solid var(--b2)',background:'var(--s)',color:'var(--t)',fontSize:13,fontWeight:700}}
                        onChange={e=>setForm(f=>({...f,roleCounts:{...f.roleCounts,[`${sec}__${role}`]:+e.target.value}}))}/>
                    </div>
                  )))}
                </div>
              </div>
            )}
            <div className="ma">
              <button className="btn se" onClick={()=>setShowNew(false)}>Cancel</button>
              <button className="btn pr" onClick={save} disabled={!form.name||!form.shiftBlockId||!form.days.length}>Save Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── EMPLOYEE PORTAL (for employees) ──────────────────────────────────────────
function EmployeePortal() {
  const {profile,signOut,activeRest,membership}=useAuth()
  const {theme,toggle:toggleTheme}=useTheme()
  const [tab,setTab]=useState('schedule')
  const [weekOffset,setWeekOffset]=useState(0)
  const [myShifts,setMyShifts]=useState([])
  const [channels,setChannels]=useState([])
  const rid=activeRest?.id

  const weekStart=addDays(getMonday(new Date()),weekOffset*7)
  const weekEnd=addDays(weekStart,6)

  useEffect(()=>{
    if(!rid)return
    sb.from('schedules').select('shifts,week_start,status').eq('restaurant_id',rid).eq('status','published')
      .gte('week_start',wKey(weekStart)).lte('week_start',wKey(weekEnd))
      .then(({data})=>{
        const shifts=[]
        ;(data||[]).forEach(sched=>{
          Object.entries(sched.shifts||{}).forEach(([key,emps])=>{
            if((emps||[]).includes(profile.id)){
              const [day,blockId,sec,role]=key.split('__')
              shifts.push({day,blockId,sec,role,week_start:sched.week_start})
            }
          })
        })
        setMyShifts(shifts)
      })
  },[rid,weekOffset])

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <style>{CSS}</style>
      <div style={{background:'var(--s)',borderBottom:'1px solid var(--b)',padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}>
        <Logo size={28}/>
        <div style={{flex:1}}><div className="logo-name">ShiftMise</div></div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="av" style={{background:avi(profile?.name)}}>{ini(profile?.name)}</div>
          <div style={{display:'none'}}>{/* mobile — show name on md+ */}</div>
          <button className="btn ic gh" onClick={toggleTheme}><Ic p={theme==='light'?P.moon:P.sun} s={15}/></button>
          <button className="btn ic gh" onClick={signOut}><Ic p={P.logout} s={15}/></button>
        </div>
      </div>
      <div style={{maxWidth:640,margin:'0 auto',padding:'20px 16px'}}>
        <div style={{marginBottom:20}}>
          <div style={{fontWeight:800,fontSize:18}}>{profile?.name}</div>
          <div style={{fontSize:13,color:'var(--t2)',fontWeight:600}}>{membership?.section} · {membership?.role_level}</div>
        </div>
        <div style={{display:'flex',gap:4,marginBottom:18,background:'var(--s)',border:'1px solid var(--b)',borderRadius:9,padding:4,width:'fit-content'}}>
          {[['schedule','My Shifts'],['requests','Requests'],['availability','Availability']].map(([id,lbl])=>(
            <button key={id} className={`btn ${tab===id?'pr':'gh'}`} style={{fontSize:13,border:'none'}} onClick={()=>setTab(id)}>{lbl}</button>
          ))}
        </div>
        {tab==='schedule'&&(
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
              <button className="btn se ic" onClick={()=>setWeekOffset(o=>o-1)}><Ic p={P.chevL} s={14}/></button>
              <span style={{fontWeight:700,fontSize:13}}>{fmtDate(weekStart)} – {fmtDate(weekEnd)}</span>
              <button className="btn se ic" onClick={()=>setWeekOffset(o=>o+1)}><Ic p={P.chevR} s={14}/></button>
            </div>
            {myShifts.length===0
              ? <div className="card" style={{textAlign:'center',padding:'32px',color:'var(--t3)',fontWeight:600,fontSize:13}}>No published shifts for this week</div>
              : myShifts.map((s,i)=>(
                  <div key={i} className="card" style={{marginBottom:8,display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:40,height:40,borderRadius:9,background:'rgba(232,93,58,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📅</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:14}}>{s.day}</div>
                      <div style={{fontSize:12,color:'var(--t2)',fontWeight:600}}>{s.blockId} · {s.role} · {s.sec}</div>
                    </div>
                  </div>
                ))
            }
          </div>
        )}
        {tab==='requests'&&<RequestsView rid={rid} employees={[]}/>}
        {tab==='availability'&&<AvailabilityView rid={rid} employees={[]} availability={{}}/>}
      </div>
    </div>
  )
}

// ── MANAGER DASHBOARD ─────────────────────────────────────────────────────────
function ManagerDashboard() {
  const {profile,signOut,isOwner,activeRest,restaurants,switchRest,isManager}=useAuth()
  const {theme,toggle:toggleTheme}=useTheme()
  const rid=activeRest?.id
  const [view,setView]=useState('schedule')
  const [sidebarOpen,setSidebarOpen]=useState(true)
  const [showAddRest,setShowAddRest]=useState(false)
  const [showSettings,setShowSettings]=useState(false)

  // Data
  const [employees,setEmployees]=useState([])
  const [availability,setAvailability]=useState({})
  const [requirements,setRequirements]=useState({})
  const [roles,setRoles]=useState({FOH:['Server','Bartender','Runner','Host'],BOH:['Dishwasher','Cook','Sushi Chef','Prep']})
  const [shiftBlocks,setShiftBlocks]=useState([{id:'lunch',name:'Lunch',start:'11:00',end:'15:00',color:'#E85D3A'},{id:'dinner',name:'Dinner',start:'16:00',end:'23:59',color:'#7C6FCD'}])
  const [openDays,setOpenDays]=useState(DAYS.reduce((a,d)=>({...a,[d]:true}),{}))

  useEffect(()=>{
    if(!rid)return
    const load = async () => {
      const [memR,availR,reqR,setR]=await Promise.all([
        sb.from('restaurant_members').select('*,profile:profiles(*)').eq('restaurant_id',rid).neq('status','inactive'),
        sb.from('availability').select('*').eq('restaurant_id',rid),
        sb.from('shift_requirements').select('*').eq('restaurant_id',rid).single(),
        sb.from('restaurant_settings').select('*').eq('restaurant_id',rid).single(),
      ])
      if(memR.data) setEmployees(memR.data.map(m=>({...m.profile,role_level:m.role_level,section:m.section,roles:m.roles,member_id:m.id,status:m.status})))
      if(availR.data){
        const av={}; DAYS.forEach(d=>av[d]={})
        availR.data.forEach(a=>(a.standing_days||[]).forEach(d=>{if(av[d])av[d][a.employee_id]=true}))
        setAvailability(av)
      }
      if(reqR.data?.requirements)setRequirements(reqR.data.requirements)
      if(setR.data){
        const s=setR.data
        if(s.foh_roles&&s.boh_roles)setRoles({FOH:s.foh_roles,BOH:s.boh_roles})
        if(s.shift_blocks)setShiftBlocks(s.shift_blocks)
        if(s.open_days)setOpenDays(s.open_days)
      }
    }
    load()
  },[rid])

  const [pendingTradesCount,setPendingTradesCount]=useState(0)
  useEffect(()=>{
    if(!rid)return
    let total=0
    Promise.all([
      sb.from('shift_trades').select('id',{count:'exact'}).eq('restaurant_id',rid).in('status',['pending','accepted']),
      sb.from('time_off_requests').select('id',{count:'exact'}).eq('restaurant_id',rid).eq('status','pending')
    ]).then(([trades,tor])=>setPendingTradesCount((trades.count||0)+(tor.count||0)))
  },[rid])

  const NAV=[
    {id:'schedule',label:'Schedule',icon:P.cal},
    {id:'templates',label:'Shift Templates',icon:P.sliders},
    {id:'employees',label:'Employees',icon:P.users},
    {id:'availability',label:'Availability',icon:P.clock},
    {id:'requests',label:'Requests',icon:P.inbox,badge:pendingTradesCount||0},
    {id:'chat',label:'Messages',icon:P.msg},
    {id:'settings',label:'Settings',icon:P.cog},
  ]

  const TITLES={
    schedule:['Schedule','Build and publish weekly schedules'],
    templates:['Shift Templates','Define and reuse shift patterns'],
    employees:[`Employees (${employees.length})`,'Manage your team'],
    availability:['Availability','Team availability overview'],
    requests:['Requests','Time off and shift trade requests'],
    chat:['Messages','Team communication'],
    settings:['Settings','Configure your restaurant'],
  }

  // Trial warning
  const trialDays=activeRest?.trial_ends_at?Math.max(0,Math.ceil((new Date(activeRest.trial_ends_at)-new Date())/86400000)):null
  const showTrial=activeRest?.subscription_status==='trialing'&&trialDays!==null&&trialDays<=7

  return (
    <>
      <style>{CSS}</style>
      {showAddRest&&<AddRestaurantModal onClose={()=>setShowAddRest(false)}/>}
      <div className="app">
        <div className={`sidebar${sidebarOpen?'':' off'}`}>
          <div className="logo-wrap">
            <Logo size={28}/>
            <div><div className="logo-name">ShiftMise</div><div className="logo-sub">Scheduling</div></div>
          </div>
          <div style={{padding:'8px 7px 0'}}>
            <RestaurantSwitcher onAdd={()=>setShowAddRest(true)}/>
          </div>
          <nav>
            {NAV.map(n=>(
              <button key={n.id} className={`ni${view===n.id?' on':''}`} onClick={()=>{setView(n.id);if(window.innerWidth<=640)setSidebarOpen(false)}}>
                <Ic p={n.icon} s={16}/>{n.label}
                {n.badge>0&&<span className="ni-badge">{n.badge}</span>}
              </button>
            ))}
          </nav>
          <div className="side-foot">
            {showTrial&&(
              <div style={{background:'rgba(212,146,10,.1)',border:'1px solid rgba(212,146,10,.2)',borderRadius:7,padding:'8px 9px',marginBottom:8,fontSize:11,color:'var(--g)',fontWeight:700}}>
                ⏱ Trial: {trialDays} days left
                <div style={{fontWeight:500,color:'var(--t3)',marginTop:2,fontSize:10}}>Add payment to keep access</div>
              </div>
            )}
            <div className="upill">
              <div className="av" style={{background:avi(profile?.name)}}>{ini(profile?.name)}</div>
              <div style={{flex:1,overflow:'hidden'}}>
                <div style={{fontWeight:700,fontSize:12,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{profile?.name}</div>
                <div style={{fontSize:10,color:'var(--t3)',fontWeight:600,textTransform:'capitalize'}}>{activeRest?.name||''}</div>
              </div>
              <button className="btn ic gh" style={{padding:'4px'}} title="Toggle theme" onClick={toggleTheme}><Ic p={theme==='light'?P.moon:P.sun} s={14}/></button>
              <button className="btn ic gh" style={{padding:'4px'}} title="Sign out" onClick={signOut}><Ic p={P.logout} s={14}/></button>
            </div>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <button className="hbtn" onClick={()=>setSidebarOpen(o=>!o)}>
              <span className="hbar" style={sidebarOpen?{transform:'rotate(45deg) translate(4px,4px)'}:{}}/>
              <span className="hbar" style={sidebarOpen?{opacity:0}:{}}/>
              <span className="hbar" style={sidebarOpen?{transform:'rotate(-45deg) translate(4px,-4px)'}:{}}/>
            </button>
            <div>
              <div className="page-title">{TITLES[view][0]}</div>
              <div className="page-sub">{TITLES[view][1]}</div>
            </div>
          </div>

          {view==='chat'
            ? <div style={{flex:1,display:'flex',overflow:'hidden'}}><ChatView rid={rid} employees={employees}/></div>
            : <div className="body">
                {view==='schedule'    &&<ScheduleView rid={rid} roles={roles} employees={employees} availability={availability} shiftBlocks={shiftBlocks} requirements={requirements} setRequirements={setRequirements} openDays={openDays}/>}
                {view==='templates'   &&<ShiftTemplatesView rid={rid} roles={roles} shiftBlocks={shiftBlocks} requirements={requirements} setRequirements={setRequirements} openDays={openDays}/>}
                {view==='employees'   &&<EmployeesView rid={rid} employees={employees} setEmployees={setEmployees} roles={roles}/>}
                {view==='availability'&&<AvailabilityView rid={rid} employees={employees} availability={availability}/>}
                {view==='requests'    &&<RequestsView rid={rid} employees={employees}/>}
                {view==='settings'    &&<SettingsView rid={rid} roles={roles} setRoles={setRoles} shiftBlocks={shiftBlocks} setShiftBlocks={setShiftBlocks} openDays={openDays} setOpenDays={setOpenDays} theme={theme} toggleTheme={toggleTheme}/>}
              </div>
          }
        </div>
      </div>
    </>
  )
}

// ── APP ROUTER ────────────────────────────────────────────────────────────────
function AppRouter() {
  const {user,profile,loading,restaurants,membership}=useAuth()
  const [needsPassword,setNeedsPassword]=useState(false)

  useEffect(()=>{
    const hash=window.location.hash
    if(hash.includes('access_token')&&(hash.includes('type=magiclink')||hash.includes('type=invite')))setNeedsPassword(true)
    const {data:{subscription}}=sb.auth.onAuthStateChange((event)=>{
      if(event==='SIGNED_IN'){const h=window.location.hash;if(h.includes('type=magiclink')||h.includes('type=invite'))setNeedsPassword(true)}
    })
    return ()=>subscription.unsubscribe()
  },[])

  if(loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <style>{CSS}</style>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
        <Logo size={44}/>
        <div className="logo-name" style={{fontSize:20}}>ShiftMise</div>
      </div>
    </div>
  )

  if(window.location.pathname==='/signup')return <SignupPage/>
  if(needsPassword&&user)return <SetPasswordPage/>
  if(!user||!profile)return <LoginPage/>
  if(restaurants.length===0)return <OnboardingPage/>
  const role=membership?.role_level||'employee'
  if(role==='owner'||role==='manager')return <ManagerDashboard/>
  return <EmployeePortal/>
}

export default function App() {
  return <AuthProvider><AppRouter/></AuthProvider>
}
