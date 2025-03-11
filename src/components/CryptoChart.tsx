import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, Line, ComposedChart } from 'recharts';
import { Maximize2, Minimize2, BarChart3, TrendingUp, ChartCandlestick, X } from 'lucide-react';

interface CryptoChartProps {
  data: number[];
  fullData?: {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

type ChartType = 'line' | 'candlestick' | 'volume';

export const CryptoChart: React.FC<CryptoChartProps> = ({ data, fullData }) => {
  const [expanded, setExpanded] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('line');

  const lineChartData = data.map((price, index) => ({
    time: index,
    price: price,
  }));

  // Simuler des données de bougies si fullData n'est pas fourni
  const candlestickData = fullData || data.map((price, index) => {
    const prevPrice = index > 0 ? data[index - 1] : price;
    const volatility = price * 0.02; // 2% de volatilité simulée
    return {
      timestamp: index,
      open: prevPrice,
      close: price,
      high: Math.max(price, prevPrice) + (Math.random() * volatility),
      low: Math.min(price, prevPrice) - (Math.random() * volatility),
      volume: price * (100 + Math.random() * 900) // Volume simulé
    };
  });

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Fonction pour créer un graphique en bougie à partir de ComposedChart
  const renderCandlestickContent = () => {
    return (
      <>
        <XAxis dataKey="timestamp" hide={!expanded} />
        <YAxis domain={['auto', 'auto']} hide={!expanded} />
        <Tooltip
          contentStyle={{ background: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Prix']}
          labelFormatter={(label) => `Il y a ${(168 - label).toFixed(0)}h`}
        />
        {/* Corps de la bougie - utilisation de rectangles */}
        <Bar
          dataKey={(entry) => entry.close > entry.open ? entry.close - entry.open : 0}
          fill="#4CAF50"  // vert pour les bougies haussières
          stroke="#4CAF50"
          stackId="a"
          baseValue={(entry) => entry.open}
        />
        <Bar
          dataKey={(entry) => entry.open > entry.close ? entry.open - entry.close : 0}
          fill="#F44336"  // rouge pour les bougies baissières
          stroke="#F44336"
          stackId="a"
          baseValue={(entry) => entry.close}
        />
        {/* Mèches - représentées par des lignes */}
        <Line
          type="monotone"
          dataKey="high"
          stroke="#000"
          dot={false}
          activeDot={false}
        />
        <Line
          type="monotone"
          dataKey="low"
          stroke="#000"
          dot={false}
          activeDot={false}
        />
      </>
    );
  };

  const renderChartContent = () => {
    switch (chartType) {
      case 'candlestick':
        return renderCandlestickContent();
      case 'volume':
        return (
          <>
            <XAxis dataKey="timestamp" hide={!expanded} />
            <YAxis domain={['auto', 'auto']} hide={!expanded} />
            <Tooltip
              contentStyle={{ background: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Volume']}
              labelFormatter={(label) => `Il y a ${(168 - label).toFixed(0)}h`}
            />
            <Bar dataKey="volume" fill="#8884d8" />
          </>
        );
      case 'line':
      default:
        return (
          <>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide={!expanded} />
            <YAxis hide={!expanded} domain={['auto', 'auto']} />
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
          </>
        );
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'candlestick':
        return (
          <ComposedChart
            data={candlestickData}
            margin={{ top: expanded ? 20 : 5, right: expanded ? 30 : 5, left: expanded ? 30 : 5, bottom: expanded ? 20 : 5 }}
          >
            {renderChartContent()}
          </ComposedChart>
        );
      case 'volume':
        return (
          <BarChart
            data={candlestickData}
            margin={{ top: expanded ? 20 : 5, right: expanded ? 30 : 5, left: expanded ? 30 : 5, bottom: expanded ? 20 : 5 }}
          >
            {renderChartContent()}
          </BarChart>
        );
      case 'line':
      default:
        return (
          <AreaChart
            data={lineChartData}
            margin={{ top: expanded ? 20 : 5, right: expanded ? 30 : 5, left: expanded ? 30 : 5, bottom: expanded ? 20 : 5 }}
          >
            {renderChartContent()}
          </AreaChart>
        );
    }
  };

  return (
    <div className={`relative ${expanded ? 'fixed inset-0 z-50 bg-white bg-opacity-95 p-6' : 'h-32 w-full'}`}>
      {expanded && (
        <div className="absolute top-4 right-4 flex gap-3">
          <button
            onClick={() => setChartType('line')}
            className={`p-2 rounded ${chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Graphique en ligne"
          >
            <TrendingUp size={20} />
          </button>
          <button
            onClick={() => setChartType('candlestick')}
            className={`p-2 rounded ${chartType === 'candlestick' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Graphique en bougies"
          >
            <ChartCandlestick size={20} />
          </button>
          <button
            onClick={() => setChartType('volume')}
            className={`p-2 rounded ${chartType === 'volume' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Graphique en volume"
          >
            <BarChart3 size={20} />
          </button>
          <button
            onClick={toggleExpand}
            className="p-2 rounded bg-red-500 text-white"
            title="Fermer"
          >
            <X size={20} />
          </button>
        </div>
      )}
      {!expanded && (
        <button
          onClick={toggleExpand}
          className="absolute top-0 right-0 p-1 bg-gray-200 rounded-bl text-gray-600 hover:bg-gray-300"
          title="Agrandir"
        >
          <Maximize2 size={16} />
        </button>
      )}
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};