import {
  ArrowRight, Briefcase, CalendarClock, ClipboardList, FlaskConical,
  PawPrint, Plus, Stethoscope, UserCog, UsersRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { animalService } from '../services/animalService'
import type { Animal } from '../types/Animal'

const modules = [
  { title: 'Pacientes', description: 'Cadastre e consulte os animais atendidos.', icon: PawPrint, path: '/animais', accent: 'teal' },
  { title: 'Tutores', description: 'Gerencie responsáveis, endereços e contatos.', icon: UsersRound, path: '/tutores', accent: 'sand' },
  { title: 'Agendamentos', description: 'Organize a agenda de atendimentos.', icon: CalendarClock, path: '/agendamentos', accent: 'blue' },
  { title: 'Consultas', description: 'Registre os atendimentos veterinários.', icon: Stethoscope, path: '/consultas', accent: 'rose' },
  { title: 'Prontuários', description: 'Acesse diagnósticos e evolução clínica.', icon: ClipboardList, path: '/registros-clinicos', accent: 'teal' },
  { title: 'Exames', description: 'Controle solicitações e resultados.', icon: FlaskConical, path: '/exames', accent: 'blue' },
  { title: 'Usuários', description: 'Administre os usuários do sistema.', icon: UserCog, path: '/usuarios', accent: 'sand' },
  { title: 'Funcionários', description: 'Gerencie a equipe e os vínculos profissionais.', icon: Briefcase, path: '/funcionarios', accent: 'rose' },
]

export function DashboardPage() {
  const [animais, setAnimais] = useState<Animal[]>([])

  useEffect(() => { animalService.listar().then(setAnimais).catch(() => setAnimais([])) }, [])

  const especies = useMemo(() => new Set(animais.map((animal) => animal.especie.toLocaleLowerCase())).size, [animais])
  const tutores = useMemo(() => new Set(animais.map((animal) => animal.tutorCpf)).size, [animais])

  return (
    <div className="dashboard">
      <section className="welcome-panel">
        <div><p className="eyebrow">Painel administrativo</p><h1>Olá, equipe VetCare.</h1><p>Gerencie os principais cadastros e consulte informações estratégicas do hospital em um só lugar.</p></div>
        <Link to="/animais/novo" className="button button--light"><Plus size={18} /> Novo paciente</Link>
        <Stethoscope className="welcome-panel__watermark" aria-hidden="true" />
      </section>

      <section className="stats-grid" aria-label="Resumo do sistema">
        <article className="stat-card"><span className="stat-card__icon stat-card__icon--teal"><PawPrint size={21} /></span><div><p>Pacientes cadastrados</p><strong>{animais.length}</strong><small>Base atual</small></div></article>
        <article className="stat-card"><span className="stat-card__icon stat-card__icon--sand"><UsersRound size={21} /></span><div><p>Tutores vinculados</p><strong>{tutores}</strong><small>Responsáveis únicos</small></div></article>
        <article className="stat-card"><span className="stat-card__icon stat-card__icon--blue"><ClipboardList size={21} /></span><div><p>Espécies atendidas</p><strong>{especies}</strong><small>Diversidade de pacientes</small></div></article>
      </section>

      <div className="dashboard__section-heading"><div><p className="eyebrow">Acesso rápido</p><h2>Principais módulos</h2></div><span>Selecione um módulo para começar</span></div>
      <section className="module-grid">
        {modules.map(({ title, description, icon: Icon, path, accent }) => (
          <Link to={path} key={title} className="module-card">
            <span className={`module-card__icon module-card__icon--${accent}`}><Icon size={23} /></span>
            <div><h3>{title}</h3><p>{description}</p></div><ArrowRight className="module-card__arrow" size={19} />
          </Link>
        ))}
      </section>

      <section className="recent-panel">
        <div className="recent-panel__header"><div><p className="eyebrow">Atualizações</p><h2>Pacientes recentes</h2></div><Link to="/animais">Ver todos <ArrowRight size={16} /></Link></div>
        <div className="recent-list">{animais.slice(-4).reverse().map((animal) => (
          <Link to={`/animais/${animal.id}`} key={animal.id} className="recent-item">
            <span className="animal-avatar">{animal.nome.slice(0, 1).toUpperCase()}</span>
            <span><strong>{animal.nome}</strong><small>{animal.especie} · {animal.raca}</small></span>
            <span className="recent-item__tutor">{animal.tutor}</span><ArrowRight size={17} />
          </Link>
        ))}</div>
      </section>
    </div>
  )
}
