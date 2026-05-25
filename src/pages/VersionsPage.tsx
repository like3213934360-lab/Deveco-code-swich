import { useState, useEffect } from 'react'
import { getCurrentVersion, listAvailableVersions, installVersion, type VersionInfo } from '../api/version'

export default function VersionsPage() {
  const [current, setCurrent] = useState<string>('')
  const [versions, setVersions] = useState<VersionInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [installing, setInstalling] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const v = await getCurrentVersion()
      setCurrent(v)
    } catch {
      setCurrent('未安装')
    }
    try {
      const list = await listAvailableVersions()
      setVersions(list)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleInstall = async (version: string) => {
    setInstalling(version)
    try {
      await installVersion(version)
      await load()
    } catch (e) {
      alert(`安装失败: ${e}`)
    }
    setInstalling(null)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">版本管理</h2>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 mb-6">
        <p className="text-sm text-[var(--text-secondary)]">当前版本</p>
        <p className="text-lg font-mono mt-1">{current || '加载中...'}</p>
      </div>

      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">可用版本</h3>

      {loading ? (
        <p className="text-sm text-[var(--text-secondary)]">加载中...</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {versions.map((v) => (
            <div
              key={v.version}
              className="flex items-center justify-between bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{v.version}</span>
                {v.is_current && (
                  <span className="text-xs px-2 py-0.5 bg-[var(--success)] text-white rounded">当前</span>
                )}
                {v.tag && (
                  <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-white rounded">{v.tag}</span>
                )}
              </div>
              {!v.is_current && (
                <button
                  onClick={() => handleInstall(v.version)}
                  disabled={installing !== null}
                  className="px-3 py-1 text-xs bg-[var(--accent)] text-white rounded hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
                >
                  {installing === v.version ? '安装中...' : '安装'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
