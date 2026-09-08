/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  Radio, 
  Code2, 
  Cpu, 
  UploadCloud, 
  Download, 
  ExternalLink, 
  Gamepad2, 
  Flame, 
  Sparkles,
  Layers
} from 'lucide-react';

import { ProjectHub } from './components/ProjectHub';
import { ArenaSimulator } from './components/ArenaSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { CircuitGuide } from './components/CircuitGuide';
import { FlashGuide } from './components/FlashGuide';
import { MAIN_CPP_CONTENT, PLATFORMIO_INI_CONTENT, SUNFOUNDER_ORIGINAL_CONTENT } from './data/projectData';

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState<string>('01_monster_truck_crash');
  const [activeSection, setActiveSection] = useState<'simulator' | 'code' | 'wiring' | 'flash'>('simulator');
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const handleDownloadFullZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('01_monster_truck_crash');
      if (folder) {
        folder.file('platformio.ini', PLATFORMIO_INI_CONTENT);
        const src = folder.folder('src');
        if (src) src.file('main.cpp', MAIN_CPP_CONTENT);
        const include = folder.folder('include');
        if (include) include.file('README', 'PlatformIO include folder');
        const docs = folder.folder('docs');
        if (docs) {
          docs.file('original_sunfounder_parking_sensor.ino', SUNFOUNDER_ORIGINAL_CONTENT);
          docs.file(
            'circuit_wiring.txt',
            'Pin 9: TRIG, Pin 10: ECHO, Pin 3: BUZZER, Pin 4: Green LED, Pin 5: Yellow LED, Pin 6: Red LED'
          );
        }
        folder.file(
          'README.md',
          '# 🏎️ Monster Truck Crash Arena Sensor\n\nArduino Uno/Nano PlatformIO project. Flashes via VSCode.\nBuzzer and LEDs speed up as monster truck moves away toward 30cm pile of cars!'
        );
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = '01_monster_truck_crash_platformio.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950 pb-16">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  Arduino Kids Toys Lab
                </h1>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  PlatformIO Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Project 01: Monster Truck Crash Detector (30cm Impact Zone)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.sunfounder.com/pages/arduino-parking-sensor-with-ultrasonic-sensor-v5"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900"
            >
              <span>SunFounder V5 Reference</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              id="header-download-zip"
              onClick={handleDownloadFullZip}
              disabled={isZipping}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isZipping ? 'Packaging...' : 'Download Project (.ZIP)'}
              </span>
              <span className="sm:hidden">ZIP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Project Selector Hub */}
        <ProjectHub
          activeProjectId={activeProjectId}
          onSelectProject={(id) => setActiveProjectId(id)}
        />

        {/* Navigation Tabs for Project 01 */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSection('simulator')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'simulator'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Interactive Arena Simulator</span>
          </button>

          <button
            onClick={() => setActiveSection('code')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'code'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>PlatformIO Code & Files</span>
          </button>

          <button
            onClick={() => setActiveSection('wiring')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'wiring'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Circuit & Track Wiring</span>
          </button>

          <button
            onClick={() => setActiveSection('flash')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'flash'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>VS Code Flashing Guide</span>
          </button>
        </div>

        {/* Active Section Views */}
        {activeSection === 'simulator' && (
          <div className="space-y-6">
            <ArenaSimulator />

            {/* Quick Summary Card */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] block">
                  How The Monster Truck Sensor Works
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Unlike a standard parking assist that beeps as you get closer to a wall, this sensor tracks the monster truck rolling <em>away</em> from the launch ramp toward the pile of cars.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] block">
                  Mounting Urgency & Accelerating Pace
                </span>
                <p className="text-slate-300 leading-relaxed">
                  As the distance increases from 3cm towards 30cm, the beep interval decreases from 600ms to 40ms, and the pitch climbs from 650Hz to 1750Hz.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-red-400 uppercase tracking-wider text-[11px] block">
                  30 cm Crash Point Impact!
                </span>
                <p className="text-slate-300 leading-relaxed">
                  The pile of cars is calibrated at exactly 30 cm. When the truck impacts, the Arduino triggers 3 siren bursts and holds the LEDs ON until reset!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'code' && <CodeExplorer />}
        {activeSection === 'wiring' && <CircuitGuide />}
        {activeSection === 'flash' && <FlashGuide />}

        {/* Project Directory Structure Reference Box */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              PlatformIO Folder Hierarchy
            </h4>
          </div>
          <p className="text-slate-400 mb-3">
            This repository contains the standalone PlatformIO folder <code className="text-amber-300 font-mono">01_monster_truck_crash/</code> ready to open in VS Code:
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
            <div>📁 01_monster_truck_crash/</div>
            <div className="pl-4">📄 platformio.ini <span className="text-slate-500">(Target environments: uno, nano, nano_old_bootloader)</span></div>
            <div className="pl-4">📁 src/</div>
            <div className="pl-8">📄 main.cpp <span className="text-amber-400 font-semibold">(Modified Monster Truck Crash detector code)</span></div>
            <div className="pl-4">📁 include/</div>
            <div className="pl-8">📄 README</div>
            <div className="pl-4">📁 docs/</div>
            <div className="pl-8">📄 original_sunfounder_parking_sensor.ino <span className="text-purple-400">(Extracted SunFounder source)</span></div>
            <div className="pl-8">📄 circuit_wiring.txt <span className="text-emerald-400">(Pin connection table & ASCII layout)</span></div>
            <div className="pl-4">📄 README.md <span className="text-slate-400">(Full documentation & tuning instructions)</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}
