import React, { useState } from 'react'
import { Search, Filter, Reply, Heart, MessageCircle, Twitter, Linkedin, Instagram } from 'lucide-react'

const platformIcons = {
  Twitter: Twitter,
  LinkedIn: Linkedin,
  Instagram: Instagram,
}

const UnifiedInbox = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  
  const messages = [
    {
      id: 1,
      platform: 'Twitter',
      type: 'mention',
      author: '@sarah_dev',
      authorName: 'Sarah Johnson',
      content: 'Love your latest post about AI! Really insightful perspective 🚀',
      timestamp: '2 minutes ago',
      isRead: false,
      postContext: 'The Future of AI in Business'
    },
    {
      id: 2,
      platform: 'LinkedIn',
      type: 'comment',
      author: 'Mike Chen',
      authorName: 'Mike Chen',
      content: 'Great insights! Would love to hear your thoughts on implementation challenges.',
      timestamp: '15 minutes ago',
      isRead: false,
      postContext: 'Digital Transformation Tips'
    },
    {
      id: 3,
      platform: 'Instagram',
      type: 'dm',
      author: '@creative_studio',
      authorName: 'Creative Studio',
      content: 'Hi! We loved your design content. Would you be interested in collaborating?',
      timestamp: '1 hour ago',
      isRead: true,
      postContext: null
    },
    {
      id: 4,
      platform: 'Twitter',
      type: 'reply',
      author: '@tech_guru',
      authorName: 'Tech Guru',
      content: 'This is exactly what I needed to read today. Thank you for sharing!',
      timestamp: '2 hours ago',
      isRead: true,
      postContext: 'Productivity Hacks for Developers'
    },
    {
      id: 5,
      platform: 'LinkedIn',
      type: 'like',
      author: 'Jennifer Wilson',
      authorName: 'Jennifer Wilson',
      content: 'and 23 others liked your post',
      timestamp: '3 hours ago',
      isRead: true,
      postContext: 'Team Leadership Best Practices'
    }
  ]

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'unread' && !message.isRead) ||
                         (selectedFilter === 'mentions' && message.type === 'mention') ||
                         (selectedFilter === 'comments' && message.type === 'comment') ||
                         (selectedFilter === 'dms' && message.type === 'dm')
    return matchesSearch && matchesFilter
  })

  const getTypeIcon = (type) => {
    switch (type) {
      case 'mention':
        return MessageCircle
      case 'comment':
        return MessageCircle
      case 'dm':
        return MessageCircle
      case 'reply':
        return Reply
      case 'like':
        return Heart
      default:
        return MessageCircle
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'mention':
        return 'text-blue-400'
      case 'comment':
        return 'text-green-400'
      case 'dm':
        return 'text-purple-400'
      case 'reply':
        return 'text-yellow-400'
      case 'like':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Unified Inbox</h1>
        <p className="text-white/70">Manage all your social media interactions in one place</p>
      </div>

      {/* Filters and Search */}
      <div className="glass-effect rounded-xl p-6 border border-white/20">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Filter Dropdown */}
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="mentions">Mentions</option>
            <option value="comments">Comments</option>
            <option value="dms">Direct Messages</option>
          </select>
        </div>
      </div>

      {/* Message List */}
      <div className="glass-effect rounded-xl border border-white/20 overflow-hidden">
        <div className="divide-y divide-white/10">
          {filteredMessages.map((message) => {
            const PlatformIcon = platformIcons[message.platform]
            const TypeIcon = getTypeIcon(message.type)
            const typeColor = getTypeColor(message.type)
            
            return (
              <div
                key={message.id}
                className={`p-6 hover:bg-white/5 transition-colors cursor-pointer ${
                  !message.isRead ? 'bg-white/5' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Platform and Type Icons */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <PlatformIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className={`p-1 rounded ${typeColor}`}>
                      <TypeIcon className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{message.authorName}</span>
                        <span className="text-white/60 text-sm">{message.author}</span>
                        {!message.isRead && (
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                        )}
                      </div>
                      <span className="text-white/60 text-sm">{message.timestamp}</span>
                    </div>

                    {message.postContext && (
                      <p className="text-white/60 text-sm mb-2">
                        Re: "{message.postContext}"
                      </p>
                    )}

                    <p className="text-white/80 mb-3">{message.content}</p>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      <button className="flex items-center space-x-1 px-3 py-1 bg-white/10 rounded text-white/70 hover:text-white hover:bg-white/20 transition-colors text-sm">
                        <Reply className="w-3 h-3" />
                        <span>Reply</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-1 bg-white/10 rounded text-white/70 hover:text-white hover:bg-white/20 transition-colors text-sm">
                        <Heart className="w-3 h-3" />
                        <span>Like</span>
                      </button>
                      <span className="text-white/60 text-xs capitalize">{message.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredMessages.length === 0 && (
          <div className="p-12 text-center">
            <MessageCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No messages match your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UnifiedInbox