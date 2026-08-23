import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { AgendamentosPage } from '../pages/AgendamentosPage'
import { AnimalDetailsPage } from '../pages/AnimalDetailsPage'
import { AnimalFormPage } from '../pages/AnimalFormPage'
import { AnimalListPage } from '../pages/AnimalListPage'
import { ConsultasPage } from '../pages/ConsultasPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ExamesPage } from '../pages/ExamesPage'
import { FuncionariosPage } from '../pages/FuncionariosPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RegistrosClinicosPage } from '../pages/RegistrosClinicosPage'
import { RelatoriosPage } from '../pages/RelatoriosPage'
import { TutoresPage } from '../pages/TutoresPage'
import { UsuariosPage } from '../pages/UsuariosPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="animais" element={<AnimalListPage />} />
        <Route path="animais/novo" element={<AnimalFormPage />} />
        <Route path="animais/:id/editar" element={<AnimalFormPage />} />
        <Route path="animais/:id" element={<AnimalDetailsPage />} />
        <Route path="tutores" element={<TutoresPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="funcionarios" element={<FuncionariosPage />} />
        <Route path="agendamentos" element={<AgendamentosPage />} />
        <Route path="consultas" element={<ConsultasPage />} />
        <Route path="registros-clinicos" element={<RegistrosClinicosPage />} />
        <Route path="prontuarios" element={<Navigate to="/registros-clinicos" replace />} />
        <Route path="exames" element={<ExamesPage />} />
        <Route path="relatorios" element={<RelatoriosPage />} />
        <Route path="pacientes" element={<Navigate to="/animais" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
