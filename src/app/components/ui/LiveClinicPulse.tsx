import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Clock, CalendarCheck, Activity } from 'lucide-react';
import { motion } from 'motion/react';

// Hourly data from 8 AM to 8 PM
const BASE_DATA = [
  { time: '8a', value: 20 },
  { time: '9a', value: 45 },
  { time: '10a', value: 85 },
  { time: '11a', value: 92 },
  { time: '12p', value: 65 },
  { time: '1p', value: 40 },
  { time: '2p', value: 35 },
  { time: '3p', value: 55 },
  { time: '4p', value: 75 },
  { time: '5p', value: 88 },
  { time: '6p', value: 95 },
  { time: '7p', value: 60 },
  { time: '8p', value: 30 },
];

export const LiveClinicPulse = () => {
  const [data, setData] = useState(BASE_DATA);
  const [currentIdx] = useState(4); // Let's mock it as 12p right now.
  const currentValue = data[currentIdx].value;

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev];
        // fluctuate the current hour's value slightly
        let change = Math.floor(Math.random() * 5) - 2;
        let newValue = newData[currentIdx].value + change;
        if (newValue > 100) newValue = 100;
        if (newValue < 10) newValue = 10;
        newData[currentIdx] = { ...newData[currentIdx], value: newValue };
        return newData;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [currentIdx]);

  // Determine status
  let statusText = 'Quiet';
  let statusColor = 'text-[#1D9E75]';
  let statusBg = 'bg-[#1D9E75]/10';
  let chartColor = '#1D9E75';

  if (currentValue > 80) {
    statusText = 'Busy';
    statusColor = 'text-[#D85A30]';
    statusBg = 'bg-[#D85A30]/10';
    chartColor = '#D85A30';
  } else if (currentValue >= 50) {
    statusText = 'Moderate';
    statusColor = 'text-[#BA7517]';
    statusBg = 'bg-[#BA7517]/10';
    chartColor = '#BA7517';
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm font-sans mb-4 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400" />
          <h2 className="font-bold text-gray-900 text-sm tracking-wide">Live Clinic Pulse</h2>
        </div>
        
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusBg}`}>
          <div className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current ${statusColor}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 bg-current ${statusColor}`}></span>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${statusColor} transition-colors duration-500`}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Main Metric */}
      <div className="mb-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Today's Footfall</p>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-black text-gray-900 leading-none">124</span>
          <span className="text-xs font-bold text-gray-400 mb-1">patients</span>
        </div>
      </div>

      {/* Area Chart */}
      <div className="h-24 w-full -ml-2 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} className="transition-all duration-500"/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} className="transition-all duration-500"/>
              </linearGradient>
            </defs>
            <Tooltip 
              cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 2 }}
              contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ color: '#9CA3AF', marginBottom: '2px' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={chartColor} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              isAnimationActive={false}
              className="transition-all duration-500"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Metrics */}
      <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
        <div>
          <div className="flex items-center gap-1 text-gray-400 mb-1">
            <Users className="w-3 h-3" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Queue</span>
          </div>
          <p className="font-bold text-gray-900 text-sm">12</p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-gray-400 mb-1">
            <Clock className="w-3 h-3" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Wait</span>
          </div>
          <p className="font-bold text-gray-900 text-sm">23 min</p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-gray-400 mb-1">
            <CalendarCheck className="w-3 h-3" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Slot</span>
          </div>
          <p className="font-bold text-gray-900 text-sm">11:30 AM</p>
        </div>
      </div>
    </motion.div>
  );
};
