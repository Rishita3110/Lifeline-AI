import { Task } from '../types';
import { CheckSquare, Sparkles, Trash2 } from 'lucide-react';

interface TaskStressQueueProps {
  tasks: Task[];
  selectedTaskId: string;
  setSelectedTaskId: (id: string) => void;
  handleAnalyzeTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  onReset: () => void;
}

export default function TaskStressQueue({
  tasks,
  selectedTaskId,
  setSelectedTaskId,
  handleAnalyzeTask,
  deleteTask,
  onReset
}: TaskStressQueueProps) {
  return (
    <div id="task-stress-queue" className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 flex-1 flex flex-col min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-indigo-400" />
          Task Stress Sandbox
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
            {tasks.length} Active Items
          </span>
          <button 
            id="btn-reset-tasks"
            onClick={onReset}
            className="text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 px-2 py-0.5 rounded font-mono transition-all"
            title="Reset tasks to defaults"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1 max-h-[400px] lg:max-h-none">
        {tasks.map(task => {
          const isSelected = selectedTaskId === task.id;
          const score = task.aiPriorityScore;
          let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
          
          if (score) {
            if (score >= 85) {
              badgeColor = 'bg-red-500/10 text-red-400 border-red-500/30';
            } else if (score >= 60) {
              badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            } else {
              badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            }
          }

          return (
            <div 
              key={task.id}
              id={`task-item-${task.id}`}
              onClick={() => setSelectedTaskId(task.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                isSelected 
                  ? 'bg-slate-800/80 border-indigo-500/50 shadow-md shadow-indigo-500/5' 
                  : 'bg-slate-950/60 border-slate-900 hover:border-slate-800 hover:bg-slate-900/30'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-800">
                    {task.category}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Due: {task.dueDate}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 truncate">{task.title}</h4>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {score ? (
                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-black ${badgeColor}`}>
                      {score}
                    </span>
                    <span className="text-[8px] text-slate-500 mt-0.5 font-mono">Risk Score</span>
                  </div>
                ) : (
                  <button 
                    id={`btn-analyze-task-${task.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnalyzeTask(task.id);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                    title="Analyze with AI"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                  </button>
                )}
                <button 
                  id={`btn-delete-task-${task.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="text-slate-600 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
