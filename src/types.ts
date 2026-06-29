/**
 * Types for the Lifeline AI application and blueprint explorer
 */

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date or time
  dueTime: string; // HH:MM
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed';
  category: string;
  createdAt: string;
  energyRequired: 'low' | 'medium' | 'high';
  aiPriorityScore?: number;
  deadlineRisk?: {
    classification: 'Low' | 'Medium' | 'High' | 'Extreme';
    score: number; // 0-100
    reason: string;
    actionSteps: string[];
    coachingPush: string;
  };
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
  riskFlag?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'agent_planner' | 'agent_predictor' | 'agent_coach';
  text: string;
  timestamp: string;
}

export interface CoachPersona {
  id: string;
  name: string;
  avatar: string;
  description: string;
  tone: string;
}

export interface BlueprintSection {
  id: string;
  title: string;
  category: 'executive' | 'ai_agent' | 'system_tech' | 'ux_wireframes' | 'submission';
  content: string;
  mermaidDiagram?: string;
  tableData?: any[];
  extraDetails?: string;
}
