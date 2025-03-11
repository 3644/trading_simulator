export interface Crypto {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: {
    price: number[];
  };
}

export interface Portfolio {
  [key: string]: {
    amount: number;
    averagePrice: number;
    leverage: number;
    isShort: boolean;
  };
}

export interface Transaction {
  type: 'buy' | 'sell';
  cryptoId: string;
  amount: number;
  price: number;
  timestamp: Date;
}

export interface User {
  email: string;
  id: string;
  friends: string[];
}

export interface LeaderboardEntry {
  email: string;
  totalValue: number;
  rank: number;
  isFriend?: boolean;
}