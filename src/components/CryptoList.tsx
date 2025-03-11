import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Search, ArrowUpDown } from 'lucide-react';
import { Crypto } from '../types';
import { CryptoChart } from './CryptoChart';

interface CryptoListProps {
  cryptos: Crypto[];
  onBuy: (crypto: Crypto, leverage: number, isShort: boolean) => void;
  onSell: (crypto: Crypto) => void;
}

type SortField = 'name' | 'price' | 'change';
type SortDirection = 'asc' | 'desc';

export const CryptoList: React.FC<CryptoListProps> = ({ cryptos, onBuy, onSell }) => {
  const [selectedLeverage, setSelectedLeverage] = useState<{ [key: string]: number }>({});
  const [shortMode, setShortMode] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const leverageOptions = [1, 2, 5, 10];

  const handleBuy = (crypto: Crypto) => {
    const leverage = selectedLeverage[crypto.id] || 1;
    const isShort = shortMode[crypto.id] || false;
    onBuy(crypto, leverage, isShort);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedCryptos = cryptos
    .filter(crypto => 
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'price':
          return direction * (a.current_price - b.current_price);
        case 'change':
          return direction * (a.price_change_percentage_24h - b.price_change_percentage_24h);
        default:
          return 0;
      }
    });

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une cryptomonnaie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => handleSort('name')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              sortField === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Nom <ArrowUpDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSort('price')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              sortField === 'price' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Prix <ArrowUpDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSort('change')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              sortField === 'change' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Variation <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {filteredAndSortedCryptos.map((crypto) => (
          <div key={crypto.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{crypto.name}</h3>
                <p className="text-gray-600">{crypto.symbol.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">${crypto.current_price.toLocaleString()}</p>
                <p className={crypto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {crypto.price_change_percentage_24h >= 0 ? (
                    <ArrowUpCircle className="inline mr-1" size={16} />
                  ) : (
                    <ArrowDownCircle className="inline mr-1" size={16} />
                  )}
                  {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                </p>
              </div>
            </div>
            {crypto.sparkline_in_7d && (
              <div className="mb-4">
                <CryptoChart data={crypto.sparkline_in_7d.price} />
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Position:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShortMode(prev => ({ ...prev, [crypto.id]: false }))}
                    className={`px-3 py-1 text-sm rounded ${
                      !shortMode[crypto.id]
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Long
                  </button>
                  <button
                    onClick={() => setShortMode(prev => ({ ...prev, [crypto.id]: true }))}
                    className={`px-3 py-1 text-sm rounded ${
                      shortMode[crypto.id]
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Short
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Levier:</span>
                <div className="flex gap-2">
                  {leverageOptions.map((leverage) => (
                    <button
                      key={leverage}
                      onClick={() => setSelectedLeverage(prev => ({ ...prev, [crypto.id]: leverage }))}
                      className={`px-2 py-1 text-sm rounded ${
                        selectedLeverage[crypto.id] === leverage
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {leverage}x
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2 justify-end">
                <button
                  onClick={() => handleBuy(crypto)}
                  className={`px-4 py-2 ${
                    shortMode[crypto.id] ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white rounded`}
                >
                  {shortMode[crypto.id] ? 'Short' : 'Long'} {selectedLeverage[crypto.id] || 1}x
                </button>
                <button
                  onClick={() => onSell(crypto)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};