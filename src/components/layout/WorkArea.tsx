import { useState } from 'react'
import { Icon } from '@openbb/ui'
import './WorkArea.css'

interface AppItem {
  id: string
  name: string
  description: string
  category: string
  icon: string
}

const sampleApps: AppItem[] = [
  {
    id: '1',
    name: 'Earnings Calendar',
    description: 'Track upcoming earnings announcements and historical results',
    category: 'Calendar',
    icon: 'calendar',
  },
  {
    id: '2',
    name: 'Portfolio Tracker',
    description: 'Monitor your portfolio performance and holdings',
    category: 'Portfolio',
    icon: 'pie-chart',
  },
  {
    id: '3',
    name: 'Stock Screener',
    description: 'Filter and screen stocks based on various criteria',
    category: 'Screener',
    icon: 'filter',
  },
  {
    id: '4',
    name: 'Market Overview',
    description: 'View market indices, sectors, and market sentiment',
    category: 'Market',
    icon: 'activity',
  },
  {
    id: '5',
    name: 'News Feed',
    description: 'Stay updated with latest financial news and analysis',
    category: 'News',
    icon: 'newspaper',
  },
  {
    id: '6',
    name: 'Technical Analysis',
    description: 'Analyze stocks with technical indicators and charts',
    category: 'Analysis',
    icon: 'bar-chart',
  },
]

export function WorkArea() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', ...new Set(sampleApps.map((app) => app.category))]

  const filteredApps = sampleApps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="work-area">
      {/* Header */}
      <div className="work-area-header">
        <div>
          <h1 className="work-area-title">Apps</h1>
          <p className="work-area-subtitle">
            Discover and use financial tools and applications
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="work-area-filters">
        <div className="search-input-wrapper">
          <Icon name={'search' as never} className="search-icon" />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Apps Grid */}
      <div className="apps-grid">
        {filteredApps.map((app) => (
          <button
            key={app.id}
            type="button"
            className="app-card"
          >
            <div className="app-card-icon">
              <Icon name={app.icon as never} />
            </div>
            <div className="app-card-content">
              <h3 className="app-card-title">{app.name}</h3>
              <p className="app-card-description">{app.description}</p>
              <span className="app-card-category">{app.category}</span>
            </div>
          </button>
        ))}
      </div>

      {filteredApps.length === 0 && (
        <div className="no-results">
          <Icon name={'search' as never} className="no-results-icon" />
          <p>No apps found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
