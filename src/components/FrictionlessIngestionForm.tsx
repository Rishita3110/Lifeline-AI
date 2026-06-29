import { FormEvent } from 'react';
import { Plus, Sparkles } from 'lucide-react';

interface FrictionlessIngestionFormProps {
  quickTitle: string;
  setQuickTitle: (val: string) => void;
  quickDesc: string;
  setQuickDesc: (val: string) => void;
  quickPriority: 'low' | 'medium' | 'high' | 'critical';
  setQuickPriority: (val: 'low' | 'medium' | 'high' | 'critical') => void;
  userEnergy: 'low' | 'medium' | 'high';
  setUserEnergy: (val: 'low' | 'medium' | 'high') => void;
  onSubmit: (e: FormEvent) => void;
}

export default function FrictionlessIngestionForm({
  quickTitle,
  setQuickTitle,
  quickDesc,
  setQuickDesc,
  quickPriority,
  setQuickPriority,
  userEnergy,
  setUserEnergy,
  onSubmit
}: FrictionlessIngestionFormProps) {
  return (
    <div id="ingestion-panel" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Plus className="h-4 w-4 text-indigo-400" />
          Frictionless Ingestion (Messy Dump)
        </h3>
        <span className="text-xs text-slate-500 font-mono">Input Agent Ingestion</span>
      </div>
      
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div>
          <input 
            id="input-quick-title"
            type="text" 
            placeholder="What is the deadline item?" 
            value={quickTitle}
            onChange={e => setQuickTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            required
          />
        </div>
        <div>
          <textarea 
            id="input-quick-desc"
            placeholder="Add messy details, emails content, or random notes..." 
            value={quickDesc}
            onChange={e => setQuickDesc(e.target.value)}
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Priority</label>
            <select 
              id="select-quick-priority"
              value={quickPriority}
              onChange={e => setQuickPriority(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical Emergency</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Your Energy Level</label>
            <select 
              id="select-user-energy"
              value={userEnergy}
              onChange={e => setUserEnergy(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="low">🔋 Low Battery</option>
              <option value="medium">⚡ Medium Energy</option>
              <option value="high">🚀 Prime Focus</option>
            </select>
          </div>
        </div>

        <button 
          id="btn-ingest-task"
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 mt-1"
        >
          <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-spin" /> Ingest & Analyze with AI
        </button>
      </form>
    </div>
  );
}
