import React from 'react';
import { Gamepad2, FolderKanban, Check, Clock, Sparkles } from 'lucide-react';
import { PROJECTS_LIST } from '../data/projectData';

interface ProjectHubProps {
  activeProjectId: string;
  onSelectProject: (id: string) => void;
}

export const ProjectHub: React.FC<ProjectHubProps> = ({ activeProjectId, onSelectProject }) => {
  return (
    <div id="project-hub" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Kids Games & Toys Lab &mdash; Projects Directory
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Multi-Project PlatformIO Architecture
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PROJECTS_LIST.map((proj) => {
          const isActive = proj.id === activeProjectId;
          const isReady = proj.status === 'Ready to Flash';

          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                  : isReady
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/60 border-slate-800/60 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                    isActive
                      ? 'bg-amber-500 text-slate-950'
                      : isReady
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {proj.number}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {proj.title}
                      {isActive && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      folder: /{proj.folderName}/
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isReady
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isReady ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {proj.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                {proj.description}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span>Sensor: <strong className="text-slate-200 font-medium">{proj.sensorUsed}</strong></span>
                <span className="font-mono text-amber-400/90">{proj.difficulty}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
