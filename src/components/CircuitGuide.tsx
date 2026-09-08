import React from 'react';
import { Cpu, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { PIN_CONNECTIONS } from '../data/projectData';

export const CircuitGuide: React.FC = () => {
  return (
    <div id="circuit-guide" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 text-slate-100 shadow-xl">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Circuit & Breadboard Wiring Guide</h3>
          <p className="text-xs text-slate-400">
            Pin connections for Arduino Uno / Nano, HC-SR04, Buzzer, and LEDs
          </p>
        </div>
      </div>

      {/* Visual Physical Track Layout Box */}
      <div className="mb-6 p-5 rounded-xl bg-slate-950 border border-slate-800">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Physical Arena Track Setup
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="font-mono text-cyan-400 font-bold block mb-1">01. Starting Ramp</span>
            <p className="text-slate-300">
              Mount the <strong>HC-SR04 ultrasonic sensor</strong> securely at the start gate/ramp (0 cm), with the two transducer &ldquo;eyes&rdquo; pointed forward along the runway.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="font-mono text-amber-400 font-bold block mb-1">02. The Monster Truck</span>
            <p className="text-slate-300">
              Place your toy monster truck in front of the sensor at the start line (<strong>0-3 cm</strong>). When stationary, the Green LED glows and buzzer is silent.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="font-mono text-red-400 font-bold block mb-1">03. The 30cm Crash Target</span>
            <p className="text-slate-300">
              Place your pile of crushable toy cars (or cardboard blocks) at <strong>EXACTLY 30 cm</strong> from the sensor. When the truck hits 30cm: <em>BOOM!</em> Crash siren triggers!
            </p>
          </div>
        </div>
      </div>

      {/* Pin Connection Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Component</th>
              <th className="py-3 px-4">Component Pin</th>
              <th className="py-3 px-4">Arduino Pin</th>
              <th className="py-3 px-4">Wire Color</th>
              <th className="py-3 px-4">Description / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {PIN_CONNECTIONS.map((conn, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-200">
                  {conn.component}
                </td>
                <td className="py-3 px-4 font-mono text-slate-300">
                  {conn.pin}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-amber-400">
                  {conn.arduinoPin}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-slate-700 shrink-0"
                      style={{ backgroundColor: conn.color }}
                    />
                    <span className="text-slate-300 font-medium">
                      {conn.color === '#ef4444'
                        ? 'Red'
                        : conn.color === '#1f2937'
                        ? 'Black'
                        : conn.color === '#eab308'
                        ? 'Yellow'
                        : conn.color === '#3b82f6'
                        ? 'Blue'
                        : conn.color === '#f97316'
                        ? 'Orange'
                        : conn.color === '#22c55e'
                        ? 'Green'
                        : 'Standard'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-400">
                  {conn.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pro Tips Box */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-white font-semibold mb-0.5">Using Resistors for LEDs:</strong>
            Always wire a 220Ω resistor (Color bands: Red-Red-Brown-Gold) in series with the anode (long leg) of each LED to prevent damaging the Arduino pins.
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-white font-semibold mb-0.5">Buzzer Types:</strong>
            The sketch works with both <em>Passive buzzers</em> (dynamic pitch climbing) and <em>Active buzzers</em> (on/off beeping). Toggle <code className="text-amber-300">USE_PASSIVE_BUZZER</code> in <code className="text-amber-300">main.cpp</code>!
          </div>
        </div>
      </div>
    </div>
  );
};
