import { Search, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { BlueprintSection } from '../types';
import { BLUEPRINT_CATEGORIES } from '../data/blueprintData';

interface BlueprintExplorerProps {
  selectedBlueprintCategory: string;
  setSelectedBlueprintCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredBlueprintSections: BlueprintSection[];
  copyToClipboard: (text: string, id: string) => void;
  copiedSectionId: string | null;
}

export default function BlueprintExplorer({
  selectedBlueprintCategory,
  setSelectedBlueprintCategory,
  searchQuery,
  setSearchQuery,
  filteredBlueprintSections,
  copyToClipboard,
  copiedSectionId
}: BlueprintExplorerProps) {
  return (
    <div id="blueprint-explorer-container" className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Search and Filters bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm">
        {/* Category buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {BLUEPRINT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedBlueprintCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedBlueprintCategory === cat.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-900 border border-slate-800/80'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search textfield */}
        <div className="relative w-full md:w-72">
          <input 
            id="input-blueprint-search"
            type="text" 
            placeholder="Search 32 specifications..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Structured Chapter cards (Scrollable flexbox) */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-10">
        {filteredBlueprintSections.length > 0 ? (
          filteredBlueprintSections.map(sec => (
            <motion.div 
              key={sec.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-slate-850 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Card Header with Category tag and Copy action */}
              <div className="bg-slate-950/60 border-b border-slate-850 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-mono font-black border border-indigo-500/20 uppercase tracking-wider">
                    Section {sec.id}
                  </span>
                  <h3 className="text-sm font-black text-white">{sec.title}</h3>
                </div>

                <button
                  onClick={() => copyToClipboard(sec.content, sec.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copiedSectionId === sec.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {copiedSectionId === sec.id ? (
                    <>
                      <Check className="h-3 w-3" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy Markdown
                    </>
                  )}
                </button>
              </div>

              {/* Content text */}
              <div className="p-6">
                <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed space-y-4 font-sans whitespace-pre-wrap">
                  {sec.content}
                </div>

                {/* Specialized Interactive elements inside blueprint cards */}
                {sec.id === "15" && (
                  <div className="mt-5 overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-mono">
                        <tr>
                          <th className="px-4 py-3 border-b border-slate-800">Feature Matrix</th>
                          <th className="px-4 py-3 border-b border-slate-800">Google Tasks</th>
                          <th className="px-4 py-3 border-b border-slate-800">Todoist</th>
                          <th className="px-4 py-3 border-b border-slate-800">Motion</th>
                          <th className="px-4 py-3 border-b border-slate-800 text-indigo-400 font-bold">Lifeline AI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        <tr className="hover:bg-slate-900/40">
                          <td className="px-4 py-3 font-bold text-white">Stress-Score Logic</td>
                          <td className="px-4 py-3">❌ Manual only</td>
                          <td className="px-4 py-3">❌ Simple Date</td>
                          <td className="px-4 py-3">⚠️ Basic slots</td>
                          <td className="px-4 py-3 text-indigo-400 font-black">✅ Dynamic Multi-Factor (0-100)</td>
                        </tr>
                        <tr className="hover:bg-slate-900/40">
                          <td className="px-4 py-3 font-bold text-white">Ambiguity Solver</td>
                          <td className="px-4 py-3">❌ None</td>
                          <td className="px-4 py-3">❌ None</td>
                          <td className="px-4 py-3">❌ None</td>
                          <td className="px-4 py-3 text-indigo-400 font-black">✅ Intelligent Task Decomposition</td>
                        </tr>
                        <tr className="hover:bg-slate-900/40">
                          <td className="px-4 py-3 font-bold text-white">Psych Accountability</td>
                          <td className="px-4 py-3">❌ None</td>
                          <td className="px-4 py-3">⚠️ Karma Points</td>
                          <td className="px-4 py-3">❌ None</td>
                          <td className="px-4 py-3 text-indigo-400 font-black">✅ 4 Conversational Persona Coaches</td>
                        </tr>
                        <tr className="hover:bg-slate-900/40">
                          <td className="px-4 py-3 font-bold text-white">Slippage Risk Warnings</td>
                          <td className="px-4 py-3">❌ None</td>
                          <td className="px-4 py-3">❌ None</td>
                          <td className="px-4 py-3">⚠️ Passive Alert</td>
                          <td className="px-4 py-3 text-indigo-400 font-black">✅ 48hr Late-Delivery Forecaster</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-12 text-center text-slate-500 italic text-sm">
            No specifications matched your search criteria. Try a different term or filter.
          </div>
        )}
      </div>
    </div>
  );
}
