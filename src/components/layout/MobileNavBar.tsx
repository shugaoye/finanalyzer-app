import { Icon } from '@openbb/ui'
import { useTranslation } from 'react-i18next'
import './MobileNavBar.css'

interface MobileNavBarProps {
  activeTab: 'menu' | 'apps' | 'search' | 'copilot'
  onTabChange: (tab: 'menu' | 'apps' | 'search' | 'copilot') => void
}

export function MobileNavBar({ activeTab, onTabChange }: MobileNavBarProps) {
  const { t } = useTranslation()
  const navItems = [
    { id: 'menu' as const, label: t('mobileNav.menu'), icon: 'menu' },
    { id: 'apps' as const, label: t('mobileNav.apps'), icon: 'grid' },
    { id: 'search' as const, label: t('mobileNav.search'), icon: 'search' },
    { id: 'copilot' as const, label: t('mobileNav.copilot'), icon: 'star' },
  ]

  return (
    <nav className="mobile-nav-bar">
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onTabChange(item.id)}
          className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
        >
          <Icon 
            name={item.icon as never} 
            className="mobile-nav-icon"
          />
          <span className="mobile-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
