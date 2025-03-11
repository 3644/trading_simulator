import React, { useState } from 'react';
import { User } from '../types';
import { UserPlus, Users } from 'lucide-react';

interface FriendsListProps {
  currentUser: User;
  onAddFriend: (email: string) => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({ currentUser, onAddFriend }) => {
  const [newFriendEmail, setNewFriendEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFriendEmail.trim()) {
      onAddFriend(newFriendEmail.trim());
      setNewFriendEmail('');
    }
  };

  // Ensure friends array exists
  const friends = currentUser.friends || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold">Mes Amis</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="email"
            value={newFriendEmail}
            onChange={(e) => setNewFriendEmail(e.target.value)}
            placeholder="Email de votre ami"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Ajouter
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {friends.map((friendEmail) => (
          <div key={friendEmail} className="p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">{friendEmail}</span>
          </div>
        ))}
      </div>
    </div>
  );
};