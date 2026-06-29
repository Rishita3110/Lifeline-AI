import { Zap, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: 'prototype' | 'blueprint';
  setActiveTab: (tab: 'prototype' | 'blueprint') => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header id="app-header" className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white font-black animate-pulse flex items-center justify-center">
          <Zap className="h-5 w-5 text-yellow-300" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            LIFELINE AI <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold border border-indigo-500/30">HACKATHON GOLD</span>
          </h1>
          <p className="text-xs text-slate-400">Proactive Deadline Protection & Multi-Agent Focus Hub</p>
        </div>
      </div>

      {/* Global Nav Toggles */}
      <div className="flex items-center gap-2">
        <button 
          id="btn-nav-prototype"
          onClick={() => setActiveTab('prototype')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'prototype' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="h-4 w-4" /> Live AI Sandbox
        </button>
        <button 
          id="btn-nav-blueprint"
          onClick={() => setActiveTab('blueprint')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'blueprint' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="h-4 w-4" /> Blueprint Explorer (32 Sections)
        </button>
      </div>
    </header>
  );
}
