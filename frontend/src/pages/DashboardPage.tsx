import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  PawPrint,
  Plus,
  Stethoscope,
  UsersRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { animalService } from '../services/animalService'
import type { Animal } from '../types/Animal'

const modules = [
  { title: 'Pacientes', description: 'Cadastre e consulte os animais atendidos.', icon: PawPrint, path: '/animais', accent: 'teal', enabled: true },
  { title: 'Tutores', description: 'Gerencie responsáveis e contatos.', icon: UsersRound, path: '#', accent: 'sand', enabled: false },
  { title: 'Agenda', description: 'Acompanhe consultas e retornos.', icon: CalendarClock, path: '#', accent: 'blue', enabled: false },
  { title: 'Prontuários', description: 'Acesse o histórico clínico completo.', icon: ClipboardList, path: '#', accent: 'rose', enabled: false },
]

export function DashboardPage() {
  const [animais, setAnimais] = useState<Animal[]>([])

  useEffect(() => {
    animalService.listar().then(setAnimais).catch(() => setAnimais([]))
  }, [])

  const especies = useMemo(() => new Set(animais.map((animal) => animal.especie.toLocaleLowerCase())).size, [animais])
  const tutores = useMemo(() => new Set(animais.map((animal) => animal.tutor.toLocaleLowerCase())).size, [animais])

  return (
    <div className="dashboard">
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">Painel administrativo</p>
          <h1>Olá, equipe VetCare.</h1>
          <p>Uma visão rápida do hospital e dos cadastros que precisam da sua atenção.</p>
        </div>
        <Link to="/animais/novo" className="button button--light"><Plus size={18} /> Novo paciente</Link>
        <Stethoscope className="welcome-panel__watermark" aria-hidden="true" />
      </section>

      <section className="stats-grid" aria-label="Resumo do sistema">
        <article className="stat-card">
          <span className="stat-card__icon stat-card__icon--teal"><PawPrint size={21} /></span>
          <div><p>Pacientes cadastrados</p><strong>{animais.length}</strong><small>Base atual</small></div>
        </article>
        <article className="stat-card">
          <span className="stat-card__icon stat-card__icon--sand"><UsersRound size={21} /></span>
          <div><p>Tutores vinculados</p><strong>{tutores}</strong><small>Responsáveis únicos</small></div>
        </article>
        <article className="stat-card">
          <span className="stat-card__icon stat-card__icon--blue"><ClipboardList size={21} /></span>
          <div><p>Espécies atendidas</p><strong>{especies}</strong><small>Diversidade de pacientes</small></div>
        </article>
      </section>

      <div className="dashboard__section-heading">
        <div><p className="eyebrow">Acesso rápido</p><h2>Principais cadastros</h2></div>
        <span>Selecione um módulo para começar</span>
      </div>

      <section className="module-grid">
        {modules.map(({ title, description, icon: Icon, path, accent, enabled }) => {
          const content = (
            <>
              <span className={`module-card__icon module-card__icon--${accent}`}><Icon size={23} /></span>
              <div><h3>{title}</h3><p>{description}</p></div>
              {enabled ? <ArrowRight className="module-card__arrow" size={19} /> : <small className="module-card__badge">Em breve</small>}
            </>
          )

          return enabled
            ? <Link to={path} key={title} className="module-card">{content}</Link>
            : <article key={title} className="module-card module-card--disabled">{content}</article>
        })}
      </section>

      <section className="recent-panel">
        <div className="recent-panel__header">
          <div><p className="eyebrow">Atualizações</p><h2>Pacientes recentes</h2></div>
          <Link to="/animais">Ver todos <ArrowRight size={16} /></Link>
        </div>
        <div className="recent-list">
          {animais.slice(-4).reverse().map((animal) => (
            <Link to={`/animais/${animal.id}`} key={animal.id} className="recent-item">
              <span className="animal-avatar">{animal.nome.slice(0, 1).toUpperCase()}</span>
              <span><strong>{animal.nome}</strong><small>{animal.especie} · {animal.raca}</small></span>
              <span className="recent-item__tutor">{animal.tutor}</span>
              <ArrowRight size={17} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
