import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// ── SUPABASE ──────────────────────────────────────────────────────────────────
const sb = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

// ── AUTH CONTEXT ──────────────────────────────────────────────────────────────
const AuthCtx = createContext(null)
const useAuth = () => useContext(AuthCtx)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (u) => {
    if (!u) { setProfile(null); return }
    const { data } = await sb.from('profiles').select('*').eq('id', u.id).single()
    setProfile(data)
  }

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      loadProfile(session?.user ?? null).finally(() => setLoading(false))
    })
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      loadProfile(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email, password) => sb.auth.signInWithPassword({ email, password })
  const signOut = async () => { await sb.auth.signOut(); setUser(null); setProfile(null) }
  const isOwner   = profile?.role_level === 'owner'
  const isManager = profile?.role_level === 'manager' || isOwner

  return (
    <AuthCtx.Provider value={{ user, profile, loading, signIn, signOut, isOwner, isManager }}>
      {children}
    </AuthCtx.Provider>
  )
}

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const GRADS = ['linear-gradient(135deg,#FF5C35,#FF8C6B)','linear-gradient(135deg,#818CF8,#A78BFA)','linear-gradient(135deg,#10B981,#34D399)','linear-gradient(135deg,#F59E0B,#FCD34D)','linear-gradient(135deg,#3B82F6,#60A5FA)','linear-gradient(135deg,#EC4899,#F472B6)']
const avi = n => { let h=0; for(let c of (n||'')) h=c.charCodeAt(0)+((h<<5)-h); return GRADS[Math.abs(h)%GRADS.length] }
const ini = n => n?.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()||'?'
const getMonday = d => { const r=new Date(d),day=r.getDay(); r.setDate(r.getDate()+(day===0?-6:1-day)); r.setHours(0,0,0,0); return r }
const addDays = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r }
const fmtDate = d => d.toLocaleDateString('en-US',{month:'short',day:'numeric'})
const wKey = d => d.toISOString().slice(0,10)

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
  alert:"M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  send:"M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z",
  sliders:"M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  trash:"M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  logout:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  clock:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  edit:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
}
const Ic = ({p,s=18,c='currentColor'}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={p}/>
  </svg>
)

