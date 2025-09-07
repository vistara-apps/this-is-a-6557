import React from 'react'

const MetricCard = ({ title, value, change, icon: Icon, color }) => {
  const isPositive = change.startsWith('+')
  
  return (
    <div className="glass-effect rounded-xl p-6 border border-white/20 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {change} from last month
          </p>
        </div>
        <div className={`p-3 rounded-lg bg-white/10 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

export default MetricCard