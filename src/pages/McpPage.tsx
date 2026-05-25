import { useState, useEffect } from 'react'
import { listMcpServers, addMcpServer, toggleMcpServer, removeMcpServer, type McpServer, type CreateMcpInput } from '../api/mcp'

export default function McpPage() {
  const [servers, setServers] = useState<McpServer[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', command: '', description: '' })

  const load = async () => {
    try {
      const list = await listMcpServers()
      setServers(list)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!form.name || !form.command) return
    const input: CreateMcpInput = {
      name: form.name,
      command: form.command.split(' '),
      description: form.description || undefined,
    }
    await addMcpServer(input)
    setForm({ name: '', command: '', description: '' })
    setShowForm(false)
    load()
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    await toggleMcpServer(id, !enabled)
    load()
  }

  const handleRemove = async (id: string) => {
    if (!confirm('确定删除此 MCP 服务器？')) return
    await removeMcpServer(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">MCP 服务器</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors"
        >
          {showForm ? '取消' : '+ 添加'}
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 mb-6 space-y-3">
          <input
            placeholder="名称 (如 playwright)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
          />
          <input
            placeholder="命令 (如 npx @playwright/mcp@latest)"
            value={form.command}
            onChange={(e) => setForm({ ...form, command: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
          />
          <input
            placeholder="描述 (可选)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
          />
          <button onClick={handleAdd} className="px-4 py-2 bg-[var(--success)] text-white rounded text-sm">
            保存
          </button>
        </div>
      )}

      <div className="space-y-3">
        {servers.length === 0 && (
          <p className="text-[var(--text-secondary)] text-sm">暂无 MCP 服务器</p>
        )}
        {servers.map((s) => (
          <div key={s.id} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{s.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${s.enabled ? 'bg-[var(--success)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'}`}>
                  {s.enabled ? '启用' : '禁用'}
                </span>
              </div>
              {s.description && <p className="text-xs text-[var(--text-secondary)] mt-1">{s.description}</p>}
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">{s.command}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(s.id, s.enabled)}
                className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--bg-card)] transition-colors"
              >
                {s.enabled ? '禁用' : '启用'}
              </button>
              <button
                onClick={() => handleRemove(s.id)}
                className="px-3 py-1 text-xs border border-[var(--danger)] text-[var(--danger)] rounded hover:bg-[var(--danger)] hover:text-white transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
