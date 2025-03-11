import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Users } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserEmail: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, currentUserEmail }) => {
  const [showOnlyFriends, setShowOnlyFriends] = useState(false);

  const filteredEntries = showOnlyFriends 
    ? entries.filter(entry => entry.isFriend || entry.email === currentUserEmail)
    : entries;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Classement des Traders</h2>
        </div>
        <button
          onClick={() => setShowOnlyFriends(!showOnlyFriends)}
          className={`flex items-center gap-2 px-3 py-1 rounded ${
            showOnlyFriends 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          {showOnlyFriends ? 'Tous' : 'Amis'}
        </button>
      </div>
      <div className="space-y-2">
        {filteredEntries.map((entry) => (
          <div
            key={entry.email}
            className={`p-3 rounded-lg ${
              entry.email === currentUserEmail
                ? 'bg-blue-50 border border-blue-200'
                : entry.isFriend
                ? 'bg-green-50 border border-green-200'
                : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`
                  w-8 h-8 flex items-center justify-center rounded-full
                  ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                    entry.rank === 2 ? 'bg-gray-100 text-gray-700' :
                    entry.rank === 3 ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-50 text-blue-700'}
                  font-bold
                `}>
                  {entry.rank}
                </span>
                <span className={`font-medium ${
                  entry.email === currentUserEmail 
                    ? 'text-blue-600'
                    : entry.isFriend
                    ? 'text-green-600'
                    : 'text-gray-700'
                }`}>
                  {entry.email}
                </span>
              </div>
              <span className="font-bold text-gray-900">
                ${entry.totalValue.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};