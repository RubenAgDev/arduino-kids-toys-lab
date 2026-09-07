import React, { useState } from 'react';
import JSZip from 'jszip';
import { Download, Copy, Check, FileCode, Folder, Terminal, Sparkles, ExternalLink } from 'lucide-react';
import { MAIN_CPP_CONTENT, PLATFORMIO_INI_CONTENT, SUNFOUNDER_ORIGINAL_CONTENT, PIN_CONNECTIONS } from '../data/projectData';

export const CodeExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'main' | 'ini' | 'sunfounder' | 'wiring'>('main');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  const getActiveContent = (): string => {
    switch (activeTab) {
      case 'main':
        return MAIN_CPP_CONTENT;
      case 'ini':
        return PLATFORMIO_INI_CONTENT;
      case 'sunfounder':
        return SUNFOUNDER_ORIGINAL_CONTENT;
      case 'wiring': {
        const lines = PIN_CONNECTIONS.map(
          (p) => `${p.component.padEnd(28)} | ${p.pin.padEnd(18)} | ${p.arduinoPin.padEnd(10)} | ${p.notes}`
        );
        return `ARDUINO MONSTER TRUCK CRASH SENSOR - PIN CONNECTIONS\n` +
          `====================================================================================\n` +
          `Component                    | Component Pin      | Arduino    | Notes\n` +
          `-----------------------------+--------------------+------------+--------------------\n` +
          lines.join('\n') +
          `\n\nTRACK SETUP:\n` +
          `1. Place HC-SR04 ultrasonic sensor at start ramp (0cm).\n` +
          `2. Monster truck sits at start line (2.5cm).\n` +
          `3. Position pile of crushable cars at 10cm.\n` +
          `4. When truck moves away toward 10cm, buzzer and LEDs escalate until CRASH!\n`;
      }
      default:
        return MAIN_CPP_CONTENT;
    }
  };

  const getActiveFilename = (): string => {
    switch (activeTab) {
      case 'main':
        return 'src/main.cpp';
      case 'ini':
        return 'platformio.ini';
      case 'sunfounder':
        return 'docs/original_sunfounder_parking_sensor.ino';
      case 'wiring':
        return 'docs/circuit_wiring.txt';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('01_monster_truck_crash');
      if (folder) {
        folder.file('platformio.ini', PLATFORMIO_INI_CONTENT);
        const srcFolder = folder.folder('src');
        if (srcFolder) {
          srcFolder.file('main.cpp', MAIN_CPP_CONTENT);
        }
        const includeFolder = folder.folder('include');
        if (includeFolder) {
          includeFolder.file('README', 'Header files directory for PlatformIO.');
        }
        const docsFolder = folder.folder('docs');
        if (docsFolder) {
          docsFolder.file('original_sunfounder_parking_sensor.ino', SUNFOUNDER_ORIGINAL_CONTENT);
          docsFolder.file('circuit_wiring.txt', getActiveContent());
        }
        folder.file(
          'README.md',
          `# Monster Truck Crash Sensor (PlatformIO Project)\n\nFlash this folder to Arduino Uno/Nano using VSCode + PlatformIO.\nTarget crash distance: 10 cm away from the sensor!`
        );
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
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
      setDownloading(false);
    }
  };

  return (
    <div id="code-explorer" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Explorer Header */}
      <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>01_monster_truck_crash</span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PlatformIO Project
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Ready to flash to Arduino Uno or Arduino Nano in VS Code
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="copy-code-btn"
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Code'}
          </button>

          <button
            id="download-zip-btn"
            onClick={handleDownloadZip}
            disabled={downloading}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'Preparing ZIP...' : 'Download Project (.ZIP)'}
          </button>
        </div>
      </div>

      {/* Tabs / File Bar */}
      <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-800 bg-slate-950/60 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('main')}
          className={`px-3 py-2 rounded-t-lg font-mono flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'main'
              ? 'bg-slate-900 text-amber-400 border-amber-500 font-bold'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-amber-400" />
          src/main.cpp
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">Modified</span>
        </button>

        <button
          onClick={() => setActiveTab('ini')}
          className={`px-3 py-2 rounded-t-lg font-mono flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'ini'
              ? 'bg-slate-900 text-blue-400 border-blue-500 font-bold'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          platformio.ini
        </button>

        <button
          onClick={() => setActiveTab('wiring')}
          className={`px-3 py-2 rounded-t-lg font-mono flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'wiring'
              ? 'bg-slate-900 text-emerald-400 border-emerald-500 font-bold'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-emerald-400" />
          circuit_wiring.txt
        </button>

        <button
          onClick={() => setActiveTab('sunfounder')}
          className={`px-3 py-2 rounded-t-lg font-mono flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'sunfounder'
              ? 'bg-slate-900 text-purple-400 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-purple-400" />
          docs/original_sunfounder.ino
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">Original</span>
        </button>
      </div>

      {/* Code Inspector Body */}
      <div className="relative">
        <div className="absolute top-3 right-4 text-[11px] font-mono text-slate-500 select-none">
          {getActiveFilename()}
        </div>
        <pre className="p-5 text-xs font-mono text-slate-300 overflow-x-auto max-h-[480px] leading-relaxed select-text">
          <code>{getActiveContent()}</code>
        </pre>
      </div>

      {/* Architecture Highlights Footer */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Key Innovation:</strong> Inverted distance math (<code className="text-amber-300">progress = (dist - 2.5) / 7.5</code>) speeds up buzzer and flashes as monster truck approaches the 10cm crash point!
          </span>
        </div>
        <a
          href="https://www.sunfounder.com/pages/arduino-parking-sensor-with-ultrasonic-sensor-v5"
          target="_blank"
          rel="noreferrer"
          className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 text-[11px]"
        >
          <span>SunFounder Source Tutorial</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