// ── GLOBAL CSS ────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
:root{
  --bg:#0C0D11;--s:#13151C;--s2:#1A1D27;--s3:#222638;
  --b:rgba(255,255,255,0.06);--b2:rgba(255,255,255,0.11);
  --a:#FF5C35;--g:#F59E0B;--pu:#818CF8;--gr:#10B981;--re:#EF4444;
  --t:#F1F2F6;--t2:#9CA3AF;--t3:#5B6278;
}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--t);}
input,select,button{font-family:inherit;}
.app{display:flex;height:100vh;overflow:hidden;}
.sidebar{width:210px;background:var(--s);border-right:1px solid var(--b);display:flex;flex-direction:column;flex-shrink:0;transition:width .2s;overflow:hidden;}
.sidebar.off{width:0;border:none;}
.logo{padding:20px 18px 16px;border-bottom:1px solid var(--b);}
.logo-name{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;background:linear-gradient(130deg,var(--a),var(--g));-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap;}
.logo-sub{font-size:10px;color:var(--t3);letter-spacing:.8px;text-transform:uppercase;white-space:nowrap;}
nav{flex:1;padding:12px 8px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;}
.ni{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:8px;font-size:13px;font-weight:500;color:var(--t2);cursor:pointer;border:none;background:none;width:100%;text-align:left;transition:all .15s;white-space:nowrap;}
.ni:hover{background:var(--s2);color:var(--t);}
.ni.on{background:rgba(255,92,53,.12);color:var(--a);}
.ni-dot{width:6px;height:6px;border-radius:50%;background:var(--a);margin-left:auto;}
.side-foot{padding:12px 8px;border-top:1px solid var(--b);}
.upill{display:flex;align-items:center;gap:8px;padding:9px 11px;background:var(--s2);border-radius:8px;}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.topbar{padding:16px 24px;border-bottom:1px solid var(--b);display:flex;align-items:center;gap:10px;flex-shrink:0;background:var(--s);}
.hbtn{background:none;border:none;cursor:pointer;padding:6px;border-radius:7px;color:var(--t2);display:flex;flex-direction:column;gap:4px;}
.hbtn:hover{color:var(--t);}
.hbar{width:18px;height:2px;background:currentColor;border-radius:1px;transition:all .2s;}
.page-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;}
.page-sub{font-size:12px;color:var(--t3);}
.body{flex:1;overflow-y:auto;padding:20px 24px;}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .15s;white-space:nowrap;}
.pr{background:var(--a);color:#fff;}.pr:hover{background:#e04d28;}
.se{background:var(--s2);color:var(--t);border:1px solid var(--b2);}.se:hover{background:var(--s3);}
.gh{background:transparent;color:var(--t2);}.gh:hover{background:var(--s2);color:var(--t);}
.ok{background:var(--gr);color:#fff;}
.dan{background:var(--re);color:#fff;}
.sm{padding:5px 11px;font-size:12px;}
.ic{padding:7px;}
.fi{width:100%;background:var(--s2);border:1px solid var(--b2);border-radius:8px;padding:9px 11px;font-size:13px;color:var(--t);outline:none;}
.fi:focus{border-color:var(--a);}
.fi-sm{padding:5px 8px;font-size:12px;}
.lbl{font-size:11px;font-weight:600;color:var(--t2);margin-bottom:5px;display:block;}
.fg{margin-bottom:14px;}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:100px;font-size:11px;font-weight:600;}
.bd{background:rgba(245,158,11,.12);color:var(--g);}
.bp{background:rgba(16,185,129,.12);color:var(--gr);}
.br{background:rgba(239,68,68,.12);color:var(--re);}
.bfoh{background:rgba(255,92,53,.12);color:var(--a);}
.bboh{background:rgba(129,140,248,.12);color:var(--pu);}
.card{background:var(--s);border:1px solid var(--b);border-radius:12px;padding:18px;}
.ct{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;color:var(--t3);letter-spacing:.6px;text-transform:uppercase;margin-bottom:14px;}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;}
.modal{background:var(--s);border:1px solid var(--b2);border-radius:16px;padding:26px;width:520px;max-width:100%;max-height:90vh;overflow-y:auto;}
.modal-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;margin-bottom:18px;}
.ma{display:flex;gap:8px;justify-content:flex-end;margin-top:18px;}
.av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-thumb{background:var(--s3);border-radius:2px;}
`

// ── LOGIN PAGE ────────────────────────────────────────────────────────────────
function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault(); setLoading(true); setErr('')
    const { error } = await signIn(email, pw)
    if (error) setErr(error.message)
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <div style={{width:380,padding:40,background:'var(--s)',borderRadius:16,border:'1px solid var(--b2)'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,background:'linear-gradient(130deg,var(--a),var(--g))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ShiftSync</div>
          <div style={{fontSize:11,color:'var(--t3)',marginTop:4,letterSpacing:'.8px',textTransform:'uppercase'}}>Restaurant Scheduler</div>
        </div>
        <form onSubmit={submit}>
          <div className="fg"><label className="lbl">Email</label><input className="fi" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@restaurant.com"/></div>
          <div className="fg"><label className="lbl">Password</label><input className="fi" type="password" value={pw} onChange={e=>setPw(e.target.value)} required placeholder="••••••••"/></div>
          {err && <div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.25)',borderRadius:8,padding:'10px 14px',fontSize:13,color:'var(--re)',marginBottom:16}}>{err}</div>}
          <button type="submit" className="btn pr" style={{width:'100%',justifyContent:'center'}} disabled={loading}>{loading?'Signing in…':'Sign In'}</button>
        </form>
        <p style={{textAlign:'center',fontSize:12,color:'var(--t3)',marginTop:20}}>New employee? Check your email for an invite link.</p>
      </div>
    </div>
  )
}

// ── EMPLOYEE PORTAL ───────────────────────────────────────────────────────────
function EmployeePortal() {
  const { profile, signOut } = useAuth()
  const [tab, setTab] = useState('schedule')
  const [weekOffset, setWeekOffset] = useState(0)
  const [shifts, setShifts] = useState([])
  const [standing, setStanding] = useState([])
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState([])
  const [activeCh, setActiveCh] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [torDates, setTorDates] = useState('')
  const [torReason, setTorReason] = useState('')
  const [torDone, setTorDone] = useState(false)
  const [savingAvail, setSavingAvail] = useState(false)
  const [availDone, setAvailDone] = useState(false)

  const monday = getMonday(new Date())
  const viewMon = addDays(monday, weekOffset*7)
  const viewSun = addDays(viewMon, 6)

  useEffect(() => {
    if (tab==='schedule') loadMyShifts()
    if (tab==='availability') loadAvail()
    if (tab==='messages') loadChannels()
  }, [tab, weekOffset])

  const loadMyShifts = async () => {
    const { data } = await sb.from('schedules').select('*').eq('week_start', wKey(viewMon)).eq('status','published').single()
    if (!data) return setShifts([])
    const found = []
    const all = data.shifts || {}
    DAYS.forEach(day => {
      Object.entries(all[day]||{}).forEach(([role, roleShifts]) => {
        ;(roleShifts||[]).forEach(s => { if (s.employeeId === profile?.id) found.push({...s,day,role}) })
      })
    })
    setShifts(found)
  }

  const loadAvail = async () => {
    const { data } = await sb.from('availability').select('*').eq('employee_id', profile?.id).single()
    if (data) setStanding(data.standing_days||[])
  }

  const saveAvail = async () => {
    setSavingAvail(true)
    await sb.from('availability').upsert({employee_id:profile?.id, standing_days:standing}, {onConflict:'employee_id'})
    setSavingAvail(false); setAvailDone(true); setTimeout(()=>setAvailDone(false),2500)
  }

  const submitTOR = async () => {
    if (!torDates.trim()) return
    await sb.from('time_off_requests').insert({employee_id:profile?.id, dates:torDates, reason:torReason, type:'time-off', status:'pending'})
    setTorDates(''); setTorReason(''); setTorDone(true); setTimeout(()=>setTorDone(false),3000)
  }

  const loadChannels = async () => {
    const { data } = await sb.from('channels').select('*').order('created_at')
    setChannels(data||[])
    if (data?.length && !activeCh) { setActiveCh(data[0]); loadMessages(data[0].id) }
  }

  const loadMessages = async id => {
    const { data } = await sb.from('messages').select('*, profiles(name)').eq('channel_id',id).order('created_at')
    setMessages(data||[])
  }

  const selectCh = ch => { setActiveCh(ch); loadMessages(ch.id) }

  const sendMsg = async () => {
    if (!chatInput.trim()||!activeCh) return
    await sb.from('messages').insert({channel_id:activeCh.id, sender_id:profile?.id, text:chatInput})
    setChatInput(''); loadMessages(activeCh.id)
  }

  const EMPCSS = `
    .emp-tabs{display:flex;gap:4px;padding:0 16px;background:var(--s);border-bottom:1px solid var(--b);}
    .etab{padding:12px 14px;font-size:13px;font-weight:600;color:var(--t2);border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;}
    .etab.on{color:var(--a);border-bottom-color:var(--a);}
    .ch-list{width:180px;border-right:1px solid var(--b);background:var(--s);overflow-y:auto;}
    .ch-it{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;font-size:13px;color:var(--t2);border:none;background:none;width:100%;text-align:left;}
    .ch-it.on{background:rgba(255,92,53,.1);color:var(--a);}
    .msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;}
    .emsg{display:flex;gap:9px;}
    .ci{flex:1;background:none;border:none;outline:none;font-size:13px;color:var(--t);}
    .ci::placeholder{color:var(--t3);}
    .snd{background:var(--a);border:none;border-radius:7px;padding:7px 11px;cursor:pointer;}
    .sblock{background:var(--s2);border:1px solid var(--b);border-radius:8px;padding:12px 14px;margin-bottom:8px;}
    .daydot{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:var(--s2);color:var(--t3);border:none;cursor:pointer;}
    .daydot.on{background:rgba(16,185,129,.15);color:var(--gr);border:1px solid rgba(16,185,129,.3);}
  `

  return (
    <>
      <style>{CSS}{EMPCSS}</style>
      <div style={{display:'flex',flexDirection:'column',height:'100vh'}}>
        <div style={{background:'var(--s)',borderBottom:'1px solid var(--b)',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div className="logo-name" style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,background:'linear-gradient(130deg,var(--a),var(--g))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ShiftSync</div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div className="av" style={{background:avi(profile?.name)}}>{ini(profile?.name)}</div>
            <div><div style={{fontSize:13,fontWeight:600}}>{profile?.name}</div><div style={{fontSize:11,color:'var(--t3)'}}>{profile?.section}</div></div>
            <button className="btn se sm" onClick={signOut}>Sign Out</button>
          </div>
        </div>
        <div className="emp-tabs">
          {[['schedule','My Schedule'],['availability','Availability'],['timeoff','Time Off'],['messages','Messages']].map(([id,lbl])=>(
            <button key={id} className={`etab ${tab===id?'on':''}`} onClick={()=>setTab(id)}>{lbl}</button>
          ))}
        </div>
        <div style={{flex:1,overflow:'auto',padding:tab==='messages'?0:20}}>

          {tab==='schedule'&&<div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
              <button className="btn se sm" onClick={()=>setWeekOffset(o=>o-1)}>←</button>
              <div style={{textAlign:'center',minWidth:160}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16}}>{fmtDate(viewMon)} – {fmtDate(viewSun)}</div>
                <div style={{fontSize:11,color:'var(--t3)'}}>{weekOffset===0?'This Week':weekOffset>0?`${weekOffset}wk ahead`:`${Math.abs(weekOffset)}wk ago`}</div>
              </div>
              <button className="btn se sm" onClick={()=>setWeekOffset(o=>o+1)}>→</button>
              {weekOffset!==0&&<button className="btn gh sm" onClick={()=>setWeekOffset(0)}>Today</button>}
            </div>
            {shifts.length===0
              ?<div className="card" style={{textAlign:'center',padding:40}}>
                 <div style={{fontSize:32,marginBottom:12}}>📅</div>
                 <div style={{fontWeight:600,marginBottom:6}}>No shifts this week</div>
                 <div style={{fontSize:13,color:'var(--t3)'}}>Schedule hasn't been published yet. Check back soon.</div>
               </div>
              :shifts.map((sh,i)=><div key={i} className="sblock">
                 <div style={{display:'flex',justifyContent:'space-between'}}>
                   <div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15}}>{sh.day}</div><div style={{fontSize:13,color:'var(--t2)',marginTop:3}}>{sh.role}</div></div>
                   <div style={{textAlign:'right'}}><div style={{fontWeight:700,fontSize:14}}>{sh.startOverride||'—'}</div><div style={{fontSize:12,color:'var(--t3)'}}>to {sh.endOverride||'—'}</div></div>
                 </div>
               </div>)
            }
          </div>}

          {tab==='availability'&&<div className="card">
            <div className="ct">My Available Days</div>
            <p style={{fontSize:13,color:'var(--t2)',marginBottom:16}}>Select days you're generally available each week.</p>
            <div style={{display:'flex',gap:8,marginBottom:20}}>
              {DAYS.map(d=><button key={d} className={`daydot ${standing.includes(d)?'on':''}`} onClick={()=>setStanding(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d])}>{d.slice(0,2)}</button>)}
            </div>
            <button className="btn pr" onClick={saveAvail} disabled={savingAvail}>{availDone?'✓ Saved!':savingAvail?'Saving…':'Save Availability'}</button>
          </div>}

          {tab==='timeoff'&&<div className="card">
            <div className="ct">Submit Time Off Request</div>
            <div className="fg"><label className="lbl">Dates</label><input className="fi" placeholder="e.g. Mar 15 or Mar 20–22" value={torDates} onChange={e=>setTorDates(e.target.value)}/></div>
            <div className="fg"><label className="lbl">Reason (optional)</label><input className="fi" placeholder="Vacation, appointment…" value={torReason} onChange={e=>setTorReason(e.target.value)}/></div>
            {torDone&&<div style={{color:'var(--gr)',fontSize:13,marginBottom:12}}>✓ Request submitted! Your manager will review it.</div>}
            <button className="btn pr" onClick={submitTOR} disabled={!torDates}>Submit Request</button>
          </div>}

          {tab==='messages'&&<div style={{display:'flex',height:'calc(100vh - 120px)'}}>
            <div className="ch-list">
              <div style={{padding:'10px 12px',fontSize:10,fontWeight:700,color:'var(--t3)',letterSpacing:'.8px',textTransform:'uppercase'}}>Channels</div>
              {channels.map(ch=><button key={ch.id} className={`ch-it ${activeCh?.id===ch.id?'on':''}`} onClick={()=>selectCh(ch)}><span style={{color:'var(--t3)'}}>＃</span>{ch.name}</button>)}
            </div>
            <div style={{flex:1,display:'flex',flexDirection:'column'}}>
              <div style={{padding:'12px 16px',borderBottom:'1px solid var(--b)',fontWeight:700}}>#{activeCh?.name}</div>
              <div className="msgs">
                {messages.length===0&&<div style={{textAlign:'center',color:'var(--t3)',marginTop:30}}>No messages yet</div>}
                {messages.map(m=><div key={m.id} className="emsg">
                  <div className="av" style={{background:avi(m.profiles?.name)}}>{ini(m.profiles?.name)}</div>
                  <div><div style={{fontSize:12,fontWeight:600}}>{m.profiles?.name}<span style={{fontSize:10,color:'var(--t3)',marginLeft:6}}>{new Date(m.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span></div>
                    <div style={{fontSize:13,color:'var(--t2)',lineHeight:1.5,marginTop:2}}>{m.text}</div>
                  </div>
                </div>)}
              </div>
              <div style={{padding:'12px 16px',borderTop:'1px solid var(--b)',display:'flex',gap:8,alignItems:'center',background:'var(--s2)'}}>
                <input className="ci" placeholder={`Message #${activeCh?.name||''}…`} value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()}/>
                <button className="snd" onClick={sendMsg}><Ic p={P.send} s={14} c="#fff"/></button>
              </div>
            </div>
          </div>}
        </div>
      </div>
    </>
  )
}

