import { useState, useEffect } from 'react'
import { startProxy, stopProxy, getProxyStatus, updateProxyConfig, type ProxyStatus, type ProxyConfigInput } from '../api/proxy'

export default function ProxyPage() {
  const [status, setStatus] = useState<ProxyStatus | null>(null)
  const [config, setConfig] = useState<ProxyConfigInput>({
    listen_address: '127.0.0.1',
    listen_port: 15800,
    auto_failover: false,
    max_retries: 3,
    streaming_first_byte_timeout_s: 60,
    non_streaming_timeout_s: 600,
  })
  const [loading, setLoading] = useState(false)

  const loadStatus = async () => {
    try {
      const s = await getProxyStatus()
      setStatus(s)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleStart = async () => {
    setLoading(true)
    try {
      await updateProxyConfig(config)
      await startProxy()
      await loadStatus()
    } catch (e) {
      alert(`启动失败: ${e}`)
    }
    setLoading(false)
  }

  const handleStop = async () => {
    setLoading(true)
    try {
      await stopProxy()
      await loadStatus()
    } catch (e) {
      alert(`停止失败: ${e}`)
    }
    setLoading(false)
  }

  const isRunning = status?.running ?? false

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">本地代理</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-[var(--success)]' : 'bg-[var(--text-secondary)]'}`} />
            <span className="text-sm">{isRunning ? '运行中' : '已停止'}</span>
          </div>
          {isRunning ? (
            <button
              onClick={handleStop}
              disabled={loading}
              className="px-4 py-2 bg-[var(--danger)] text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              停止
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={loading}
              className="px-4 py-2 bg-[var(--success)] text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              启动
            </button>
          )}
        </div>
      </div>

      {isRunning && status && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
            <p className="text-xs text-[var(--text-secondary)]">监听地址</p>
            <p className="text-sm font-mono mt-1">{status.listen_address}:{status.listen_port}</p>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
            <p className="text-xs text-[var(--text-secondary)]">总请求数</p>
            <p className="text-lg font-semibold mt-1">{status.total_requests}</p>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
            <p className="text-xs text-[var(--text-secondary)]">活跃 Provider</p>
            <p className="text-sm mt-1">{status.active_provider || '-'}</p>
          </div>
        </div>
      )}

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium mb-4">代理配置</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1">监听地址</label>
            <input
              value={config.listen_address}
              onChange={(e) => setConfig({ ...config, listen_address: e.target.value })}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1">端口</label>
            <input
              type="number"
              value={config.listen_port}
              onChange={(e) => setConfig({ ...config, listen_port: parseInt(e.target.value) || 15800 })}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1">最大重试次数</label>
            <input
              type="number"
              value={config.max_retries}
              onChange={(e) => setConfig({ ...config, max_retries: parseInt(e.target.value) || 3 })}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1">非流式超时 (秒)</label>
            <input
              type="number"
              value={config.non_streaming_timeout_s}
              onChange={(e) => setConfig({ ...config, non_streaming_timeout_s: parseInt(e.target.value) || 600 })}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1">流式首字节超时 (秒)</label>
            <input
              type="number"
              value={config.streaming_first_byte_timeout_s}
              onChange={(e) => setConfig({ ...config, streaming_first_byte_timeout_s: parseInt(e.target.value) || 60 })}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] disabled:opacity-50"
            />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              checked={config.auto_failover}
              onChange={(e) => setConfig({ ...config, auto_failover: e.target.checked })}
              disabled={isRunning}
              className="w-4 h-4"
            />
            <label className="text-sm text-[var(--text-primary)]">自动故障转移</label>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">使用说明</h3>
        <div className="text-xs text-[var(--text-secondary)] space-y-2">
          <p>1. 启动代理后，在 DevEco Code 配置文件中将 baseURL 设置为：</p>
          <code className="block bg-[var(--bg-card)] px-3 py-2 rounded font-mono">
            http://{config.listen_address}:{config.listen_port}/v1
          </code>
          <p>2. 代理会自动将请求转发到当前活跃的 Provider，并记录费用和延迟。</p>
          <p>3. 开启「自动故障转移」后，当前 Provider 失败时会自动切换到 failover 队列中的下一个。</p>
        </div>
      </div>
    </div>
  )
}
