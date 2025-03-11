import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Users, ChevronRight, ChevronLeft } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserEmail: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, currentUserEmail }) => {
  const [showOnlyFriends, setShowOnlyFriends] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Nombre de joueurs par page

  const filteredEntries = showOnlyFriends 
    ? entries.filter(entry => entry.isFriend || entry.email === currentUserEmail)
    : entries;

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  
  // Obtention des entrées pour la page actuelle
  const currentEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fonction pour changer de page
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
        {currentEntries.map((entry) => (
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
      
      {/* Contrôles de pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-1 rounded ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {/* Afficher les numéros de page */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Calculer les numéros de page à afficher
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded ${
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
              className={`p-1 rounded ${
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