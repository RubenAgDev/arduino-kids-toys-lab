import React from 'react';
import { UploadCloud, CheckCircle, Terminal, HelpCircle } from 'lucide-react';

export const FlashGuide: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Install PlatformIO in VS Code',
      desc: 'Open VS Code, navigate to Extensions (Ctrl+Shift+X), search for "PlatformIO IDE", and click Install. Wait 1-2 minutes for setup to complete.',
      badge: 'One-Time Setup'
    },
    {
      num: '02',
      title: 'Open Project Folder',
      desc: 'In VS Code, click File > Open Folder... and select the "01_monster_truck_crash" directory. PlatformIO will automatically load platformio.ini.',
      badge: 'Open Folder'
    },
    {
      num: '03',
      title: 'Connect Arduino via USB',
      desc: 'Plug your Arduino Uno or Arduino Nano into your computer USB port. No manual driver installation is needed on modern OS.',
      badge: 'Plug USB'
    },
    {
      num: '04',
      title: 'Click Flash / Upload Button',
      desc: 'Click the right-arrow (Upload) icon in the bottom PlatformIO status bar (or press Ctrl+Alt+U). Watch the build compile and flash in seconds!',
      badge: 'Upload (Ctrl+Alt+U)'
    },
    {
      num: '05',
      title: 'Open Serial Monitor at 115200 Baud',
      desc: 'Click the plug icon in the status bar (Ctrl+Alt+S) to launch the Serial Monitor. Watch the live ASCII car arena as your monster truck rolls!',
      badge: 'Monitor (115200)'
    }
  ];

  return (
    <div id="flash-guide" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 text-slate-100 shadow-xl">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">How to Flash in VS Code with PlatformIO</h3>
          <p className="text-xs text-slate-400">
            5 quick steps from code to live Arduino monster truck game
          </p>
        </div>
      </div>

      {/* Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((s, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/20">
                  {s.num}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {s.badge}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mb-1.5">{s.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-900 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <CheckCircle className="w-3 h-3" />
              <span>Ready in project</span>
            </div>
          </div>
        ))}
      </div>

      {/* PlatformIO CLI Commands Cheatsheet & Troubleshooting */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CLI Shortcuts */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-2.5">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>PlatformIO Terminal Commands</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-slate-300 flex justify-between">
              <code>pio run</code>
              <span className="text-slate-500 font-sans text-[11px]">Compile sketch</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-amber-300 flex justify-between">
              <code>pio run -t upload</code>
              <span className="text-slate-500 font-sans text-[11px]">Compile & Flash</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-cyan-300 flex justify-between">
              <code>pio device monitor -b 115200</code>
              <span className="text-slate-500 font-sans text-[11px]">Open Serial Monitor</span>
            </div>
          </div>
        </div>

        {/* Arduino Nano Bootloader Tip */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-2.5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Using an Arduino Nano clone?</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Many popular low-cost Nano boards use the &ldquo;Old Bootloader&rdquo;. We have already configured a dedicated environment for this in <code className="text-amber-300 font-mono">platformio.ini</code>:
          </p>
          <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <code>pio run -e nano_old_bootloader -t upload</code>
          </div>
        </div>
      </div>
    </div>
  );
};