// ── SCHEDULE VIEW (MANAGER) ───────────────────────────────────────────────────
function ScheduleView({ roles, employees, availability, shiftBlocks, requirements, setRequirements, openDays, setOpenDays }) {
  const [section, setSection] = useState('FOH')
  const [reqModal, setReqModal] = useState(null)
  const [assignModal, setAssignModal] = useState(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [allSchedules, setAllSchedules] = useState({})
  const [allStatuses, setAllStatuses] = useState({})
  const [alerts, setAlerts] = useState([])
  const [saving, setSaving] = useState(false)

  const monday = getMonday(new Date())
  const viewMon = addDays(monday, weekOffset*7)
  const viewSun = addDays(viewMon, 6)
  const wk = wKey(viewMon)
  const schedule = allSchedules[wk] || {}
  const status   = allStatuses[wk] || 'draft'
  const setSched = u => setAllSchedules(p=>({...p,[wk]:typeof u==='function'?u(p[wk]||{}):u}))
  const setStatus = s => setAllStatuses(p=>({...p,[wk]:s}))

  useEffect(() => {
    sb.from('schedules').select('*').eq('week_start',wk).single().then(({data})=>{
      if (data) {
        setAllSchedules(p=>({...p,[wk]:data.shifts||{}}))
        setAllStatuses(p=>({...p,[wk]:data.status||'draft'}))
      }
    })
  }, [wk])

  const persist = async (shifts, st) => {
    setSaving(true)
    await sb.from('schedules').upsert({week_start:wk, shifts, status:st, updated_at:new Date().toISOString()},{onConflict:'week_start'})
    setSaving(false)
  }

  const autoFill = () => {
    const newSched = {}, newAlerts = []
    DAYS.forEach(day => {
      if (!openDays[day]) return
      newSched[day] = {}
      ;[...(roles.FOH||[]),...(roles.BOH||[])].forEach(role => {
        newSched[day][role] = []
        shiftBlocks.forEach(sb2 => {
          const needed = requirements[role]?.[day]?.[sb2.id]?.count || 0
          if (!needed) return
          const dayAvail = availability[day] || {}
          const eligible = employees.filter(e => e.roles?.includes(role) && dayAvail[e.id])
          for (let i=0;i<needed;i++) {
            const already = newSched[day][role].map(s=>s.employeeId)
            const pick = eligible.find(e=>!already.includes(e.id))
            if (pick) newSched[day][role].push({id:`${day}-${role}-${sb2.id}-${pick.id}`,employeeId:pick.id,shiftBlockId:sb2.id,role,day})
            else newAlerts.push({id:`${day}-${role}-${sb2.id}-${i}`,msg:`${day} ${sb2.name} — ${role} #${i+1} unfilled`})
          }
        })
      })
    })
    setSched(newSched); setAlerts(newAlerts); persist(newSched,'draft')
  }

  const removeShift = (day, role, id) => {
    const ns = {...schedule,[day]:{...schedule[day],[role]:schedule[day][role].filter(s=>s.id!==id)}}
    setSched(ns); persist(ns, status)
  }

  const assignEmp = empId => {
    if (!assignModal) return
    const {role,day,sbId} = assignModal
    const req = requirements[role]?.[day]?.[sbId]
    const sb2 = shiftBlocks.find(b=>b.id===sbId)
    const ns = {...schedule,[day]:{...(schedule[day]||{}),[role]:[...(schedule[day]?.[role]||[]),{id:`${day}-${role}-${sbId}-${empId}-${Date.now()}`,employeeId:empId,shiftBlockId:sbId,startOverride:req?.startOverride||sb2?.start,endOverride:req?.endOverride||sb2?.end}]}}
    setSched(ns); setAlerts(p=>p.filter(a=>!a.id.startsWith(`${day}-${role}-${sbId}`))); setAssignModal(null); persist(ns,status)
  }

  const SCCS = `
    .stool{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;}
    .stabs{display:flex;gap:6px;margin-bottom:14px;}
    .stab{padding:6px 18px;border-radius:100px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid var(--b2);background:transparent;color:var(--t2);}
    .stab.f.on{background:rgba(255,92,53,.13);color:var(--a);border-color:rgba(255,92,53,.3);}
    .stab.b.on{background:rgba(129,140,248,.13);color:var(--pu);border-color:rgba(129,140,248,.3);}
    .gwrap{overflow-x:auto;border:1px solid var(--b);border-radius:12px;}
    .sgrid{display:grid;grid-template-columns:130px repeat(7,minmax(108px,1fr));background:var(--s);min-width:900px;}
    .gh2{background:var(--s2);padding:10px 8px;text-align:center;font-size:11px;font-weight:700;color:var(--t3);letter-spacing:.5px;text-transform:uppercase;border-bottom:1px solid var(--b);border-right:1px solid var(--b);}
    .gh2:last-child{border-right:none;}
    .gh2.clk{cursor:pointer;}.gh2.clk:hover{background:var(--s3);}
    .ds{font-size:9px;margin-top:3px;font-weight:700;}
    .rcell{background:var(--s2);border-bottom:1px solid var(--b);border-right:1px solid var(--b);padding:10px 12px;display:flex;flex-direction:column;justify-content:center;}
    .gcell{border-bottom:1px solid var(--b);border-right:1px solid var(--b);padding:6px;min-height:90px;background:var(--s);}
    .gcell:last-child{border-right:none;}
    .gcell.cls{background:rgba(0,0,0,.12);}
    .sc{border-radius:6px;padding:5px 7px;margin-bottom:4px;font-size:11px;border-left:3px solid;position:relative;padding-right:16px;}
    .sc.f{background:rgba(255,92,53,.1);border-left-color:var(--a);}
    .sc.b{background:rgba(129,140,248,.1);border-left-color:var(--pu);}
    .empty{border-radius:6px;padding:5px 7px;margin-bottom:4px;font-size:11px;background:rgba(239,68,68,.07);border:1px dashed rgba(239,68,68,.3);color:var(--re);text-align:center;cursor:pointer;}
    .empty:hover{background:rgba(239,68,68,.14);}
    .addmore{width:100%;padding:3px;border-radius:4px;background:transparent;border:1px dashed var(--b2);color:var(--t3);font-size:10px;cursor:pointer;margin-top:3px;}
    .addmore:hover{border-color:var(--a);color:var(--a);}
    .afbar{background:linear-gradient(135deg,rgba(255,92,53,.08),rgba(245,158,11,.08));border:1px solid rgba(255,92,53,.2);border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:14px;margin-bottom:18px;}
    .afic{width:38px;height:38px;border-radius:9px;background:linear-gradient(135deg,var(--a),var(--g));display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .albar{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:10px;font-size:13px;margin-bottom:10px;}
    .rqg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}
    .rqdc{background:var(--s2);border:1px solid var(--b);border-radius:8px;padding:12px;}
    .rqf{display:grid;grid-template-columns:56px 1fr 1fr;gap:5px;align-items:end;}
  `

  const sectionRoles = roles[section]||[]

  return (
    <div>
      <style>{SCCS}</style>
      {alerts.map(a=>(
        <div className="albar" key={a.id}><Ic p={P.alert} s={16} c="var(--re)"/><span style={{flex:1}}><strong style={{color:'var(--re)'}}>Gap:</strong> {a.msg}</span><button className="btn gh sm" onClick={()=>setAlerts(p=>p.filter(x=>x.id!==a.id))}>×</button></div>
      ))}
      <div className="afbar">
        <div className="afic"><Ic p={P.zap} s={18} c="#fff"/></div>
        <div style={{flex:1}}><div style={{fontWeight:700}}>Auto-Fill Schedule</div><div style={{fontSize:12,color:'var(--t2)',marginTop:2}}>Fills shifts based on requirements & availability. Review before publishing.</div></div>
        <button className="btn pr" onClick={autoFill}><Ic p={P.zap} s={14}/> Run Auto-Fill</button>
      </div>
      <div className="stool">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button className="btn se ic" onClick={()=>setWeekOffset(o=>o-1)}><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
          <div style={{textAlign:'center',minWidth:180}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16}}>{fmtDate(viewMon)} – {fmtDate(viewSun)}</div>
            <div style={{fontSize:11,color:'var(--t3)',marginTop:1}}>{weekOffset===0?'Current Week':weekOffset<0?`${Math.abs(weekOffset)}wk ago`:`${weekOffset}wk ahead`}</div>
          </div>
          <button className="btn se ic" onClick={()=>setWeekOffset(o=>o+1)}><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
          {weekOffset!==0&&<button className="btn gh sm" onClick={()=>setWeekOffset(0)}>Today</button>}
        </div>
        <span className={`badge ${status==='draft'?'bd':'bp'}`}>{status==='draft'?'Draft':'Published'}</span>
        {saving&&<span style={{fontSize:12,color:'var(--t3)'}}>Saving…</span>}
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          {status==='draft'
            ?<button className="btn ok" onClick={async()=>{setStatus('published');await persist(schedule,'published')}}><Ic p={P.check} s={14}/> Publish</button>
            :<button className="btn se sm" onClick={async()=>{setStatus('draft');await persist(schedule,'draft')}}>Unpublish</button>
          }
        </div>
      </div>
      <div className="stabs">
        <button className={`stab f ${section==='FOH'?'on':''}`} onClick={()=>setSection('FOH')}>FOH</button>
        <button className={`stab b ${section==='BOH'?'on':''}`} onClick={()=>setSection('BOH')}>BOH</button>
      </div>
      <div className="gwrap">
        <div className="sgrid">
          <div className="gh2">Role</div>
          {DAYS.map(day=>(
            <div key={day} className="gh2 clk" onClick={()=>{ const u={...openDays,[day]:!openDays[day]}; setOpenDays(u); sb.from('restaurant_settings').update({open_days:u}).eq('id',1) }}>
              {day.slice(0,3)}<div className={`ds`} style={{color:openDays[day]?'var(--gr)':'var(--re)'}}>{openDays[day]?'OPEN':'CLOSED'}</div>
            </div>
          ))}
          {sectionRoles.map(role=>(
            <div key={role} style={{display:'contents'}}>
              <div className="rcell">
                <div style={{fontWeight:700,fontSize:12}}>{role}</div>
                <div style={{fontSize:10,color:'var(--t3)',marginTop:2}}>{section}</div>
                <button onClick={()=>setReqModal(role)} style={{fontSize:10,color:'var(--a)',background:'none',border:'none',cursor:'pointer',marginTop:5,textAlign:'left',fontFamily:'inherit',fontWeight:600,padding:0}}>⚙ Requirements</button>
              </div>
              {DAYS.map(day=>{
                const dayShifts = schedule[day]?.[role]||[]
                const totalReq = shiftBlocks.reduce((s,b)=>s+(requirements[role]?.[day]?.[b.id]?.count||0),0)
                return (
                  <div key={day} className={`gcell ${!openDays[day]?'cls':''}`}>
                    {!openDays[day]
                      ?<div style={{fontSize:10,color:'var(--t3)',textAlign:'center',paddingTop:8}}>Closed</div>
                      :<>
                        {totalReq>0&&<div style={{fontSize:10,color:'var(--t3)',marginBottom:3}}>{dayShifts.length}/{totalReq} filled</div>}
                        {dayShifts.map(sh=>{
                          const emp = employees.find(e=>e.id===sh.employeeId)
                          const blk = shiftBlocks.find(b=>b.id===sh.shiftBlockId)
                          const req = requirements[role]?.[day]?.[sh.shiftBlockId]
                          return (
                            <div key={sh.id} className={`sc ${section==='FOH'?'f':'b'}`}>
                              <div style={{fontWeight:700,color:'var(--t)',fontSize:11}}>{emp?.name?.split(' ')[0]||'?'}</div>
                              <div style={{fontSize:10,color:blk?.color,marginTop:1}}>{blk?.name}</div>
                              <div style={{fontSize:10,color:'var(--t3)',marginTop:1}}>{req?.startOverride||blk?.start}–{req?.endOverride||blk?.end}</div>
                              <button onClick={()=>removeShift(day,role,sh.id)} style={{position:'absolute',top:3,right:3,background:'none',border:'none',cursor:'pointer',color:'var(--t3)',padding:0}}><Ic p={P.x} s={10}/></button>
                            </div>
                          )
                        })}
                        {dayShifts.length<totalReq&&Array.from({length:totalReq-dayShifts.length}).map((_,i)=>{
                          const filled={}; dayShifts.forEach(s=>{filled[s.shiftBlockId]=(filled[s.shiftBlockId]||0)+1})
                          const nb=shiftBlocks.find(b=>(filled[b.id]||0)<(requirements[role]?.[day]?.[b.id]?.count||0))
                          return <div key={i} className="empty" onClick={()=>setAssignModal({role,day,sbId:nb?.id||shiftBlocks[0]?.id})}>+ Assign {nb?.name}</div>
                        })}
                        {totalReq===0&&dayShifts.length===0&&<div style={{fontSize:10,color:'var(--t3)',textAlign:'center',paddingTop:6}}>No reqs</div>}
                        <button className="addmore" onClick={()=>setAssignModal({role,day,sbId:shiftBlocks[0]?.id})}>+ Add shift</button>
                      </>
                    }
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={{marginTop:10,fontSize:11,color:'var(--t3)'}}>💡 Click day headers to toggle open/closed · Click ⚙ to set staffing requirements per role</div>

      {reqModal&&(()=>{
        const [local, setLocal] = useState(()=>{
          const l={}
          DAYS.forEach(d=>{l[d]={}; shiftBlocks.forEach(sb2=>{const ex=requirements[reqModal]?.[d]?.[sb2.id]||{count:0,startOverride:'',endOverride:''}; l[d][sb2.id]={...ex}})})
          return l
        })
        const upd=(d,bid,f,v)=>setLocal(p=>({...p,[d]:{...p[d],[bid]:{...p[d][bid],[f]:v}}}))
        return (
          <div className="ov" onClick={e=>e.target===e.currentTarget&&setReqModal(null)}>
            <div className="modal" style={{width:660}}>
              <div className="modal-title">Requirements — {reqModal}</div>
              <div className="rqg">
                {DAYS.map(day=>(
                  <div className="rqdc" key={day} style={{opacity:openDays[day]?1:0.4}}>
                    <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>{day}{!openDays[day]&&<span style={{color:'var(--re)',fontSize:10,marginLeft:6}}>CLOSED</span>}</div>
                    {shiftBlocks.map(sb2=>(
                      <div key={sb2.id} style={{marginBottom:10}}>
                        <div style={{fontSize:11,fontWeight:600,color:sb2.color,marginBottom:5}}>{sb2.name}</div>
                        <div className="rqf">
                          <div><div style={{fontSize:9,color:'var(--t3)',marginBottom:2}}># Staff</div><input className="fi fi-sm" type="number" min="0" max="20" value={local[day][sb2.id].count} onChange={e=>upd(day,sb2.id,'count',parseInt(e.target.value)||0)} disabled={!openDays[day]} style={{textAlign:'center'}}/></div>
                          <div><div style={{fontSize:9,color:'var(--t3)',marginBottom:2}}>Start</div><input className="fi fi-sm" type="time" value={local[day][sb2.id].startOverride||sb2.start} onChange={e=>upd(day,sb2.id,'startOverride',e.target.value)} disabled={!openDays[day]}/></div>
                          <div><div style={{fontSize:9,color:'var(--t3)',marginBottom:2}}>End</div><input className="fi fi-sm" type="time" value={local[day][sb2.id].endOverride||sb2.end} onChange={e=>upd(day,sb2.id,'endOverride',e.target.value)} disabled={!openDays[day]}/></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="ma">
                <button className="btn se" onClick={()=>setReqModal(null)}>Cancel</button>
                <button className="btn pr" onClick={()=>{const r={...requirements,[reqModal]:local}; setRequirements(r); sb.from('shift_requirements').upsert({id:1,requirements:r}); setReqModal(null)}}>Save</button>
              </div>
            </div>
          </div>
        )
      })()}

      {assignModal&&(()=>{
        const {role,day,sbId}=assignModal
        const blk=shiftBlocks.find(b=>b.id===sbId)
        const alreadyOn=(schedule[day]?.[role]||[]).map(s=>s.employeeId)
        const dayAvail=availability[day]||{}
        const avail=employees.filter(e=>e.roles?.includes(role)&&dayAvail[e.id]&&!alreadyOn.includes(e.id))
        const unavail=employees.filter(e=>e.roles?.includes(role)&&!avail.includes(e)&&!alreadyOn.includes(e.id))
        return (
          <div className="ov" onClick={e=>e.target===e.currentTarget&&setAssignModal(null)}>
            <div className="modal" style={{width:400}}>
              <div className="modal-title">Assign {role}</div>
              <p style={{fontSize:13,color:'var(--t2)',marginBottom:16}}><strong>{day}</strong> · <span style={{color:blk?.color}}>{blk?.name}</span></p>
              {avail.length>0&&<><div style={{fontSize:11,fontWeight:700,color:'var(--gr)',marginBottom:8,textTransform:'uppercase',letterSpacing:'.5px'}}>Available</div>
                {avail.map(emp=><button key={emp.id} onClick={()=>assignEmp(emp.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:'var(--rsm)',background:'var(--s2)',border:'1px solid var(--b2)',cursor:'pointer',textAlign:'left',width:'100%',marginBottom:6}}>
                  <div className="av" style={{background:avi(emp.name)}}>{ini(emp.name)}</div>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{emp.name}</div><div style={{fontSize:11,color:'var(--t3)'}}>{emp.roles?.join(', ')}</div></div>
                  <span style={{fontSize:11,color:'var(--gr)',fontWeight:600}}>✓ Available</span>
                </button>)}
              </>}
              {unavail.length>0&&<><div style={{fontSize:11,fontWeight:700,color:'var(--t3)',margin:'10px 0 8px',textTransform:'uppercase',letterSpacing:'.5px'}}>Override</div>
                {unavail.map(emp=><button key={emp.id} onClick={()=>assignEmp(emp.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:'var(--rsm)',background:'var(--s2)',border:'1px solid var(--b)',cursor:'pointer',textAlign:'left',width:'100%',marginBottom:6,opacity:.6}}>
                  <div className="av" style={{background:avi(emp.name)}}>{ini(emp.name)}</div>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{emp.name}</div><div style={{fontSize:11,color:'var(--t3)'}}>{emp.roles?.join(', ')}</div></div>
                  <span style={{fontSize:11,color:'var(--re)',fontWeight:600}}>Override</span>
                </button>)}
              </>}
              {avail.length===0&&unavail.length===0&&<div style={{textAlign:'center',color:'var(--t3)',padding:'20px 0',fontSize:13}}>No {role}s found.</div>}
              <div className="ma"><button className="btn se" onClick={()=>setAssignModal(null)}>Cancel</button></div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ── EMPLOYEES VIEW ────────────────────────────────────────────────────────────
function EmployeesView({ employees, setEmployees, roles, availability }) {
  const { isOwner } = useAuth()
  const [showInvite, setShowInvite] = useState(false)
  const [form, setForm] = useState({name:'',email:'',phone:'',section:'FOH',roles:[],role_level:'employee'})
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [invErr, setInvErr] = useState('')

  const filtered = employees.filter(e=>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.roles?.some(r=>r.toLowerCase().includes(search.toLowerCase()))
  )

  const invite = async () => {
    setBusy(true); setInvErr('')
    const meta = {name:form.name,phone:form.phone,section:form.section,roles:form.roles,role_level:form.role_level}
    const { data, error } = await sb.auth.admin.inviteUserByEmail(form.email, {data:meta})
    if (error) {
      // Fallback: regular signUp (sends confirmation email)
      const { error: e2 } = await sb.auth.signUp({email:form.email, password:crypto.randomUUID(), options:{data:meta}})
      if (e2) { setInvErr('Could not invite — check Supabase auth settings.'); setBusy(false); return }
    }
    const { data: emps } = await sb.from('profiles').select('*').order('name')
    setEmployees(emps||[])
    setShowInvite(false); setForm({name:'',email:'',phone:'',section:'FOH',roles:[],role_level:'employee'})
    setBusy(false)
  }

  const ECSS = `.empg{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;}
    .ecard{background:var(--s);border:1px solid var(--b);border-radius:12px;padding:16px;transition:all .15s;}
    .ecard:hover{border-color:var(--b2);transform:translateY(-2px);}
    .ehead{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
    .chip{padding:2px 9px;border-radius:100px;font-size:11px;font-weight:600;background:var(--s2);color:var(--t2);border:1px solid var(--b);}
    .ddsm{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;background:var(--s2);color:var(--t3);}
    .ddsm.on{background:rgba(16,185,129,.14);color:var(--gr);}
  `

  return (
    <div>
      <style>{ECSS}</style>
      <div style={{display:'flex',gap:10,marginBottom:18}}>
        <input className="fi" style={{flex:1}} placeholder="Search by name or role…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <button className="btn pr" onClick={()=>setShowInvite(true)}><Ic p={P.plus} s={14}/> Invite Employee</button>
      </div>
      <div className="empg">
        {filtered.map(emp=>{
          const avail = DAYS.filter(d=>(availability[d]||{})[emp.id])
          return (
            <div className="ecard" key={emp.id}>
              <div className="ehead">
                <div className="av" style={{width:38,height:38,background:avi(emp.name),fontSize:13}}>{ini(emp.name)}</div>
                <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{emp.name}</div><div style={{fontSize:11,color:'var(--t3)',marginTop:1}}>{emp.email}</div></div>
                <span className={`badge ${emp.section==='FOH'?'bfoh':'bboh'}`}>{emp.section}</span>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:10}}>
                {emp.roles?.map(r=><span key={r} className="chip">{r}</span>)}
                {emp.role_level!=='employee'&&<span className="badge" style={{background:'rgba(129,140,248,.12)',color:'var(--pu)'}}>{emp.role_level}</span>}
              </div>
              <div style={{fontSize:11,color:'var(--t3)',marginBottom:5}}>Availability</div>
              <div style={{display:'flex',gap:3}}>
                {DAYS.map(d=><div key={d} className={`ddsm ${avail.includes(d)?'on':''}`}>{d[0]}</div>)}
              </div>
              {emp.status==='invited'&&<div style={{marginTop:8}}><span className="badge bd">Invite Pending</span></div>}
            </div>
          )
        })}
      </div>
      {showInvite&&(
        <div className="ov" onClick={e=>e.target===e.currentTarget&&setShowInvite(false)}>
          <div className="modal">
            <div className="modal-title">Invite Employee</div>
            <div className="fg"><label className="lbl">Full Name</label><input className="fi" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Jane Smith"/></div>
            <div className="row2">
              <div className="fg"><label className="lbl">Email</label><input className="fi" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="jane@example.com"/></div>
              <div className="fg"><label className="lbl">Phone</label><input className="fi" type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+1 555 0000"/></div>
            </div>
            <div className="row2">
              <div className="fg"><label className="lbl">Section</label>
                <select className="fi" value={form.section} onChange={e=>setForm({...form,section:e.target.value,roles:[]})}>
                  <option>FOH</option><option>BOH</option>
                </select>
              </div>
              {isOwner&&<div className="fg"><label className="lbl">Permission Level</label>
                <select className="fi" value={form.role_level} onChange={e=>setForm({...form,role_level:e.target.value})}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
                </select>
              </div>}
            </div>
            <div className="fg"><label className="lbl">Roles</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:7,marginTop:4}}>
                {(roles[form.section]||[]).map(r=>{const sel=form.roles.includes(r);return(
                  <button key={r} onClick={()=>setForm({...form,roles:sel?form.roles.filter(x=>x!==r):[...form.roles,r]})}
                    style={{padding:'4px 12px',borderRadius:'100px',cursor:'pointer',fontSize:12,fontWeight:600,border:'1px solid',background:sel?'rgba(255,92,53,.15)':'var(--s2)',color:sel?'var(--a)':'var(--t2)',borderColor:sel?'rgba(255,92,53,.3)':'var(--b)'}}>
                    {r}
                  </button>
                )})}
              </div>
            </div>
            {invErr&&<div style={{color:'var(--re)',fontSize:13,marginBottom:12}}>{invErr}</div>}
            <div className="ma">
              <button className="btn se" onClick={()=>setShowInvite(false)}>Cancel</button>
              <button className="btn pr" onClick={invite} disabled={!form.name||!form.email||busy}>{busy?'Sending…':'Send Invite'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── AVAILABILITY VIEW ─────────────────────────────────────────────────────────
function AvailabilityView({ employees, availability }) {
  const [requests, setRequests] = useState([])
  useEffect(()=>{
    sb.from('time_off_requests').select('*, profiles(name)').order('created_at',{ascending:false}).then(({data})=>setRequests(data||[]))
  },[])
  const handle = async (id, dec) => {
    await sb.from('time_off_requests').update({status:dec}).eq('id',id)
    setRequests(p=>p.map(r=>r.id===id?{...r,status:dec}:r))
  }
  return (
    <div>
      <div className="card" style={{marginBottom:18}}>
        <div className="ct">Pending Requests</div>
        {requests.filter(r=>r.status==='pending').length===0&&<div style={{fontSize:13,color:'var(--t3)'}}>No pending requests.</div>}
        {requests.map(req=>(
          <div key={req.id} style={{background:'var(--s2)',border:'1px solid var(--b)',borderRadius:8,padding:'12px 14px',display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
            <div className="av" style={{background:avi(req.profiles?.name)}}>{ini(req.profiles?.name)}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:13}}>{req.profiles?.name}</div>
              <div style={{fontSize:11,color:'var(--t3)',marginTop:2}}>{req.type==='time-off'?'🗓 Time Off':'🔄 Avail Change'} · {req.dates}{req.reason&&` · ${req.reason}`}</div>
            </div>
            {req.status==='pending'
              ?<div style={{display:'flex',gap:6}}><button className="btn ok sm" onClick={()=>handle(req.id,'approved')}>Approve</button><button className="btn dan sm" onClick={()=>handle(req.id,'denied')}>Deny</button></div>
              :<span className={`badge ${req.status==='approved'?'bp':'br'}`}>{req.status}</span>
            }
          </div>
        ))}
      </div>
      <div className="card">
        <div className="ct">Availability Overview</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead><tr><th style={{textAlign:'left',padding:'8px 10px',color:'var(--t3)',fontWeight:600}}>Employee</th>{DAYS.map(d=><th key={d} style={{padding:'8px 6px',color:'var(--t3)',fontWeight:600,textAlign:'center'}}>{d.slice(0,3)}</th>)}</tr></thead>
            <tbody>{employees.map(emp=><tr key={emp.id} style={{borderTop:'1px solid var(--b)'}}>
              <td style={{padding:'9px 10px',fontWeight:500}}>{emp.name}</td>
              {DAYS.map(d=><td key={d} style={{padding:'9px 6px',textAlign:'center'}}>{(availability[d]||{})[emp.id]?<span style={{color:'var(--gr)'}}>✓</span>:<span style={{color:'var(--s3)'}}>–</span>}</td>)}
            </tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── CHAT VIEW ─────────────────────────────────────────────────────────────────
function ChatView({ employees }) {
  const { profile } = useAuth()
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState([])
  const [active, setActive] = useState(null)
  const [input, setInput] = useState('')
  const [newChName, setNewChName] = useState('')
  const [showNewCh, setShowNewCh] = useState(false)

  useEffect(()=>{
    sb.from('channels').select('*').order('created_at').then(({data})=>{
      setChannels(data||[]); if(data?.length&&!active){setActive(data[0]);loadMsgs(data[0].id)}
    })
  },[])

  useEffect(()=>{
    if (!active) return
    loadMsgs(active.id)
    const sub = sb.channel(`msg:${active.id}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`channel_id=eq.${active.id}`},()=>loadMsgs(active.id))
      .subscribe()
    return ()=>sub.unsubscribe()
  },[active?.id])

  const loadMsgs = async id => {
    const {data}=await sb.from('messages').select('*, profiles(name)').eq('channel_id',id).order('created_at')
    setMessages(data||[])
  }

  const send = async () => {
    if (!input.trim()||!active) return
    await sb.from('messages').insert({channel_id:active.id,sender_id:profile?.id,text:input})
    setInput('')
  }

  const createCh = async () => {
    if (!newChName.trim()) return
    await sb.from('channels').insert({name:newChName,type:'group'})
    const {data}=await sb.from('channels').select('*').order('created_at')
    setChannels(data||[]); setNewChName(''); setShowNewCh(false)
  }

  const CCSS = `.cside{width:200px;border-right:1px solid var(--b);background:var(--s);overflow-y:auto;flex-shrink:0;}
    .csec{padding:12px 12px 4px;font-size:10px;font-weight:700;color:var(--t3);letter-spacing:.8px;text-transform:uppercase;}
    .cit{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;font-size:13px;color:var(--t2);border:none;background:none;width:100%;text-align:left;}
    .cit:hover{background:var(--s2);color:var(--t);}
    .cit.on{background:rgba(255,92,53,.1);color:var(--a);}
    .cmain{flex:1;display:flex;flex-direction:column;background:var(--bg);}
    .cmsgs{flex:1;overflow-y:auto;padding:18px 20px;display:flex;flex-direction:column;gap:14px;}
    .cmsg{display:flex;gap:10px;}
    .cinp{flex:1;background:none;border:none;outline:none;font-size:13px;color:var(--t);}
    .cinp::placeholder{color:var(--t3);}
    .csnd{background:var(--a);border:none;border-radius:7px;padding:7px 11px;cursor:pointer;display:flex;align-items:center;}
  `

  return (
    <div style={{display:'flex',flex:1,height:'100%'}}>
      <style>{CCSS}</style>
      <div className="cside">
        <div className="csec">Channels</div>
        {channels.map(ch=><button key={ch.id} className={`cit ${active?.id===ch.id?'on':''}`} onClick={()=>{setActive(ch);loadMsgs(ch.id)}}>
          <span style={{color:'var(--t3)'}}>＃</span>{ch.name}
        </button>)}
        <button onClick={()=>setShowNewCh(true)} style={{display:'flex',alignItems:'center',gap:7,padding:'7px 12px',cursor:'pointer',fontSize:12,fontWeight:600,color:'var(--a)',border:'none',background:'none',width:'100%'}}>
          <Ic p={P.plus} s={13}/> New Channel
        </button>
      </div>
      <div className="cmain">
        <div style={{padding:'14px 20px',borderBottom:'1px solid var(--b)',fontWeight:700,background:'var(--s)',flexShrink:0}}>#{active?.name||''}</div>
        <div className="cmsgs">
          {messages.length===0&&<div style={{textAlign:'center',color:'var(--t3)',marginTop:40,fontSize:13}}>No messages yet</div>}
          {messages.map(m=>(
            <div key={m.id} className="cmsg">
              <div className="av" style={{background:avi(m.profiles?.name)}}>{ini(m.profiles?.name)}</div>
              <div>
                <div style={{display:'flex',alignItems:'baseline',gap:7}}><span style={{fontSize:13,fontWeight:600}}>{m.profiles?.name||'Unknown'}</span><span style={{fontSize:11,color:'var(--t3)'}}>{new Date(m.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span></div>
                <div style={{fontSize:13,color:'var(--t2)',lineHeight:1.5,marginTop:2}}>{m.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:'14px 20px',borderTop:'1px solid var(--b)',flexShrink:0,background:'var(--s)'}}>
          <div style={{display:'flex',gap:8,alignItems:'center',background:'var(--s2)',border:'1px solid var(--b2)',borderRadius:12,padding:'9px 13px'}}>
            <input className="cinp" placeholder={`Message #${active?.name||''}…`} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}/>
            <button className="csnd" onClick={send}><Ic p={P.send} s={14} c="#fff"/></button>
          </div>
        </div>
      </div>
      {showNewCh&&(
        <div className="ov" onClick={e=>e.target===e.currentTarget&&setShowNewCh(false)}>
          <div className="modal" style={{width:380}}>
            <div className="modal-title">New Channel</div>
            <div className="fg"><label className="lbl">Channel Name</label><input className="fi" placeholder="e.g. Late Night Crew" value={newChName} onChange={e=>setNewChName(e.target.value)} autoFocus/></div>
            <div className="ma"><button className="btn se" onClick={()=>setShowNewCh(false)}>Cancel</button><button className="btn pr" onClick={createCh} disabled={!newChName.trim()}>Create</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SETTINGS VIEW ─────────────────────────────────────────────────────────────
function SettingsView({ roles, setRoles, shiftBlocks, setShiftBlocks, openDays, setOpenDays }) {
  const { isOwner, signOut } = useAuth()
  const [newRole, setNewRole] = useState('')
  const [newRoleSec, setNewRoleSec] = useState('FOH')
  const [newBlock, setNewBlock] = useState({name:'',start:'',end:'',color:'#10B981'})
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  const save = updates => sb.from('restaurant_settings').update(updates).eq('id',1)

  const addRole = () => {
    if (!newRole.trim()) return
    const u={...roles,[newRoleSec]:[...(roles[newRoleSec]||[]),newRole.trim()]}
    setRoles(u); setNewRole(''); save({foh_roles:u.FOH,boh_roles:u.BOH})
  }
  const removeRole = (sec,r) => {
    const u={...roles,[sec]:roles[sec].filter(x=>x!==r)}
    setRoles(u); save({foh_roles:u.FOH,boh_roles:u.BOH})
  }
  const updBlock = (id,f,v) => {
    const u=shiftBlocks.map(b=>b.id===id?{...b,[f]:v}:b)
    setShiftBlocks(u); save({shift_blocks:u})
  }
  const removeBlock = id => {
    const u=shiftBlocks.filter(b=>b.id!==id)
    setShiftBlocks(u); save({shift_blocks:u})
  }
  const addBlock = () => {
    if (!newBlock.name.trim()) return
    const u=[...shiftBlocks,{id:`block-${Date.now()}`,...newBlock}]
    setShiftBlocks(u); save({shift_blocks:u}); setNewBlock({name:'',start:'',end:'',color:'#10B981'}); setShowAddBlock(false)
  }
  const toggleDay = day => {
    const u={...openDays,[day]:!openDays[day]}
    setOpenDays(u); save({open_days:u})
  }

  const handleReset = async () => {
    setResetting(true)
    const tables=['messages','channels','schedules','time_off_requests','availability','shift_templates','shift_requirements']
    for (const t of tables) await sb.from(t).delete().neq('id','00000000-0000-0000-0000-000000000000')
    await sb.from('profiles').delete().neq('role_level','owner')
    setResetting(false); setResetConfirm(false); window.location.reload()
  }

  const stcss=`.stitle{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;margin-bottom:13px;padding-bottom:8px;border-bottom:1px solid var(--b);}
    .trow{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--b);}
    .tog{width:38px;height:21px;border-radius:100px;cursor:pointer;position:relative;transition:all .2s;border:none;flex-shrink:0;}
    .tog::after{content:'';position:absolute;width:15px;height:15px;border-radius:50%;background:#fff;top:3px;left:3px;transition:all .2s;}
    .tog.on{background:var(--a);}.tog.on::after{left:20px;}.tog:not(.on){background:var(--s3);}
  `

  return (
    <div style={{maxWidth:660}}>
      <style>{stcss}</style>
      <div style={{marginBottom:26}}>
        <div className="stitle">Operating Days</div>
        {DAYS.map(day=>(
          <div className="trow" key={day}>
            <div style={{fontSize:13,fontWeight:500}}>{day}</div>
            <button className={`tog ${openDays[day]?'on':''}`} onClick={()=>toggleDay(day)}/>
          </div>
        ))}
      </div>
      <div style={{marginBottom:26}}>
        <div className="stitle">Shift Blocks</div>
        {shiftBlocks.map(sb2=>(
          <div key={sb2.id} style={{background:'var(--s2)',border:'1px solid var(--b)',borderRadius:8,padding:'12px 14px',marginBottom:8,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <input type="color" value={sb2.color} onChange={e=>updBlock(sb2.id,'color',e.target.value)} style={{width:28,height:28,border:'none',borderRadius:6,cursor:'pointer',padding:2,flexShrink:0}}/>
            <input className="fi" style={{flex:1,minWidth:100}} value={sb2.name} onChange={e=>updBlock(sb2.id,'name',e.target.value)}/>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div><div style={{fontSize:9,color:'var(--t3)',marginBottom:2}}>Start</div><input className="fi fi-sm" type="time" value={sb2.start} onChange={e=>updBlock(sb2.id,'start',e.target.value)} style={{width:100}}/></div>
              <span style={{color:'var(--t3)',fontSize:12,marginTop:10}}>→</span>
              <div><div style={{fontSize:9,color:'var(--t3)',marginBottom:2}}>End</div><input className="fi fi-sm" type="time" value={sb2.end} onChange={e=>updBlock(sb2.id,'end',e.target.value)} style={{width:100}}/></div>
            </div>
            <button className="btn gh ic" onClick={()=>removeBlock(sb2.id)} style={{marginTop:10}}><Ic p={P.trash} s={15} c="var(--re)"/></button>
          </div>
        ))}
        {showAddBlock
          ?<div style={{background:'var(--s2)',border:'1px solid var(--b)',borderRadius:8,padding:'12px 14px',marginTop:8,display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
             <input type="color" value={newBlock.color} onChange={e=>setNewBlock({...newBlock,color:e.target.value})} style={{width:28,height:28,border:'none',borderRadius:6,cursor:'pointer',padding:2}}/>
             <input className="fi" style={{flex:1,minWidth:100}} placeholder="Shift name" value={newBlock.name} onChange={e=>setNewBlock({...newBlock,name:e.target.value})}/>
             <input className="fi fi-sm" type="time" value={newBlock.start} onChange={e=>setNewBlock({...newBlock,start:e.target.value})} style={{width:100}}/>
             <span style={{color:'var(--t3)'}}>→</span>
             <input className="fi fi-sm" type="time" value={newBlock.end} onChange={e=>setNewBlock({...newBlock,end:e.target.value})} style={{width:100}}/>
             <button className="btn pr sm" onClick={addBlock}>Add</button>
             <button className="btn gh sm" onClick={()=>setShowAddBlock(false)}>Cancel</button>
           </div>
          :<button className="btn se" style={{marginTop:8}} onClick={()=>setShowAddBlock(true)}><Ic p={P.plus} s={14}/> Add Shift Block</button>
        }
      </div>
      <div style={{marginBottom:26}}>
        <div className="stitle">Roles</div>
        {['FOH','BOH'].map(sec=>(
          <div key={sec} style={{marginBottom:18}}>
            <div style={{fontSize:12,fontWeight:700,color:sec==='FOH'?'var(--a)':'var(--pu)',marginBottom:10}}>{sec}</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:10}}>
              {(roles[sec]||[]).map(r=>(
                <div key={r} style={{display:'flex',alignItems:'center',gap:5,background:'var(--s2)',borderRadius:'100px',padding:'4px 12px',border:'1px solid var(--b)',fontSize:13}}>
                  {r}<button onClick={()=>removeRole(sec,r)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--t3)',display:'flex',padding:0}}><Ic p={P.x} s={12}/></button>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{display:'flex',gap:8}}>
          <select className="fi" style={{width:90}} value={newRoleSec} onChange={e=>setNewRoleSec(e.target.value)}><option>FOH</option><option>BOH</option></select>
          <input className="fi" style={{flex:1}} placeholder="New role name…" value={newRole} onChange={e=>setNewRole(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addRole()}/>
          <button className="btn pr" onClick={addRole}>Add</button>
        </div>
      </div>
      {isOwner&&(
        <div style={{marginBottom:26}}>
          <div className="stitle" style={{color:'var(--re)'}}>Danger Zone</div>
          <div style={{background:'rgba(239,68,68,.06)',border:'1px solid rgba(239,68,68,.2)',borderRadius:12,padding:18}}>
            <div style={{fontWeight:600,marginBottom:6}}>Reset All Data</div>
            <div style={{fontSize:13,color:'var(--t2)',marginBottom:14}}>Wipes all schedules, employees, messages, and requests. Your owner account is preserved. This cannot be undone.</div>
            {!resetConfirm
              ?<button className="btn dan" onClick={()=>setResetConfirm(true)}>Reset All Data</button>
              :<div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                 <span style={{fontSize:13,color:'var(--re)',fontWeight:600}}>Are you absolutely sure?</span>
                 <button className="btn dan" onClick={handleReset} disabled={resetting}>{resetting?'Resetting…':'Yes, Reset Everything'}</button>
                 <button className="btn se" onClick={()=>setResetConfirm(false)}>Cancel</button>
               </div>
            }
          </div>
        </div>
      )}
    </div>
  )
}

// ── MANAGER DASHBOARD ─────────────────────────────────────────────────────────
function ManagerDashboard() {
  const { profile, signOut, isOwner } = useAuth()
  const [view, setView] = useState('schedule')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [employees, setEmployees] = useState([])
  const [availability, setAvailability] = useState({})
  const [requirements, setRequirements] = useState({})
  const [roles, setRoles] = useState({FOH:['Server','Bartender','Runner','Host'],BOH:['Dishwasher','Cook','Sushi Chef','Prep']})
  const [shiftBlocks, setShiftBlocks] = useState([{id:'lunch',name:'Lunch',start:'11:00',end:'15:00',color:'#F59E0B'},{id:'dinner',name:'Dinner',start:'16:00',end:'23:59',color:'#818CF8'}])
  const [openDays, setOpenDays] = useState(DAYS.reduce((a,d)=>({...a,[d]:true}),{}))

  useEffect(()=>{
    const load = async () => {
      const [empR, availR, reqR, setR] = await Promise.all([
        sb.from('profiles').select('*').order('name'),
        sb.from('availability').select('*'),
        sb.from('shift_requirements').select('*').eq('id',1).single(),
        sb.from('restaurant_settings').select('*').eq('id',1).single(),
      ])
      if (empR.data) setEmployees(empR.data)
      if (availR.data) {
        const av={}; DAYS.forEach(d=>{av[d]={}})
        availR.data.forEach(a=>{(a.standing_days||[]).forEach(d=>{if(av[d]) av[d][a.employee_id]=true})})
        setAvailability(av)
      }
      if (reqR.data?.requirements) setRequirements(reqR.data.requirements)
      if (setR.data) {
        const s=setR.data
        if (s.foh_roles&&s.boh_roles) setRoles({FOH:s.foh_roles,BOH:s.boh_roles})
        if (s.shift_blocks) setShiftBlocks(s.shift_blocks)
        if (s.open_days) setOpenDays(s.open_days)
      }
    }
    load()
  },[])

  const NAV = [
    {id:'schedule',    label:'Schedule',        icon:P.cal},
    {id:'employees',   label:'Employees',       icon:P.users},
    {id:'availability',label:'Availability',    icon:P.clock},
    {id:'chat',        label:'Messages',        icon:P.msg, dot:true},
    {id:'settings',    label:'Settings',        icon:P.cog},
  ]

  const TITLES = {
    schedule:    ['Schedule','Build, auto-fill, and publish weekly schedules'],
    employees:   ['Employees',`${employees.length} team members`],
    availability:['Availability','Requests and staff availability'],
    chat:        ['Messages','Team communication'],
    settings:    ['Settings','Configure restaurant settings'],
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className={`sidebar ${sidebarOpen?'':'off'}`}>
          <div className="logo">
            <div className="logo-name">ShiftSync</div>
            <div className="logo-sub">Restaurant Scheduler</div>
          </div>
          <nav>
            {NAV.map(n=>(
              <button key={n.id} className={`ni ${view===n.id?'on':''}`} onClick={()=>{setView(n.id);if(window.innerWidth<=640)setSidebarOpen(false)}}>
                <Ic p={n.icon} s={17}/>{n.label}{n.dot&&<span className="ni-dot"/>}
              </button>
            ))}
          </nav>
          <div className="side-foot">
            <div className="upill">
              <div className="av" style={{background:avi(profile?.name)}}>{ini(profile?.name)}</div>
              <div style={{flex:1,overflow:'hidden'}}><div style={{fontWeight:600,fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{profile?.name}</div><div style={{fontSize:10,color:'var(--t3)'}}>{profile?.role_level}</div></div>
              <button className="btn gh ic" onClick={signOut} title="Sign out"><Ic p={P.logout} s={15}/></button>
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
            <div><div className="page-title">{TITLES[view][0]}</div><div className="page-sub">{TITLES[view][1]}</div></div>
          </div>
          {view==='chat'
            ?<div style={{flex:1,display:'flex',overflow:'hidden'}}><ChatView employees={employees}/></div>
            :<div className="body">
               {view==='schedule'    &&<ScheduleView roles={roles} employees={employees} availability={availability} shiftBlocks={shiftBlocks} requirements={requirements} setRequirements={setRequirements} openDays={openDays} setOpenDays={setOpenDays}/>}
               {view==='employees'   &&<EmployeesView employees={employees} setEmployees={setEmployees} roles={roles} availability={availability}/>}
               {view==='availability'&&<AvailabilityView employees={employees} availability={availability}/>}
               {view==='settings'    &&<SettingsView roles={roles} setRoles={setRoles} shiftBlocks={shiftBlocks} setShiftBlocks={setShiftBlocks} openDays={openDays} setOpenDays={setOpenDays}/>}
             </div>
          }
        </div>
      </div>
    </>
  )
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
function AppRouter() {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0C0D11'}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,background:'linear-gradient(130deg,#FF5C35,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ShiftSync</div>
    </div>
  )
  if (!user||!profile) return <LoginPage/>
  if (profile.role_level==='owner'||profile.role_level==='manager') return <ManagerDashboard/>
  return <EmployeePortal/>
}

export default function App() {
  return <AuthProvider><AppRouter/></AuthProvider>
}
