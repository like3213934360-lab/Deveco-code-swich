import { Routes, Route, NavLink } from 'react-router-dom'
import Icon, { type IconName } from './icons/Icon'
import ProvidersPage from './pages/ProvidersPage'
import VersionsPage from './pages/VersionsPage'
import ConfigPage from './pages/ConfigPage'
import CostPage from './pages/CostPage'
import McpPage from './pages/McpPage'
import SkillsPage from './pages/SkillsPage'
import HealthPage from './pages/HealthPage'
import ProxyPage from './pages/ProxyPage'

const navItems: { path: string; label: string; icon: IconName }[] = [
  { path: '/', label: 'Provider', icon: 'bolt' },
  { path: '/versions', label: '版本', icon: 'package' },
  { path: '/config', label: '配置', icon: 'settings' },
  { path: '/cost', label: '费用', icon: 'payments' },
  { path: '/proxy', label: '代理', icon: 'proxy' },
  { path: '/mcp', label: 'MCP', icon: 'mcp' },
  { path: '/skills', label: 'Skill', icon: 'skill' },
  { path: '/health', label: '健康', icon: 'health' },
]

export default function App() {
  return (
    <div className="flex h-screen w-screen">
      <aside className="w-56 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <h1 className="text-lg font-bold text-[var(--accent)]">DevEco Switch</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Provider Manager</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
          v0.1.0
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route path="/" element={<ProvidersPage />} />
          <Route path="/versions" element={<VersionsPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/cost" element={<CostPage />} />
          <Route path="/proxy" element={<ProxyPage />} />
          <Route path="/mcp" element={<McpPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/health" element={<HealthPage />} />
        </Routes>
      </main>
    </div>
  )
}
