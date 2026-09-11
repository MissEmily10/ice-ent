export type ApiPosition = {
  id: string
  title: string
  description: string | null
  is_open: boolean
  group: { id: string; title: string; is_channel_level: boolean }
}

export type ApiApplication = {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  position: string
  group: string
  created_at: string
}

const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!apiUrl) throw new Error('VITE_API_URL is not configured')
  const initData = (window as Window & { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData
  const headers = new Headers(options?.headers)
  if (initData) headers.set('X-Telegram-Init-Data', initData)
  if (options?.body) headers.set('Content-Type', 'application/json')
  const response = await fetch(`${apiUrl}${path}`, { ...options, headers })
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  return response.json() as Promise<T>
}

export const api = {
  enabled: Boolean(apiUrl),
  catalog: (scope: 'all' | 'channel' | 'groups', onlyOpen: boolean) => request<ApiPosition[]>(`/api/catalog?scope=${scope === 'groups' ? 'group' : scope}&is_open=${onlyOpen}`),
  applications: () => request<ApiApplication[]>('/api/applications/my'),
  submitApplication: (positionId: string, answers: { field_id: string; value: string }[]) => request<{ id: string; status: string }>('/api/applications', { method: 'POST', body: JSON.stringify({ position_id: positionId, answers }) }),
}
