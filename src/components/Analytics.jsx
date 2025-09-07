import React, { useState } from 'react'
import { TrendingUp, Users, MessageCircle, Share2, Calendar, Download } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedPlatform, setSelectedPlatform] = useState('all')

  // Sample data for charts
  const engagementData = [
    { name: 'Mon', Twitter: 120, LinkedIn: 80, Instagram: 95, Facebook: 45 },
    { name: 'Tue', Twitter: 150, LinkedIn: 95, Instagram: 110, Facebook: 60 },
    { name: 'Wed', Twitter: 180, LinkedIn: 120, Instagram: 85, Facebook: 55 },
    { name: 'Thu', Twitter: 165, LinkedIn: 140, Instagram: 125, Facebook: 70 },
    { name: 'Fri', Twitter: 200, LinkedIn: 160, Instagram: 140, Facebook: 80 },
    { name: 'Sat', Twitter: 140, LinkedIn: 90, Instagram: 160, Facebook: 65 },
    { name: 'Sun', Twitter: 110, LinkedIn: 70, Instagram: 130, Facebook: 50 },
  ]

  const followerGrowthData = [
    { name: 'Week 1', followers: 2400 },
    { name: 'Week 2', followers: 2600 },
    { name: 'Week 3', followers: 2800 },
    { name: 'Week 4', followers: 3200 },
  ]

  const platformDistribution = [
    { name: 'Twitter', value: 45, color: '#1DA1F2' },
    { name: 'LinkedIn', value: 25, color: '#0077B5' },
    { name: 'Instagram', value: 20, color: '#E4405F' },
    { name: 'Facebook', value: 10, color: '#1877F2' },
  ]

  const topPosts = [
    {
      content: 'Just launched our new product feature! 🚀',
      platform: 'Twitter',
      engagement: 1856,
      reach: 12400,
      timestamp: '2 days ago'
    },
    {
      content: 'Behind the scenes of our design process...',
      platform: 'Instagram',
      engagement: 1234,
      reach: 8900,
      timestamp: '3 days ago'
    },
    {
      content: 'Thoughts on the future of AI in business',
      platform: 'LinkedIn',
      engagement: 2341,
      reach: 15600,
      timestamp: '5 days ago'
    }
  ]

  const metrics = [
    { title: 'Total Engagement', value: '12.4K', change: '+18%', icon: MessageCircle, color: 'text-blue-400' },
    { title: 'Reach', value: '156K', change: '+25%', icon: TrendingUp, color: 'text-green-400' },
    { title: 'New Followers', value: '+234', change: '+12%', icon: Users, color: 'text-purple-400' },
    { title: 'Shares', value: '1.2K', change: '+8%', icon: Share2, color: 'text-orange-400' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-white/70">Track your social media performance across all platforms</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-accent rounded-lg text-white hover:bg-accent/90 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const isPositive = metric.change.startsWith('+')
          
          return (
            <div key={index} className="glass-effect rounded-xl p-6 border border-white/20 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                  <p className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {metric.change} from last period
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-white/10 ${metric.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Over Time */}
        <div className="glass-effect rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Engagement Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Line type="monotone" dataKey="Twitter" stroke="#1DA1F2" strokeWidth={2} />
              <Line type="monotone" dataKey="LinkedIn" stroke="#0077B5" strokeWidth={2} />
              <Line type="monotone" dataKey="Instagram" stroke="#E4405F" strokeWidth={2} />
              <Line type="monotone" dataKey="Facebook" stroke="#1877F2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Follower Growth */}
        <div className="glass-effect rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Follower Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={followerGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="followers" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Distribution and Top Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Distribution */}
        <div className="glass-effect rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Platform Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={platformDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {platformDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {platformDistribution.map((platform, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: platform.color }}
                  ></div>
                  <span className="text-white/80 text-sm">{platform.name}</span>
                </div>
                <span className="text-white font-medium">{platform.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Posts */}
        <div className="lg:col-span-2 glass-effect rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Top Performing Posts</h3>
          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <div key={index} className="p-4 bg-white/10 rounded-lg border border-white/20">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white text-sm flex-1">{post.content}</p>
                  <span className="text-white/60 text-xs ml-3">{post.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-accent text-sm font-medium">{post.platform}</span>
                  <div className="flex items-center space-x-4 text-white/70 text-xs">
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{post.engagement.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{post.reach.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics