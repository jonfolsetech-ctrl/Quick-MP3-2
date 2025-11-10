
 'use client'

import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export default function Studio() {
  const [tab, setTab] = useState<'lyrics'|'compose'|'vocal'|'help'>('lyrics')
  const [schemaMode, setSchemaMode] = useState(false)

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Music Studio</h1>
        <nav className="flex gap-2">
          <button onClick={()=>setTab('lyrics')} className={`btn ${tab==='lyrics'?'bg-indigo-500':'bg-slate-700'}`}>Lyrics</button>
          <button onClick={()=>setTab('compose')} className={`btn ${tab==='compose'?'bg-indigo-500':'bg-slate-700'}`}>Compose</button>
          <button onClick={()=>setTab('vocal')} className={`btn ${tab==='vocal'?'bg-indigo-500':'bg-slate-700'}`}>Vocal Lab</button>
          <button onClick={()=>setTab('help')} className={`btn ${tab==='help'?'bg-indigo-500':'bg-slate-700'}`}>Help</button>
        </nav>
      <div className="flex items-center gap-2">
          <label className="text-sm text-slate-300">Schema JSON Mode</label>
          <input type="checkbox" checked={schemaMode} onChange={e=>setSchemaMode(e.target.checked)} />
        </div>
      </header>

      {tab==='lyrics' && <LyricsPanel schemaMode={schemaMode} />}
      {tab==='compose' && <ComposePanel schemaMode={schemaMode} />}
      {tab==='vocal' && <VocalPanel schemaMode={schemaMode} />}
      {tab==='help' && <HelpPanel/>}
    </main>
  )
}

function LyricsPanel({schemaMode=false}:{schemaMode?:boolean}){
  const [genre, setGenre] = useState('pop')
  const [mood, setMood] = useState('joyful')
  const [verses, setVerses] = useState(2)
  const [choruses, setChoruses] = useState(1)
  const [prompt, setPrompt] = useState('summer love, joy and nostalgia')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    setResult(null)
    const endpoint = schemaMode ? `${API}/v1/ai/lyrics` : `${API}/v1/lyrics.generate`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ genre, mood, length:{verses, choruses}, prompt })
    })
    const json = await res.json()
    setResult(json.lyrics_result ? json.lyrics_result : json.result)
    setLoading(false)
  }

  return (
    <section className="card space-y-4">
      <h2 className="text-xl font-semibold">Lyric Generation</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Genre</label>
          <select className="select" value={genre} onChange={e=>setGenre(e.target.value)}>
            <option>pop</option><option>rock</option><option>hip-hop</option><option>country</option>
          </select>
        </div>
        <div>
          <label className="label">Mood</label>
          <select className="select" value={mood} onChange={e=>setMood(e.target.value)}>
            <option>joyful</option><option>sad</option><option>reflective</option><option>nostalgic</option>
          </select>
        </div>
        <div>
          <label className="label">Verses</label>
          <input className="input" type="number" value={verses} onChange={e=>setVerses(parseInt(e.target.value)||0)}/>
        </div>
        <div>
          <label className="label">Choruses</label>
          <input className="input" type="number" value={choruses} onChange={e=>setChoruses(parseInt(e.target.value)||0)}/>
        </div>
        <div className="col-span-2">
          <label className="label">Prompt / Topics</label>
          <input className="input" value={prompt} onChange={e=>setPrompt(e.target.value)}/>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="btn" onClick={run} disabled={loading}>{loading?'Generating...':'Generate'}</button>
      </div>
      {result && !schemaMode && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">{result.title}</h3>
          {result.sections.map((s:any, i:number)=>(
            <div key={i}>
              <div className="text-sm text-slate-400 uppercase">{s.type}</div>
              <pre className="whitespace-pre-wrap">{s.lines.join('\n')}</pre>
            </div>
          ))}
        </div>
      )}
      {result && schemaMode && (
        <pre className="whitespace-pre-wrap text-xs bg-slate-800/60 p-3 rounded-lg overflow-auto">{JSON.stringify({lyrics_result: result}, null, 2)}</pre>
      )}
    </section>
  )
}

