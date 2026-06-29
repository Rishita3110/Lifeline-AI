import { useState, useEffect, useRef, FormEvent } from 'react';
import { Task, Subtask, ChatMessage } from './types';
import { blueprintSections } from './data/blueprintData';
import { COACH_PERSONAS } from './data/coachPersonas';
import { parseDeadlineFromText, parseDateFromText } from './utils/dateUtils';

// Modular components
import Header from './components/Header';
import FrictionlessIngestionForm from './components/FrictionlessIngestionForm';
import TaskStressQueue from './components/TaskStressQueue';
import TaskDetailsPane from './components/TaskDetailsPane';
import CoachChat from './components/CoachChat';
import CalendarTimeline from './components/CalendarTimeline';
import BlueprintExplorer from './components/BlueprintExplorer';

export default function App() {
  // Global App States
  const [activeTab, setActiveTab] = useState<'prototype' | 'blueprint'>('prototype');
  
  // Prototype States
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('lifeline_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load tasks from localStorage:", e);
      }
    }
    return [
      {
        id: 'task-1',
        title: 'Decompose Q3 Investor Pitch Slides',
        description: 'Break down slides 1 to 10 for the final submission deadline tomorrow.',
        dueDate: '2026-06-29',
        dueTime: '12:00',
        priority: 'high',
        status: 'in_progress',
        category: 'Startup',
        energyRequired: 'high',
        createdAt: new Date().toISOString(),
        aiPriorityScore: 92,
        deadlineRisk: {
          classification: 'High',
          score: 92,
          reason: 'Due in less than 24 hours. Require intense cognitive energy. Potential high friction bottleneck.',
          actionSteps: [
            'Draft Slide 1 title and value proposition (15 mins)',
            'Complete slide 2 competitor battle matrix list (20 mins)',
            'Create slide 3 system architecture flowchart (30 mins)'
          ],
          coachingPush: 'STOP THINKING. START DECOMPOSED DRAFTING. I have pre-formatted the template. Give me 15 minutes of focus right now!'
        },
        subtasks: [
          { id: 'sub-1', title: 'Draft value proposition slide', completed: true, estimatedMinutes: 15, riskFlag: false },
          { id: 'sub-2', title: 'Assemble competitor comparison grid', completed: false, estimatedMinutes: 20, riskFlag: true },
          { id: 'sub-3', title: 'Write technical architecture specs', completed: false, estimatedMinutes: 30, riskFlag: true }
        ]
      },
      {
        id: 'task-2',
        title: 'Pay Server Maintenance Bill',
        description: 'Submit monthly recurring cloud infrastructure remittance before midnight.',
        dueDate: '2026-06-28',
        dueTime: '23:59',
        priority: 'critical',
        status: 'pending',
        category: 'Finance',
        energyRequired: 'low',
        createdAt: new Date().toISOString(),
        aiPriorityScore: 95,
        deadlineRisk: {
          classification: 'Extreme',
          score: 95,
          reason: 'Due tonight. Missing this triggers service suspension on the main production database.',
          actionSteps: [
            'Log in to Google Cloud billing console.',
            'Verify payment gateway configuration.',
            'Hit submit wire and log transaction receipt.'
          ],
          coachingPush: 'This takes exactly 3 minutes. Do it right now so we don\'t lose server access tonight!'
        },
        subtasks: [
          { id: 'sub-4', title: 'Access GCP Console dashboard', completed: false, estimatedMinutes: 2, riskFlag: false },
          { id: 'sub-5', title: 'Process card payment authorization', completed: false, estimatedMinutes: 3, riskFlag: true }
        ]
      },
      {
        id: 'task-3',
        title: 'Pre-read Academic Journal',
        description: 'Review deep-learning optimization methodologies for Tuesday seminar.',
        dueDate: '2026-06-30',
        dueTime: '14:00',
        priority: 'medium',
        status: 'pending',
        category: 'Academics',
        energyRequired: 'medium',
        createdAt: new Date().toISOString(),
        subtasks: []
      }
    ];
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string>('task-1');
  const [userEnergy, setUserEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [activePersona, setActivePersona] = useState<string>('adrenaline');
  
  // Quick task input state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickPriority, setQuickPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [quickDueDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  
  // AI Loading Indicators
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  // Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent_coach',
      text: "LISTEN UP! 🚨 I am Ignis, your high-energy Adrenaline Coach. The clock is ticking, the files are ready, and your deadlines don't care about your feelings. Let's get that keyboard warm and smash through these tasks together! What are we conquering first?",
      timestamp: '5:10 PM'
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Agenda States
  const [agenda, setAgenda] = useState<any[]>(() => {
    const saved = localStorage.getItem('lifeline_agenda');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load agenda from localStorage:", e);
      }
    }
    return [
      { time: "08:30 AM", activity: "🌅 Setup & Energy Grounding ritual", type: "system" },
      { time: "09:00 AM", activity: "🔥 Deep Focus: Decompose Q3 Investor Pitch Slides", type: "focus" },
      { time: "11:00 AM", activity: "🍃 Smart Break & Hydration Window", type: "rest" },
      { time: "11:30 AM", activity: "🔥 Deep Focus: Pay Server Maintenance Bill", type: "focus" },
      { time: "12:00 PM", activity: "🍱 Brain Food Reset & Physical Rest", type: "rest" },
      { time: "01:30 PM", activity: "🏁 Final check-off & Evening wrap-up", type: "system" }
    ];
  });

  // Blueprint Explorer States
  const [selectedBlueprintCategory, setSelectedBlueprintCategory] = useState<string>('executive');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);

  // Sync scroll on chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Persist tasks list to localStorage
  useEffect(() => {
    localStorage.setItem('lifeline_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Persist agenda to localStorage
  useEffect(() => {
    localStorage.setItem('lifeline_agenda', JSON.stringify(agenda));
  }, [agenda]);

  // Automatically sync/optimize calendar timeline in the background when tasks list changes
  useEffect(() => {
    const autoOptimizeCalendar = async () => {
      try {
        const response = await fetch('/api/optimize-calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tasks })
        });
        const data = await response.json();
        if (data && Array.isArray(data.agenda)) {
          setAgenda(data.agenda);
        }
      } catch (error) {
        console.error("Auto calendar synchronization failed:", error);
      }
    };

    if (tasks.length > 0) {
      autoOptimizeCalendar();
    } else {
      setAgenda([]);
    }
  }, [tasks]);

  // Update chatbot welcoming response on persona change
  const handlePersonaChange = (personaId: string) => {
    setActivePersona(personaId);
    let welcomeText = '';
    if (personaId === 'adrenaline') {
      welcomeText = "TICK TOCK! 🚨 Every second you waste is a second you'll regret! Ignis is back in the driver seat. Let's light up the console and crush your active task. Give me action!";
    } else if (personaId === 'zen') {
      welcomeText = 'Deep breath in... and let it go. 🍃 This is Zephyr. The mountain of work is just tiny grains of sand. Let\'s choose one grain, focus mindfully, and let the chaos fade away.';
    } else if (personaId === 'unfiltered') {
      welcomeText = "Let's be completely real. 💀 Vera here. You are stalling. Close Netflix, mute your phone, and open your code. Nobody is going to do this for you. Let's begin.";
    } else if (personaId === 'friend') {
      welcomeText = "Hey there! 😊 Amis is here. I know things look extremely heavy and you're feeling the pressure. But you are incredibly smart and build awesome things. Let's take a tiny step together, okay?";
    }

    setChatMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'agent_coach',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Trigger Live AI Analysis via Server
  const handleAnalyzeTask = async (taskId: string, optionalTask?: Task) => {
    const task = optionalTask || tasks.find(t => t.id === taskId);
    if (!task) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/predict-deadline-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          dueTime: task.dueTime,
          priority: task.priority,
          energyRequired: task.energyRequired
        })
      });
      const data = await response.json();
      
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            aiPriorityScore: data.aiPriorityScore,
            deadlineRisk: {
              classification: data.classification,
              score: data.aiPriorityScore,
              reason: data.reason,
              actionSteps: data.actionSteps,
              coachingPush: data.coachingPush
            }
          };
        }
        return t;
      }));

      // Append AI Notification
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'agent_predictor',
          text: `🚨 [DEADLINE PREDICTOR] Task "${task.title}" analyzed. Risk Classification: ${data.classification} (Priority: ${data.aiPriorityScore}/100). Reason: ${data.reason}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger Live Subtask Decomposer via Server
  const handleBreakdownTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setIsBreakingDown(true);
    try {
      const response = await fetch('/api/breakdown-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description
        })
      });
      const data = await response.json();
      
      const newSubtasks: Subtask[] = data.map((sub: any, i: number) => ({
        id: `sub-${Date.now()}-${i}`,
        title: sub.title,
        completed: false,
        estimatedMinutes: sub.estimatedMinutes,
        riskFlag: sub.riskFlag
      }));

      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: newSubtasks
          };
        }
        return t;
      }));

      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'agent_planner',
          text: `🧩 [TASK PLANNER] Decomposed "${task.title}" into ${newSubtasks.length} actionable micro-tasks. Open the task panel to review your sequential execution recipe!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsBreakingDown(false);
    }
  };

  // Add Task Function
  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    // Automatically parse a deadline time from the unstructured dump title or description
    const parsedTime = parseDeadlineFromText(quickTitle) || parseDeadlineFromText(quickDesc) || '17:00';

    const parsedDate = parseDateFromText(quickTitle) || parseDateFromText(quickDesc) || quickDueDate;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: quickTitle,
      description: quickDesc,
      dueDate: parsedDate,
      dueTime: parsedTime,
      priority: quickPriority,
      status: 'pending',
      category: 'Inbox',
      energyRequired: userEnergy,
      createdAt: new Date().toISOString(),
      subtasks: []
    };

    setTasks(prev => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
    
    // Reset form fields
    setQuickTitle('');
    setQuickDesc('');
    
    // Automatically trigger AI Analysis for immediate feedback
    setTimeout(() => {
      handleAnalyzeTask(newTask.id, newTask);
    }, 200);
  };

  // Send message to Coach Persona via Server
  const handleSendChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsgText = chatInput;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const chatHistory = [...chatMessages, userMsg].map(msg => ({
        sender: msg.sender === 'user' ? 'user' : 'ai',
        text: msg.text
      }));

      const response = await fetch('/api/chat-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          persona: activePersona
        })
      });
      const data = await response.json();

      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-reply`,
          sender: 'agent_coach',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Optimize Calendar Timeline via Server
  const handleOptimizeCalendar = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/optimize-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, forceAI: true })
      });
      const data = await response.json();
      setAgenda(data.agenda);

      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'agent_planner',
          text: `⚙️ [CALENDAR AGENT] Re-sequenced and optimized daily focus calendar timeline based on active priorities and remaining task stress profiles!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.subtasks) {
        return {
          ...t,
          subtasks: t.subtasks.map(sub => {
            if (sub.id === subtaskId) {
              return { ...sub, completed: !sub.completed };
            }
            return sub;
          })
        };
      }
      return t;
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(tasks[0]?.id || '');
    }
  };

  // Clipboard copy helper
  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSectionId(sectionId);
    setTimeout(() => setCopiedSectionId(null), 2000);
  };

  const onResetTasks = () => {
    localStorage.removeItem('lifeline_tasks');
    localStorage.removeItem('lifeline_agenda');
    window.location.reload();
  };

  // Filtering for Blueprint Explorer
  const filteredBlueprintSections = blueprintSections.filter(sec => {
    const matchesCategory = sec.category === selectedBlueprintCategory;
    const matchesSearch = sec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sec.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      {/* Header Bar */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Body Layout */}
      <main className="flex-1 overflow-hidden p-6 flex flex-col">
        {activeTab === 'prototype' ? (
          /* ============================================================ */
          /* VIEW 1: LIVE PROTOTYPE SANDBOX                               */
          /* ============================================================ */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full flex-1 overflow-y-auto lg:overflow-hidden">
            
            {/* Left Col: Task Manager & Quick Ingestion (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-6 lg:overflow-y-auto pr-1">
              <FrictionlessIngestionForm 
                quickTitle={quickTitle}
                setQuickTitle={setQuickTitle}
                quickDesc={quickDesc}
                setQuickDesc={setQuickDesc}
                quickPriority={quickPriority}
                setQuickPriority={setQuickPriority}
                userEnergy={userEnergy}
                setUserEnergy={setUserEnergy}
                onSubmit={handleAddTask}
              />

              <TaskStressQueue 
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                setSelectedTaskId={setSelectedTaskId}
                handleAnalyzeTask={handleAnalyzeTask}
                deleteTask={deleteTask}
                onReset={onResetTasks}
              />
            </div>

            {/* Middle Col: Selected Emergency Task Details & Coach Feedback (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6 lg:overflow-y-auto pr-1">
              <TaskDetailsPane 
                selectedTask={selectedTask}
                isAnalyzing={isAnalyzing}
                isBreakingDown={isBreakingDown}
                handleAnalyzeTask={handleAnalyzeTask}
                handleBreakdownTask={handleBreakdownTask}
                toggleSubtask={toggleSubtask}
              />
            </div>

            {/* Right Col: Persona Coaching & Dynamic Calendar (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:overflow-y-auto pr-1">
              <CoachChat 
                activePersona={activePersona}
                handlePersonaChange={handlePersonaChange}
                chatMessages={chatMessages}
                isChatLoading={isChatLoading}
                chatInput={chatInput}
                setChatInput={setChatInput}
                handleSendChat={handleSendChat}
                chatBottomRef={chatBottomRef}
              />

              <CalendarTimeline 
                agenda={agenda}
                isOptimizing={isOptimizing}
                handleOptimizeCalendar={handleOptimizeCalendar}
              />
            </div>

          </div>
        ) : (
          /* ============================================================ */
          /* VIEW 2: COMPREHENSIVE BLUEPRINT EXPLORER                     */
          /* ============================================================ */
          <BlueprintExplorer 
            selectedBlueprintCategory={selectedBlueprintCategory}
            setSelectedBlueprintCategory={setSelectedBlueprintCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredBlueprintSections={filteredBlueprintSections}
            copyToClipboard={copyToClipboard}
            copiedSectionId={copiedSectionId}
          />
        )}
      </main>

      {/* Footer System Credits */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-3 flex items-center justify-between text-[10px] text-slate-500 font-mono shrink-0">
        <div>SYSTEM STATUS: ACTIVE & COMPILING</div>
        <div>CRAFTED BY TEAM LIFELINE • GOOGLE AI STUDIO 2026</div>
      </footer>
    </div>
  );
}
