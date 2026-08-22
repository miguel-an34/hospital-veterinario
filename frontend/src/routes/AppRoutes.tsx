import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { AnimalDetailsPage } from '../pages/AnimalDetailsPage'
import { AnimalFormPage } from '../pages/AnimalFormPage'
import { AnimalListPage } from '../pages/AnimalListPage'
import { DashboardPage } from '../pages/DashboardPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="animais" element={<AnimalListPage />} />
        <Route path="animais/novo" element={<AnimalFormPage />} />
        <Route path="animais/:id/editar" element={<AnimalFormPage />} />
        <Route path="animais/:id" element={<AnimalDetailsPage />} />
        <Route path="pacientes" element={<Navigate to="/animais" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
