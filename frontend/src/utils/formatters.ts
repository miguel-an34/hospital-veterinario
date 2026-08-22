export function formatarData(data: string): string {
  if (!data) return 'Não informada'
  const [ano, mes, dia] = data.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR').format(new Date(ano, mes - 1, dia))
}

export function formatarPeso(peso: number): string {
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: peso < 1 ? 2 : 1,
    maximumFractionDigits: 2,
  }).format(peso)} kg`
}

export function calcularIdade(dataNascimento: string): string {
  if (!dataNascimento) return 'Não informada'

  const nascimento = new Date(`${dataNascimento}T00:00:00`)
  const hoje = new Date()
  let anos = hoje.getFullYear() - nascimento.getFullYear()
  let meses = hoje.getMonth() - nascimento.getMonth()

  if (hoje.getDate() < nascimento.getDate()) meses--
  if (meses < 0) {
    anos--
    meses += 12
  }

  if (anos > 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
  return `${Math.max(0, meses)} ${meses === 1 ? 'mês' : 'meses'}`
}
