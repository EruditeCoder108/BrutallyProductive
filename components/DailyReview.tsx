import React, { useState } from 'react';
import { NeoButton, NeoCard } from './NeoComponents';
import { Star } from 'lucide-react';

interface DailyReviewProps {
  onSave: (rating: number) => void;
  onCancel: () => void;
}

export const DailyReview: React.FC<DailyReviewProps> = ({ onSave, onCancel }) => {
  const [rating, setRating] = useState(5);

  return (
    <div className="fixed inset-0 bg-neo-white z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <NeoCard className="space-y-8 border-4 shadow-neo-lg p-8 bg-white">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black uppercase">Day Complete!</h2>
            <p className="font-bold text-gray-600">Be honest. How disciplined were you?</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="text-8xl font-black text-neo-purple">
              {rating}
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer border-2 border-neo-black accent-neo-purple"
            />
            <div className="flex justify-between w-full font-bold text-xs uppercase text-gray-400">
              <span>Slacker</span>
              <span>Machine</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <NeoButton 
              variant="secondary" 
              className="w-full text-lg py-4"
              onClick={() => onSave(rating)}
            >
              Save Rating
            </NeoButton>
            <button 
              onClick={onCancel}
              className="w-full py-2 text-sm font-bold text-gray-400 hover:text-black uppercase"
            >
              Go Back
            </button>
          </div>
        </NeoCard>
      </div>
    </div>
  );
};