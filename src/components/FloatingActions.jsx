import { useEffect, useState } from 'react'
import { ArrowUp, BotMessageSquare, X } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { yamooContact } from '../data'

const whatsappMessage = 'Bonjour YAMOO DRIVE, je souhaite obtenir des informations sur vos véhicules et vos services de location.'

export default function FloatingActions({ chatOpen, onToggleChat }) {
  const [showTop, setShowTop] = useState(false)
  useEffect(() => {
    const scroll = () => setShowTop(scrollY > 500)
    addEventListener('scroll', scroll, { passive: true })
    scroll()
    return () => removeEventListener('scroll', scroll)
  }, [])
  const backToTop = () => {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  }
  const whatsapp = `https://wa.me/${yamooContact.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
  return <nav className="floating-actions" aria-label="Actions rapides">
    <button className={`floating-action assistant-action ${chatOpen ? 'active' : ''}`} onClick={onToggleChat} aria-label={chatOpen ? 'Fermer l’assistant YAMOO DRIVE' : 'Ouvrir l’assistant YAMOO DRIVE'} aria-expanded={chatOpen}>{chatOpen ? <X /> : <BotMessageSquare />}<span>{chatOpen ? 'Fermer' : 'Assistant'}</span></button>
    <a className="floating-action whatsapp-action" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Contacter YAMOO DRIVE sur WhatsApp"><FaWhatsapp /><span>WhatsApp</span></a>
    <button className={`floating-action top-action ${showTop ? 'visible' : ''}`} onClick={backToTop} aria-label="Retour en haut de la page" tabIndex={showTop ? 0 : -1}><ArrowUp /><span>Retour en haut</span></button>
  </nav>
}
