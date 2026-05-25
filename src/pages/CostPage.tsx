import { useState, useEffect } from 'react'
import { getCostSummary, getDailyUsage, type CostSummary, type DailyUsage } from '../api/cost'

export default function CostPage() {
  const [summary, setSummary] = useState<CostSummary | null>(null)
  const [daily, setDaily] = useState<DailyUsage[]>([])

  const load = async () => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - 30)

    const range = {
      start: start.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    }

    try {
      const s = await getCostSummary(range)
      setSummary(s)
      const d = await getDailyUsage(range)
      setDaily(d)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">费用追踪</h2>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="总请求数" value={summary?.total_requests ?? 0} />
        <StatCard label="输入 Tokens" value={formatTokens(summary?.total_input_tokens ?? 0)} />
        <StatCard label="输出 Tokens" value={formatTokens(summary?.total_output_tokens ?? 0)} />
        <StatCard label="总费用 (CNY)" value={`¥${(summary?.total_cost_cny ?? 0).toFixed(2)}`} />
      </div>

      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">每日用量 (近30天)</h3>
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
              <th className="text-left px-4 py-2">日期</th>
              <th className="text-right px-4 py-2">请求数</th>
              <th className="text-right px-4 py-2">输入</th>
              <th className="text-right px-4 py-2">输出</th>
              <th className="text-right px-4 py-2">费用</th>
            </tr>
          </thead>
          <tbody>
            {daily.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--text-secondary)]">暂无数据</td></tr>
            ) : (
              daily.map((d, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-2">{d.date}</td>
                  <td className="px-4 py-2 text-right">{d.request_count}</td>
                  <td className="px-4 py-2 text-right">{formatTokens(d.input_tokens)}</td>
                  <td className="px-4 py-2 text-right">{formatTokens(d.output_tokens)}</td>
                  <td className="px-4 py-2 text-right">¥{d.total_cost_cny.toFixed(4)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  )
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
