import { useState } from 'react'
import { Briefcase, Check, Heart, Plane, Users } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { addDays, carById, dateLabel, fleet, today, yamooContact } from '../data'

const events = [
  {
    id: 'mariage', icon: Heart, title: 'Mariages & dots', car: 'camry',
    pitch: 'Les mariés arrivent à l’heure et avec élégance. La famille suit sans se perdre.',
    points: ['Véhicule des mariés soigné', 'Cortège coordonné entre les lieux', 'Décoration du véhicule à demander au devis'],
  },
  {
    id: 'entreprise', icon: Briefcase, title: 'Séminaires & entreprises', car: 'camry',
    pitch: 'Délégations, conférences ou visites de partenaires : vos invités sont pris en charge comme il se doit.',
    points: ['Chauffeur ponctuel et discret', 'Navettes hôtel ↔ lieu de l’événement', 'Facturation à l’entreprise sur demande'],
  },
  {
    id: 'vip', icon: Plane, title: 'Accueil VIP & aéroport', car: 'camry',
    pitch: 'Votre invité atterrit à Douala, son chauffeur l’attend déjà. Première impression réussie.',
    points: ['Accueil à l’aéroport de Douala', 'Bagages pris en charge', 'Horaires ajustés au vol'],
  },
  {
    id: 'famille', icon: Users, title: 'Cérémonies & voyages de groupe', car: 'jetour',
    pitch: 'Anniversaires, deuils, retours au village : toute la famille voyage ensemble, en confort.',
    points: ['4×4 et SUV pour la route', 'Plusieurs véhicules selon le groupe', 'Trajets hors de Douala'],
  },
]

export default function EventsSection({ onReserve }) {
  const [plan, setPlan] = useState({ event: 'mariage', date: addDays(today(), 14), guests: 8, place: '' })
  const event = events.find(item => item.id === plan.event)
  const guests = Math.max(1, Number(plan.guests) || 1)
  const seats = carById(event.car).seats
  const vehicles = Math.ceil(guests / seats)
  const update = values => setPlan(current => ({ ...current, ...values }))
  const summary = `${event.title} le ${dateLabel(plan.date)}${plan.place ? ` à ${plan.place}` : ''}, environ ${guests} personne${guests > 1 ? 's' : ''}`
  const whatsapp = `https://wa.me/${yamooContact.whatsappNumber}?text=${encodeURIComponent(`Bonjour YAMOO DRIVE, je prépare un événement : ${summary}. Pouvez-vous me proposer une solution de transport avec chauffeur et un devis ?`)}`

  return <section className="events-section section" id="evenements" data-reveal>
    <div className="shell">
      <header className="editorial-head">
        <div><p className="eyebrow">Événements</p><h2>Votre grand jour,<br />sans souci de transport.</h2></div>
        <p>Mariage, séminaire, accueil d’invités ou cérémonie familiale : dites-nous combien vous êtes et où vous allez. Nous organisons les véhicules et les chauffeurs, vous profitez du moment.</p>
      </header>

      <div className="event-grid">
        {events.map(item => {
          const Icon = item.icon
          return <article key={item.id} className={`event-card ${plan.event === item.id ? 'selected' : ''}`}>
            <span className="event-icon"><Icon size={22} /></span>
            <h3>{item.title}</h3>
            <p>{item.pitch}</p>
            <ul>{item.points.map(point => <li key={point}><Check size={14} />{point}</li>)}</ul>
            <div className="event-card-foot"><small>Véhicule conseillé</small><strong>{carById(item.car).name}</strong></div>
            <button className="text-link" onClick={() => { update({ event: item.id }); document.getElementById('event-planner')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}>Préparer cet événement <i>↗</i></button>
          </article>
        })}
      </div>

      <form className="event-planner" id="event-planner" onSubmit={event => event.preventDefault()}>
        <div className="planner-intro">
          <p className="eyebrow">Planificateur d’événement</p>
          <h3>Préparez votre demande en 30 secondes.</h3>
          <p>Remplissez ces quatre champs : nous vous suggérons le nombre de véhicules et votre message est prêt à envoyer.</p>
        </div>
        <div className="planner-fields">
          <label>Type d’événement<select value={plan.event} onChange={e => update({ event: e.target.value })}>{events.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label>Date<input type="date" min={today()} value={plan.date} onChange={e => update({ date: e.target.value })} /></label>
          <label>Nombre de personnes à transporter<input type="number" min="1" max="200" value={plan.guests} onChange={e => update({ guests: e.target.value })} /></label>
          <label>Lieu ou trajet<input value={plan.place} onChange={e => update({ place: e.target.value })} placeholder="Ex. Église de Bonapriso → salle à Kotto" /></label>
        </div>
        <div className="planner-result" aria-live="polite">
          <small>Notre suggestion</small>
          <strong>{vehicles} véhicule{vehicles > 1 ? 's' : ''} avec chauffeur</strong>
          <p>Base : {carById(event.car).name}, {seats} passagers par véhicule.{vehicles > fleet.length ? ' Pour ce volume, l’équipe vérifie les disponibilités et vous propose la meilleure combinaison.' : ' Disponibilité et prix confirmés par l’équipe.'}</p>
          <div className="planner-actions">
            <a className="button whatsapp-button" href={whatsapp} target="_blank" rel="noreferrer"><FaWhatsapp size={18} />Demander un devis sur WhatsApp</a>
            <button type="button" className="button dark-button" onClick={() => onReserve(event.car, { service: 'Événement', date: plan.date, passengers: Math.min(guests, seats), trip: `${event.title}${plan.place ? ` — ${plan.place}` : ''} (${guests} pers.)` })}>Réserver en ligne</button>
          </div>
        </div>
      </form>
    </div>
  </section>
}
