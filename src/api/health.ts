import { invoke } from '@tauri-apps/api/core'

export interface HealthResult {
  provider_id: string
  provider_name: string
  status: string
  latency_ms: number | null
  error: string | null
}

export const checkAllHealth = () => invoke<HealthResult[]>('check_all_health')
export const getHealthHistory = (providerId: string) => invoke<Record<string, unknown>>('get_health_history', { providerId })
