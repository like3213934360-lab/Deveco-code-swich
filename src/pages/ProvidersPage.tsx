import { useState, useEffect } from 'react'
import { listProviders, createProvider, deleteProvider, switchProvider, testProvider, type Provider, type CreateProviderInput } from '../api/provider'

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [showForm, setShowForm] = useState(false)
  const [testResult, setTestResult] = useState<Record<string, string>>({})
  const [form, setForm] = useState<CreateProviderInput>({
    name: '',
    provider_type: 'openai-compatible',
    base_url: '',
    api_key: '',
  })

  const load = async () => {
    try {
      const list = await listProviders()
      setProviders(list)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.name || !form.base_url) return
    await createProvider(form)
    setForm({ name: '', provider_type: 'openai-compatible', base_url: '', api_key: '' })
    setShowForm(false)
    load()
  }

  const handleSwitch = async (id: string) => {
    await switchProvider(id)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此 Provider？')) return
    await deleteProvider(id)
    load()
  }

  const handleTest = async (id: string) => {
    setTestResult((prev) => ({ ...prev, [id]: '测试中...' }))
    try {
      const result = await testProvider(id)
      setTestResult((prev) => ({ ...prev, [id]: result }))
    } catch (e) {
      setTestResult((prev) => ({ ...prev, [id]: `失败: ${e}` }))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Provider 管理</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors"
        >
          {showForm ? '取消' : '+ 添加 Provider'}
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="名称"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
            />
            <select
              value={form.provider_type}
              onChange={(e) => setForm({ ...form, provider_type: e.target.value })}
              className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
            >
              <option value="openai-compatible">OpenAI Compatible</option>
              <option value="huawei-free">华为免费模型</option>
              <option value="zhipu">智谱 ZhipuAI</option>
              <option value="aliyun">阿里通义</option>
              <option value="custom">自定义</option>
            </select>
            <input
              placeholder="Base URL"
              value={form.base_url}
              onChange={(e) => setForm({ ...form, base_url: e.target.value })}
              className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
            />
            <input
              placeholder="API Key (可选)"
              type="password"
              value={form.api_key || ''}
              onChange={(e) => setForm({ ...form, api_key: e.target.value })}
              className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
            />
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-[var(--success)] text-white rounded text-sm"
          >
            保存
          </button>
        </div>
      )}

      <div className="space-y-3">
        {providers.length === 0 && (
          <p className="text-[var(--text-secondary)] text-sm">暂无 Provider，点击上方按钮添加</p>
        )}
        {providers.map((p) => (
          <div
            key={p.id}
            className={`bg-[var(--bg-secondary)] border rounded-lg p-4 flex items-center justify-between ${
              p.is_active ? 'border-[var(--success)]' : 'border-[var(--border)]'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{p.name}</span>
                {p.is_active && (
                  <span className="text-xs px-2 py-0.5 bg-[var(--success)] text-white rounded">当前</span>
                )}
                <span className="text-xs text-[var(--text-secondary)]">{p.provider_type}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{p.base_url}</p>
              {testResult[p.id] && (
                <p className="text-xs mt-1 text-[var(--warning)]">{testResult[p.id]}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTest(p.id)}
                className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--bg-card)] transition-colors"
              >
                测试
              </button>
              {!p.is_active && (
                <button
                  onClick={() => handleSwitch(p.id)}
                  className="px-3 py-1 text-xs bg-[var(--accent)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors"
                >
                  切换
                </button>
              )}
              <button
                onClick={() => handleDelete(p.id)}
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
