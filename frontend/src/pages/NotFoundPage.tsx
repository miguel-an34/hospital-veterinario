import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <div className="not-found"><strong>404</strong><h1>Página não encontrada</h1><p>O endereço acessado não existe neste sistema.</p><Link to="/" className="button button--primary">Voltar ao início</Link></div>
}
