import { invoke } from '@tauri-apps/api/core'

export interface Provider {
  id: string
  name: string
  provider_type: string
  base_url: string
  api_key: string | null
  npm_package: string | null
  is_active: boolean
  in_failover_queue: boolean
  priority: number
  cost_multiplier: number
  limit_daily_cny: number | null
  limit_monthly_cny: number | null
  settings_json: string
  notes: string | null
  icon: string | null
  created_at: number
  updated_at: number
}

export interface CreateProviderInput {
  name: string
  provider_type: string
  base_url: string
  api_key?: string
  npm_package?: string
  notes?: string
}

export interface UpdateProviderInput {
  name?: string
  base_url?: string
  api_key?: string
  npm_package?: string
  notes?: string
  priority?: number
}

export const listProviders = () => invoke<Provider[]>('list_providers')
export const createProvider = (input: CreateProviderInput) => invoke<Provider>('create_provider', { input })
export const updateProvider = (id: string, input: UpdateProviderInput) => invoke<Provider>('update_provider', { id, input })
export const deleteProvider = (id: string) => invoke<void>('delete_provider', { id })
export const switchProvider = (id: string) => invoke<void>('switch_provider', { id })
export const testProvider = (id: string) => invoke<string>('test_provider', { id })
