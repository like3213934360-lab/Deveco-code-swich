import { useState, useEffect } from 'react'
import { check } from '@tauri-apps/plugin-updater'

export default function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [version, setVersion] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    checkForUpdate()
  }, [])

  const checkForUpdate = async () => {
    try {
      const update = await check()
      if (update) {
        setUpdateAvailable(true)
        setVersion(update.version)
      }
    } catch (e) {
      console.error('Update check failed:', e)
    }
  }

  const handleUpdate = async () => {
    setDownloading(true)
    try {
      const update = await check()
      if (update) {
        await update.downloadAndInstall()
      }
    } catch (e) {
      alert(`更新失败: ${e}`)
      setDownloading(false)
    }
  }

  if (!updateAvailable || dismissed) return null

  return (
    <div className="fixed bottom-4 right-4 bg-[var(--bg-secondary)] border border-[var(--accent)] rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">发现新版本 v{version}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">建议更新以获取最新功能和修复</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg leading-none"
        >
          ×
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleUpdate}
          disabled={downloading}
          className="px-3 py-1.5 bg-[var(--accent)] text-white rounded text-xs hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
        >
          {downloading ? '下载中...' : '立即更新'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="px-3 py-1.5 border border-[var(--border)] rounded text-xs hover:bg-[var(--bg-card)] transition-colors"
        >
          稍后
        </button>
      </div>
    </div>
  )
}
