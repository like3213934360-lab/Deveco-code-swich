import { Routes, Route, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Icon, { type IconName } from './icons/Icon'
import UpdateChecker from './components/UpdateChecker'
import { useThemeStore } from './stores/themeStore'
import ProvidersPage from './pages/ProvidersPage'
import VersionsPage from './pages/VersionsPage'
import ConfigPage from './pages/ConfigPage'
import CostPage from './pages/CostPage'
import McpPage from './pages/McpPage'
import SkillsPage from './pages/SkillsPage'
import HealthPage from './pages/HealthPage'
import ProxyPage from './pages/ProxyPage'

const navItems: { path: string; labelKey: string; icon: IconName }[] = [
  { path: '/', labelKey: 'nav.provider', icon: 'bolt' },
  { path: '/versions', labelKey: 'nav.version', icon: 'package' },
  { path: '/config', labelKey: 'nav.config', icon: 'settings' },
  { path: '/cost', labelKey: 'nav.cost', icon: 'payments' },
  { path: '/proxy', labelKey: 'nav.proxy', icon: 'proxy' },
  { path: '/mcp', labelKey: 'nav.mcp', icon: 'mcp' },
  { path: '/skills', labelKey: 'nav.skill', icon: 'skill' },
  { path: '/health', labelKey: 'nav.health', icon: 'health' },
]

export default function App() {
  const { t } = useTranslation()

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
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">v0.1.0</span>
          <div className="flex items-center gap-1">
            <LangToggle />
            <ThemeToggle />
          </div>
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

      <UpdateChecker />
    </div>
  )
}

function LangToggle() {
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'

  const toggle = () => {
    const next = isZh ? 'en' : 'zh'
    i18n.changeLanguage(next)
    localStorage.setItem('deveco-switch-lang', next)
  }

  return (
    <button
      onClick={toggle}
      className="px-1.5 py-0.5 rounded text-xs font-mono hover:bg-[var(--bg-card)] transition-colors text-[var(--text-secondary)]"
      title={isZh ? 'Switch to English' : '切换到中文'}
    >
      {isZh ? 'EN' : '中'}
    </button>
  )
}

function ThemeToggle() {
  const { theme, toggle } = useThemeStore()
  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded hover:bg-[var(--bg-card)] transition-colors"
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"/>
        </svg>
      )}
    </button>
  )
}
