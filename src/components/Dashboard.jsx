import React from 'react'
import { TrendingUp, Users, MessageCircle, Share2, Calendar, Clock } from 'lucide-react'
import MetricCard from './MetricCard'
import SocialAccountCard from './SocialAccountCard'
import RecentPostCard from './RecentPostCard'

const Dashboard = () => {
  const metrics = [
    { title: 'Total Followers', value: '24.7K', change: '+12%', icon: Users, color: 'text-blue-400' },
    { title: 'Engagement Rate', value: '8.4%', change: '+2.1%', icon: MessageCircle, color: 'text-green-400' },
    { title: 'Posts This Month', value: '42', change: '+8', icon: Share2, color: 'text-purple-400' },
    { title: 'Reach', value: '156K', change: '+18%', icon: TrendingUp, color: 'text-orange-400' },
  ]

  const connectedAccounts = [
    { platform: 'Twitter', username: '@johndoe', followers: '12.3K', status: 'connected' },
    { platform: 'LinkedIn', username: 'John Doe', followers: '8.9K', status: 'connected' },
    { platform: 'Instagram', username: '@john_creates', followers: '3.5K', status: 'connected' },
    { platform: 'Facebook', username: 'John Doe', followers: '2.1K', status: 'disconnected' },
  ]

  const recentPosts = [
    {
      content: 'Just launched our new product feature! 🚀',
      platforms: ['Twitter', 'LinkedIn'],
      engagement: { likes: 156, comments: 23, shares: 12 },
      timestamp: '2 hours ago'
    },
    {
      content: 'Behind the scenes of our design process...',
      platforms: ['Instagram', 'Twitter'],
      engagement: { likes: 89, comments: 15, shares: 8 },
      timestamp: '5 hours ago'
    },
    {
      content: 'Thoughts on the future of AI in business',
      platforms: ['LinkedIn'],
      engagement: { likes: 234, comments: 45, shares: 67 },
      timestamp: '1 day ago'
    }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, John!</h1>
          <p className="text-white/70">Here's what's happening with your social presence</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="flex items-center space-x-2 px-4 py-2 bg-accent rounded-lg text-white hover:bg-accent/90 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>Schedule Post</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Accounts */}
        <div className="lg:col-span-1">
          <div className="glass-effect rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Connected Accounts</h3>
            <div className="space-y-3">
              {connectedAccounts.map((account, index) => (
                <SocialAccountCard key={index} {...account} />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <div className="glass-effect rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Recent Posts</h3>
              <button className="text-accent hover:text-accent/80 transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <RecentPostCard key={index} {...post} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="glass-effect rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-accent" />
          AI-Powered Suggestions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <h4 className="font-medium text-white mb-2">Optimal Posting Time</h4>
            <p className="text-white/70 text-sm">Post on Twitter in 2 hours for maximum engagement</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <h4 className="font-medium text-white mb-2">Content Suggestion</h4>
            <p className="text-white/70 text-sm">Share industry insights to boost LinkedIn engagement</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <h4 className="font-medium text-white mb-2">Trending Hashtag</h4>
            <p className="text-white/70 text-sm">#TechTrends is trending - perfect for your next post</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard