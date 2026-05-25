import { useState, useEffect } from 'react'
import { listSkills, toggleSkill, type Skill } from '../api/skill'

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])

  const load = async () => {
    try {
      const list = await listSkills()
      setSkills(list)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (id: string, enabled: boolean) => {
    await toggleSkill(id, !enabled)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Skill 管理</h2>
      </div>

      <div className="space-y-3">
        {skills.length === 0 && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-8 text-center">
            <p className="text-[var(--text-secondary)] text-sm">暂无已安装的 Skill</p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              使用 <code className="bg-[var(--bg-card)] px-1 rounded">npx skills add repo/name</code> 安装
            </p>
          </div>
        )}
        {skills.map((s) => (
          <div key={s.id} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{s.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${s.enabled ? 'bg-[var(--success)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'}`}>
                  {s.enabled ? '启用' : '禁用'}
                </span>
              </div>
              {s.description && <p className="text-xs text-[var(--text-secondary)] mt-1">{s.description}</p>}
              {s.repo_owner && (
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {s.repo_owner}/{s.repo_name} ({s.repo_branch})
                </p>
              )}
            </div>
            <button
              onClick={() => handleToggle(s.id, s.enabled)}
              className="px-3 py-1 text-xs border border-[var(--border)] rounded hover:bg-[var(--bg-card)] transition-colors"
            >
              {s.enabled ? '禁用' : '启用'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
