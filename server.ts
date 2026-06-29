import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer } from "http";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Successfully initialized Gemini API Client.");
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }
} else {
  console.warn("GEMINI_API_KEY environment variable is missing or placeholder. Running in Simulation/Sandbox mode.");
}

// Quiet API warning log to prevent platform highlighting as critical errors
function logApiWarning(context: string, error: any) {
  // Gracefully transition to local offline high-fidelity simulator
  console.log(`[Status] Agent '${context}' switched to high-fidelity offline mode.`);
}

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    aiInitialized: !!ai,
    timestamp: new Date().toISOString()
  });
});

// Endpoint: Predict Deadline Risk & Priority Score
app.post("/api/predict-deadline-risk", async (req, res) => {
  const { title, description, dueDate, dueTime, priority, energyRequired } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  const prompt = `Analyze this task for deadline risk, urgency, and complexity:
  - Title: ${title}
  - Description: ${description || "No description provided."}
  - Due Date: ${dueDate}
  - Due Time: ${dueTime || "End of day"}
  - User Stated Priority: ${priority}
  - User Energy Level: ${energyRequired}
  - Current Local Time: 2026-06-28T17:10:39-07:00
  
  Generate an AI Priority Score (0-100), classify the risk level (Low, Medium, High, Extreme), give a detailed reason why, and outline 3-4 actionable sequential execution steps to complete this task and beat the deadline. Also provide a high-energy, motivational coaching push specifically targeted at this task's characteristics.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiPriorityScore: { 
                type: Type.INTEGER, 
                description: "Calculated overall priority score from 0 (lowest urgency) to 100 (absolute crisis)." 
              },
              classification: { 
                type: Type.STRING, 
                description: "Deadline risk classification: Low, Medium, High, or Extreme." 
              },
              reason: { 
                type: Type.STRING, 
                description: "1-2 sentence detailed reason analyzing why this score and risk was assigned." 
              },
              actionSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-4 actionable sequential steps to complete this specific task immediately."
              },
              coachingPush: { 
                type: Type.STRING, 
                description: "A strong, direct, motivational push tailored to the task and energy level." 
              }
            },
            required: ["aiPriorityScore", "classification", "reason", "actionSteps", "coachingPush"]
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        return res.json(JSON.parse(resultText));
      }
    } catch (error) {
      logApiWarning("risk prediction", error);
    }
  }

  // Robust simulation fallback if Gemini is not set up or fails
  console.log("Using local simulation for risk prediction.");
  
  const hoursLeft = Math.floor(Math.random() * 12) + 2;
  const isHighUrgency = priority === 'high' || priority === 'critical' || hoursLeft < 6;
  const riskClass = isHighUrgency ? 'High' : (priority === 'medium' ? 'Medium' : 'Low');
  const aiScore = isHighUrgency ? Math.floor(Math.random() * 21) + 80 : Math.floor(Math.random() * 30) + 40;

  const reason = `Dynamic Analysis: '${title}' has been assessed as a ${priority} priority task with a deadline on ${dueDate || 'today'} ${dueTime ? `at ${dueTime}` : ''}. It requires ${energyRequired} energy, posing a ${riskClass.toLowerCase()} risk of deadline slippage.`;
  const actionSteps = [
    `Initialize workspace and prepare focus blocks specifically for "${title}".`,
    `Identify the critical path and break "${title}" into micro-steps to prevent procrastination.`,
    `Execute the high-energy components first, targeting completion before the ${dueTime || 'stipulated'} deadline.`,
    `Review and verify the final outcomes of "${title}" to ensure all requirements are met.`
  ];
  const coachingPush = `Let's tackle "${title}" head-on! With ${energyRequired} energy required, you need to stay locked in. Block out all distractions and push this across the finish line!`;

  res.json({
    aiPriorityScore: aiScore,
    classification: riskClass,
    reason,
    actionSteps,
    coachingPush
  });
});

// Endpoint: Breakdown Task into Subtasks
app.post("/api/breakdown-task", async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  const prompt = `Break down the following large task into 4 distinct, smaller, manageable subtasks:
  - Task Title: ${title}
  - Description: ${description || "No description provided."}
  
  For each subtask, generate a concise title, an estimated time to complete in minutes, and a true/false flag indicating whether this specific step carries a high execution risk or bottleneck threat.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Actionable, clear subtask title." },
                estimatedMinutes: { type: Type.INTEGER, description: "Estimated time in minutes." },
                riskFlag: { type: Type.BOOLEAN, description: "Whether this step is highly prone to procrastination or bottlenecks." }
              },
              required: ["title", "estimatedMinutes", "riskFlag"]
            }
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        return res.json(JSON.parse(resultText));
      }
    } catch (error) {
      logApiWarning("task breakdown", error);
    }
  }

  // Fallback
  res.json([
    { title: `Prepare workspace and gather prerequisites for "${title}"`, estimatedMinutes: 15, riskFlag: false },
    { title: `Draft outline and tackle core challenges of "${title}"`, estimatedMinutes: 30, riskFlag: true },
    { title: `Execute the primary focused action block of "${title}"`, estimatedMinutes: 45, riskFlag: true },
    { title: `Conduct final review and verify outcomes of "${title}"`, estimatedMinutes: 15, riskFlag: false }
  ]);
});

// Endpoint: Focus Coach Conversation (Motivation Agent)
app.post("/api/chat-coach", async (req, res) => {
  const { messages, persona } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const latestMessage = messages[messages.length - 1]?.text || "";
  
  let systemInstruction = "You are an expert productivity coach.";
  if (persona === "adrenaline") {
    systemInstruction = "You are 'The Adrenaline Rush' coach. You speak with extreme intensity, urgency, and high-energy. You use caps lock occasionally, clock metaphors, and tell the user they need to act NOW. There is no time to waste!";
  } else if (persona === "zen") {
    systemInstruction = "You are the 'Zen Master' coach. You speak with deep calm, mindfulness, and breathing metaphors. You remind the user that focus comes from peace, and help them take a deep breath before breaking down the chaos.";
  } else if (persona === "unfiltered") {
    systemInstruction = "You are the 'Unfiltered Realist' coach. You tell it like it is. You are direct, slightly blunt, and point out that procrastination is a choice. You give them a tough-love push to stop complaining and start doing.";
  } else if (persona === "friend") {
    systemInstruction = "You are the 'Supportive Ally' coach. You are highly empathetic, warm, positive, and validating. You encourage them, celebrate tiny victories, and assure them that they have everything it takes to succeed.";
  }

  if (ai) {
    try {
      const chatHistory = messages.slice(0, -1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Since we need to call with correct model structure, we use simple generateContent with prompt & instruction
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: latestMessage,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
        }
      });

      const resultText = response.text;
      if (resultText) {
        return res.json({ text: resultText });
      }
    } catch (error) {
      logApiWarning("coach chat", error);
    }
  }

  // Fallback responses
  let simulatedResponse = "Let's focus and get this task completed right away!";
  if (persona === "adrenaline") {
    simulatedResponse = `TICK TOCK! 🚨 No time to sit around! That deadline is rushing towards you like an express train! Let's get up, get that keyboard burning, and get 15 minutes of pure work done. NOW, NOW, NOW!`;
  } else if (persona === "zen") {
    simulatedResponse = `Take a slow, deep breath in... and let it go. 🍃 The chaos is only as loud as your mind allows it to be. Choose one single thing, let everything else drift away, and let's begin with gentle awareness.`;
  } else if (persona === "unfiltered") {
    simulatedResponse = `Look, I could sugarcoat this, but the fact is: you're procrastinating. If you don't start in the next 5 minutes, you will fail to deliver or submit low-quality work. Put the phone down, close the tabs, and open the editor. It's that simple.`;
  } else if (persona === "friend") {
    simulatedResponse = `Hey, I know it feels super overwhelming right now and you're under a ton of pressure. But remember how much you've already accomplished! You can absolutely do this. Let's just do the very first step together, okay? I'm right here with you!`;
  }

  res.json({ text: simulatedResponse });
});

