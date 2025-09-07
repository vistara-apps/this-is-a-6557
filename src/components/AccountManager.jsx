import React from 'react';
import { Plus, Check, X, Settings } from 'lucide-react';

const AccountManager = ({ accounts, onConnectAccount }) => {
  const platformInfo = {
    Twitter: {
      description: 'Connect your Twitter account to share tweets and engage with your audience.',
      permissions: ['Post tweets', 'Read mentions', 'Access analytics'],
      color: '#1DA1F2'
    },
    Facebook: {
      description: 'Manage your Facebook pages and groups with seamless posting and monitoring.',
      permissions: ['Post to pages', 'Read comments', 'Access insights'],
      color: '#4267B2'
    },
    LinkedIn: {
      description: 'Share professional content and connect with your business network.',
      permissions: ['Post updates', 'Read messages', 'Access company pages'],
      color: '#0077B5'
    },
    Instagram: {
      description: 'Share photos and stories to grow your Instagram presence.',
      permissions: ['Post photos', 'Read comments', 'Access stories'],
      color: '#E4405F'
    }
  };

  const AccountCard = ({ account }) => {
    const info = platformInfo[account.platform];
    
    return (
      <div className="card-gradient rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: info.color + '20' }}
            >
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: info.color }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{account.platform}</h3>
              <p className="text-white/60 text-sm">{account.username}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {account.connected ? (
              <div className="flex items-center space-x-2">
                <span className="text-green-400 text-sm font-medium">Connected</span>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            ) : (
              <span className="text-white/60 text-sm">Not connected</span>
            )}
          </div>
        </div>
        
        <p className="text-white/70 text-sm mb-4">{info.description}</p>
        
        <div className="mb-4">
          <h4 className="text-white font-medium text-sm mb-2">Permissions:</h4>
          <div className="space-y-1">
            {info.permissions.map((permission, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-white/60">
                <Check className="w-3 h-3 text-green-400" />
                <span>{permission}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onConnectAccount(account.id)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              account.connected
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
            }`}
          >
            {account.connected ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Disconnect
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Connect
              </>
            )}
          </button>
          
          {account.connected && (
            <button className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          )}
        </div>
      </div>
    );
  };

  const connectedCount = accounts.filter(acc => acc.connected).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Account Manager</h1>
          <p className="text-white/70 mt-2">
            Connect and manage your social media accounts
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{connectedCount}/{accounts.length}</div>
          <div className="text-white/60 text-sm">Connected</div>
        </div>
      </div>

      {/* Connection Status Overview */}
      <div className="card-gradient rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Connection Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((account) => {
            const info = platformInfo[account.platform];
            return (
              <div key={account.id} className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">{account.platform}</div>
                  <div className={`text-xs ${account.connected ? 'text-green-400' : 'text-white/60'}`}>
                    {account.connected ? 'Connected' : 'Not connected'}
                  </div>
                </div>
                {account.connected && (
                  <Check className="w-4 h-4 text-green-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>

      {/* Integration Instructions */}
      <div className="card-gradient rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Integration Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-medium mb-3">Getting Started</h3>
            <div className="space-y-2 text-sm text-white/70">
              <p>1. Click "Connect" on any platform above</p>
              <p>2. Authorize SocialSync AI in the popup window</p>
              <p>3. Grant necessary permissions for posting and analytics</p>
              <p>4. Start creating and scheduling content!</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-3">Security & Privacy</h3>
            <div className="space-y-2 text-sm text-white/70">
              <p>• Your data is encrypted and securely stored</p>
              <p>• We only request necessary permissions</p>
              <p>• You can disconnect accounts anytime</p>
              <p>• No passwords are stored on our servers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManager;