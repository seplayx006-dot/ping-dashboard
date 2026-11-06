import { useEffect, useState } from 'react'
import { Plus, Search, Settings, Sun, Moon, X, RotateCcw, Clock as CI, CloudSun, ListTodo, StickyNote, Link2, Hourglass, Timer, Quote as QI, Globe, Calculator } from 'lucide-react'
import { useLS, useNow, Clock, WorldClock, Weather, Todo, Notes, Links, Countdown, Focus, Quote, Calc } from './widgets'

const REG: Record<string, { t: string; d: string; cat: string; I: any; C: any }> = {
  clock: { t: 'Clock', d: 'Digital clock with time zones', cat: 'Time', I: CI, C: Clock },
  world: { t: 'World clock', d: 'Local times in major cities', cat: 'Time', I: Globe, C: WorldClock },
  weather: { t: 'Weather', d: 'Live weather for any city', cat: 'Weather', I: CloudSun, C: Weather },
  todo: { t: 'To-do list', d: 'Tasks with priorities and due dates', cat: 'Productivity', I: ListTodo, C: Todo },
  notes: { t: 'Notes', d: 'Auto-saved notepad', cat: 'Organization', I: StickyNote, C: Notes },
  links: { t: 'Quick links', d: 'Your favorite sites', cat: 'Organization', I: Link2, C: Links },
  countdown: { t: 'Countdown', d: 'Days, hours and minutes left', cat: 'Time', I: Hourglass, C: Countdown },
  focus: { t: 'Focus timer', d: 'Pomodoro with custom durations', cat: 'Productivity', I: Timer, C: Focus },
  quote: { t: 'Daily quote', d: 'A new quote every day', cat: 'Entertainment', I: QI, C: Quote },
  calc: { t: 'Calculator', d: 'Basic calculator', cat: 'Utilities', I: Calculator, C: Calc },
}
const DEF = ['clock', 'weather', 'todo', 'notes', 'links', 'focus'].map(t => ({ id: t + '1', type: t }))
const ENG: Record<string, string> = { Google: 'https://www.google.com/search?q=', Bing: 'https://www.bing.com/search?q=', DuckDuckGo: 'https://duckduckgo.com/?q=' }
const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

