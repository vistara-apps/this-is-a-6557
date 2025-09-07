import React from 'react'
import { 
  LayoutDashboard, 
  PenTool, 
  Inbox, 
  BarChart3, 
  Settings, 
  User,
  Zap
} from 'lucide-react'

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'composer', label: 'Composer', icon: PenTool },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed left-0 top-0 h-full w-64 glass-effect border-r border-white/20 z-50">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">SocialSync AI</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/10 border border-white/20">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">John Doe</p>
              <p className="text-white/60 text-xs">Pro Plan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar