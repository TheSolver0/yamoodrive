import { createContext, useContext, useMemo, useState } from 'react'

export const fleet = [
  { id: 'jetour', name: 'Jetour T2', kind: '4×4', use: 'Robuste et confortable pour la route : Kribi, Limbé, Yaoundé.', seats: 4, consumption: 10.5, indicativePrice: 65000, equipment: ['Climatisation', 'Sellerie confort', 'Grand coffre'], photos: [['Avant trois quarts', 'jetour-cape-front'], ['Profil', 'jetour-side'], ['Arrière trois quarts', 'jetour-cape-rear'], ['De face', 'jetour-face']] },
  { id: 'chery', name: 'Chery Tiggo', kind: 'SUV', use: 'Spacieux pour la famille et les bagages.', seats: 4, consumption: 8.8, indicativePrice: 50000, equipment: ['Climatisation', 'Connectivité', 'Aide au stationnement'], photos: [['Avant trois quarts', 'chery-front'], ['Arrière trois quarts', 'chery-rear']] },
  { id: 'camry', name: 'Toyota Camry', kind: 'Berline', use: 'Élégante pour vos rendez-vous et transferts aéroport.', seats: 4, consumption: 7.5, indicativePrice: 40000, equipment: ['Climatisation', 'Confort arrière', 'Charge USB'], photos: [['Avant trois quarts', 'camry-front'], ['Arrière trois quarts', 'camry-rear'], ['Profil avant', 'camry-profile']] },
]

export const services = ['Location avec chauffeur', 'Mise à disposition', 'Transfert', 'Déplacement professionnel', 'Événement']
export const yamooContact = {
  phone: '+237 672 89 40 84',
  whatsappNumber: (import.meta.env.VITE_YAMOO_WHATSAPP_NUMBER || '237672894084').replace(/\D/g, ''),
}

export const faqItems = [
  ['Comment réserver avec chauffeur ?', 'Indiquez vos dates, le lieu de départ, la destination et le nombre de passagers. L’équipe confirme la disponibilité, le chauffeur et le devis sur WhatsApp.'],
  ['Quel est le prix de la location ?', 'YAMOO DRIVE annonce des locations à partir de 30 000 FCFA. Le prix dépend du véhicule, de la durée et de votre trajet.'],
  ['Le carburant et les péages sont-ils inclus ?', 'Demandez le détail dans votre devis. Le calculateur donne une estimation du carburant seul.'],
  ['Puis-je voir le véhicule avant de réserver ?', 'Explorez les photos sur le site puis demandez un créneau à Logpom, carrefour ADEM, à Douala.'],
  ['Pouvez-vous gérer le transport d’un mariage ou d’un séminaire ?', 'Oui. Utilisez le planificateur d’événement ou écrivez-nous sur WhatsApp avec la date, le lieu et le nombre de personnes. L’équipe vous propose les véhicules, les chauffeurs et un devis selon les disponibilités.'],
  ['Quels documents faut-il prévoir ?', 'L’équipe confirme les pièces requises, l’acompte éventuel et les règles d’annulation avant la réservation.'],
]

const STORAGE_KEY = 'yamoo-drive-react-v1'
export const statuses = ['En attente', 'Confirmée', 'Terminée', 'Annulée']
export const visitStatuses = ['En attente', 'Confirmé', 'Effectué', 'Annulé']
export const hours = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']

export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Douala', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
export function addDays(date, amount) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + amount)
  return value.toISOString().slice(0, 10)
}
export const dateLabel = value => new Intl.DateTimeFormat('fr-CM', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`))
export const money = value => `${new Intl.NumberFormat('fr-CM').format(Math.round(value))} FCFA`
export const carById = id => fleet.find(car => car.id === id)
export const overlaps = (startA, endA, startB, endB) => startA <= endB && endA >= startB
export function isSlotAvailable(data, car, start, end = start, time = '', ignoredId = '') {
  if (!data.availability[car]) return false
  const maintenance = (data.maintenance || []).some(item => item.car === car && !['Annulée', 'Annulé'].includes(item.status) && overlaps(start, end, item.date, item.end || item.date))
  if (maintenance) return false
  return !data.requests.some(item => item.id !== ignoredId && item.car === car && !['Annulée', 'Annulé', 'Terminée', 'Effectué'].includes(item.status) && (
    item.type === 'order' ? overlaps(start, end, item.date, item.end || item.date) : item.date === start && (!time || item.time === time)
  ))
}

export function initialData() {
  const day = today()
  return {
    people: [
      { id: 'EQ-101', name: 'Alain M.', role: 'Chauffeur', active: true },
      { id: 'EQ-102', name: 'Prisca N.', role: 'Chauffeur', active: true },
      { id: 'EQ-103', name: 'Joël B.', role: 'Accueil', active: true },
      { id: 'EQ-104', name: 'Mireille T.', role: 'Gestion', active: true },
    ],
    availability: { jetour: true, chery: true, camry: true },
    maintenance: [
      { id: 'MNT-101', car: 'chery', date: addDays(day, 7), end: addDays(day, 8), label: 'Entretien préventif', status: 'Planifiée' },
    ],
    requests: [
      { id: 'VIS-101', type: 'visit', client: 'Client démo A', car: 'jetour', date: addDays(day, 1), time: '10:00', status: 'Confirmé', driver: '', staff: 'EQ-103' },
      { id: 'VIS-102', type: 'visit', client: 'Client démo B', car: 'chery', date: addDays(day, 2), time: '14:00', status: 'En attente', driver: '', staff: '' },
      { id: 'LOC-101', type: 'order', client: 'Client démo C', phone: '+237 6 00 00 00 03', service: 'Transfert', car: 'camry', date: addDays(day, 3), end: addDays(day, 3), trip: 'Accueil à l’aéroport', passengers: 2, amount: 40000, status: 'Confirmée', driver: 'EQ-101', staff: 'EQ-104' },
      { id: 'LOC-102', type: 'order', client: 'Client démo D', phone: '+237 6 00 00 00 04', service: 'Location avec chauffeur', car: 'jetour', date: addDays(day, 4), end: addDays(day, 6), trip: 'Séjour à Kribi', passengers: 4, amount: 195000, status: 'En attente', driver: '', staff: '' },
    ],
  }
}

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setDataState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialData() } catch { return initialData() }
  })
  const setData = next => {
    setDataState(current => {
      const value = typeof next === 'function' ? next(current) : next
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      return value
    })
  }
  const reset = () => setData(initialData())
  const value = useMemo(() => ({ data, setData, reset }), [data])
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useYamooData = () => useContext(DataContext)
