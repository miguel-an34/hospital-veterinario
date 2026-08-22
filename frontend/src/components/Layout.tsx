import {
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardPlus,
  LayoutDashboard,
  Menu,
  PawPrint,
  Stethoscope,
  UsersRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { label: 'Visão geral', path: '/', icon: LayoutDashboard, enabled: true },
  { label: 'Animais', path: '/animais', icon: PawPrint, enabled: true },
  { label: 'Tutores', path: '/tutores', icon: UsersRound, enabled: false },
  { label: 'Agendamentos', path: '/agendamentos', icon: CalendarDays, enabled: false },
  { label: 'Consultas', path: '/consultas', icon: Stethoscope, enabled: false },
  { label: 'Prontuários', path: '/prontuarios', icon: ClipboardPlus, enabled: false },
]

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <div className="brand">
          <span className="brand__mark"><PawPrint size={23} /></span>
          <span><strong>VetCare</strong><small>Hospital Veterinário</small></span>
          <button className="icon-button sidebar__close" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Navegação principal">
          <p className="sidebar__label">Gestão</p>
          {navigation.map(({ label, path, icon: Icon, enabled }) => (
            enabled ? (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{label}</span>
              </NavLink>
            ) : (
              <span key={path} className="nav-item nav-item--disabled" title="Módulo em desenvolvimento">
                <Icon size={19} strokeWidth={1.8} />
                <span>{label}</span>
                <small>Em breve</small>
              </span>
            )
          ))}

          <p className="sidebar__label sidebar__label--spaced">Relatórios</p>
          <span className="nav-item nav-item--disabled" title="Módulo em desenvolvimento">
            <ChartNoAxesCombined size={19} strokeWidth={1.8} />
            <span>Visões estratégicas</span>
            <small>Em breve</small>
          </span>
        </nav>

        <div className="sidebar__footer">
          <span className="status-dot" />
          <span><strong>Ambiente acadêmico</strong><small>API simulada ativa</small></span>
        </div>
      </aside>

      {menuOpen && <button className="sidebar-overlay" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />}

      <div className="main-area">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <Menu size={22} />
          </button>
          <div className="topbar__system">
            <span className="topbar__system-icon"><Stethoscope size={17} /></span>
            <span>Sistema de Gestão Veterinária</span>
          </div>
          <div className="user-chip" aria-label="Usuário atual">
            <span className="user-chip__avatar">AC</span>
            <span><strong>Administrador</strong><small>Equipe clínica</small></span>
          </div>
        </header>
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