function ComposePanel({schemaMode=false}:{schemaMode?:boolean}){
  const [key, setKey] = useState('C major')
  const [tempo, setTempo] = useState(120)
  const [style, setStyle] = useState('electronic-pop')
  const [duration, setDuration] = useState(150)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    setResult(null)
    const endpoint = schemaMode ? `${API}/v1/ai/compose` : `${API}/v1/compose.generate`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ key, tempo_bpm: tempo, style, duration_sec: duration, instrumentation:['drums','bass','pads','lead'] })
    })
    const json = await res.json()
    setResult(json.lyrics_result ? json.lyrics_result : json.result)
    setLoading(false)
  }

  return (
    <section className="card space-y-4">
      <h2 className="text-xl font-semibold">Music Composition</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Key</label>
          <input className="input" value={key} onChange={e=>setKey(e.target.value)}/>
        </div>
        <div>
          <label className="label">Tempo (BPM)</label>
          <input className="input" type="number" value={tempo} onChange={e=>setTempo(parseInt(e.target.value)||0)}/>
        </div>
        <div>
          <label className="label">Style</label>
          <input className="input" value={style} onChange={e=>setStyle(e.target.value)}/>
        </div>
        <div>
          <label className="label">Duration (sec)</label>
          <input className="input" type="number" value={duration} onChange={e=>setDuration(parseInt(e.target.value)||0)}/>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="btn" onClick={run} disabled={loading}>{loading?'Composing...':'Compose'}</button>
      </div>
      {result && !schemaMode && (
        <div className="mt-4 space-y-2">
          <div className="text-sm text-slate-400">Project: {result.project_id}</div>
          <div className="text-sm">Mix URL (mock): {result.audio.mix_url}</div>
          <div className="text-sm">Key: {result.metadata.key} • Tempo: {result.metadata.tempo_bpm} • Style: {result.metadata.style}</div>
        </div>
      )}
      {result && schemaMode && (
        <pre className="whitespace-pre-wrap text-xs bg-slate-800/60 p-3 rounded-lg overflow-auto">{JSON.stringify({composition_result: result}, null, 2)}</pre>
      )}
    </section>
  )
}

function VocalPanel({schemaMode=false}:{schemaMode?:boolean}){
  const [instURL, setInstURL] = useState<string|null>(null)
  const [sepResult, setSepResult] = useState<any>(null)
  const [mixResult, setMixResult] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [mixing, setMixing] = useState(false)

  const handleSeparate = async (e: any) => {
    const file = e.target.files?.[0]
    if(!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const endpoint = schemaMode ? `${API}/v1/ai/separate` : `${API}/v1/separate.vocals`;
    const res = await fetch(endpoint, { method:'POST', body: fd })
    const json = await res.json()
    setSepResult(json.separation_plan ? json.separation_plan : json.result)
    setInstURL(json.result.instrumental_url)
    setUploading(false)
  }

  const handleMix = async (e: any) => {
    const files = e.target.files
    if(!files || files.length<2) return
    const fd = new FormData()
    fd.append('instrumental', files[0])
    fd.append('vocals', files[1])
    fd.append('key', 'C major')
    fd.append('tempo_bpm', '120')
    fd.append('preset', 'pop-clear')
    setMixing(true)
    const endpoint2 = schemaMode ? `${API}/v1/ai/reintegrate` : `${API}/v1/mix.reintegrate`;
    const res = await fetch(endpoint2, { method:'POST', body: fd })
    const json = await res.json()
    setMixResult(json.reintegration_plan ? json.reintegration_plan : json.result)
    setMixing(false)
  }

  return (
    <section className="card space-y-4">
      <h2 className="text-xl font-semibold">Vocal Lab</h2>

      <div className="space-y-2">
        <label className="label">Strip Vocals (upload one file)</label>
        <input className="file" type="file" accept="audio/*" onChange={handleSeparate}/>
        {uploading && <div>Processing...</div>}
        {sepResult && !schemaMode && (
          <div className="text-sm space-y-1">
            <div>Instrumental (mock): {sepResult.instrumental_url}</div>
            <div>Vocals (mock): {sepResult.vocals_url}</div>
          </div>
        )}
          {sepResult && schemaMode && (
            <pre className="whitespace-pre-wrap text-xs bg-slate-800/60 p-3 rounded-lg overflow-auto">{JSON.stringify({separation_plan: sepResult}, null, 2)}</pre>
          )}
      </div>

      <div className="space-y-2">
        <label className="label">Reintegrate (choose 2 files: instrumental, vocals)</label>
        <input className="file" type="file" accept="audio/*" multiple onChange={handleMix}/>
        {mixing && <div>Mixing...</div>}
        {mixResult && !schemaMode && (
          <div className="text-sm space-y-1">
            <div>Final Mix (mock): {mixResult.final_mix_url}</div>
            <div>Preset: {mixResult.settings.preset} • Key: {mixResult.settings.key} • BPM: {mixResult.settings.tempo_bpm}</div>
          </div>
        )}
        {mixResult && schemaMode && (
          <pre className="whitespace-pre-wrap text-xs bg-slate-800/60 p-3 rounded-lg overflow-auto">{JSON.stringify({reintegration_plan: mixResult}, null, 2)}</pre>
        )}
      </div>
    </section>
  )
}


function HelpPanel(){
  return (
    <section className="card space-y-4">
      <h2 className="text-xl font-semibold">Help & FAQ</h2>
      <div className="space-y-2 text-sm text-slate-200">
        <p><strong>How to use:</strong> Generate lyrics → Compose music → Customize → Use Vocal Lab for separation & reintegration → Export.</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Schema JSON Mode</strong>: toggling this shows API responses in the structured schema you can store or pipe to a backend.</li>
          <li><strong>Cleaner separation</strong>: upload WAV/FLAC (44.1/48k), use Best quality.</li>
          <li><strong>Export loudness</strong>: aim for -14 LUFS, -1 dBTP ceiling.</li>
        </ul>
        <p><strong>Amplify:</strong> set <code>NEXT_PUBLIC_API_BASE</code> to your backend URL in the Amplify console.</p>
      </div>
    </section>
  )
}
