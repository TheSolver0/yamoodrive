import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, DoorOpen, LogOut, Minus, Plus, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'

const features = {
  wheel: { title: 'Volant', text: 'Commandes multifonctions au volant. Touchez ce point pour tester le klaxon de démonstration.' },
  screen: { title: 'Écran central', text: 'Écran multimédia placé au centre de la planche de bord.' },
  climate: { title: 'Climatisation', text: 'Aérateurs et commandes de confort accessibles depuis la console centrale.' },
  console: { title: 'Console centrale', text: 'Sélecteur de vitesse, commandes de conduite et rangements.' },
  seats: { title: 'Sièges', text: 'Sellerie de l’habitacle photographié. La finition exacte dépend du véhicule loué.' },
}

const commons = (author, file, license = 'CC BY-SA 4.0') => ({ author, url: `https://commons.wikimedia.org/wiki/File:${file}`, license })
const licenseUrl = { 'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/' }

const exteriorCredits = {
  'jetour-side': commons('Husskeyy', 'Jetour_T2_in_Milnerton,_Cape_Town.jpg'),
  'jetour-cape-front': commons('Husskeyy', 'New_Jetour_T2_(Front)_in_Constantia,_Cape_Town.jpg'),
  'jetour-cape-rear': commons('Husskeyy', 'New_Jetour_T2_(Rear)_in_Constantia,_Cape_Town.jpg'),
}

// Door position (in % of the exterior photo) and interior scenes for each vehicle.
const cabins = {
  jetour: {
    door: { photo: 'jetour-side', x: 63, y: 56 },
    interiors: [
      { id: 'driver', label: 'Poste de conduite', src: '/assets/jetour-interior.webp', credit: commons('Ethan Llamas', 'Jetour_T2_2.0T_Beyond_XWD_interior.jpg'),
        hotspots: [{ id: 'wheel', x: 18, y: 30 }, { id: 'screen', x: 49, y: 17 }, { id: 'climate', x: 49, y: 37 }, { id: 'console', x: 49.5, y: 62 }, { id: 'seats', x: 77, y: 88 }] },
      { id: 'passenger', label: 'Vue passager', src: '/assets/jetour-t2-interior-cc-by-sa.jpg', credit: commons('Milhouse35', 'Jetour_T2_interior.jpg'),
        hotspots: [{ id: 'wheel', x: 36, y: 40 }, { id: 'screen', x: 57, y: 38 }, { id: 'climate', x: 54, y: 55 }, { id: 'console', x: 47, y: 68 }, { id: 'seats', x: 25, y: 70 }] },
    ],
  },
  chery: {
    door: { photo: 'chery-front', x: 69, y: 50 },
    interiors: [
      { id: 'driver', label: 'Planche de bord', src: '/assets/chery-interior.webp', credit: { ...commons('Jengtingchen', 'Chery_Tiggo_7_II_007.jpg'), note: 'recadrée, écran assombri' },
        hotspots: [{ id: 'wheel', x: 12, y: 18 }, { id: 'screen', x: 54, y: 16 }, { id: 'climate', x: 48, y: 49 }, { id: 'console', x: 36, y: 57 }, { id: 'seats', x: 16, y: 68 }] },
    ],
  },
  camry: {
    door: { photo: 'camry-front', x: 40, y: 54 },
    interiors: [
      { id: 'driver', label: 'Poste de conduite', src: '/assets/camry-interior.webp', credit: { ...commons('Ethan Llamas', 'PIMS_2024_-_All-New_Toyota_Camry_HEV_(dashboard).jpg'), note: 'recadrée' },
        hotspots: [{ id: 'wheel', x: 50.5, y: 36 }, { id: 'screen', x: 65, y: 15 }, { id: 'climate', x: 67, y: 33 }, { id: 'console', x: 68, y: 53 }, { id: 'seats', x: 58, y: 88 }] },
    ],
  },
}

let audioContext
const audio = () => {
  const Context = window.AudioContext || window.webkitAudioContext
  if (!Context) return null
  audioContext ||= new Context()
  if (audioContext.state === 'suspended') audioContext.resume()
  return audioContext
}

function playHorn() {
  const context = audio()
  if (!context) return
  const gain = context.createGain()
  const now = context.currentTime
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.025)
  gain.gain.setValueAtTime(0.18, now + 0.22)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48)
  gain.connect(context.destination)
  ;[305, 382].forEach(frequency => {
    const oscillator = context.createOscillator()
    oscillator.type = 'sawtooth'
    oscillator.frequency.value = frequency
    oscillator.connect(gain)
    oscillator.start(now)
    oscillator.stop(now + 0.5)
  })
}

// Short mechanical "clack" of a door latch followed by a soft thump.
function playDoor(delay = 0) {
  const context = audio()
  if (!context) return
  const now = context.currentTime + delay
  const length = Math.floor(context.sampleRate * 0.09)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3)
  const noise = context.createBufferSource()
  noise.buffer = buffer
  const filter = context.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1700
  const noiseGain = context.createGain()
  noiseGain.gain.value = 0.35
  noise.connect(filter).connect(noiseGain).connect(context.destination)
  noise.start(now)
  const thump = context.createOscillator()
  const thumpGain = context.createGain()
  thump.frequency.setValueAtTime(120, now + 0.03)
  thump.frequency.exponentialRampToValueAtTime(48, now + 0.22)
  thumpGain.gain.setValueAtTime(0.0001, now + 0.03)
  thumpGain.gain.exponentialRampToValueAtTime(0.32, now + 0.05)
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26)
  thump.connect(thumpGain).connect(context.destination)
  thump.start(now + 0.03)
  thump.stop(now + 0.3)
}

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const STRIPS = 44

function Credit({ credit }) {
  if (!credit) return null
  return <p className="photo-credit">Photo : <a href={credit.url} target="_blank" rel="noreferrer">{credit.author} / Wikimedia Commons</a> · <a href={licenseUrl[credit.license]} target="_blank" rel="noreferrer">{credit.license}</a>{credit.note ? ` · ${credit.note}` : ''}</p>
}

