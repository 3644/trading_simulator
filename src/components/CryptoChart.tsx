import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CryptoChartProps {
  data: number[];
}

export const CryptoChart: React.FC<CryptoChartProps> = ({ data }) => {
  const chartData = data.map((price, index) => ({
    time: index,
    price: price,
  }));

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ background: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Prix']}
            labelFormatter={(label) => `Il y a ${(168 - label).toFixed(0)}h`}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#6366f1"
            fillOpacity={1}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};