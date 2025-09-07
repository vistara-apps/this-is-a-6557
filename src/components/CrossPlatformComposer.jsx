import React, { useState } from 'react';
import { Image, Calendar, Send, Sparkles, X } from 'lucide-react';

const CrossPlatformComposer = ({ connectedAccounts, onCreatePost }) => {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  const platformCustomizations = {
    Twitter: { maxLength: 280, color: '#1DA1F2' },
    Facebook: { maxLength: 8000, color: '#4267B2' },
    LinkedIn: { maxLength: 3000, color: '#0077B5' },
    Instagram: { maxLength: 2200, color: '#E4405F' }
  };

  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleAiSuggestions = () => {
    const suggestions = [
      "🚀 Boost engagement by adding relevant emojis and hashtags",
      "📊 Best posting time: 2:00 PM for maximum reach",
      "💡 Consider adding a question to encourage comments",
      "🎯 Tag relevant accounts to increase visibility",
      "📈 Add trending hashtags: #SocialMedia #AI #Growth"
    ];
    setAiSuggestions(suggestions);
    setShowAiSuggestions(true);
  };

  const handleSubmit = () => {
    if (!content.trim() || selectedPlatforms.length === 0) return;

    const scheduledAt = scheduledDate && scheduledTime 
      ? `${scheduledDate}T${scheduledTime}:00Z`
      : null;

    onCreatePost({
      content,
      platforms: selectedPlatforms,
      scheduledAt,
      createdAt: new Date().toISOString()
    });

    // Reset form
    setContent('');
    setSelectedPlatforms([]);
    setScheduledDate('');
    setScheduledTime('');
    setShowAiSuggestions(false);
    setAiSuggestions([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Create Post</h1>
        <button
          onClick={handleAiSuggestions}
          className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI Suggestions
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Composer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-gradient rounded-xl p-6">
            <div className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Share it with the world..."
                className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <Image className="w-4 h-4 mr-2" />
                    Media
                  </button>
                  <span className="text-sm text-white/60">
                    {content.length} characters
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Selection */}
          <div className="card-gradient rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Select Platforms</h3>
            <div className="grid grid-cols-2 gap-3">
              {connectedAccounts.map((account) => {
                const isSelected = selectedPlatforms.includes(account.platform);
                const config = platformCustomizations[account.platform];
                
                return (
                  <button
                    key={account.id}
                    onClick={() => handlePlatformToggle(account.platform)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-white/40 bg-white/20'
                        : 'border-white/20 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <div className="text-left">
                        <div className="text-white font-medium">{account.platform}</div>
                        <div className="text-white/60 text-sm">
                          Max: {config.maxLength} chars
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scheduling */}
          <div className="card-gradient rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Schedule Post</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || selectedPlatforms.length === 0}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              {scheduledDate ? 'Schedule Post' : 'Post Now'}
            </button>
            
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">
              Save Draft
            </button>
          </div>
        </div>

        {/* AI Suggestions Panel */}
        <div className="space-y-6">
          {showAiSuggestions && (
            <div className="card-gradient rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">AI Suggestions</h3>
                <button
                  onClick={() => setShowAiSuggestions(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-white/10 rounded-lg">
                    <p className="text-sm text-white/80">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optimal Posting Times */}
          <div className="card-gradient rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Optimal Times</h3>
            <div className="space-y-3">
              {selectedPlatforms.map((platform) => (
                <div key={platform} className="flex items-center justify-between">
                  <span className="text-white/80">{platform}</span>
                  <span className="text-sm text-purple-300">2:00 PM</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {content && selectedPlatforms.length > 0 && (
            <div className="card-gradient rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="space-y-3">
                {selectedPlatforms.map((platform) => {
                  const config = platformCustomizations[platform];
                  const truncatedContent = content.length > config.maxLength 
                    ? content.substring(0, config.maxLength) + '...'
                    : content;
                  
                  return (
                    <div key={platform} className="p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-sm text-white/80">{platform}</span>
                      </div>
                      <p className="text-sm text-white/70">{truncatedContent}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrossPlatformComposer;