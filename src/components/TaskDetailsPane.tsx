import { Task } from '../types';
import { ShieldAlert, Cpu, Sparkles, RefreshCw } from 'lucide-react';

interface TaskDetailsPaneProps {
  selectedTask: Task | undefined;
  isAnalyzing: boolean;
  isBreakingDown: boolean;
  handleAnalyzeTask: (taskId: string) => void;
  handleBreakdownTask: (taskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
}

export default function TaskDetailsPane({
  selectedTask,
  isAnalyzing,
  isBreakingDown,
  handleAnalyzeTask,
  handleBreakdownTask,
  toggleSubtask
}: TaskDetailsPaneProps) {
  if (!selectedTask) {
    return (
      <div id="no-task-details" className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-center text-slate-500 flex items-center justify-center h-full">
        No active task selected. Add or select one on the left queue.
      </div>
    );
  }

  return (
    <div id="task-details-pane" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-5 flex-1 backdrop-blur-sm">
      {/* Title Bar */}
      <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
        <div className="min-w-0">
          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold border border-indigo-500/30 font-mono inline-block mb-1.5">
            {selectedTask.category} Active Emergency
          </span>
          <h2 className="text-lg font-black text-white leading-tight">{selectedTask.title}</h2>
          <p className="text-xs text-slate-400 mt-1">{selectedTask.description || 'No description added.'}</p>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <div className="text-xs text-slate-400 font-mono mb-1">AI Risk Status</div>
          {selectedTask.aiPriorityScore ? (
            <div className="flex items-center gap-2">
              <div className={`h-3.5 w-3.5 rounded-full border animate-pulse ${
                selectedTask.aiPriorityScore >= 85 
                  ? 'bg-red-500 border-red-400 shadow-md shadow-red-500/40' 
                  : selectedTask.aiPriorityScore >= 60 
                    ? 'bg-amber-500 border-amber-400' 
                    : 'bg-emerald-500 border-emerald-400'
              }`} />
              <span className="text-sm font-black text-white font-mono">{selectedTask.aiPriorityScore}/100</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic">Unanalyzed</span>
          )}
        </div>
      </div>

      {/* AI Deadline Risk Assessment Details */}
      {selectedTask.deadlineRisk ? (
        <div className="bg-slate-950/80 rounded-xl p-4.5 border border-indigo-950/40 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-400 animate-bounce" />
              Predictive Risk Assessment
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
              selectedTask.deadlineRisk.classification === 'Extreme' || selectedTask.deadlineRisk.classification === 'High'
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              {selectedTask.deadlineRisk.classification} Crisis Risk
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
            &quot;{selectedTask.deadlineRisk.reason}&quot;
          </p>

          {/* Action Steps */}
          <div>
            <div className="text-xs font-bold text-white mb-2 font-mono flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              Autonomous Execution Recipe:
            </div>
            <ul className="space-y-1.5">
              {selectedTask.deadlineRisk.actionSteps.map((step, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 pl-1.5">
                  <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Live Coach Push Quote */}
          <div className="bg-indigo-650/10 border-l-4 border-indigo-500 p-3.5 rounded-r-lg mt-1 bg-indigo-500/5">
            <div className="text-[10px] text-indigo-400 uppercase tracking-widest font-black mb-1">
              🔥 Dynamic Coach Alert
            </div>
            <p className="text-xs text-slate-200 font-bold leading-relaxed">
              &quot;{selectedTask.deadlineRisk.coachingPush}&quot;
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/40 rounded-xl p-6 border border-slate-800/80 text-center flex flex-col items-center justify-center py-10 gap-3">
          <div className="bg-slate-900 p-3 rounded-full text-slate-600">
            <Sparkles className="h-6 w-6 text-indigo-500 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">No AI Assessment Yet</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Let our Multi-Agent Predictive engine analyze hours remaining and complexity parameters.
            </p>
          </div>
          <button 
            id="btn-calibrate-task"
            onClick={() => handleAnalyzeTask(selectedTask.id)}
            disabled={isAnalyzing}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg mt-1 flex items-center gap-1.5"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" /> Calibrate AI Risk
              </>
            )}
          </button>
        </div>
      )}

      {/* Intelligent Subtask Checklist Panel */}
      <div className="border-t border-slate-800/80 pt-4 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-xs font-mono">🧩 Intelligent Task Breakdown</h3>
            <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Micro-steps</span>
          </div>
          
          <button 
            id="btn-decompose-task"
            onClick={() => handleBreakdownTask(selectedTask.id)}
            disabled={isBreakingDown}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-black flex items-center gap-1"
          >
            {isBreakingDown ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" /> Decomposing...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" /> Re-decompose with Gemini
              </>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 max-h-[180px]">
          {selectedTask.subtasks && selectedTask.subtasks.length > 0 ? (
            selectedTask.subtasks.map(sub => (
              <div 
                key={sub.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                  sub.completed 
                    ? 'bg-slate-950/30 border-slate-900/60 opacity-60' 
                    : 'bg-slate-950/70 border-slate-800/60 hover:bg-slate-900/40'
                }`}
              >
                <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                  <input 
                    type="checkbox" 
                    checked={sub.completed}
                    onChange={() => toggleSubtask(selectedTask.id, sub.id)}
                    className="rounded text-indigo-600 bg-slate-900 border-slate-800 focus:ring-indigo-500 h-3.5 w-3.5 shrink-0"
                  />
                  <span className={`text-xs truncate ${sub.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {sub.title}
                  </span>
                </label>
                
                <div className="flex items-center gap-2 shrink-0">
                  {sub.riskFlag && (
                    <span className="bg-red-500/10 text-red-400 text-[8px] px-1.5 py-0.5 rounded font-black border border-red-500/20 uppercase tracking-wider">
                      🚩 bottleneck
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono">
                    {sub.estimatedMinutes} mins
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs italic">
              Click &quot;Re-decompose&quot; above to break this huge item into bite-sized actionable micro-tasks.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
