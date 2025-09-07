import React, { useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import CrossPlatformComposer from './components/CrossPlatformComposer';
import UnifiedInbox from './components/UnifiedInbox';
import PerformanceDashboard from './components/PerformanceDashboard';
import AccountManager from './components/AccountManager';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: 1, platform: 'Twitter', username: '@yourhandle', connected: true, color: '#1DA1F2' },
    { id: 2, platform: 'Facebook', username: 'Your Page', connected: true, color: '#4267B2' },
    { id: 3, platform: 'LinkedIn', username: 'Your Profile', connected: false, color: '#0077B5' },
    { id: 4, platform: 'Instagram', username: '@yourinstagram', connected: true, color: '#E4405F' }
  ]);

  const [posts, setPosts] = useState([
    {
      id: 1,
      content: "Just published a new blog post about social media trends!",
      platforms: ['Twitter', 'LinkedIn'],
      scheduledAt: '2024-01-15T10:00:00Z',
      status: 'published',
      metrics: { likes: 45, shares: 12, comments: 8, reach: 1250 }
    },
    {
      id: 2,
      content: "Check out our latest product update! 🚀",
      platforms: ['Twitter', 'Facebook', 'Instagram'],
      scheduledAt: '2024-01-16T14:30:00Z',
      status: 'scheduled',
      metrics: { likes: 0, shares: 0, comments: 0, reach: 0 }
    }
  ]);

  const [engagements, setEngagements] = useState([
    {
      id: 1,
      type: 'comment',
      platform: 'Twitter',
      author: '@johndoe',
      content: 'Great insights! Thanks for sharing.',
      timestamp: '2024-01-15T11:30:00Z',
      isRead: false,
      postId: 1
    },
    {
      id: 2,
      type: 'mention',
      platform: 'LinkedIn',
      author: 'Jane Smith',
      content: 'Loved your recent post about social media strategies!',
      timestamp: '2024-01-15T09:15:00Z',
      isRead: false,
      postId: 1
    },
    {
      id: 3,
      type: 'message',
      platform: 'Facebook',
      author: 'Marketing Team',
      content: 'Can we schedule a meeting to discuss the campaign?',
      timestamp: '2024-01-14T16:45:00Z',
      isRead: true,
      postId: null
    }
  ]);

  const handleCreatePost = (newPost) => {
    const post = {
      id: posts.length + 1,
      ...newPost,
      status: newPost.scheduledAt ? 'scheduled' : 'published',
      metrics: { likes: 0, shares: 0, comments: 0, reach: 0 }
    };
    setPosts([...posts, post]);
  };

  const handleConnectAccount = (accountId) => {
    setConnectedAccounts(accounts =>
      accounts.map(account =>
        account.id === accountId
          ? { ...account, connected: !account.connected }
          : account
      )
    );
  };

  const handleMarkAsRead = (engagementId) => {
    setEngagements(prevEngagements =>
      prevEngagements.map(eng =>
        eng.id === engagementId ? { ...eng, isRead: true } : eng
      )
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'composer':
        return (
          <CrossPlatformComposer
            connectedAccounts={connectedAccounts.filter(acc => acc.connected)}
            onCreatePost={handleCreatePost}
          />
        );
      case 'inbox':
        return (
          <UnifiedInbox
            engagements={engagements}
            onMarkAsRead={handleMarkAsRead}
          />
        );
      case 'analytics':
        return <PerformanceDashboard posts={posts} />;
      case 'accounts':
        return (
          <AccountManager
            accounts={connectedAccounts}
            onConnectAccount={handleConnectAccount}
          />
        );
      default:
        return <PerformanceDashboard posts={posts} />;
    }
  };

  return (
    <DashboardLayout
      activeView={activeView}
      setActiveView={setActiveView}
      connectedAccounts={connectedAccounts}
      unreadCount={engagements.filter(e => !e.isRead).length}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

export default App;