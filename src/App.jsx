import { Route, Routes } from 'react-router-dom'
import PublicSite from './components/PublicSite'
import AdminDashboard from './components/AdminDashboard'
import { DataProvider } from './data'

export default function App() {
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </DataProvider>
  )
}
