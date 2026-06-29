import { FormEvent, RefObject } from 'react';
import { ChatMessage, CoachPersona } from '../types';
import { COACH_PERSONAS } from '../data/coachPersonas';
import { Send } from 'lucide-react';

interface CoachChatProps {
  activePersona: string;
  handlePersonaChange: (personaId: string) => void;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSendChat: (e: FormEvent) => void;
  chatBottomRef: RefObject<HTMLDivElement | null>;
}

export default function CoachChat({
  activePersona,
  handlePersonaChange,
  chatMessages,
  isChatLoading,
  chatInput,
  setChatInput,
  handleSendChat,
  chatBottomRef
}: CoachChatProps) {
  return (
    <div id="coach-chat-panel" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col h-[340px] backdrop-blur-sm">
      {/* Persona Circular Badges */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <span className="text-xs font-bold text-white font-mono">AI Coach Active Persona:</span>
        <div className="flex gap-2">
          {COACH_PERSONAS.map(p => (
            <button
              key={p.id}
              onClick={() => handlePersonaChange(p.id)}
              className={`text-base p-1.5 rounded-full transition-all hover:scale-110 ${
                activePersona === p.id 
                  ? 'bg-indigo-600 scale-110 shadow shadow-indigo-600/50 border border-indigo-400' 
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
              title={p.name}
            >
              {p.avatar}
            </button>
          ))}
        </div>
      </div>

      {/* Chat window messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-1 max-h-[190px]">
        {chatMessages.map(msg => {
          let containerClass = 'flex items-start gap-2.5';
          let bubbleClass = 'bg-slate-950/80 text-slate-300 border border-slate-800';
          let senderLabel = COACH_PERSONAS.find(p => p.id === activePersona)?.name || 'AI Assistant';
          let avatarSym = '🤖';

          if (msg.sender === 'user') {
            containerClass = 'flex items-start gap-2.5 flex-row-reverse';
            bubbleClass = 'bg-indigo-600 text-white border border-indigo-500 ml-auto';
            senderLabel = 'You';
            avatarSym = '👤';
          } else if (msg.sender === 'agent_predictor') {
            bubbleClass = 'bg-red-950/20 text-red-300 border border-red-900/50';
            senderLabel = 'Predictor Agent';
            avatarSym = '🔮';
          } else if (msg.sender === 'agent_planner') {
            bubbleClass = 'bg-indigo-950/20 text-indigo-300 border border-indigo-900/50';
            senderLabel = 'Planner Agent';
            avatarSym = '🧩';
          } else {
            avatarSym = COACH_PERSONAS.find(p => p.id === activePersona)?.avatar || '🤖';
          }

          return (
            <div key={msg.id} className={containerClass}>
              <div className="bg-slate-800 p-1.5 rounded-full text-xs shrink-0 flex items-center justify-center">
                {avatarSym}
              </div>
              <div className="max-w-[85%]">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-black text-slate-400">{senderLabel}</span>
                  <span className="text-[8px] text-slate-600 font-mono">{msg.timestamp}</span>
                </div>
                <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${bubbleClass}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        {isChatLoading && (
          <div className="flex items-start gap-2.5">
            <div className="bg-slate-800 p-1.5 rounded-full text-xs shrink-0 animate-spin">⚡</div>
            <div className="p-2 bg-slate-950 rounded-xl text-xs text-slate-500 italic">
              Coach is thinking of a strong motivation push...
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
        <input 
          id="input-coach-chat"
          type="text" 
          placeholder="Tell your coach why you are struggling or ask for help..." 
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button 
          id="btn-send-coach-chat"
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl p-2 px-3 flex items-center justify-center transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
