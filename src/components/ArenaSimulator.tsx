import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Volume2, VolumeX, Radio } from 'lucide-react';
import { playBuzzerTone, playCrashSoundEffect } from '../utils/audioSynth';

export const ArenaSimulator: React.FC = () => {
  const [distance, setDistance] = useState<number>(1.5);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [hasCrashed, setHasCrashed] = useState<boolean>(false);
  const [activeLed, setActiveLed] = useState<'green' | 'yellow' | 'red' | 'all' | 'none'>('green');
  const [blinkState, setBlinkState] = useState<boolean>(true);

  const CRASH_DISTANCE_CM = 30.0;
  const START_DISTANCE_CM = 3.0;

  const animationFrameRef = useRef<number | null>(null);
  const driveStartTimeRef = useRef<number | null>(null);

  const progress = Math.max(0, Math.min(0.99, (distance - START_DISTANCE_CM) / (CRASH_DISTANCE_CM - START_DISTANCE_CM)));
  const beepInterval = Math.max(40, Math.round(600 - progress * 560));
  const beepPitch = Math.round(650 + progress * 1100);

  const triggerCrash = useCallback(() => {
    setHasCrashed(true);
    setIsDriving(false);
    setActiveLed('all');
    setBlinkState(true);

    if (audioEnabled) {
      playCrashSoundEffect(0.35);
    }

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.65 }, colors: ['#ef4444', '#f59e0b', '#10b981', '#ffffff'] });
    } catch {}
  }, [audioEnabled]);

  useEffect(() => {
    if (distance >= CRASH_DISTANCE_CM && !hasCrashed) {
      triggerCrash();
    } else if (distance <= START_DISTANCE_CM && hasCrashed) {
      setHasCrashed(false);
    }
  }, [distance, hasCrashed, triggerCrash]);

  useEffect(() => {
    if (distance <= START_DISTANCE_CM) {
      setActiveLed('green');
      setBlinkState(true);
      return; 
    }

    if (hasCrashed) {
      setActiveLed('all');
      setBlinkState(true);
      return; 
    }

    const timer = setInterval(() => {
      setBlinkState((prev) => {
        const nextState = !prev;
        if (distance < 12.0) setActiveLed(nextState ? 'green' : 'none');
        else if (distance < 22.0) setActiveLed(nextState ? 'yellow' : 'none');
        else setActiveLed(nextState ? 'red' : 'none');

        if (nextState && audioEnabled) playBuzzerTone(beepPitch, 35, 0.25);
        return nextState;
      });
    }, beepInterval);

    return () => clearInterval(timer);
  }, [beepInterval, beepPitch, audioEnabled, distance, hasCrashed]);

  useEffect(() => {
    if (!isDriving) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const driveStep = (timestamp: number) => {
      if (!driveStartTimeRef.current) driveStartTimeRef.current = timestamp;
      const elapsed = timestamp - driveStartTimeRef.current;
      const travelProgress = Math.min(1, elapsed / 4500);
      const newDist = START_DISTANCE_CM + travelProgress * (CRASH_DISTANCE_CM - START_DISTANCE_CM);

      setDistance(parseFloat(newDist.toFixed(1)));

      if (travelProgress < 1) animationFrameRef.current = requestAnimationFrame(driveStep);
      else {
        setIsDriving(false);
        driveStartTimeRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(driveStep);
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [isDriving]);

  const handleStartDrive = () => {
    setDistance(START_DISTANCE_CM);
    setHasCrashed(false);
    driveStartTimeRef.current = null;
    setIsDriving(true);
  };

  const handleReset = () => {
    setIsDriving(false);
    setHasCrashed(false);
    driveStartTimeRef.current = null;
    setDistance(1.5);
  };

  const truckTrackPercentage = 15 + Math.min(32, Math.max(0, distance)) * (70 / 30);

  return (
    <div id="arena-simulator" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 text-slate-100 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-red-500/20 text-red-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">Monster Truck Crash Arena Simulator</h2>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">Sensor sits at 0cm. Monster truck moves away toward the 30cm crash pile!</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setAudioEnabled(!audioEnabled)} className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${audioEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}>
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {audioEnabled ? 'Buzzer Audio On' : 'Muted'}
          </button>
          <button onClick={handleStartDrive} disabled={isDriving} className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 transition-transform active:scale-95 cursor-pointer">
            <Play className="w-3.5 h-3.5 fill-current" />
            {isDriving ? 'Rolling...' : 'Auto-Drive & Crash!'}
          </button>
          <button onClick={handleReset} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors" title="Reset to Start line">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`relative w-full h-56 md:h-64 rounded-xl overflow-hidden border transition-all duration-300 ${hasCrashed ? 'border-red-500 shadow-lg shadow-red-500/30 bg-gradient-to-b from-red-950/40 to-slate-900' : 'border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        <div className="absolute left-[15%] top-4 bottom-12 border-r-2 border-dashed border-emerald-500/40 flex flex-col justify-end pr-1"><span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Start (0-3cm)</span></div>
        <div className="absolute left-[85%] top-4 bottom-12 border-r-2 border-red-500 flex flex-col justify-end pr-1"><span className="text-[10px] font-mono text-red-400 font-bold uppercase">Crash (30cm)</span></div>

        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="bg-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded text-white mb-1 shadow">HC-SR04</div>
          <div className="w-10 h-20 bg-blue-900/90 border-2 border-blue-400 rounded-lg flex flex-col justify-around items-center p-1 shadow-md">
            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center relative">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-60 pointer-events-none" />
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-1 font-semibold">0 cm</span>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 h-8 pointer-events-none transition-all duration-75 flex items-center" style={{ left: '52px', width: `calc(${truckTrackPercentage}% - 65px)` }}>
          <div className="w-full h-1 bg-cyan-400/40 relative overflow-hidden rounded-full"><div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-transparent animate-pulse" /></div>
        </div>

        <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-100 flex flex-col items-center ${hasCrashed ? 'scale-110 rotate-3' : ''}`} style={{ left: `calc(${truckTrackPercentage}% - 40px)` }}>
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold mb-1 shadow ${hasCrashed ? 'bg-red-600 text-white animate-bounce' : distance >= 22 ? 'bg-red-500 text-white' : distance >= 12 ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'}`}>
            {hasCrashed ? '💥 CRASH!' : `${distance.toFixed(1)} cm`}
          </div>
          <div className="relative w-20 h-14 select-none">
            <div className="w-16 h-7 bg-amber-500 rounded-t-lg mx-auto relative border-t-2 border-amber-300 shadow-md">
              <div className="absolute -top-3 left-3 w-8 h-4 bg-slate-800 rounded-t-sm border border-slate-600 flex items-center justify-center"><div className="w-5 h-2 bg-sky-300/80 rounded-xs" /></div>
              <div className="absolute right-2 top-1 text-[9px]">🔥</div>
              <div className="absolute -right-1 top-2 w-2 h-2 rounded-full bg-yellow-200 shadow-sm shadow-yellow-300" />
            </div>
            <div className="w-14 mx-auto flex justify-between px-2 -mt-0.5">
              <div className="w-1.5 h-2.5 bg-slate-400 border border-slate-600" /><div className="w-1.5 h-2.5 bg-slate-400 border border-slate-600" />
            </div>
            <div className="w-20 flex justify-between -mt-1">
              <div className={`w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center shadow-lg ${isDriving ? 'animate-spin' : ''}`}><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /></div>
              <div className={`w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center shadow-lg ${isDriving ? 'animate-spin' : ''}`}><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /></div>
            </div>
          </div>
        </div>

        <div className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col items-center transition-all ${hasCrashed ? 'scale-90 rotate-6' : ''}`}>
          {hasCrashed && <div className="absolute -top-8 -left-4 text-3xl animate-bounce">💥</div>}
          <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Pile of Cars</div>
          <div className="flex flex-col gap-1 items-center">
            <div className={`w-14 rounded transition-all duration-300 ${hasCrashed ? 'h-2 bg-red-800 scale-x-125' : 'h-5 bg-red-600 border border-red-400'} flex items-center justify-center text-[9px] font-bold text-white shadow`}>{hasCrashed ? '💥' : '🚗'}</div>
            <div className={`w-16 rounded transition-all duration-300 ${hasCrashed ? 'h-2 bg-blue-900 scale-x-110' : 'h-5 bg-blue-600 border border-blue-400'} flex items-center justify-center text-[9px] font-bold text-white shadow`}>{hasCrashed ? 'CRUSHED' : '🚙'}</div>
            <div className={`w-18 rounded transition-all duration-300 ${hasCrashed ? 'h-3 bg-purple-900 scale-x-105' : 'h-5 bg-purple-600 border border-purple-400'} flex items-center justify-center text-[9px] font-bold text-white shadow`}>{hasCrashed ? 'SMASHED' : '🚕'}</div>
          </div>
        </div>
      </div>

      <div className="mt-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <label htmlFor="distance-range" className="flex items-center gap-1.5 text-slate-300">
            <span>Manual Proximity Control:</span>
            <span className="text-amber-400 font-mono text-sm">{distance.toFixed(1)} cm</span>
            <span className="text-slate-500 font-normal">({(distance / 2.54).toFixed(2)} in)</span>
          </label>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${distance >= 30 ? 'bg-red-500 text-white' : distance >= 22 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {distance >= 30 ? 'IMPACT POINT (30 cm)' : `Zone: ${distance <= 3 ? 'Safe / Start' : distance < 22 ? 'Warning' : 'Critical'}`}
          </span>
        </div>
        <input id="distance-range" type="range" min="1.0" max="35.0" step="0.1" value={distance} onChange={(e) => { setIsDriving(false); setDistance(parseFloat(e.target.value)); }} className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
          <span>0-3 cm (Start)</span><span>12 cm</span><span>22 cm</span><span className="text-red-400 font-bold">30 cm (Crash!)</span><span>35 cm</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-3">
          <div className="flex gap-2 items-center">
            <div className="flex flex-col items-center gap-1"><div className={`w-5 h-5 rounded-full border transition-all duration-75 ${((activeLed === 'green' || activeLed === 'all') && blinkState) ? 'bg-emerald-400 border-emerald-300 shadow-md shadow-emerald-500' : 'bg-emerald-950 border-emerald-900 opacity-40'}`} /><span className="text-[9px] font-mono text-slate-400">Pin 4</span></div>
            <div className="flex flex-col items-center gap-1"><div className={`w-5 h-5 rounded-full border transition-all duration-75 ${((activeLed === 'yellow' || activeLed === 'all') && blinkState) ? 'bg-amber-400 border-amber-300 shadow-md shadow-amber-500' : 'bg-amber-950 border-amber-900 opacity-40'}`} /><span className="text-[9px] font-mono text-slate-400">Pin 5</span></div>
            <div className="flex flex-col items-center gap-1"><div className={`w-5 h-5 rounded-full border transition-all duration-75 ${((activeLed === 'red' || activeLed === 'all') && blinkState) ? 'bg-red-500 border-red-400 shadow-md shadow-red-500' : 'bg-red-950 border-red-900 opacity-40'}`} /><span className="text-[9px] font-mono text-slate-400">Pin 6</span></div>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">LED Status</span>
            <span className="text-xs font-semibold text-slate-200">{activeLed === 'all' ? 'Solid On!' : activeLed.toUpperCase()}</span>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Buzzer (Pin 3)</span>
            <span className="text-xs font-semibold text-slate-200">{hasCrashed ? 'Silent (Hold)' : distance <= START_DISTANCE_CM ? 'Silent (Ready)' : `${beepPitch} Hz`}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono">Interval</span>
            <span className="text-xs font-mono font-bold text-amber-400 block">{hasCrashed || distance <= START_DISTANCE_CM ? '-' : `${beepInterval}ms`}</span>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">HC-SR04 Pulse</span>
            <span className="text-xs font-mono text-slate-200">{Math.round((distance * 2) / 0.0343)} μs</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono">Speed of Sound</span>
            <span className="text-xs font-mono text-cyan-400 block">343 m/s</span>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-center">
          <div className="flex justify-between items-center text-[10px] mb-1 font-bold">
            <span className="text-slate-400 uppercase">Crash Intensity</span>
            <span className="text-amber-400 font-mono">{hasCrashed ? '100%' : distance <= START_DISTANCE_CM ? '0%' : `${Math.round(progress * 100)}%`}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-100 ${hasCrashed ? 'w-full bg-red-500 animate-pulse' : progress > 0.7 ? 'bg-red-500' : progress > 0.4 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: hasCrashed ? '100%' : distance <= START_DISTANCE_CM ? '0%' : `${Math.max(5, progress * 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
