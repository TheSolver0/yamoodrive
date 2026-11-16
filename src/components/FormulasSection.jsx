import { Check, KeyRound, UserRound } from 'lucide-react'

const formulas = [
  {
    service: 'Location avec chauffeur', icon: UserRound, tag: 'Le plus confortable',
    title: 'Avec chauffeur', lead: 'Installez-vous, on s’occupe de la route.',
    points: ['Chauffeur qui connaît Douala et ses raccourcis', 'Pas de stress : ni embouteillages au volant, ni parking', 'Idéal pour l’aéroport, les réunions et les événements'],
    cta: 'Réserver avec chauffeur',
  },
  {
    service: 'Location sans chauffeur', icon: KeyRound, tag: 'Le plus libre',
    title: 'Sans chauffeur', lead: 'Prenez les clés, allez où vous voulez.',
    points: ['Vous gérez vos horaires et votre itinéraire', 'Véhicule propre, climatisé et vérifié avant la remise', 'Permis de conduire requis, conditions confirmées par l’équipe'],
    cta: 'Réserver sans chauffeur',
  },
]

export default function FormulasSection({ onReserve }) {
  return <section className="formulas-section section" id="formules" data-reveal>
    <div className="shell">
      <header className="editorial-head compact">
        <div><p className="eyebrow">Deux formules</p><h2>Au volant<br />ou à l’arrière ?</h2></div>
        <p>Chez YAMOO DRIVE, c’est vous qui choisissez. Même véhicule, même soin, même tarif d’appel dès 30 000 FCFA : seule la façon de voyager change.</p>
      </header>
      <div className="formula-grid">
        {formulas.map(item => {
          const Icon = item.icon
          return <article key={item.service} className="formula-card">
            <div className="formula-top"><span className="event-icon"><Icon size={22} /></span><small>{item.tag}</small></div>
            <h3>{item.title}</h3>
            <p className="formula-lead">{item.lead}</p>
            <ul>{item.points.map(point => <li key={point}><Check size={15} />{point}</li>)}</ul>
            <button className="button dark-button" onClick={() => onReserve(item.service)}>{item.cta}</button>
          </article>
        })}
      </div>
    </div>
  </section>
}
