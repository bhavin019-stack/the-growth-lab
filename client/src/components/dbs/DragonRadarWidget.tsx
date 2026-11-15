import React from 'react';
import { Sparkles, Zap, Award } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface DragonRadarWidgetProps {
  completedCount: number; // 0 to 7
  onBallClick?: (ballIndex: number) => void;
}

export const DragonRadarWidget: React.FC<DragonRadarWidgetProps> = ({
  completedCount = 4,
  onBallClick
}) => {
  const balls = [1, 2, 3, 4, 5, 6, 7];

  const handleBallClick = (idx: number) => {
    soundEffects.playDragonRadarChime();
    if (onBallClick) onBallClick(idx);
  };

  return (
    <div className="bg-canvas-card border-2 border-dbs-blue/40 rounded-2xl p-4 shadow-ki-blue relative overflow-hidden">
      {/* Background Dragon Radar Grid subtle effect */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border border-dbs-blue/20 pointer-events-none" />
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full border border-dbs-blue/15 pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-dbs-orange/20 border border-dbs-orange flex items-center justify-center text-dbs-orange font-bold text-xs shadow-warm-sm">
            ★
          </div>
          <div>
            <h3 className="font-extrabold text-xs md:text-sm text-charcoal-900 tracking-tight flex items-center gap-1.5">
              <span>Super Dragon Balls Radar</span>
              <span className="text-[10px] text-dbs-gold font-mono bg-dbs-gold/10 px-2 py-0.5 rounded border border-dbs-gold/30">
                {completedCount}/7 Gathered
              </span>
            </h3>
            <p className="text-[11px] text-charcoal-500">
              Complete daily learning & drills to collect the 7 Super Dragon Balls
            </p>
          </div>
        </div>

        {completedCount >= 7 ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-dbs-gold/20 text-dbs-gold border border-dbs-gold rounded-full text-xs font-black shadow-ki-gold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Super Shenron Summonable!</span>
          </div>
        ) : (
          <span className="text-[10px] font-mono text-charcoal-400 self-start sm:self-auto">
            {7 - completedCount} Balls remaining today
          </span>
        )}
      </div>

      {/* The 7 Dragon Balls row */}
      <div className="grid grid-cols-7 gap-2 md:gap-3 py-2 relative z-10">
        {balls.map((stars) => {
          const isCollected = stars <= completedCount;
          return (
            <button
              key={stars}
              onClick={() => handleBallClick(stars)}
              className={`aspect-square rounded-full flex flex-col items-center justify-center border-2 transition-all group relative cursor-pointer ${
                isCollected
                  ? 'bg-gradient-to-br from-amber-400 to-orange-600 border-amber-300 shadow-ki-gold scale-105'
                  : 'bg-canvas-subtle/80 border-canvas-border hover:border-dbs-blue/60 opacity-60 hover:opacity-100'
              }`}
              title={`${stars}-Star Dragon Ball (${isCollected ? 'Collected' : 'Locked - Complete Daily Milestone'})`}
            >
              {/* Star icons */}
              <div className="text-center font-black leading-none">
                <span className={`text-xs md:text-sm ${isCollected ? 'text-red-700 star-shadow' : 'text-charcoal-500'}`}>
                  ★
                </span>
                <span className={`text-[9px] block font-mono font-bold ${isCollected ? 'text-amber-100' : 'text-charcoal-400'}`}>
                  {stars}
                </span>
              </div>

              {/* Shimmer on collected */}
              {isCollected && (
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
