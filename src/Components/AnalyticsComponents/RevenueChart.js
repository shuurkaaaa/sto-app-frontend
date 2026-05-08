import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../Context/AnalyticsContext';

export const RevenueChart = () => {
  const { chartData, loading } = useAnalytics();

  if (loading) return <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Завантаження графіка...</div>;

  if (!chartData || chartData.length === 0) {
    return (
      <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
        Немає даних за вибраний період
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
          <XAxis 
            dataKey="name" 
            tick={{fill: '#94a3b8', fontSize: 12}} 
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{fill: '#94a3b8', fontSize: 12}} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F1F5F9' }}
            itemStyle={{ color: '#3B82F6' }}
            labelStyle={{ marginBottom: '5px', fontWeight: 'bold' }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#3B82F6" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#0F172A' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};