import { useState, useEffect } from 'react'
import { checkAllHealth, type HealthResult } from '../api/health'

export default function HealthPage() {
  const [results, setResults] = useState<HealthResult[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await checkAllHealth()
      setResults(r)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const statusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'var(--success)'
      case 'degraded': return 'var(--warning)'
      case 'down': return 'var(--danger)'
      default: return 'var(--text-secondary)'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'healthy': return '正常'
      case 'degraded': return '降级'
      case 'down': return '离线'
      default: return '未知'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">健康监控</h2>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
        >
          {loading ? '检测中...' : '刷新'}
        </button>
      </div>

      <div className="space-y-3">
        {results.length === 0 && !loading && (
          <p className="text-[var(--text-secondary)] text-sm">暂无 Provider，请先添加</p>
        )}
        {results.map((r) => (
          <div key={r.provider_id} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: statusColor(r.status) }}
              />
              <div>
                <span className="font-medium">{r.provider_name}</span>
                <span className="text-xs text-[var(--text-secondary)] ml-2">{statusLabel(r.status)}</span>
              </div>
            </div>
            <div className="text-right">
              {r.latency_ms !== null && (
                <span className="text-sm font-mono">{r.latency_ms}ms</span>
              )}
              {r.error && (
                <p className="text-xs text-[var(--danger)] mt-1">{r.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
