import React, { useState } from 'react'
import { Image, Calendar, Send, Sparkles, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react'

const platforms = [
  { id: 'twitter', name: 'Twitter', icon: Twitter, limit: 280, color: 'bg-blue-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, limit: 3000, color: 'bg-blue-600' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, limit: 2200, color: 'bg-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, limit: 63206, color: 'bg-blue-700' },
]

const ContentComposer = () => {
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter'])
  const [scheduledTime, setScheduledTime] = useState('')
  const [aiSuggestions] = useState([
    "Add relevant hashtags to increase discoverability",
    "Consider posting at 3 PM for optimal engagement",
    "Include a call-to-action to boost interactions",
    "Add emojis to make your content more engaging"
  ])

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  const getCharacterCount = (platformId) => {
    const platform = platforms.find(p => p.id === platformId)
    return platform ? platform.limit - content.length : 0
  }

  const handlePost = () => {
    console.log('Posting to platforms:', selectedPlatforms)
    console.log('Content:', content)
    console.log('Scheduled time:', scheduledTime)
    // Reset form
    setContent('')
    setScheduledTime('')
    alert('Post scheduled successfully!')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Create Content</h1>
        <p className="text-white/70">Compose and schedule posts across all your social platforms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Composer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Input */}
          <div className="glass-effect rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Compose Your Post</h3>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-accent"
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors">
                  <Image className="w-4 h-4" />
                  <span className="text-sm">Add Media</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 bg-accent rounded-lg text-white hover:bg-accent/90 transition-colors">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">AI Enhance</span>
                </button>
              </div>
              <span className="text-white/60 text-sm">{content.length} characters</span>
            </div>
          </div>

          {/* Platform Selection */}
          <div className="glass-effect rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Select Platforms</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {platforms.map((platform) => {
                const Icon = platform.icon
                const isSelected = selectedPlatforms.includes(platform.id)
                const remainingChars = getCharacterCount(platform.id)
                
                return (
                  <div
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white/20 border-accent'
                        : 'bg-white/10 border-white/20 hover:bg-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${platform.color}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-medium">{platform.name}</span>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <p className={`text-xs ${remainingChars < 0 ? 'text-red-400' : 'text-white/60'}`}>
                        {remainingChars} characters remaining
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Scheduling */}
          <div className="glass-effect rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Schedule Post</h3>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={handlePost}
                className="flex items-center space-x-2 px-6 py-3 bg-accent rounded-lg text-white hover:bg-accent/90 transition-colors"
              >
                {scheduledTime ? <Calendar className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                <span>{scheduledTime ? 'Schedule' : 'Post Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Suggestions Sidebar */}
        <div className="space-y-6">
          <div className="glass-effect rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-accent" />
              AI Suggestions
            </h3>
            
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-white/10 rounded-lg border border-white/20">
                  <p className="text-white/80 text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Optimal Posting Times */}
          <div className="glass-effect rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Optimal Times</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">Twitter</span>
                <span className="text-accent text-sm font-medium">3:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">LinkedIn</span>
                <span className="text-accent text-sm font-medium">8:00 AM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">Instagram</span>
                <span className="text-accent text-sm font-medium">7:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentComposer