import React from 'react'
import { Heart, MessageCircle, Share2, Twitter, Linkedin, Instagram } from 'lucide-react'

const platformIcons = {
  Twitter: Twitter,
  LinkedIn: Linkedin,
  Instagram: Instagram,
}

const RecentPostCard = ({ content, platforms, engagement, timestamp }) => {
  return (
    <div className="bg-white/10 rounded-lg p-4 border border-white/20">
      <div className="flex items-start justify-between mb-3">
        <p className="text-white text-sm flex-1">{content}</p>
        <span className="text-white/60 text-xs ml-3">{timestamp}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {platforms.map((platform, index) => {
            const Icon = platformIcons[platform]
            return (
              <div key={index} className="p-1 bg-white/10 rounded">
                <Icon className="w-3 h-3 text-white" />
              </div>
            )
          })}
        </div>
        
        <div className="flex items-center space-x-4 text-white/70 text-xs">
          <div className="flex items-center space-x-1">
            <Heart className="w-3 h-3" />
            <span>{engagement.likes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-3 h-3" />
            <span>{engagement.comments}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Share2 className="w-3 h-3" />
            <span>{engagement.shares}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecentPostCard