import { useState, useEffect } from 'react'
import { readConfig, writeConfig, getConfigPath } from '../api/config'

export default function ConfigPage() {
  const [config, setConfig] = useState<string>('')
  const [configPath, setConfigPath] = useState<string>('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const path = await getConfigPath()
      setConfigPath(path)
      const data = await readConfig()
      setConfig(JSON.stringify(data, null, 2))
    } catch (e) {
      setError(`加载失败: ${e}`)
    }
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setError(null)
    try {
      const parsed = JSON.parse(config)
      await writeConfig(parsed)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(`保存失败: ${e}`)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">配置编辑</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">{configPath}</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-[var(--success)]">已保存</span>}
          {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors"
          >
            保存
          </button>
        </div>
      </div>

      <textarea
        value={config}
        onChange={(e) => setConfig(e.target.value)}
        spellCheck={false}
        className="flex-1 w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 font-mono text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--accent)]"
      />
    </div>
  )
}