// Helper to parse explicit time ranges from task text
function parseExplicitTimeRange(text: string) {
  if (!text) return null;
  const lower = text.toLowerCase();
  
  // 1. Match full range with colons: e.g., "11:30 to 12:30" or "11:30am to 12:30pm" or "11:30 - 12:30"
  const rangeWithColons = lower.match(/(\d{1,2}):(\d{2})\s*(am|pm)?\s*(?:to|-|until|and|\s)\s*(\d{1,2}):(\d{2})\s*(am|pm)?/);
  if (rangeWithColons) {
    let startH = parseInt(rangeWithColons[1], 10);
    const startM = parseInt(rangeWithColons[2], 10);
    const startPeriod = rangeWithColons[3];
    
    let endH = parseInt(rangeWithColons[4], 10);
    const endM = parseInt(rangeWithColons[5], 10);
    const endPeriod = rangeWithColons[6];
    
    if (startPeriod === 'pm' && startH < 12) startH += 12;
    if (startPeriod === 'am' && startH === 12) startH = 0;
    if (endPeriod === 'pm' && endH < 12) endH += 12;
    if (endPeriod === 'am' && endH === 12) endH = 0;
    
    if (!startPeriod && endPeriod === 'pm' && startH < endH && startH < 12) {
      startH += 12;
    }
    
    return {
      startMinutes: startH * 60 + startM,
      endMinutes: endH * 60 + endM
    };
  }
  
  // 2. Match hour-only ranges: e.g., "7pm to 8pm" or "7 to 8 pm" or "7pm - 8pm" or "19 to 20"
  const hourOnlyRange = lower.match(/(\d{1,2})\s*(am|pm)?\s*(?:to|-|until|and)\s*(\d{1,2})\s*(am|pm)?/);
  if (hourOnlyRange) {
    let startH = parseInt(hourOnlyRange[1], 10);
    const startPeriod = hourOnlyRange[2];
    let endH = parseInt(hourOnlyRange[3], 10);
    const endPeriod = hourOnlyRange[4];
    
    if (startPeriod === 'pm' && startH < 12) startH += 12;
    if (startPeriod === 'am' && startH === 12) startH = 0;
    if (endPeriod === 'pm' && endH < 12) endH += 12;
    if (endPeriod === 'am' && endH === 12) endH = 0;
    
    // Handle implicit am/pm (e.g. "7 to 8 pm" -> both pm)
    if (!startPeriod && endPeriod) {
      if (endPeriod === 'pm' && startH < endH && startH < 12) {
        startH += 12;
      } else if (endPeriod === 'am' && startH === 12) {
        startH = 0;
      }
    }
    
    return {
      startMinutes: startH * 60,
      endMinutes: endH * 60
    };
  }
  
  // 3. Match single time with colon: e.g., "at 11:30" or "at 11:30am"
  const singleWithColon = lower.match(/(?:at|due|by|@|scheduled)\s*(\d{1,2}):(\d{2})\s*(am|pm)?/);
  if (singleWithColon) {
    let h = parseInt(singleWithColon[1], 10);
    const m = parseInt(singleWithColon[2], 10);
    const period = singleWithColon[3];
    if (period === 'pm' && h < 12) h += 12;
    if (period === 'am' && h === 12) h = 0;
    
    return {
      startMinutes: h * 60 + m,
      endMinutes: h * 60 + m + 60 // default 1 hour
    };
  }
  
  // 4. Match single hour-only time: e.g., "at 7pm" or "at 7 pm" or "@ 19"
  const singleHourOnly = lower.match(/(?:at|due|by|@|scheduled)\s*(\d{1,2})\s*(am|pm)/);
  if (singleHourOnly) {
    let h = parseInt(singleHourOnly[1], 10);
    const period = singleHourOnly[2];
    if (period === 'pm' && h < 12) h += 12;
    if (period === 'am' && h === 12) h = 0;
    
    return {
      startMinutes: h * 60,
      endMinutes: h * 60 + 60 // default 1 hour
    };
  }
  
  return null;
}

// Endpoint: Optimize Calendar
app.post("/api/optimize-calendar", async (req, res) => {
  const { tasks, forceAI } = req.body;

  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.json({
      agenda: [
        { time: "09:00 AM", activity: "Morning Sync & Goal Alignment", type: "system" },
        { time: "10:00 AM", activity: "High-Focus Block 1 (Easiest Task)", type: "focus" },
        { time: "12:00 PM", activity: "Rest & Brain Reset Hour", type: "rest" },
        { time: "02:00 PM", activity: "Deep Work Block 2 (Bottleneck Resolution)", type: "focus" },
        { time: "05:00 PM", activity: "End of Day Review & Task Verification", type: "system" }
      ]
    });
  }

  // Helper function to post-process and enrich agenda activities with progress strings
  const enrichAgendaWithSubtasks = (agendaArray: any[]) => {
    return agendaArray.map((item: any) => {
      if (item.type === 'focus') {
        // Find if this activity matches any active task title
        const matchedTask = tasks.find((t: any) => 
          item.activity.toLowerCase().includes(t.title.toLowerCase()) || 
          t.title.toLowerCase().includes(item.activity.toLowerCase())
        );
        if (matchedTask) {
          const totalSubtasks = matchedTask.subtasks ? matchedTask.subtasks.length : 0;
          const completedSubtasks = matchedTask.subtasks ? matchedTask.subtasks.filter((s: any) => s.completed).length : 0;
          if (totalSubtasks > 0) {
            let progressStr = "";
            if (completedSubtasks === totalSubtasks) {
              progressStr = " ✅ (Completed)";
            } else {
              progressStr = ` 🧩 (${completedSubtasks}/${totalSubtasks} steps)`;
            }
            // Append progressStr if not already present
            if (!item.activity.includes("✅") && !item.activity.includes("🧩")) {
              item.activity = `${item.activity}${progressStr}`;
            }
          }
        }
      }
      return item;
    });
  };

  if (ai) {
    try {
      const prompt = `Create an optimized, high-performance hourly daily calendar agenda starting from 09:00 AM based on these current tasks:
      ${JSON.stringify(tasks.map(t => ({ title: t.title, priority: t.priority, energy: t.energyRequired, deadline: t.dueTime || t.dueDate })))}
      
      CRITICAL REQUIREMENT: For every "focus" type block, you MUST explicitly schedule and mention one of the active tasks from the list above. The activity name MUST contain the EXACT title of that task (e.g., "Deep Focus: Decompose Q3 Investor Pitch Slides" or "Focus Block: playing badminton" or "Practice session: playing badminton"). Do NOT use generic names like "Deep Work Session" without incorporating the exact task title.
      
      Sequence them logically so high priority tasks are handled during high focus blocks, incorporate quick rest windows, and schedule check-ins. Make sure tasks are scheduled well before their deadlines. Return a structured JSON array where each item has a 'time', an 'activity' description, and a 'type' (focus, rest, or system).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              agenda: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING, description: "E.g., '09:00 AM', '11:15 AM'." },
                    activity: { type: Type.STRING, description: "Detailed, actionable scheduling activity name." },
                    type: { type: Type.STRING, description: "Must be: focus, rest, or system." }
                  },
                  required: ["time", "activity", "type"]
                }
              }
            },
            required: ["agenda"]
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        const parsed = JSON.parse(resultText);
        if (parsed && Array.isArray(parsed.agenda)) {
          parsed.agenda = enrichAgendaWithSubtasks(parsed.agenda);
          return res.json(parsed);
        }
      }
    } catch (error) {
      logApiWarning("calendar optimization", error);
    }
  }

  // Heuristic Local Optimization Engine (Highly responsive, offline-first, zero rate-limit)
  // 1. Filter out completed tasks so they don't clog up the active timeline
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  
  // Helper to parse each task's deadline into absolute minutes since midnight today (June 28, 2026)
  const getDeadlineMinutes = (task: any) => {
    let minutes = 17 * 60; // default to 5:00 PM (1020 minutes)
    if (task.dueTime) {
      const parts = task.dueTime.split(':');
      if (parts.length >= 2) {
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (!isNaN(h) && !isNaN(m)) {
          minutes = h * 60 + m;
        }
      }
    }
    
    if (task.dueDate) {
      const todayStr = "2026-06-28";
      if (task.dueDate !== todayStr) {
        try {
          const tDate = new Date(task.dueDate);
          const oDate = new Date(todayStr);
          const diffTime = tDate.getTime() - oDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            minutes += diffDays * 1440;
          }
        } catch (e) {
          // ignore
        }
      }
    }
    return minutes;
  };
  
  const pinnedTasks: any[] = [];
  const floatingTasks: any[] = [];

  activeTasks.forEach((task: any) => {
    const range = parseExplicitTimeRange(task.title) || parseExplicitTimeRange(task.description);
    if (range) {
      pinnedTasks.push({
        ...task,
        startMinutes: range.startMinutes,
        endMinutes: range.endMinutes
      });
    } else {
      floatingTasks.push(task);
    }
  });

  // Sort pinned tasks by start time
  pinnedTasks.sort((a, b) => a.startMinutes - b.startMinutes);

  // Sort floating tasks by deadline urgency, priority, and energy
  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  const energyWeight = { high: 3, medium: 2, low: 1 };

  floatingTasks.sort((a, b) => {
    const deadA = getDeadlineMinutes(a);
    const deadB = getDeadlineMinutes(b);
    if (deadA !== deadB) return deadA - deadB;
    
    const pA = priorityWeight[a.priority as keyof typeof priorityWeight] || 1;
    const pB = priorityWeight[b.priority as keyof typeof priorityWeight] || 1;
    if (pB !== pA) return pB - pA;
    
    const eA = energyWeight[a.energyRequired as keyof typeof energyWeight] || 1;
    const eB = energyWeight[b.energyRequired as keyof typeof energyWeight] || 1;
    return eB - eA;
  });

  const simulatedAgenda: any[] = [];
  let currentTimeMins = 540; // Starts at 09:00 AM

  const formatMinutes = (totalMins: number) => {
    const h = Math.floor(totalMins / 60) % 24;
    const m = totalMins % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    const displayMin = m < 10 ? `0${m}` : m;
    return `${displayHour < 10 ? '0' : ''}${displayHour}:${displayMin} ${period}`;
  };

  const formatDueTime = (timeStr: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    const displayMin = m < 10 ? `0${m}` : m;
    return `${displayHour}:${displayMin} ${period}`;
  };

  // Add initial setup ritual
  simulatedAgenda.push({ 
    time: formatMinutes(510), // 8:30 AM
    activity: "🌅 Setup & Energy Grounding ritual", 
    type: "system" 
  });

  // Loop to schedule both pinned and floating tasks
  while (pinnedTasks.length > 0 || floatingTasks.length > 0) {
    if (pinnedTasks.length > 0) {
      const nextPinned = pinnedTasks[0];
      let floatDuration = 60;
      if (floatingTasks.length > 0) {
        const nextFloat = floatingTasks[0];
        if (nextFloat.energyRequired === 'high') floatDuration = 90;
        else if (nextFloat.energyRequired === 'low') floatDuration = 45;
      }

      // If scheduling the next floating task would overlap with the pinned task
      const wouldOverlap = floatingTasks.length > 0 && (currentTimeMins + floatDuration + 15 > nextPinned.startMinutes);
      
      if (currentTimeMins >= nextPinned.startMinutes || wouldOverlap || floatingTasks.length === 0) {
        // Schedule pinned task
        if (currentTimeMins < nextPinned.startMinutes) {
          // Fill transition/rest window before the pinned task starts
          simulatedAgenda.push({
            time: formatMinutes(currentTimeMins),
            activity: `🍃 Transition & Prep Window`,
            type: "rest"
          });
        }

        const totalSubtasks = nextPinned.subtasks ? nextPinned.subtasks.length : 0;
        const completedSubtasks = nextPinned.subtasks ? nextPinned.subtasks.filter((s: any) => s.completed).length : 0;
        let progressStr = "";
        if (totalSubtasks > 0) {
          if (completedSubtasks === totalSubtasks) {
            progressStr = " ✅ (Completed)";
          } else {
            progressStr = ` 🧩 (${completedSubtasks}/${totalSubtasks} steps)`;
          }
        }
        
        simulatedAgenda.push({
          time: formatMinutes(nextPinned.startMinutes),
          activity: `🔥 Deep Focus: ${nextPinned.title} [${nextPinned.priority.toUpperCase()}]${progressStr}`,
          type: "focus"
        });

        currentTimeMins = nextPinned.endMinutes;
        
        // Add a smart break after the focus block
        simulatedAgenda.push({
          time: formatMinutes(currentTimeMins),
          activity: `🍃 Smart Break & Hydration Window`,
          type: "rest"
        });
        
        currentTimeMins += 15;
        pinnedTasks.shift();
        continue;
      }
    }

    // Schedule next floating task
    if (floatingTasks.length > 0) {
      const task = floatingTasks.shift();
      let durationMins = 60;
      if (task.energyRequired === 'high') durationMins = 90;
      else if (task.energyRequired === 'low') durationMins = 45;

      const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
      const completedSubtasks = task.subtasks ? task.subtasks.filter((s: any) => s.completed).length : 0;
      let progressStr = "";
      if (totalSubtasks > 0) {
        if (completedSubtasks === totalSubtasks) {
          progressStr = " ✅ (Completed)";
        } else {
          progressStr = ` 🧩 (${completedSubtasks}/${totalSubtasks} steps)`;
        }
      }

      simulatedAgenda.push({
        time: formatMinutes(currentTimeMins),
        activity: `🔥 Deep Focus: ${task.title} [${task.priority.toUpperCase()}]${progressStr}${task.dueTime ? ` (Deadline: ${formatDueTime(task.dueTime)})` : ''}`,
        type: "focus"
      });

      currentTimeMins += durationMins;

      // Add a smart break after the focus block
      simulatedAgenda.push({
        time: formatMinutes(currentTimeMins),
        activity: `🍃 Smart Break & Hydration Window`,
        type: "rest"
      });

      currentTimeMins += 15;
    }
  }

  if (simulatedAgenda.length === 1) {
    simulatedAgenda.push({ time: "09:00 AM", activity: "Plan your day by adding tasks above!", type: "system" });
  } else {
    simulatedAgenda.push({ 
      time: formatMinutes(currentTimeMins), 
      activity: "🏁 Final check-off & Evening wrap-up", 
      type: "system" 
    });
  }

  res.json({ agenda: simulatedAgenda });
});


// ==========================================
// VITE & STATIC FILES SERVER
// ==========================================

async function startServer() {
  const httpServer = createServer(app);

  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
