import React, { useState } from 'react';
import { MessageCircle, AtSign, Mail, Filter, Search, Check } from 'lucide-react';

const UnifiedInbox = ({ engagements, onMarkAsRead }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getIcon = (type) => {
    switch (type) {
      case 'comment': return MessageCircle;
      case 'mention': return AtSign;
      case 'message': return Mail;
      default: return MessageCircle;
    }
  };

  const getPlatformColor = (platform) => {
    const colors = {
      Twitter: '#1DA1F2',
      Facebook: '#4267B2',
      LinkedIn: '#0077B5',
      Instagram: '#E4405F'
    };
    return colors[platform] || '#6B7280';
  };

  const filteredEngagements = engagements.filter(engagement => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !engagement.isRead) ||
                         (filter === engagement.type);
    
    const matchesSearch = searchTerm === '' || 
                         engagement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engagement.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Unified Inbox</h1>
        <div className="text-white/60">
          {filteredEngagements.filter(e => !e.isRead).length} unread messages
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card-gradient rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-white/60" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="comment">Comments</option>
              <option value="mention">Mentions</option>
              <option value="message">Messages</option>
            </select>
          </div>
        </div>
      </div>

      {/* Engagement List */}
      <div className="space-y-4">
        {filteredEngagements.length === 0 ? (
          <div className="card-gradient rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white/60" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No messages found</h3>
            <p className="text-white/60">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          filteredEngagements.map((engagement) => {
            const Icon = getIcon(engagement.type);
            const platformColor = getPlatformColor(engagement.platform);
            
            return (
              <div
                key={engagement.id}
                className={`card-gradient rounded-xl p-6 transition-all hover:bg-white/15 ${
                  !engagement.isRead ? 'ring-1 ring-purple-400/50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: platformColor + '20' }}
                    >
                      <Icon 
                        className="w-5 h-5"
                        style={{ color: platformColor }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-medium">{engagement.author}</h3>
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                          {engagement.platform}
                        </span>
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full capitalize">
                          {engagement.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-white/60">
                          {formatTime(engagement.timestamp)}
                        </span>
                        {!engagement.isRead && (
                          <button
                            onClick={() => onMarkAsRead(engagement.id)}
                            className="p-1 text-white/60 hover:text-white transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-white/80 mb-3">{engagement.content}</p>
                    
                    <div className="flex items-center space-x-3">
                      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
                        Reply
                      </button>
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">
                        Like
                      </button>
                      {engagement.type === 'mention' && (
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">
                          Repost
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {!engagement.isRead && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UnifiedInbox;