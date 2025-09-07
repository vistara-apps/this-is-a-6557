import React from 'react';
import {
  BarChart3,
  Edit3,
  Inbox,
  Settings,
  Users,
  Bell,
  Search,
  User
} from 'lucide-react';

const DashboardLayout = ({ 
  children, 
  activeView, 
  setActiveView, 
  connectedAccounts, 
  unreadCount 
}) => {
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'composer', name: 'Composer', icon: Edit3 },
    { id: 'inbox', name: 'Inbox', icon: Inbox, badge: unreadCount },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'accounts', name: 'Accounts', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 glass-effect">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <h1 className="text-xl font-bold text-white">SocialSync AI</h1>
              <p className="text-sm text-white/70 mt-1">Unify your social presence</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                    {item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Connected Accounts Summary */}
            <div className="p-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-white/70 mb-3">Connected Accounts</h3>
              <div className="space-y-2">
                {connectedAccounts.filter(acc => acc.connected).map((account) => (
                  <div key={account.id} className="flex items-center text-sm text-white/60">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: account.color }}
                    />
                    {account.platform}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="glass-effect border-b border-white/10">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1 flex items-center">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search posts, messages..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-white/70 hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <div className="text-white font-medium">John Doe</div>
                    <div className="text-white/60">Pro Plan</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;