// Interior rendered on the inside of a CSS 3D cylinder: the visitor stands at its centre and looks around.
function CabinPanorama({ scene, zoom, onZoom, onFeature, honked, intro }) {
  const stageRef = useRef(null)
  const worldRef = useRef(null)
  const view = useRef({ yaw: 0, pitch: 0, vYaw: 0, vPitch: 0, dragging: false, pointers: new Map(), pinch: 0, pinchZoom: 1 })
  const limits = useRef({ yaw: 0, pitch: 0, p: 1000 })
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [aspect, setAspect] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    setAspect(0); setFailed(false)
    const image = new Image()
    image.onload = () => alive && setAspect(image.naturalWidth / image.naturalHeight)
    image.onerror = () => alive && setFailed(true)
    image.src = scene.src
    return () => { alive = false }
  }, [scene.src])

  useLayoutEffect(() => {
    const stage = stageRef.current
    const measure = () => setSize({ w: stage.clientWidth, h: stage.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  let layout = null
  if (aspect && size.w) {
    const arc = clamp(aspect * 0.9, 1.3, 2.4)
    const base = Math.max(1.02 * size.h * aspect / arc, size.w / 2 / Math.tan(0.45 * arc))
    const radius = base
    const perspective = base * zoom
    const chord = 2 * radius * Math.tan(arc / (2 * STRIPS))
    const width = chord * STRIPS
    const height = width / aspect
    layout = { arc, radius, perspective, chord, width, height,
      yawMax: Math.max(0, arc / 2 - Math.atan(size.w / 2 / perspective)),
      pitchMax: Math.max(0, Math.atan(height / 2 / radius) - Math.atan(size.h / 2 / perspective)) }
    limits.current = { yaw: layout.yawMax, pitch: layout.pitchMax, p: perspective }
  }

  const apply = useCallback(() => {
    const v = view.current
    const { yaw, pitch, p } = limits.current
    v.yaw = clamp(v.yaw, -yaw, yaw)
    v.pitch = clamp(v.pitch, -pitch, pitch)
    if (worldRef.current) worldRef.current.style.transform = `translateZ(${p}px) rotateX(${v.pitch}rad) rotateY(${v.yaw}rad)`
  }, [])

  // Inertia loop + gentle "look around" when entering.
  useEffect(() => {
    if (!layout) return undefined
    const v = view.current
    if (intro && !reducedMotion()) { v.yaw = limits.current.yaw * 0.7; v.vYaw = -limits.current.yaw * 0.035 }
    else { v.yaw = 0; v.vYaw = 0 }
    v.pitch = 0
    let frame
    const tick = () => {
      if (!v.dragging && (Math.abs(v.vYaw) > 1e-5 || Math.abs(v.vPitch) > 1e-5)) {
        v.yaw += v.vYaw; v.pitch += v.vPitch
        v.vYaw *= 0.94; v.vPitch *= 0.9
        apply()
      }
      frame = requestAnimationFrame(tick)
    }
    apply()
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.src, Boolean(layout)])

  useEffect(() => { apply() })

  useEffect(() => {
    const stage = stageRef.current
    const wheel = event => { event.preventDefault(); onZoom(z => clamp(z - event.deltaY * 0.0015, 1, 2.4)) }
    const keys = event => {
      const v = view.current
      if (event.key === 'ArrowLeft') v.vYaw = 0.03
      if (event.key === 'ArrowRight') v.vYaw = -0.03
      if (event.key === 'ArrowUp') v.vPitch = 0.02
      if (event.key === 'ArrowDown') v.vPitch = -0.02
    }
    stage.addEventListener('wheel', wheel, { passive: false })
    addEventListener('keydown', keys)
    return () => { stage.removeEventListener('wheel', wheel); removeEventListener('keydown', keys) }
  }, [onZoom])

  const radiansPerPixel = () => Math.atan(size.w / 2 / limits.current.p) / (size.w / 2 || 1)
  const pointerDown = event => {
    if (event.target.closest('button')) return
    const v = view.current
    stageRef.current.setPointerCapture?.(event.pointerId)
    v.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    v.dragging = true; v.vYaw = 0; v.vPitch = 0
    if (v.pointers.size === 2) {
      const [a, b] = [...v.pointers.values()]
      v.pinch = Math.hypot(b.x - a.x, b.y - a.y); v.pinchZoom = zoom
    }
  }
  const pointerMove = event => {
    const v = view.current
    const last = v.pointers.get(event.pointerId)
    if (!last) return
    v.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (v.pointers.size === 2) {
      const [a, b] = [...v.pointers.values()]
      if (v.pinch) onZoom(clamp(v.pinchZoom * Math.hypot(b.x - a.x, b.y - a.y) / v.pinch, 1, 2.4))
      return
    }
    const k = radiansPerPixel()
    const dYaw = -(event.clientX - last.x) * k
    const dPitch = (event.clientY - last.y) * k
    v.yaw += dYaw; v.pitch += dPitch
    v.vYaw = dYaw * 0.9; v.vPitch = dPitch * 0.6
    apply()
  }
  const pointerUp = event => {
    const v = view.current
    v.pointers.delete(event.pointerId)
    if (!v.pointers.size) { v.dragging = false; v.pinch = 0 }
    if (stageRef.current?.hasPointerCapture?.(event.pointerId)) stageRef.current.releasePointerCapture(event.pointerId)
  }

  const strips = []
  if (layout) {
    const { arc, radius, chord, width, height } = layout
    for (let i = 0; i < STRIPS; i++) {
      const angle = arc / 2 - (i + 0.5) * arc / STRIPS
      strips.push(<div key={i} className="cabin-strip" style={{
        width: chord + 1.5, height, left: -chord / 2, top: -height / 2,
        backgroundImage: `url("${scene.src}")`, backgroundSize: `${width}px ${height}px`, backgroundPosition: `${-i * chord}px 0`,
        transform: `rotateY(${angle}rad) translateZ(${-radius}px)`,
      }} />)
    }
  }

  return <div className={`cabin-stage ${intro ? 'intro' : ''}`} ref={stageRef} style={layout ? { perspective: `${layout.perspective}px` } : undefined} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}>
    {layout && <div className="cabin-world" ref={worldRef} key={scene.src}>
      {strips}
      {scene.hotspots.map(point => {
        const angle = layout.arc / 2 - point.x / 100 * layout.arc
        const y = (point.y / 100 - 0.5) * layout.height
        return <button key={point.id} className={`photo-hotspot cabin-hotspot ${point.id === 'wheel' && honked ? 'honked' : ''}`}
          style={{ transform: `rotateY(${angle}rad) translateZ(${-layout.radius + 4}px) translateY(${y}px) scale(${1 / zoom})` }}
          onPointerDown={event => event.stopPropagation()} onClick={() => onFeature(point.id)} aria-label={`Découvrir : ${features[point.id].title}`}>
          <span>{point.id === 'wheel' ? '♪' : '+'}</span><small>{features[point.id].title}</small>
        </button>
      })}
    </div>}
    {!layout && !failed && <div className="photo-loader"><i /><span>Préparation de l’habitacle</span></div>}
    {failed && <div className="photo-failure"><p>Cette photographie ne peut pas être chargée.</p></div>}
  </div>
}

export default function ImmersiveExperience({ car, onClose, onReserve, startInside = false }) {
  const cabin = cabins[car.id]
  const exteriors = car.photos.map(([label, name]) => ({ label, name, src: `/assets/${name}.webp`, credit: exteriorCredits[name] }))
  const doorIndex = Math.max(0, exteriors.findIndex(view => view.name === cabin?.door.photo))
  const [exteriorIndex, setExteriorIndex] = useState(doorIndex)
  const [phase, setPhase] = useState(startInside && cabin ? 'inside' : 'outside') // outside | entering | inside
  const [doorSwing, setDoorSwing] = useState(false)
  const [interiorIndex, setInteriorIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [sound, setSound] = useState(true)
  const [activeFeature, setActiveFeature] = useState(null)
  const [honked, setHonked] = useState(false)
  const [exteriorLoaded, setExteriorLoaded] = useState(false)
  const timers = useRef([])
  const exterior = exteriors[exteriorIndex]
  const interior = cabin?.interiors[interiorIndex]
  const atDoor = exteriorIndex === doorIndex

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const enter = () => {
    if (!cabin || phase !== 'outside') return
    setActiveFeature(null)
    if (!atDoor) { setExteriorIndex(doorIndex); setExteriorLoaded(false) }
    if (reducedMotion()) { setPhase('inside'); return }
    if (sound) playDoor()
    setPhase('entering')
    later(() => { setPhase('inside'); setDoorSwing(true); setZoom(1) }, 900)
    later(() => setDoorSwing(false), 2100)
  }
  const exit = () => {
    setActiveFeature(null); setZoom(1)
    if (sound) playDoor()
    setPhase('outside'); setExteriorIndex(doorIndex)
  }
  const chooseExterior = index => { setExteriorIndex((index + exteriors.length) % exteriors.length); setExteriorLoaded(false) }
  const chooseInterior = index => { setInteriorIndex(index); setActiveFeature(null); setZoom(1) }
  const selectFeature = id => {
    setActiveFeature(id)
    if (id === 'wheel') {
      if (sound) playHorn()
      setHonked(true)
      later(() => setHonked(false), 650)
    }
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const keyboard = event => {
      if (event.key === 'Escape') onClose()
      if (phase === 'outside' && event.key === 'ArrowRight') chooseExterior(exteriorIndex + 1)
      if (phase === 'outside' && event.key === 'ArrowLeft') chooseExterior(exteriorIndex - 1)
      if (phase === 'outside' && event.key === 'Enter' && event.target === document.body) enter()
      if (phase === 'inside' && (event.key === '+' || event.key === '=')) setZoom(z => clamp(z + 0.25, 1, 2.4))
      if (phase === 'inside' && event.key === '-') setZoom(z => clamp(z - 0.25, 1, 2.4))
    }
    addEventListener('keydown', keyboard)
    return () => { document.body.style.overflow = previousOverflow; removeEventListener('keydown', keyboard) }
  })

  const door = cabin?.door
  const inside = phase === 'inside'

  return <section className={`photo-experience cabin-experience phase-${phase}`} role="dialog" aria-modal="true" aria-label={`Visite de ${car.name}`}>
    {!inside && <div className="exterior-stage">
      <div className="exterior-frame" key={exterior.name} style={{ transformOrigin: atDoor && door ? `${door.x}% ${door.y}%` : 'center' }}>
        <img src={exterior.src} alt={`${car.name}, ${exterior.label}`} draggable="false" onLoad={event => { event.currentTarget.parentElement.style.setProperty('--ar', event.currentTarget.naturalWidth / event.currentTarget.naturalHeight); setExteriorLoaded(true) }} />
        {cabin && atDoor && exteriorLoaded && phase === 'outside' && <button className="door-hotspot" style={{ left: `${door.x}%`, top: `${door.y}%` }} onClick={enter} aria-label={`Ouvrir la portière et entrer dans ${car.name}`}>
          <i aria-hidden="true" /><span><DoorOpen size={18} /></span><small>Ouvrir la portière</small>
        </button>}
      </div>
      {exteriors.length > 1 && phase === 'outside' && <>
        <button className="exterior-arrow prev" onClick={() => chooseExterior(exteriorIndex - 1)} aria-label="Vue précédente"><ChevronLeft /></button>
        <button className="exterior-arrow next" onClick={() => chooseExterior(exteriorIndex + 1)} aria-label="Vue suivante"><ChevronRight /></button>
      </>}
    </div>}
    {phase === 'entering' && <div className="enter-fade" aria-hidden="true" />}

    {inside && interior && <CabinPanorama scene={interior} zoom={zoom} onZoom={setZoom} onFeature={selectFeature} honked={honked} intro={doorSwing} />}
    {doorSwing && <div className="door-swing" aria-hidden="true"><div className="door-panel"><span className="door-window" /><span className="door-handle" /></div></div>}

    <div className="photo-vignette" aria-hidden="true" />
    <header className="immersive-header"><div><p className="eyebrow">{inside ? 'À bord' : 'Vue extérieure'}</p><strong>{car.name}</strong><span>{inside ? 'Glissez pour regarder autour de vous. Photos réelles du modèle ; la finition peut varier.' : cabin ? 'Touchez la portière pour entrer dans le véhicule.' : 'Vues extérieures du véhicule.'}</span></div><button className="immersive-close" onClick={onClose} aria-label="Fermer la visite"><X size={20} /></button></header>
    <div className="photo-help">{inside ? 'Glissez pour tourner la tête · Molette ou pincement pour zoomer' : 'Flèches pour changer de vue · Portière pour entrer'}</div>
    {activeFeature && inside && <aside className="feature-card"><button onClick={() => setActiveFeature(null)} aria-label="Fermer la fiche"><X size={17} /></button><p className="eyebrow">Équipement visible</p><h2>{features[activeFeature].title}</h2><p>{features[activeFeature].text}</p></aside>}

    <nav className="immersive-controls photo-controls" aria-label="Contrôles de la visite">
      <div className="viewpoints">
        {inside
          ? <>{cabin.interiors.map((scene, index) => <button key={scene.id} aria-pressed={interiorIndex === index} onClick={() => chooseInterior(index)}>{scene.label}</button>)}<button className="exit-cabin" onClick={exit}><LogOut size={15} />Sortir</button></>
          : <>{exteriors.map((view, index) => <button key={view.name} aria-pressed={exteriorIndex === index} onClick={() => chooseExterior(index)}>{view.label}</button>)}</>}
      </div>
      <div className="scene-actions">
        {inside && <><button onClick={() => setZoom(z => clamp(z - 0.3, 1, 2.4))} disabled={zoom <= 1} aria-label="Dézoomer" className="icon-only"><Minus size={17} /></button><button onClick={() => setZoom(z => clamp(z + 0.3, 1, 2.4))} disabled={zoom >= 2.4} aria-label="Zoomer" className="icon-only"><Plus size={17} /></button><button onClick={() => { setZoom(1); setActiveFeature(null) }} aria-label="Réinitialiser la vue" className="icon-only"><RotateCcw size={16} /></button></>}
        {!inside && cabin && <button className="enter-cabin" onClick={enter} disabled={phase !== 'outside'}><DoorOpen size={16} />Entrer</button>}
        <button className="sound-toggle" aria-pressed={sound} onClick={() => setSound(value => !value)}>{sound ? <Volume2 size={16} /> : <VolumeX size={16} />}<span>Son {sound ? 'activé' : 'coupé'}</span></button>
        <button className="reserve-scene" onClick={() => onReserve(car.id)}>Réserver ce véhicule</button>
      </div>
    </nav>
    <Credit credit={inside ? interior?.credit : exterior.credit} />
  </section>
}
