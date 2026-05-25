import { invoke } from '@tauri-apps/api/core'

export interface RequestLog {
  id: string
  provider_id: string | null
  model: string | null
  input_tokens: number
  output_tokens: number
  cache_read_tokens: number
  cache_creation_tokens: number
  total_cost_cny: number
  latency_ms: number | null
  first_token_ms: number | null
  status_code: number | null
  error_message: string | null
  session_id: string | null
  is_streaming: boolean
  created_at: number
}

export interface DailyUsage {
  date: string
  provider_id: string | null
  model: string | null
  request_count: number
  input_tokens: number
  output_tokens: number
  total_cost_cny: number
}

export interface CostSummary {
  total_requests: number
  total_input_tokens: number
  total_output_tokens: number
  total_cost_cny: number
  by_provider: { provider_id: string; provider_name: string; request_count: number; total_cost_cny: number }[]
  by_model: { model: string; request_count: number; total_cost_cny: number }[]
}

export interface DateRange {
  start: string
  end: string
}

export interface LogFilter {
  limit?: number
  offset?: number
  provider_id?: string
  model?: string
}

export const getCostSummary = (range: DateRange) => invoke<CostSummary>('get_cost_summary', { range })
export const getRequestLogs = (filter: LogFilter) => invoke<RequestLog[]>('get_request_logs', { filter })
export const getDailyUsage = (range: DateRange) => invoke<DailyUsage[]>('get_daily_usage', { range })
