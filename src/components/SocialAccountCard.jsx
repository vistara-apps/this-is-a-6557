import React from 'react'
import { Twitter, Linkedin, Instagram, Facebook, CheckCircle, AlertCircle } from 'lucide-react'

const platformIcons = {
  Twitter: Twitter,
  LinkedIn: Linkedin,
  Instagram: Instagram,
  Facebook: Facebook,
}

const SocialAccountCard = ({ platform, username, followers, status }) => {
  const Icon = platformIcons[platform]
  const isConnected = status === 'connected'
  
  return (
    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-white/10 rounded-lg">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">{platform}</p>
          <p className="text-white/60 text-xs">{username}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-white/70 text-xs">{followers}</span>
        {isConnected ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <AlertCircle className="w-4 h-4 text-orange-400" />
        )}
      </div>
    </div>
  )
}

export default SocialAccountCard