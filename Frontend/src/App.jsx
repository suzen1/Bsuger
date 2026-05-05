import React from 'react'
import Onbording from './pages/Onbording'
import Dashbord from './pages/Dashbord'
import Mealogger from './pages/mealogger'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Onbording />} />
        <Route path='/dashbord' element={<Dashbord />} />
        <Route path='/mealogger' element={<Mealogger />} />
        <Route path='/reports' element={<Reports />} />
        <Route path='/profile' element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App 