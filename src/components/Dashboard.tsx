import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Crypto, Portfolio as PortfolioType, LeaderboardEntry } from '../types';
import { CryptoList } from './CryptoList';
import { Portfolio } from './Portfolio';
import { Leaderboard } from './Leaderboard';
import { FriendsList } from './FriendsList';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [portfolio, setPortfolio] = useLocalStorage<PortfolioType>('portfolio', {});
  const [balance, setBalance] = useLocalStorage<number>('balance', 10000);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, logout, addFriend } = useAuth();
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const calculateTotalValue = () => {
    const portfolioValue = Object.entries(portfolio).reduce((total, [cryptoId, holding]) => {
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
    return portfolioValue + balance;
  };

  useEffect(() => {
    if (user) {
      const totalValue = calculateTotalValue();
      
      // Simuler d'autres utilisateurs pour le leaderboard
      const mockUsers = [
        { email: 'trader1@example.com', totalValue: 12500 + Math.random() * 5000, isFriend: true },
        { email: 'crypto_king@example.com', totalValue: 15000 + Math.random() * 7000, isFriend: false },
        { email: 'hodler99@example.com', totalValue: 8000 + Math.random() * 3000, isFriend: false },
        { email: 'satoshi_fan@example.com', totalValue: 20000 + Math.random() * 10000, isFriend: false },
        { email: 'altcoin_lover@example.com', totalValue: 5000 + Math.random() * 2000, isFriend: true },
      ];
      
      // Ajouter l'utilisateur actuel aux entrées du leaderboard
      const userEntry: LeaderboardEntry = {
        email: user.email,
        totalValue,
        rank: 0,
        isFriend: false
      };

      // Ajouter les amis comme étant des "amis" dans le leaderboard
      const friendsEntries = mockUsers.map(entry => ({
        ...entry,
        isFriend: user.friends.includes(entry.email) || entry.isFriend
      }));

      // Combiner l'utilisateur actuel et les entrées simulées, trier et attribuer des rangs
      const allEntries = [userEntry, ...friendsEntries]
        .sort((a, b) => b.totalValue - a.totalValue)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      setLeaderboard(allEntries);
    }
  }, [portfolio, cryptos, balance, user]);

  const fetchCryptos = async () => {
    try {
      setIsRefreshing(true);
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 50, // Increased from 10 to 50
            sparkline: true,
            price_change_percentage: '24h',
          },
        }
      );
      
      const sanitizedData = response.data.map((crypto: any) => {
        const prices = Array.isArray(crypto.sparkline_in_7d?.price) 
          ? crypto.sparkline_in_7d.price 
          : [];
          
        return {
          id: String(crypto.id),
          symbol: String(crypto.symbol),
          name: String(crypto.name),
          current_price: Number(crypto.current_price) || 0,
          price_change_percentage_24h: Number(crypto.price_change_percentage_24h) || 0,
          sparkline_in_7d: {
            price: prices.map(Number)
          }
        };
      });
      
      setCryptos(sanitizedData);
    } catch (error) {
      console.warn('Erreur lors de la récupération des données:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCryptos();
    const interval = setInterval(fetchCryptos, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBuy = (crypto: Crypto, leverage: number, isShort: boolean, takeProfit?: number, stopLoss?: number) => {
    const amount = parseFloat(prompt(`Combien de ${crypto.symbol.toUpperCase()} voulez-vous ${isShort ? 'shorter' : 'acheter'}?`) || '0');
    if (amount <= 0) return;

    const cost = amount * crypto.current_price;
    if (cost > balance) {
      alert('Fonds insuffisants!');
      return;
    }

    setBalance(prev => Number(prev) - cost);
    setPortfolio(prev => {
      const existing = prev[crypto.id] || { amount: 0, averagePrice: 0, leverage: 1, isShort: false };
      const totalAmount = Number(existing.amount) + amount;
      const totalCost = Number(existing.amount) * Number(existing.averagePrice) + cost;
      return {
        ...prev,
        [crypto.id]: {
          amount: totalAmount,
          averagePrice: totalCost / totalAmount,
          leverage: leverage,
          isShort: isShort,
          takeProfit: takeProfit,
          stopLoss: stopLoss
        },
      };
    });
  };

  const handleSell = (crypto: Crypto) => {
    const holding = portfolio[crypto.id];
    if (!holding || holding.amount === 0) {
      alert('Vous ne possédez pas cette position!');
      return;
    }

    const amount = parseFloat(prompt(`Combien de ${crypto.symbol.toUpperCase()} voulez-vous fermer? (Max: ${holding.amount})`) || '0');
    if (amount <= 0 || amount > holding.amount) return;

    const currentPrice = crypto.current_price;
    const initialPrice = holding.averagePrice;
    const priceChange = holding.isShort 
      ? initialPrice - currentPrice 
      : currentPrice - initialPrice;
    const profit = priceChange * amount * holding.leverage;
    
    setBalance(prev => Number(prev) + (amount * initialPrice) + profit);
    setPortfolio(prev => {
      const remaining = Number(holding.amount) - amount;
      if (remaining === 0) {
        const { [crypto.id]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [crypto.id]: {
          amount: remaining,
          averagePrice: holding.averagePrice,
          leverage: holding.leverage,
          isShort: holding.isShort
        },
      };
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Simulateur de Trading Crypto</h1>
            <p className="text-gray-600 mt-2">Connecté en tant que {user?.email}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchCryptos}
              disabled={isRefreshing}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 ${
                isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <CryptoList cryptos={cryptos} onBuy={handleBuy} onSell={handleSell} />
              <Portfolio portfolio={portfolio} cryptos={cryptos} balance={balance} />
            </div>
          </div>
          <div className="lg:col-span-1">
            {user && <FriendsList currentUser={user} onAddFriend={addFriend} />}
            <Leaderboard entries={leaderboard} currentUserEmail={user?.email || ''} />
          </div>
        </div>
      </div>
    </div>
  );
};