import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Calendar from './pages/Calendar'
import Financial from './pages/Financial'
import Settings from './pages/Settings'
import Assistant from './pages/Assistant'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/financial" element={<Financial />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/assistant" element={<Assistant />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App