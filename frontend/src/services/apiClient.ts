const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

interface ApiErrorBody {
  message?: string
  fieldErrors?: Record<string, string>
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está ativo.')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null) as ApiErrorBody | null
    const fieldMessage = body?.fieldErrors ? Object.values(body.fieldErrors)[0] : undefined
    throw new Error(fieldMessage ? `${body?.message ?? 'Campo inválido'}: ${fieldMessage}` : body?.message ?? `A operação falhou (erro ${response.status}).`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
