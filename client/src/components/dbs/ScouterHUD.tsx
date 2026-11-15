import React, { useState, useEffect } from 'react';
import { X, Eye, Zap, Crosshair, Radio } from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

interface ScouterHUDProps {
  isOpen: boolean;
  onClose: () => void;
  userPowerLevel?: number;
}

export const ScouterHUD: React.FC<ScouterHUDProps> = ({
  isOpen,
  onClose,
  userPowerLevel = 9001
}) => {
  const [scannedLevel, setScannedLevel] = useState(1200);
  const [targetName, setTargetName] = useState('MBA SCHOLAR (SAIYAN FORM)');
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      soundEffects.playScouterBeep();
      setScanning(true);
      setScannedLevel(1200);

      const interval = setInterval(() => {
        setScannedLevel(prev => {
          if (prev >= userPowerLevel) {
            setScanning(false);
            clearInterval(interval);
            return userPowerLevel;
          }
          soundEffects.playScouterBeep();
          return prev + Math.floor(Math.random() * 850) + 300;
        });
      }, 90);

      return () => clearInterval(interval);
    }
  }, [isOpen, userPowerLevel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-4 md:p-8 animate-fade-in">
      {/* Semi-transparent Green/Red Scouter HUD Lens filter */}
      <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px] scouter-scanlines border-4 border-dbs-scouter/40 rounded-3xl pointer-events-auto overflow-hidden">
        
        {/* Top Tactical Bar */}
        <div className="p-4 md:p-6 flex items-center justify-between text-dbs-scouter font-mono border-b border-dbs-scouter/30 bg-black/40">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 animate-pulse text-dbs-scouter" />
            <div>
              <span className="text-xs tracking-widest uppercase font-extrabold block">
                CAPSULE CORP • SCOUTER MK-V BATTLE SCANNER
              </span>
              <span className="text-[10px] text-dbs-scouter/70">
                TARGET IDENTIFIED: {targetName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-dbs-scouter/80 block">KI READOUT</span>
              <span className="text-lg md:text-2xl font-black tracking-wider text-dbs-scouter text-shadow">
                {scannedLevel.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => {
                soundEffects.playInstantTransmission();
                onClose();
              }}
              className="p-2 rounded-xl bg-dbs-scouter/20 hover:bg-dbs-scouter/40 text-dbs-scouter border border-dbs-scouter transition-all cursor-pointer pointer-events-auto"
              title="Close Scouter Mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Target Reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-72 h-72 md:w-96 md:h-96 border-2 border-dbs-scouter/40 rounded-full flex items-center justify-center">
            {/* Spinning Crosshairs */}
            <div className="absolute inset-0 border border-dashed border-dbs-scouter/30 rounded-full animate-spin" style={{ animationDuration: '18s' }} />
            
            <Crosshair className="w-20 h-20 text-dbs-scouter/70 animate-pulse" />

            {/* Battle Power Badge */}
            <div className="absolute bottom-10 bg-black/75 border border-dbs-scouter px-4 py-1.5 rounded-full font-mono text-xs md:text-sm text-dbs-scouter font-black shadow-scouter flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>
                {scannedLevel >= 9000 ? "IT'S OVER 9,000! (SUPER SAIYAN TIER)" : `SCANNING KI: ${scannedLevel}`}
              </span>
            </div>
          </div>
        </div>

        {/* Tactical Status Readout Bottom */}
        <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-dbs-scouter bg-black/60 p-3.5 rounded-2xl border border-dbs-scouter/30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-dbs-scouter animate-ping" />
            <span>GRAVITY RESISTANCE: 100G (HYPERBOLIC TIME CHAMBER READY)</span>
          </div>

          <div className="flex items-center gap-4">
            <span>KI PURITY: 99.4% (GOD KI SYNCHRONIZED)</span>
            <button
              onClick={() => {
                soundEffects.playSuperSaiyanAura();
                setScannedLevel(prev => prev + 2500);
              }}
              className="px-3 py-1 bg-dbs-scouter/20 hover:bg-dbs-scouter/40 text-dbs-scouter border border-dbs-scouter rounded-lg cursor-pointer pointer-events-auto transition-colors font-bold"
            >
              Power Up Ki (+2500)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
