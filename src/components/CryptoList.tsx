import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Search, ArrowUpDown, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { Crypto } from '../types';
import { CryptoChart } from './CryptoChart';

interface CryptoListProps {
  cryptos: Crypto[];
  onBuy: (crypto: Crypto, leverage: number, isShort: boolean, takeProfit?: number, stopLoss?: number) => void;
  onSell: (crypto: Crypto) => void;
}

type SortField = 'name' | 'price' | 'change';
type SortDirection = 'asc' | 'desc';

export const CryptoList: React.FC<CryptoListProps> = ({ cryptos, onBuy, onSell }) => {
  const [selectedLeverage, setSelectedLeverage] = useState<{ [key: string]: number }>({});
  const [customLeverage, setCustomLeverage] = useState<{ [key: string]: number }>({});
  const [showCustomLeverage, setShowCustomLeverage] = useState<{ [key: string]: boolean }>({});
  const [takeProfit, setTakeProfit] = useState<{ [key: string]: number | undefined }>({});
  const [stopLoss, setStopLoss] = useState<{ [key: string]: number | undefined }>({});
  const [showOrderSettings, setShowOrderSettings] = useState<{ [key: string]: boolean }>({});
  const [shortMode, setShortMode] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const leverageOptions = [1, 2, 5, 10];

  const handleBuy = (crypto: Crypto) => {
    const leverage = showCustomLeverage[crypto.id] 
      ? Math.max(1, Math.min(100, customLeverage[crypto.id] || 1)) 
      : selectedLeverage[crypto.id] || 1;
    const isShort = shortMode[crypto.id] || false;
    const tp = takeProfit[crypto.id];
    const sl = stopLoss[crypto.id];
    
    onBuy(crypto, leverage, isShort, tp, sl);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleOrderSettings = (cryptoId: string) => {
    setShowOrderSettings(prev => ({
      ...prev,
      [cryptoId]: !prev[cryptoId]
    }));
  };

  const handleCustomLeverageChange = (cryptoId: string, value: string) => {
    const leverage = parseFloat(value);
    if (!isNaN(leverage)) {
      setCustomLeverage(prev => ({
        ...prev,
        [cryptoId]: Math.max(1, Math.min(100, leverage))
      }));
    }
  };

  const handleTakeProfitChange = (crypto: Crypto, value: string) => {
    const tp = parseFloat(value);
    if (!isNaN(tp)) {
      setTakeProfit(prev => ({
        ...prev,
        [crypto.id]: tp
      }));
    } else {
      setTakeProfit(prev => ({
        ...prev,
        [crypto.id]: undefined
      }));
    }
  };

  const handleStopLossChange = (crypto: Crypto, value: string) => {
    const sl = parseFloat(value);
    if (!isNaN(sl)) {
      setStopLoss(prev => ({
        ...prev,
        [crypto.id]: sl
      }));
    } else {
      setStopLoss(prev => ({
        ...prev,
        [crypto.id]: undefined
      }));
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

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedCryptos.length / itemsPerPage);
  const paginatedCryptos = filteredAndSortedCryptos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  useEffect(() => {
    // Reset to first page when filter/search changes
    setCurrentPage(1);
  }, [searchTerm]);

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
        {paginatedCryptos.map((crypto) => (
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
                <button
                  onClick={() => toggleOrderSettings(crypto.id)}
                  className={`ml-auto px-2 py-1 text-sm rounded-full ${
                    showOrderSettings[crypto.id]
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Paramètres avancés"
                >
                  <Settings size={16} />
                </button>
              </div>
              
              {showOrderSettings[crypto.id] && (
                <div className="bg-gray-50 p-3 rounded-lg mb-2 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Take Profit (Prix $)
                    </label>
                    <input
                      type="number"
                      placeholder="Prix cible pour TP"
                      value={takeProfit[crypto.id] || ''}
                      onChange={(e) => handleTakeProfitChange(crypto, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stop Loss (Prix $)
                    </label>
                    <input
                      type="number"
                      placeholder="Prix cible pour SL"
                      value={stopLoss[crypto.id] || ''}
                      onChange={(e) => handleStopLossChange(crypto, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Levier:</span>
                <div className="flex gap-2 flex-wrap">
                  {!showCustomLeverage[crypto.id] && leverageOptions.map((leverage) => (
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
                  <button
                    onClick={() => setShowCustomLeverage(prev => ({ ...prev, [crypto.id]: !prev[crypto.id] }))}
                    className={`px-2 py-1 text-sm rounded ${
                      showCustomLeverage[crypto.id]
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {showCustomLeverage[crypto.id] ? 'Presets' : 'Custom'}
                  </button>
                </div>
              </div>
              
              {showCustomLeverage[crypto.id] && (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={customLeverage[crypto.id] || ''}
                    onChange={(e) => handleCustomLeverageChange(crypto.id, e.target.value)}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1-100x"
                  />
                  <span className="text-sm text-gray-600">x (1-100)</span>
                </div>
              )}
              
              <div className="flex space-x-2 justify-end">
                <button
                  onClick={() => handleBuy(crypto)}
                  className={`px-4 py-2 ${
                    shortMode[crypto.id] ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white rounded`}
                >
                  {shortMode[crypto.id] ? 'Short' : 'Long'} {showCustomLeverage[crypto.id] 
                    ? Math.max(1, Math.min(100, customLeverage[crypto.id] || 1)) 
                    : selectedLeverage[crypto.id] || 1}x
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
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Affichage <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedCryptos.length)}
            </span>{' '}
            sur <span className="font-medium">{filteredAndSortedCryptos.length}</span> cryptomonnaies
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {[...Array(Math.min(5, totalPages))].map((_, idx) => {
              // Calculate page numbers to show
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = idx + 1;
              } else if (currentPage <= 3) {
                pageNum = idx + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + idx;
              } else {
                pageNum = currentPage - 2 + idx;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};