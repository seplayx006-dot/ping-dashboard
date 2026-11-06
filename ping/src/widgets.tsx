import { useEffect, useState } from 'react'
import { Plus, X, Play, Pause, RotateCcw } from 'lucide-react'

export function useLS<T>(k: string, init: T): [T, (v: any) => void] {
  const [v, s] = useState<T>(() => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : init } catch { return init } })
  useEffect(() => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }, [k, v])
  return [v, s]
}
export const useNow = (ms = 1000) => { const [n, s] = useState(new Date()); useEffect(() => { const t = setInterval(() => s(new Date()), ms); return () => clearInterval(t) }, [ms]); return n }
const TZ = ['local', 'UTC', 'Europe/Berlin', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'Asia/Dubai', 'Australia/Sydney']
const fmt = (d: Date, tz: string, h12: boolean) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: h12, ...(tz === 'local' ? {} : { timeZone: tz }) })

export function Clock({ id }: any) {
  const [c, setC] = useLS(`ping.${id}`, { tz: 'local', h12: false }); const n = useNow()
  return <div><div className="text-5xl font-semibold tabular-nums">{fmt(n, c.tz, c.h12)}</div>
    <div className="flex gap-2 mt-3"><select className="inp" value={c.tz} onChange={e => setC({ ...c, tz: e.target.value })}>{TZ.map(z => <option key={z} value={z} style={{ color: '#000' }}>{z}</option>)}</select>
      <button className="btn g" onClick={() => setC({ ...c, h12: !c.h12 })}>{c.h12 ? '12h' : '24h'}</button></div></div>
}
export function WorldClock() {
  const n = useNow(10000)
  return <div className="space-y-2">{TZ.slice(2).map(z => <div key={z} className="flex justify-between"><span className="mut">{z.split('/')[1].replace('_', ' ')}</span><span className="tabular-nums">{fmt(n, z, false)}</span></div>)}</div>
}
const wx = (c: number) => c === 0 ? 'Clear' : c < 4 ? 'Partly cloudy' : c < 50 ? 'Fog' : c < 70 ? 'Rain' : c < 80 ? 'Snow' : c < 90 ? 'Showers' : 'Thunderstorm'
export function Weather({ id }: any) {
  const [city, setCity] = useLS(`ping.${id}`, ''); const [q, setQ] = useState(city); const [d, setD] = useState<any>(null); const [err, setErr] = useState(''); const [load, setLoad] = useState(false)
  useEffect(() => {
    if (!city) return; let off = false; setLoad(true); setErr('')
    fetch(`https://geocoding-api.open-meteo.com/v1/search?count=1&name=${encodeURIComponent(city)}`).then(r => r.json()).then(g => {
      const p = g.results?.[0]; if (!p) throw new Error('City not found. Check the spelling.')
      return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,weather_code,wind_speed_10m`).then(r => r.json()).then(w => !off && setD({ name: p.name, ...w.current }))
    }).catch(e => !off && setErr(e.message || 'Weather could not be loaded.')).finally(() => !off && setLoad(false))
    return () => { off = true }
  }, [city])
  return <div><form className="flex gap-2" onSubmit={e => { e.preventDefault(); setCity(q.trim()) }}><input className="inp" placeholder="Search a city" value={q} onChange={e => setQ(e.target.value)} /><button className="btn">Show</button></form>
    <div className="mt-3">{load ? <p className="mut">Loading…</p> : err ? <p className="text-red-400">{err}</p> : d ? <><div className="text-4xl font-semibold">{Math.round(d.temperature_2m)}°C</div><div className="mut">{d.name} · {wx(d.weather_code)} · {d.wind_speed_10m} km/h</div></> : <p className="mut">Enter a city to see live weather.</p>}</div></div>
}
export function Todo({ id }: any) {
  const [t, setT] = useLS<any[]>(`ping.${id}`, []); const [x, setX] = useState(''); const [p, setP] = useState('2'); const [due, setDue] = useState('')
  const add = () => { if (x.trim()) { setT([...t, { id: Date.now(), x: x.trim(), p, due, done: false }]); setX(''); setDue('') } }
  return <div><div className="flex gap-2 flex-wrap"><input className="inp flex-1" placeholder="New task" value={x} onChange={e => setX(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
    <select className="inp !w-24" value={p} onChange={e => setP(e.target.value)}><option value="1" style={{ color: '#000' }}>High</option><option value="2" style={{ color: '#000' }}>Med</option><option value="3" style={{ color: '#000' }}>Low</option></select>
    <input type="date" className="inp !w-36" value={due} onChange={e => setDue(e.target.value)} /><button className="btn" aria-label="Add task" onClick={add}><Plus size={16} /></button></div>
    <ul className="mt-3 space-y-1">{[...t].sort((a, b) => a.p.localeCompare(b.p)).map(i => <li key={i.id} className="flex items-center gap-2">
      <input type="checkbox" checked={i.done} onChange={() => setT(t.map(o => o.id === i.id ? { ...o, done: !o.done } : o))} />
      <span className={`flex-1 ${i.done ? 'line-through mut' : ''}`}>{i.x} {i.due && <small className="mut">· {i.due}</small>}</span>
      <span className="text-xs" style={{ color: i.p === '1' ? '#f87171' : i.p === '2' ? '#fbbf24' : '#34d399' }}>●</span>
      <button aria-label="Delete" onClick={() => setT(t.filter(o => o.id !== i.id))}><X size={16} /></button></li>)}
      {!t.length && <li className="mut">No tasks yet. Add your first one above.</li>}</ul></div>
}
export function Notes({ id }: any) {
  const [n, setN] = useLS(`ping.${id}`, '')
  return <textarea className="inp h-40" placeholder="Write something… saved automatically" value={n} onChange={e => setN(e.target.value)} />
}
export function Links({ id }: any) {
  const [l, setL] = useLS<any[]>(`ping.${id}`, []); const [n, setN] = useState(''); const [u, setU] = useState('')
  const add = () => { if (!u.trim()) return; const url = /^https?:\/\//.test(u) ? u : 'https://' + u; setL([...l, { id: Date.now(), n: n.trim() || url.replace(/^https?:\/\//, ''), u: url }]); setN(''); setU('') }
  return <div><div className="flex gap-2"><input className="inp" placeholder="Name" value={n} onChange={e => setN(e.target.value)} /><input className="inp" placeholder="example.com" value={u} onChange={e => setU(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} /><button className="btn" aria-label="Add link" onClick={add}><Plus size={16} /></button></div>
    <div className="mt-3 flex flex-wrap gap-2">{l.map(i => <span key={i.id} className="btn g !pr-2"><a href={i.u} target="_blank" rel="noreferrer">{i.n}</a><button aria-label="Remove" onClick={() => setL(l.filter(o => o.id !== i.id))}><X size={14} /></button></span>)}
      {!l.length && <p className="mut">No links yet. Add a site above.</p>}</div></div>
}
export function Countdown({ id }: any) {
  const [c, setC] = useLS(`ping.${id}`, { name: '', date: '' }); const n = useNow(1000)
  const ms = c.date ? new Date(c.date).getTime() - n.getTime() : 0; const d = Math.max(0, ms)
  return <div><div className="flex gap-2"><input className="inp" placeholder="Event name" value={c.name} onChange={e => setC({ ...c, name: e.target.value })} /><input type="datetime-local" className="inp" value={c.date} onChange={e => setC({ ...c, date: e.target.value })} /></div>
    <div className="mt-3">{c.date ? <><div className="mut">{c.name || 'Event'}</div><div className="text-3xl font-semibold tabular-nums">{ms <= 0 ? 'Done' : `${Math.floor(d / 864e5)}d ${Math.floor(d % 864e5 / 36e5)}h ${Math.floor(d % 36e5 / 6e4)}m`}</div></> : <p className="mut">Pick a date to start counting down.</p>}</div></div>
}
export function Focus({ id }: any) {
  const [c, setC] = useLS(`ping.${id}`, { w: 25, b: 5 }); const [m, setM] = useState<'w' | 'b'>('w'); const [left, setL] = useState(c.w * 60); const [run, setR] = useState(false)
  useEffect(() => { if (!run) return; const t = setInterval(() => setL(l => Math.max(0, l - 1)), 1000); return () => clearInterval(t) }, [run])
  useEffect(() => { if (left === 0 && run) { const nx = m === 'w' ? 'b' : 'w'; setM(nx); setL(c[nx] * 60) } }, [left])
  const reset = () => { setR(false); setL(c[m] * 60) }
  const set = (k: 'w' | 'b', v: string) => { const x = Math.max(1, +v || 1); setC({ ...c, [k]: x }); if (k === m && !run) setL(x * 60) }
  return <div><div className="mut">{m === 'w' ? 'Focus' : 'Break'}</div><div className="text-5xl font-semibold tabular-nums">{String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}</div>
    <div className="flex gap-2 mt-3 items-center"><button className="btn" onClick={() => setR(!run)}>{run ? <Pause size={16} /> : <Play size={16} />}{run ? 'Pause' : 'Start'}</button><button className="btn g" aria-label="Reset" onClick={reset}><RotateCcw size={16} /></button>
      <input type="number" className="inp !w-16" aria-label="Work minutes" value={c.w} onChange={e => set('w', e.target.value)} /><input type="number" className="inp !w-16" aria-label="Break minutes" value={c.b} onChange={e => set('b', e.target.value)} /></div></div>
}
const Q = ['The secret of getting ahead is getting started. – Mark Twain', 'Well done is better than well said. – Benjamin Franklin', 'Do what you can, with what you have, where you are. – Theodore Roosevelt', 'It always seems impossible until it’s done. – Nelson Mandela', 'Action is the foundational key to all success. – Pablo Picasso', 'What we think, we become. – Buddha', 'Simplicity is the ultimate sophistication. – Leonardo da Vinci']
export function Quote() { const d = Math.floor(Date.now() / 864e5); return <p className="text-lg leading-relaxed">“{Q[d % Q.length]}”</p> }
export function Calc() {
  const [d, setD] = useState('0'); const [a, setA] = useState<number | null>(null); const [op, setOp] = useState(''); const [fresh, setF] = useState(true)
  const calc = (x: number, y: number, o: string) => o === '+' ? x + y : o === '-' ? x - y : o === '×' ? x * y : o === '÷' ? (y ? x / y : NaN) : y
  const press = (k: string) => {
    if (/^[\d.]$/.test(k)) { if (k === '.' && !fresh && d.includes('.')) return; setD(fresh || (d === '0' && k !== '.') ? (k === '.' && fresh ? '0.' : k) : d + k); setF(false) }
    else if (k === 'C') { setD('0'); setA(null); setOp(''); setF(true) }
    else { const cur = parseFloat(d); const r = a !== null && op && !fresh ? calc(a, cur, op) : cur; setD(String(+r.toFixed(10))); setA(r); setOp(k === '=' ? '' : k); setF(true) }
  }
  return <div><div className="inp text-right text-2xl mb-2 overflow-hidden">{d}</div><div className="grid grid-cols-4 gap-2">{['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', 'C', '+'].map(k => <button key={k} className={`btn justify-center ${/\d|\./.test(k) ? 'g' : ''}`} onClick={() => press(k)}>{k}</button>)}<button className="btn col-span-4 justify-center" onClick={() => press('=')}>=</button></div></div>
}
