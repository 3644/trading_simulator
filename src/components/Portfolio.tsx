import React from 'react';
import { Portfolio as PortfolioType, Crypto } from '../types';

interface PortfolioProps {
  portfolio: PortfolioType;
  cryptos: Crypto[];
  balance: number;
}

export const Portfolio: React.FC<PortfolioProps> = ({ portfolio, cryptos, balance }) => {
  const calculateTotalValue = () => {
    return Object.entries(portfolio).reduce((total, [cryptoId, holding]) => {
      const crypto = cryptos.find((c) => c.id === cryptoId);
      if (crypto) {
        const currentPrice = crypto.current_price;
        const initialPrice = holding.averagePrice;
        const priceChange = holding.isShort 
          ? initialPrice - currentPrice 
          : currentPrice - initialPrice;
        const profit = priceChange * holding.amount * holding.leverage;
        return total + (holding.amount * initialPrice) + profit;
      }
      return total;
    }, 0);
  };

  const calculateProfit = (cryptoId: string, holding: PortfolioType[string]) => {
    const crypto = cryptos.find((c) => c.id === cryptoId);
    if (crypto) {
      const currentPrice = crypto.current_price;
      const initialPrice = holding.averagePrice;
      const priceChange = holding.isShort 
        ? initialPrice - currentPrice 
        : currentPrice - initialPrice;
      return priceChange * holding.amount * holding.leverage;
    }
    return 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-2xl font-bold mb-4">Mon Portfolio</h2>
      <div className="mb-4">
        <p className="text-lg">
          Balance: <span className="font-bold">${balance.toLocaleString()}</span>
        </p>
        <p className="text-lg">
          Valeur Totale: <span className="font-bold">${(calculateTotalValue() + balance).toLocaleString()}</span>
        </p>
      </div>
      <div className="space-y-4">
        {Object.entries(portfolio).map(([cryptoId, holding]) => {
          const crypto = cryptos.find((c) => c.id === cryptoId);
          if (!crypto) return null;

          const profit = calculateProfit(cryptoId, holding);
          const positionValue = holding.amount * holding.averagePrice;

          return (
            <div key={cryptoId} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{crypto.name}</h3>
                  <p className="text-gray-600">
                    {holding.amount} {crypto.symbol.toUpperCase()}
                    <span className={`ml-2 px-2 py-0.5 rounded text-sm ${
                      holding.isShort ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {holding.isShort ? 'Short' : 'Long'} {holding.leverage}x
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    ${(positionValue + profit).toLocaleString()}
                  </p>
                  <p className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};