export default function App() {
  const [name, setName] = useLS('ping.name', ''); const [w, setW] = useLS<any[]>('ping.layout', DEF)
  const [light, setLight] = useLS('ping.light', false); const [ac, setAc] = useLS('ping.accent', COLORS[0]); const [eng, setEng] = useLS('ping.engine', 'Google')
  const [q, setQ] = useState(''); const [lib, setLib] = useState(false); const [set, setSet] = useState(false); const [nm, setNm] = useState(''); const [drag, setDrag] = useState<number | null>(null); const [cat, setCat] = useState('All'); const [ls, setLs] = useState('')
  const now = useNow(30000)
  useEffect(() => { document.documentElement.classList.toggle('light', light); document.documentElement.style.setProperty('--ac', ac) }, [light, ac])
  const h = now.getHours(); const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  const add = (type: string) => { setW([...w, { id: type + Date.now(), type }]); setLib(false) }
  const drop = (to: number) => { if (drag === null || drag === to) return; const c = [...w]; const [m] = c.splice(drag, 1); c.splice(to, 0, m); setW(c); setDrag(null) }
  const go = (e: any) => { e.preventDefault(); if (q.trim()) window.open(ENG[eng] + encodeURIComponent(q), '_blank') }
  const cats = ['All', ...Array.from(new Set(Object.values(REG).map(r => r.cat)))]

  if (!name) return <div className="min-h-screen grid place-items-center p-4"><form className="card max-w-sm w-full space-y-4" onSubmit={e => { e.preventDefault(); nm.trim() && setName(nm.trim()) }}>
    <div className="text-3xl font-bold">PING<span style={{ color: 'var(--ac)' }}>.</span></div><p className="mut">Your personal internet dashboard. What should we call you?</p>
    <input className="inp" autoFocus placeholder="Your name" value={nm} onChange={e => setNm(e.target.value)} /><button className="btn w-full justify-center">Create my dashboard</button></form></div>

  return <div className="max-w-6xl mx-auto p-4 md:p-8">
    <header className="flex flex-wrap items-center gap-3 justify-between mb-6">
      <div className="text-2xl font-bold">PING<span style={{ color: 'var(--ac)' }}>.</span></div>
      <form onSubmit={go} className="flex gap-2 flex-1 min-w-[240px] max-w-xl"><select className="inp !w-32" value={eng} onChange={e => setEng(e.target.value)}>{Object.keys(ENG).map(k => <option key={k} style={{ color: '#000' }}>{k}</option>)}</select>
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-3 mut" /><input className="inp !pl-9" placeholder="Search the web" value={q} onChange={e => setQ(e.target.value)} /></div></form>
      <div className="flex gap-2"><button className="btn" onClick={() => setLib(true)}><Plus size={16} />Add widget</button><button className="btn g" aria-label="Settings" onClick={() => setSet(true)}><Settings size={16} /></button></div>
    </header>
    <h1 className="text-3xl md:text-4xl font-semibold">{greet}, {name}</h1>
    <p className="mut mb-6">{now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
    {!w.length && <div className="card text-center mut">Your dashboard is empty. Use “Add widget” to get started.</div>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{w.map((x, i) => { const R = REG[x.type]; if (!R) return null; return <section key={x.id} className="card" draggable onDragStart={() => setDrag(i)} onDragOver={e => e.preventDefault()} onDrop={() => drop(i)}>
      <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2 font-medium cursor-grab"><R.I size={16} style={{ color: 'var(--ac)' }} />{R.t}</div><button aria-label={`Remove ${R.t}`} className="mut" onClick={() => setW(w.filter(o => o.id !== x.id))}><X size={16} /></button></div>
      <R.C id={x.id} /></section> })}</div>

    {lib && <div className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-10" onClick={() => setLib(false)}><div className="card w-full max-w-2xl max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between mb-3"><h2 className="text-xl font-semibold">Widget library</h2><button aria-label="Close" onClick={() => setLib(false)}><X /></button></div>
      <input className="inp mb-3" placeholder="Search widgets" value={ls} onChange={e => setLs(e.target.value)} />
      <div className="flex gap-2 flex-wrap mb-3">{cats.map(c => <button key={c} className={`btn ${c === cat ? '' : 'g'}`} onClick={() => setCat(c)}>{c}</button>)}</div>
      <div className="grid sm:grid-cols-2 gap-3">{Object.entries(REG).filter(([, r]) => (cat === 'All' || r.cat === cat) && (r.t + r.d).toLowerCase().includes(ls.toLowerCase())).map(([k, r]) => <button key={k} className="card text-left flex gap-3 items-start" onClick={() => add(k)}><r.I style={{ color: 'var(--ac)' }} /><span><b>{r.t}</b><br /><span className="mut text-sm">{r.d}</span></span></button>)}</div></div></div>}

    {set && <div className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-10" onClick={() => setSet(false)}><div className="card w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between"><h2 className="text-xl font-semibold">Settings</h2><button aria-label="Close" onClick={() => setSet(false)}><X /></button></div>
      <label className="block mut">Username<input className="inp mt-1" value={name} onChange={e => setName(e.target.value)} /></label>
      <div><div className="mut mb-1">Accent color</div><div className="flex gap-2">{COLORS.map(c => <button key={c} aria-label={c} className="w-8 h-8 rounded-full" style={{ background: c, outline: c === ac ? '2px solid var(--fg)' : 'none' }} onClick={() => setAc(c)} />)}</div></div>
      <button className="btn g" onClick={() => setLight(!light)}>{light ? <Moon size={16} /> : <Sun size={16} />}{light ? 'Dark mode' : 'Light mode'}</button>
      <button className="btn g" onClick={() => confirm('Reset dashboard to default widgets?') && setW(DEF)}><RotateCcw size={16} />Reset dashboard</button></div></div>}
  </div>
}
