import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { addDays, carById, dateLabel, faqItems, fleet, hours, isSlotAvailable, money, services, today, useYamooData, yamooContact } from '../data'
import FloatingActions from './FloatingActions'
import EventsSection from './EventsSection'

const asset = name => `/assets/${name}.webp`
const ImmersiveExperience = lazy(() => import('./ImmersiveExperience'))

function Reservation({ type, carId, prefill = {}, onClose }) {
  const { data, setData } = useYamooData()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ vehicle: carId || 'jetour', service: 'Location avec chauffeur', client: '', phone: '', email: '', date: addDays(today(), 1), end: addDays(today(), 1), time: '09:00', pickupTime: '08:00', trip: '', passengers: 1, ...prefill, ...(prefill.date ? { end: prefill.date } : {}) })
  const [done, setDone] = useState(null)
  const visit = type === 'visit'
  const car = carById(form.vehicle)
  const available = isSlotAvailable(data, form.vehicle, form.date, visit ? form.date : form.end, visit ? form.time : '')
  const days = Math.max(1, Math.round((new Date(`${form.end}T12:00:00Z`) - new Date(`${form.date}T12:00:00Z`)) / 86400000) + 1)
  const estimate = car.indicativePrice * days
  const update = values => { setError(''); setForm(current => ({ ...current, ...values })) }
  const next = event => {
    event.preventDefault()
    if (!available) return setError('Ce véhicule est déjà réservé, en visite ou en maintenance sur ce créneau.')
    setStep(value => Math.min(3, value + 1))
  }
  const submit = event => {
    event.preventDefault()
    if (!available) return setError('Ce créneau vient d’être occupé. Choisissez une autre date ou un autre véhicule.')
    const prefix = visit ? 'VIS' : 'LOC'
    const id = `${prefix}-${Math.max(100, ...data.requests.filter(item => item.id.startsWith(prefix)).map(item => Number(item.id.split('-')[1]) || 0)) + 1}`
    const item = { id, type, client: form.client, phone: form.phone, email: form.email, car: form.vehicle, date: form.date, status: 'En attente', driver: '', staff: '', ...(visit ? { time: form.time } : { service: form.service, end: form.end, pickupTime: form.pickupTime, trip: form.trip, passengers: Number(form.passengers), amount: estimate }) }
    setData(current => ({ ...current, requests: [...current.requests, item] }))
    setDone(item)
  }
  const whatsapp = done ? `https://wa.me/${yamooContact.whatsappNumber}?text=${encodeURIComponent(visit ? `Bonjour YAMOO DRIVE, je voudrais voir ${car.name} le ${dateLabel(done.date)} à ${done.time}.` : `Bonjour YAMOO DRIVE, je souhaite un devis pour ${car.name} du ${dateLabel(done.date)} au ${dateLabel(done.end)}. Trajet : ${done.trip || 'à préciser'}.`)}` : '#'
  return (
    <div className="react-modal-backdrop" role="presentation"><section className="react-modal booking-dialog" role="dialog" aria-modal="true"><div className="modal-head"><div><p className="eyebrow">Parcours {visit ? 'de visite' : 'de réservation'}</p><h2>{visit ? 'Voir le véhicule' : 'Votre trajet'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Fermer">×</button></div>
      {done ? <div className="booking-success"><span aria-hidden="true">✓</span><h3>Demande transmise</h3><p>Le dossier <strong>{done.id}</strong> est enregistré dans la démonstration et visible dans le portail de gestion.</p><div className="actions modal-actions"><a className="button primary" href={whatsapp} target="_blank" rel="noreferrer">Continuer sur WhatsApp →</a><button className="button ghost" onClick={onClose}>Fermer</button></div></div> : <form onSubmit={step < 3 ? next : submit}><div className="booking-steps" aria-label="Progression"><span className={step >= 1 ? 'active' : ''}>1. Choix</span><span className={step >= 2 ? 'active' : ''}>2. Coordonnées</span><span className={step >= 3 ? 'active' : ''}>3. Récapitulatif</span></div>
        {step === 1 && <><div className="fields"><label>Véhicule<select value={form.vehicle} onChange={event => update({ vehicle: event.target.value })}>{fleet.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>{!visit && <label>Service de démonstration<select value={form.service} onChange={event => update({ service: event.target.value })}>{services.map(item => <option key={item}>{item}</option>)}</select></label>}</div><div className="fields"><label>Date<input type="date" min={today()} required value={form.date} onChange={event => update({ date: event.target.value, end: event.target.value })} /></label>{visit ? <label>Créneau<select value={form.time} onChange={event => update({ time: event.target.value })}>{hours.map(hour => <option key={hour} disabled={!isSlotAvailable(data, form.vehicle, form.date, form.date, hour)}>{hour}</option>)}</select></label> : <label>Retour<input type="date" min={form.date} required value={form.end} onChange={event => update({ end: event.target.value })} /></label>}</div>{!visit && <div className="fields"><label>Heure de prise en charge<input type="time" value={form.pickupTime} onChange={event => update({ pickupTime: event.target.value })} /></label><label>Passagers<input type="number" min="1" max={car.seats} value={form.passengers} onChange={event => update({ passengers: event.target.value })} /></label></div>}{!visit && <label>Trajet ou besoin<input required value={form.trip} onChange={event => update({ trip: event.target.value })} placeholder="Ex. Bonapriso vers l’aéroport" /></label>}<p className={`slot-state ${available ? 'ok' : 'no'}`}>{available ? 'Créneau disponible dans la démonstration' : 'Créneau indisponible — modifiez votre sélection'}</p></>}
        {step === 2 && <><div className="fields"><label>Nom complet<input required value={form.client} onChange={event => update({ client: event.target.value })} placeholder="Ex. Alex Mboa" /></label><label>Téléphone<input required type="tel" value={form.phone} onChange={event => update({ phone: event.target.value })} placeholder="+237 6…" /></label></div><label>E-mail (facultatif)<input type="email" value={form.email} onChange={event => update({ email: event.target.value })} placeholder="alex@exemple.com" /></label><p className="hint">Ces coordonnées fictives restent uniquement dans ce navigateur.</p></>}
        {step === 3 && <div className="booking-summary"><img src={asset(car.photos[0][1])} alt="" /><div><strong>{car.name}</strong><p>{visit ? `Visite le ${dateLabel(form.date)} à ${form.time}` : `${form.service} · du ${dateLabel(form.date)} au ${dateLabel(form.end)}`}</p><p>{form.client} · {form.phone}</p>{!visit && <output>Estimation démo : {money(estimate)}</output>}</div></div>}
        {error && <p className="error" role="alert">{error}</p>}<div className="booking-actions">{step > 1 && <button className="button ghost" type="button" onClick={() => setStep(value => value - 1)}>← Retour</button>}<button className="button primary" type="submit">{step < 3 ? 'Continuer →' : 'Confirmer la demande →'}</button></div></form>}
    </section></div>
  )
}

function Chat({ onClose, onGallery }) {
  const [messages, setMessages] = useState([{ mine: false, text: 'Bonjour ! Décrivez votre trajet, la date et le nombre de passagers.' }])
  const [input, setInput] = useState('')
  const reply = text => {
    const value = text.toLowerCase()
    if (value.includes('kribi') || value.includes('voyage')) return { text: 'Je vous propose le Jetour T2 avec chauffeur pour ce trajet.', car: 'jetour' }
    if (value.includes('famille') || /[4-9]\s*(personnes|passagers)/.test(value)) return { text: 'Le Chery Tiggo est intéressant pour une famille et des bagages.', car: 'chery' }
    if (value.includes('aéroport') || value.includes('ville')) return { text: 'La Toyota Camry convient bien à un transfert en ville ou à l’aéroport.', car: 'camry' }
    if (value.includes('prix') || value.includes('tarif')) return { text: 'Les locations sont annoncées à partir de 30 000 FCFA. Le devis dépend des dates et du trajet.' }
    return { text: 'Précisez votre destination, le nombre de passagers et la date souhaitée pour une recommandation.' }
  }
  const send = event => {
    event.preventDefault()
    if (!input.trim()) return
    const answer = reply(input)
    setMessages(items => [...items, { mine: true, text: input }, { mine: false, ...answer }])
    setInput('')
  }
  return <section className="chat-panel"><header><div><h2>Assistant YAMOO</h2><p>Conseils de réservation</p></div><button className="icon-button" onClick={onClose}>×</button></header><div className="messages">{messages.map((message, index) => <div key={index} className={`message ${message.mine ? 'mine' : ''}`}>{message.text}{message.car && <button className="chat-link" onClick={() => onGallery(message.car)}>Voir le véhicule</button>}</div>)}</div><form onSubmit={send}><input value={input} onChange={event => setInput(event.target.value)} placeholder="Ex. 3 passagers, aéroport demain" /><button className="button primary">↑</button></form></section>
}

export default function PublicSite() {
  const { data } = useYamooData()
  const [filter, setFilter] = useState('Tous')
  const [immersiveCar, setImmersiveCarState] = useState(null)
  const [immersiveInside, setImmersiveInside] = useState(false)
  const setImmersiveCar = (car, inside = false) => { setImmersiveInside(inside); setImmersiveCarState(car) }
  const [reservation, setReservation] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [fuel, setFuel] = useState({ vehicle: 'jetour', distance: 100, price: 850 })
  const [quickCar, setQuickCar] = useState('jetour')
  useEffect(() => {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible')), { threshold: 0.1 })
    document.querySelectorAll('[data-reveal]').forEach(element => reveal.observe(element))
    const scroll = () => {
      const root = document.documentElement
      root.style.setProperty('--scroll-progress', Math.min(1, scrollY / Math.max(1, root.scrollHeight - innerHeight)))
      root.style.setProperty('--hero-shift', `${Math.min(150, scrollY * 0.18)}px`)
      document.querySelector('.public-site .top')?.classList.toggle('is-scrolled', scrollY > 48)
    }
    const pointer = event => {
      const x = (event.clientX / innerWidth - .5) * 2
      const y = (event.clientY / innerHeight - .5) * 2
      document.documentElement.style.setProperty('--pointer-x', `${x * 14}px`)
      document.documentElement.style.setProperty('--pointer-y', `${y * 10}px`)
    }
    addEventListener('scroll', scroll, { passive: true }); scroll()
    addEventListener('pointermove', pointer, { passive: true })
    return () => { reveal.disconnect(); removeEventListener('scroll', scroll); removeEventListener('pointermove', pointer) }
  }, [])
  const filtered = fleet.filter(car => filter === 'Tous' || car.kind === filter)
  const fuelCar = carById(fuel.vehicle)
  const fuelCost = Number(fuel.distance) * fuelCar.consumption / 100 * Number(fuel.price)
  const openReserve = (type, carId, prefill) => setReservation({ type, carId, prefill })
  return <div className="public-site"><div className="scroll-progress"><span /></div>
    <header className="top"><nav className="shell nav"><a className="brand" href="#accueil"><img src="/assets/yamoo-logo.webp" alt="YAMOO DRIVE" /></a><div className="navlinks"><a href="#collection">Collection</a><a href="#evenements">Événements</a><a href="#showroom">Showroom</a><a href="#reservation">Réserver</a></div><div className="nav-actions"><Link className="team-link" to="/admin">Portail de gestion</Link><button className="button nav-cta" onClick={() => openReserve('order', 'jetour')}>Réserver</button></div></nav></header>
    <main>
      <section className="hero" id="accueil"><div className="hero-media"><img src="/assets/hero-jetour-africa.webp" alt="Jetour T2 stationné sous le soleil" /><span /></div><p className="hero-credit">Photo : <a href="https://commons.wikimedia.org/wiki/File:Jetour_T2_in_Milnerton,_Cape_Town.jpg" target="_blank" rel="noreferrer">Husskeyy</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></p><div className="shell hero-inner"><div className="hero-text"><p className="eyebrow">Location de véhicules avec chauffeur · Douala</p><h1><span>Votre route.</span><br /><em>Notre exigence.</em></h1><p className="hero-copy">Aéroport, rendez-vous d’affaires, mariage ou week-end à Kribi : choisissez votre véhicule, nous fournissons le chauffeur. Réponse rapide sur WhatsApp, locations à partir de 30 000 FCFA.</p><div className="actions"><a className="button light-button" href="#collection">Voir les véhicules</a><button className="button line-button" onClick={() => openReserve('order', 'jetour')}>Réserver maintenant</button></div></div><div className="hero-meta"><span><b>Douala</b>Logpom · Carrefour ADEM</span><span><b>Événements</b>Mariages, séminaires, accueil VIP</span><button onClick={() => setImmersiveCar(carById('jetour'))}>Visiter le Jetour T2 en 3D <i>↗</i></button></div><a className="scroll-cue" href="#collection"><span>Découvrir</span><i /></a></div></section>

      <section className="collection section" id="collection" data-reveal><div className="shell"><header className="editorial-head"><div><p className="eyebrow">Nos véhicules</p><h2>Le bon véhicule<br />pour chaque trajet.</h2></div><p>Berline élégante pour la ville, SUV spacieux pour la famille ou 4×4 robuste pour la route : comparez, visitez l’intérieur en 3D et réservez en quelques clics.</p></header><div className="pills">{['Tous', '4×4', 'SUV', 'Berline'].map(item => <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="vehicle-editorial">{filtered.map((car, index) => <article className={`vehicle-story vehicle-${index + 1}`} key={car.id}><button className="vehicle-image" onClick={() => setImmersiveCar(car)} aria-label={`Explorer ${car.name}`}><img src={asset(car.photos[0][1])} alt={car.name} /><span>{String(index + 1).padStart(2, '0')}</span></button><div className="vehicle-info"><div><p className="eyebrow">{car.kind} · {car.seats} places</p><h3>{car.name}</h3><p>{car.use}</p></div><div className="vehicle-price"><small>Tarif indicatif démo</small><strong>Dès {money(car.indicativePrice)}</strong><span>par jour</span></div><div className="vehicle-actions"><button className="text-link" onClick={() => setImmersiveCar(car)}>Visiter en 3D <i>↗</i></button><button className="button dark-button" disabled={!data.availability[car.id]} onClick={() => openReserve('order', car.id)}>{data.availability[car.id] ? 'Réserver ce véhicule' : 'Indisponible'}</button></div></div></article>)}</div><p className="legal-note">Photographies de référence. Les véhicules exacts, tarifs, équipements et disponibilités sont à confirmer auprès de YAMOO DRIVE.</p></div></section>

      <section className="rental-experience" id="experience" data-reveal><div className="experience-image"><img src="/assets/camry-profile.webp" alt="Toyota Camry pour les déplacements à Douala" /></div><div className="experience-copy"><p className="eyebrow">Comment ça marche</p><h2>Vous montez.<br />On s’occupe du reste.</h2><p>Oubliez les embouteillages au volant, le parking et l’itinéraire. Un chauffeur vous attend à l’heure convenue avec un véhicule propre et prêt pour votre trajet.</p><ol><li><span>01</span><div><strong>Dites-nous où vous allez</strong><p>Dates, départ, destination et nombre de passagers, sur le site ou WhatsApp.</p></div></li><li><span>02</span><div><strong>Recevez votre devis</strong><p>L’équipe confirme le véhicule, le chauffeur et le prix avant tout engagement.</p></div></li><li><span>03</span><div><strong>Profitez du trajet</strong><p>Aéroport, réunion, cérémonie ou escapade : vous arrivez reposé.</p></div></li></ol><button className="text-link light" onClick={() => setChatOpen(true)}>Parler de mon trajet <i>↗</i></button></div></section>

      <EventsSection onReserve={(carId, prefill) => openReserve('order', carId, prefill)} />

      <section className="immersive-showcase" id="showroom" data-reveal><div className="immersive-media"><img src="/assets/jetour-t2-interior-cc-by-sa.jpg" alt="Habitacle réel du Jetour T2" /></div><div className="shell immersive-content"><p className="eyebrow">Visite virtuelle 3D</p><h2>Entrez.<br />Explorez.<br /><em>Écoutez.</em></h2><p>Ouvrez la portière, installez-vous et regardez autour de vous : volant, écran, console… Touchez les points pour découvrir chaque détail et tester le klaxon.</p><button className="button light-button" onClick={() => setImmersiveCar(carById('jetour'))}>Ouvrir la portière</button></div><button className="immersive-trigger" onClick={() => setImmersiveCar(carById('jetour'), true)}><span>+</span><small>Explorer le cockpit</small></button><p className="showcase-credit">Photo : <a href="https://commons.wikimedia.org/wiki/File:Jetour_T2_interior.jpg" target="_blank" rel="noreferrer">Milhouse35</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></p></section>

      <section className="journey-tools section" id="reservation" data-reveal><div className="shell"><header className="editorial-head compact"><div><p className="eyebrow">Réservation</p><h2>Réservez en 2 minutes.</h2></div><p>Choisissez votre véhicule et vos dates : l’équipe vous recontacte pour confirmer. Estimez aussi votre budget carburant avant de partir.</p></header><div className="tool-grid"><form className="quick-booking" onSubmit={event => { event.preventDefault(); openReserve('order', quickCar) }}><span className="tool-number">01</span><h3>Choisir un véhicule</h3><label>Véhicule<select value={quickCar} onChange={event => setQuickCar(event.target.value)}>{fleet.map(car => <option key={car.id} value={car.id}>{car.name} · dès {money(car.indicativePrice)}</option>)}</select></label><div className="quick-preview"><img src={asset(carById(quickCar).photos[0][1])} alt="" /><div><strong>{carById(quickCar).name}</strong><small>{carById(quickCar).use}</small></div></div><button className="button dark-button full">Commencer la réservation</button></form><form className="fuel-form" id="carburant"><span className="tool-number">02</span><h3>Estimer le carburant</h3><label>Véhicule de référence<select value={fuel.vehicle} onChange={event => setFuel({ ...fuel, vehicle: event.target.value })}>{fleet.map(car => <option key={car.id} value={car.id}>{car.name}</option>)}</select></label><div className="fields"><label>Distance totale<input type="number" min="1" value={fuel.distance} onChange={event => setFuel({ ...fuel, distance: event.target.value })} /></label><label>Prix par litre<input type="number" min="1" value={fuel.price} onChange={event => setFuel({ ...fuel, price: event.target.value })} /></label></div><div className="fuel-total"><span>Estimation<small>{(fuel.distance * fuelCar.consumption / 100).toFixed(1)} L environ</small></span><output>{money(fuelCost)}</output></div><p className="legal-note">Carburant seul, estimation indicative.</p></form></div></div></section>

      <section className="about-section" data-reveal><div className="shell about-grid"><div><p className="eyebrow">YAMOO DRIVE</p><h2>Une équipe locale,<br />joignable directement.</h2></div><div className="about-copy"><p>YAMOO DRIVE est une entreprise camerounaise installée à Logpom, carrefour ADEM. Nous connaissons les routes et les horaires de Douala, et vous parlez directement à l’équipe : pas de standard, pas d’attente inutile.</p><div className="about-facts"><span><strong>Logpom</strong><small>Carrefour ADEM</small></span><span><strong>Avec chauffeur</strong><small>Ville, aéroport et route</small></span><span><strong>WhatsApp</strong><small>Réponse directe de l’équipe</small></span></div></div></div></section>

      <section className="terms shell section" id="modalites" data-reveal><div><p className="eyebrow">Questions utiles</p><h2>Vos questions, nos réponses.</h2><a className="text-link" href="https://wa.me/message/LVM4H4KCFPRVD1" target="_blank" rel="noreferrer">Écrire sur WhatsApp <i>↗</i></a></div><div className="faq">{faqItems.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>

      <section className="final-cta"><div className="final-cta-media"><img src="/assets/chery-front.webp" alt="Chery Tiggo disponible chez YAMOO DRIVE" /></div><div className="shell final-cta-content"><p className="eyebrow">Prêt à partir ?</p><h2>Votre chauffeur vous attend.</h2><div className="actions"><button className="button light-button" onClick={() => openReserve('order', 'chery')}>Réserver un véhicule</button><a className="button line-button" href="#collection">Voir la collection</a></div></div></section>
    </main><footer><div className="shell footer-inner"><a className="brand" href="#accueil"><img src="/assets/yamoo-logo.webp" alt="YAMOO DRIVE" /></a><address>Logpom, carrefour ADEM, Douala<br /><a href="tel:+237672894084">+237 672 89 40 84</a></address><div className="foot-links"><a href="https://www.facebook.com/p/YAMOO-DRIVE-61594347541271/" target="_blank" rel="noreferrer">Facebook</a><a href="https://www.tiktok.com/@yamoo.drive" target="_blank" rel="noreferrer">TikTok</a><Link to="/admin">Portail de gestion</Link></div></div></footer>
    <div className="chat-wrap">{chatOpen && <Chat onClose={() => setChatOpen(false)} onGallery={id => { setImmersiveCar(carById(id)); setChatOpen(false) }} />}</div><FloatingActions chatOpen={chatOpen} onToggleChat={() => setChatOpen(value => !value)} />
    {immersiveCar && <Suspense fallback={<div className="immersive-import-loader">Chargement de la visite 3D…</div>}><ImmersiveExperience key={`${immersiveCar.id}-${immersiveInside}`} car={immersiveCar} startInside={immersiveInside} onClose={() => setImmersiveCar(null)} onReserve={carId => { setImmersiveCar(null); openReserve('order', carId) }} /></Suspense>}{reservation && <Reservation {...reservation} onClose={() => setReservation(null)} />}
  </div>
}
