import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Volume2, VolumeX, Sparkles, AlertTriangle, Radio } from 'lucide-react';
import { playBuzzerTone, playCrashSoundEffect } from '../utils/audioSynth';

export const ArenaSimulator: React.FC = () => {
  // Distance from sensor in cm (starts near sensor at 2.5cm, crash point is 10.0cm)
  const [distance, setDistance] = useState<number>(3.0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [hasCrashed, setHasCrashed] = useState<boolean>(false);
  const [activeLed, setActiveLed] = useState<'green' | 'yellow' | 'red' | 'all' | 'none'>('green');
  const [blinkState, setBlinkState] = useState<boolean>(false);

  // Crash threshold constant matching Arduino code
  const CRASH_DISTANCE_CM = 10.0;
  const START_DISTANCE_CM = 2.5;

  const animationFrameRef = useRef<number | null>(null);
  const driveStartTimeRef = useRef<number | null>(null);

  // Calculate intensity (0.0 to 1.0)
  const progress = Math.max(0, Math.min(0.99, (distance - START_DISTANCE_CM) / (CRASH_DISTANCE_CM - START_DISTANCE_CM)));
  const beepInterval = Math.max(40, Math.round(600 - progress * 550));
  const beepPitch = Math.round(650 + progress * 1100);

  // Trigger crash event
  const triggerCrash = useCallback(() => {
    setHasCrashed(true);
    setIsDriving(false);
    setActiveLed('all');

    if (audioEnabled) {
      playCrashSoundEffect(0.35);
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#ef4444', '#f59e0b', '#10b981', '#ffffff']
      });
    } catch {
      // Confetti fallback
    }

    // Auto recover/reset after 2.5s
    setTimeout(() => {
      setActiveLed('red');
    }, 1200);
  }, [audioEnabled]);

  // Handle crash check
  useEffect(() => {
    if (distance >= CRASH_DISTANCE_CM && !hasCrashed) {
      triggerCrash();
    } else if (distance < 4.0 && hasCrashed) {
      setHasCrashed(false);
    }
  }, [distance, hasCrashed, triggerCrash]);

  // Audio & LED blinking timer loop based on current distance
  useEffect(() => {
    if (hasCrashed) return;

    const timer = setInterval(() => {
      setBlinkState((prev) => {
        const nextState = !prev;

        // Determine LED color
        if (distance < 5.0) {
          setActiveLed(nextState ? 'green' : 'none');
        } else if (distance < 8.0) {
          setActiveLed(nextState ? 'yellow' : 'none');
        } else {
          setActiveLed(nextState ? 'red' : 'none');
        }

        // Play chirp sound if enabled and active pulse
        if (nextState && audioEnabled) {
          playBuzzerTone(beepPitch, 35, 0.25);
        }

        return nextState;
      });
    }, beepInterval);

    return () => clearInterval(timer);
  }, [beepInterval, beepPitch, audioEnabled, distance, hasCrashed]);

  // Auto-drive animation loop
  useEffect(() => {
    if (!isDriving) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const driveStep = (timestamp: number) => {
      if (!driveStartTimeRef.current) driveStartTimeRef.current = timestamp;
      const elapsed = timestamp - driveStartTimeRef.current;

      // 3.5 seconds to reach 10cm from starting point
      const travelProgress = Math.min(1, elapsed / 3200);
      const newDist = START_DISTANCE_CM + travelProgress * (CRASH_DISTANCE_CM - START_DISTANCE_CM);

      setDistance(parseFloat(newDist.toFixed(1)));

      if (travelProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(driveStep);
      } else {
        setIsDriving(false);
        driveStartTimeRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(driveStep);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
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
    setDistance(3.0);
    setActiveLed('green');
  };

  // Convert distance to track percentage for visual rendering (0cm = 12%, 10cm = 85%)
  const truckTrackPercentage = 15 + Math.min(10.5, Math.max(0, distance)) * 7.0;

  return (
    <div id="arena-simulator" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 text-slate-100 shadow-xl">
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-red-500/20 text-red-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Monster Truck Crash Arena Simulator
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Sensor sits at 0cm. Monster truck moves away toward the 10cm crash pile!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="toggle-audio-btn"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
              audioEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Buzzer Audio Synthesizer"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {audioEnabled ? 'Buzzer Audio On' : 'Muted'}
          </button>

          <button
            id="drive-truck-btn"
            onClick={handleStartDrive}
            disabled={isDriving}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isDriving ? 'Rolling...' : 'Auto-Drive & Crash!'}
          </button>

          <button
            id="reset-truck-btn"
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Reset to Start line"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Visual Arena Stage */}
      <div className={`relative w-full h-56 md:h-64 rounded-xl overflow-hidden border transition-all duration-300 ${
        hasCrashed 
          ? 'border-red-500 shadow-lg shadow-red-500/30 animate-pulse bg-gradient-to-b from-red-950/40 to-slate-900' 
          : 'border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900'
      }`}>
        {/* Dirt track texture / arena lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

        {/* Start Line Marking */}
        <div className="absolute left-[15%] top-4 bottom-12 border-r-2 border-dashed border-emerald-500/40 flex flex-col justify-end pr-1">
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Start (2cm)</span>
        </div>

        {/* 10cm Crash Impact Wall & Target Line */}
        <div className="absolute left-[85%] top-4 bottom-12 border-r-2 border-red-500 flex flex-col justify-end pr-1">
          <span className="text-[10px] font-mono text-red-400 font-bold uppercase">Crash (10cm)</span>
        </div>

        {/* Ultrasonic Sensor (Mounted at left wall: 0cm) */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="bg-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded text-white mb-1 shadow">
            HC-SR04
          </div>
          <div className="w-10 h-20 bg-blue-900/90 border-2 border-blue-400 rounded-lg flex flex-col justify-around items-center p-1 shadow-md">
            {/* Sensor Transducer 'Eyes' */}
            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center relative">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              {/* Ultrasonic Wave Pulse Rings */}
              <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-60 pointer-events-none" />
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-1 font-semibold">0 cm</span>
        </div>

        {/* Dynamic Distance Ultrasonic Beam Line */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-8 pointer-events-none transition-all duration-75 flex items-center"
          style={{
            left: '52px',
            width: `calc(${truckTrackPercentage}% - 65px)`
          }}
        >
          <div className="w-full h-1 bg-cyan-400/40 relative overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Monster Truck Graphic */}
        <div 
          className={`absolute top-1/2 -translate-y-1/2 transition-all duration-100 flex flex-col items-center ${
            hasCrashed ? 'scale-110 rotate-3' : ''
          }`}
          style={{
            left: `calc(${truckTrackPercentage}% - 40px)`
          }}
        >
          {/* Proximity / Speed Floating Tag */}
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold mb-1 shadow ${
            hasCrashed
              ? 'bg-red-600 text-white animate-bounce'
              : distance > 8
              ? 'bg-red-500 text-white'
              : distance > 5
              ? 'bg-amber-500 text-slate-950'
              : 'bg-emerald-500 text-slate-950'
          }`}>
            {hasCrashed ? '💥 CRASH!' : `${distance.toFixed(1)} cm`}
          </div>

          {/* SVG Monster Truck */}
          <div className="relative w-20 h-14 select-none">
            {/* Truck Body */}
            <div className="w-16 h-7 bg-amber-500 rounded-t-lg mx-auto relative border-t-2 border-amber-300 shadow-md">
              {/* Cab & Window */}
              <div className="absolute -top-3 left-3 w-8 h-4 bg-slate-800 rounded-t-sm border border-slate-600 flex items-center justify-center">
                <div className="w-5 h-2 bg-sky-300/80 rounded-xs" />
              </div>
              {/* Flame decals */}
              <div className="absolute right-2 top-1 text-[9px]">🔥</div>
              {/* Headlights */}
              <div className="absolute -right-1 top-2 w-2 h-2 rounded-full bg-yellow-200 shadow-sm shadow-yellow-300" />
            </div>

            {/* Suspension Springs */}
            <div className="w-14 mx-auto flex justify-between px-2 -mt-0.5">
              <div className="w-1.5 h-2.5 bg-slate-400 border border-slate-600" />
              <div className="w-1.5 h-2.5 bg-slate-400 border border-slate-600" />
            </div>

            {/* Monster Truck Giant Wheels */}
            <div className="w-20 flex justify-between -mt-1">
              <div className={`w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center shadow-lg ${
                isDriving ? 'animate-spin' : ''
              }`}>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              </div>
              <div className={`w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center shadow-lg ${
                isDriving ? 'animate-spin' : ''
              }`}>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Pile of Crushable Cars at 10cm */}
        <div className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col items-center transition-all ${
          hasCrashed ? 'scale-90 rotate-6' : ''
        }`}>
          {hasCrashed && (
            <div className="absolute -top-8 -left-4 text-3xl animate-bounce">
              💥
            </div>
          )}
          <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">
            Pile of Cars
          </div>
          {/* Stack of toy cars */}
          <div className="flex flex-col gap-1 items-center">
            {/* Top Car (crushed flat when crashed) */}
            <div className={`w-14 rounded transition-all duration-300 ${
              hasCrashed ? 'h-2 bg-red-800 scale-x-125' : 'h-5 bg-red-600 border border-red-400'
            } flex items-center justify-center text-[9px] font-bold text-white shadow`}>
              {hasCrashed ? '💥' : '🚗'}
            </div>
            {/* Middle Car */}
            <div className={`w-16 rounded transition-all duration-300 ${
              hasCrashed ? 'h-2 bg-blue-900 scale-x-110' : 'h-5 bg-blue-600 border border-blue-400'
            } flex items-center justify-center text-[9px] font-bold text-white shadow`}>
              {hasCrashed ? 'CRUSHED' : '🚙'}
            </div>
            {/* Bottom Car */}
            <div className={`w-18 rounded transition-all duration-300 ${
              hasCrashed ? 'h-3 bg-purple-900 scale-x-105' : 'h-5 bg-purple-600 border border-purple-400'
            } flex items-center justify-center text-[9px] font-bold text-white shadow`}>
              {hasCrashed ? 'SMASHED' : '🚕'}
            </div>
          </div>
        </div>

        {/* Track Floor / Mud Ramp */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-stone-900 to-amber-950/60 border-t border-amber-800/40 flex items-center justify-between px-6">
          <span className="text-[11px] font-mono text-stone-400">Launch Ramp</span>
          <span className="text-[11px] font-mono text-stone-400">Crush Zone Arena</span>
        </div>
      </div>

      {/* Interactive Distance Slider */}
      <div className="mt-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <label htmlFor="distance-range" className="flex items-center gap-1.5 text-slate-300">
            <span>Manual Proximity Control:</span>
            <span className="text-amber-400 font-mono text-sm">{distance.toFixed(1)} cm</span>
            <span className="text-slate-500 font-normal">({(distance / 2.54).toFixed(2)} in)</span>
          </label>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            distance >= 10 
              ? 'bg-red-500 text-white' 
              : distance >= 8 
              ? 'bg-amber-500/20 text-amber-400' 
              : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {distance >= 10 ? 'IMPACT POINT (10 cm)' : `Zone: ${distance < 5 ? 'Safe / Start' : distance < 8 ? 'Warning' : 'Critical'}`}
          </span>
        </div>

        <input
          id="distance-range"
          type="range"
          min="2.0"
          max="12.0"
          step="0.1"
          value={distance}
          onChange={(e) => {
            setIsDriving(false);
            setDistance(parseFloat(e.target.value));
          }}
          className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />

        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
          <span>2 cm (Near Sensor)</span>
          <span>5 cm</span>
          <span>8 cm</span>
          <span className="text-red-400 font-bold">10 cm (Pile Impact!)</span>
          <span>12 cm (Past)</span>
        </div>
      </div>

      {/* Live Hardware Telemetry Panel (LEDs & Buzzer Monitor) */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Virtual LEDs */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-3">
          <div className="flex gap-2 items-center">
            {/* Green LED (Pin 4) */}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-5 h-5 rounded-full border transition-all duration-75 ${
                activeLed === 'green' || activeLed === 'all'
                  ? 'bg-emerald-400 border-emerald-300 shadow-md shadow-emerald-500'
                  : 'bg-emerald-950 border-emerald-900 opacity-40'
              }`} />
              <span className="text-[9px] font-mono text-slate-400">Pin 4</span>
            </div>

            {/* Yellow LED (Pin 5) */}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-5 h-5 rounded-full border transition-all duration-75 ${
                activeLed === 'yellow' || activeLed === 'all'
                  ? 'bg-amber-400 border-amber-300 shadow-md shadow-amber-500'
                  : 'bg-amber-950 border-amber-900 opacity-40'
              }`} />
              <span className="text-[9px] font-mono text-slate-400">Pin 5</span>
            </div>

            {/* Red LED (Pin 6) */}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-5 h-5 rounded-full border transition-all duration-75 ${
                activeLed === 'red' || activeLed === 'all'
                  ? 'bg-red-500 border-red-400 shadow-md shadow-red-500'
                  : 'bg-red-950 border-red-900 opacity-40'
              }`} />
              <span className="text-[9px] font-mono text-slate-400">Pin 6</span>
            </div>
          </div>

          <div className="border-l border-slate-800 pl-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">LED Status</span>
            <span className="text-xs font-semibold text-slate-200">
              {activeLed === 'all' ? '💥 All Strobing!' : activeLed.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Buzzer Sound Telemetry */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Buzzer (Pin 3)</span>
            <span className="text-xs font-semibold text-slate-200">
              {hasCrashed ? 'Crash Siren (2000Hz)' : `${beepPitch} Hz Tone`}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono">Interval</span>
            <span className="text-xs font-mono font-bold text-amber-400 block">
              {hasCrashed ? '25ms (Solid)' : `${beepInterval}ms`}
            </span>
          </div>
        </div>

        {/* Ultrasonic Calculation */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">HC-SR04 Echo Pulse</span>
            <span className="text-xs font-mono text-slate-200">
              {Math.round((distance * 2) / 0.0343)} μs
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono">Speed of Sound</span>
            <span className="text-xs font-mono text-cyan-400 block">343 m/s</span>
          </div>
        </div>

        {/* Intensity Meter */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-center">
          <div className="flex justify-between items-center text-[10px] mb-1 font-bold">
            <span className="text-slate-400 uppercase">Crash Intensity</span>
            <span className="text-amber-400 font-mono">{hasCrashed ? '100%' : `${Math.round(progress * 100)}%`}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-100 ${
                hasCrashed 
                  ? 'w-full bg-red-500 animate-pulse' 
                  : progress > 0.7 
                  ? 'bg-red-500' 
                  : progress > 0.4 
                  ? 'bg-amber-400' 
                  : 'bg-emerald-400'
              }`}
              style={{ width: hasCrashed ? '100%' : `${Math.max(5, progress * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
