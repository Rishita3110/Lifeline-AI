import { Calendar, RefreshCw } from 'lucide-react';

interface AgendaItem {
  time: string;
  activity: string;
  type: 'focus' | 'rest' | 'system';
}

interface CalendarTimelineProps {
  agenda: AgendaItem[];
  isOptimizing: boolean;
  handleOptimizeCalendar: () => void;
}

export default function CalendarTimeline({
  agenda,
  isOptimizing,
  handleOptimizeCalendar
}: CalendarTimelineProps) {
  return (
    <div id="calendar-timeline-panel" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col flex-1 backdrop-blur-sm min-h-[220px]">
      <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-indigo-400 animate-pulse" />
          <h3 className="font-bold text-white text-xs font-mono">Dynamic Calendar Timeline</h3>
        </div>
        <button 
          id="btn-optimize-agenda"
          onClick={handleOptimizeCalendar}
          disabled={isOptimizing}
          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-black flex items-center gap-1"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" /> Healing...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3" /> AI Optimize Agenda
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[160px]">
        {agenda.map((item, idx) => {
          let borderLeft = 'border-l-2 border-indigo-500';
          let bg = 'bg-slate-950/50';
          let icon = '🎯';

          if (item.type === 'rest') {
            borderLeft = 'border-l-2 border-emerald-500';
            bg = 'bg-emerald-500/5';
            icon = '🍃';
          } else if (item.type === 'system') {
            borderLeft = 'border-l-2 border-slate-700';
            bg = 'bg-slate-950/20';
            icon = '⚙️';
          }

          return (
            <div 
              key={idx}
              className={`p-2.5 rounded-r-lg flex items-center justify-between gap-3 ${borderLeft} ${bg}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] text-slate-500 font-mono font-bold shrink-0">{item.time}</span>
                <span className="text-xs text-slate-400 shrink-0">{icon}</span>
                <span className="text-xs text-slate-200 truncate">{item.activity}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
