import React, { useState } from 'react';
import { TrendingUp, Heart, Share2, MessageCircle, Eye, Calendar } from 'lucide-react';

const PerformanceDashboard = ({ posts }) => {
  const [timeRange, setTimeRange] = useState('7days');
  
  // Calculate aggregated metrics
  const totalMetrics = posts.reduce((acc, post) => ({
    likes: acc.likes + post.metrics.likes,
    shares: acc.shares + post.metrics.shares,
    comments: acc.comments + post.metrics.comments,
    reach: acc.reach + post.metrics.reach
  }), { likes: 0, shares: 0, comments: 0, reach: 0 });

  const engagementRate = totalMetrics.reach > 0 
    ? ((totalMetrics.likes + totalMetrics.shares + totalMetrics.comments) / totalMetrics.reach * 100).toFixed(1)
    : 0;

  // Mock chart data
  const chartData = [
    { day: 'Mon', likes: 45, shares: 12, comments: 8 },
    { day: 'Tue', likes: 62, shares: 18, comments: 15 },
    { day: 'Wed', likes: 38, shares: 9, comments: 6 },
    { day: 'Thu', likes: 78, shares: 25, comments: 22 },
    { day: 'Fri', likes: 95, shares: 32, comments: 28 },
    { day: 'Sat', likes: 52, shares: 16, comments: 12 },
    { day: 'Sun', likes: 41, shares: 11, comments: 9 }
  ];

  const maxValue = Math.max(...chartData.flatMap(d => [d.likes, d.shares, d.comments]));

  const MetricCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="card-gradient rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-500/20`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value.toLocaleString()}</h3>
      <p className="text-white/60 text-sm">{title}</p>
    </div>
  );

  const PostCard = ({ post }) => (
    <div className="card-gradient rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-white/80 mb-3">{post.content}</p>
          <div className="flex items-center space-x-4">
            {post.platforms.map((platform, index) => (
              <span key={index} className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">
                {platform}
              </span>
            ))}
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          post.status === 'published' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {post.status}
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-lg font-semibold text-white">{post.metrics.likes}</div>
          <div className="text-xs text-white/60">Likes</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-white">{post.metrics.shares}</div>
          <div className="text-xs text-white/60">Shares</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-white">{post.metrics.comments}</div>
          <div className="text-xs text-white/60">Comments</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-white">{post.metrics.reach}</div>
          <div className="text-xs text-white/60">Reach</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Performance Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
        </select>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Likes"
          value={totalMetrics.likes}
          change={12.5}
          icon={Heart}
          color="red"
        />
        <MetricCard
          title="Total Shares"
          value={totalMetrics.shares}
          change={8.3}
          icon={Share2}
          color="blue"
        />
        <MetricCard
          title="Total Comments"
          value={totalMetrics.comments}
          change={-2.1}
          icon={MessageCircle}
          color="green"
        />
        <MetricCard
          title="Total Reach"
          value={totalMetrics.reach}
          change={15.7}
          icon={Eye}
          color="purple"
        />
      </div>

      {/* Engagement Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-gradient rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Engagement Trends</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-white/70">Likes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-white/70">Shares</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white/70">Comments</span>
              </div>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between space-x-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                <div className="w-full flex flex-col items-center space-y-1">
                  <div 
                    className="w-3 bg-red-400 rounded-t"
                    style={{ height: `${(data.likes / maxValue) * 150}px` }}
                  />
                  <div 
                    className="w-3 bg-blue-400"
                    style={{ height: `${(data.shares / maxValue) * 150}px` }}
                  />
                  <div 
                    className="w-3 bg-green-400 rounded-b"
                    style={{ height: `${(data.comments / maxValue) * 150}px` }}
                  />
                </div>
                <span className="text-xs text-white/60">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        <div className="space-y-6">
          <div className="card-gradient rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Engagement Rate</div>
                  <div className="text-white/60 text-sm">{engagementRate}%</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Best Day</div>
                  <div className="text-white/60 text-sm">Friday</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Eye className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Top Platform</div>
                  <div className="text-white/60 text-sm">Twitter</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-gradient rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/70">Posts Published</span>
                <span className="text-white font-medium">{posts.filter(p => p.status === 'published').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Posts Scheduled</span>
                <span className="text-white font-medium">{posts.filter(p => p.status === 'scheduled').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Avg. Engagement</span>
                <span className="text-white font-medium">{engagementRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Posts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;