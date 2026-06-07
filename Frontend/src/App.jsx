import React from 'react'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import MealLogger from './pages/MealLogger'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import Login from './pages/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path='/onboarding' element={<Onboarding />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/meals' element={<MealLogger />} />
        <Route path='/reports' element={<Reports />} />
        <Route path='/profile' element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App 