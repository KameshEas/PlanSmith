export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Task {
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Milestone {
  name: string;
  deadline?: string;
  description?: string;
}

export interface ProjectPlan {
  title: string;
  overview: {
    summary: string;
    objectives: string[];
    successCriteria: string[];
  };
  features: {
    category: string;
    items: string[];
  }[];
  scope: {
    included: string[];
    excluded: string[];
  };
  timeline: {
    milestones: Milestone[];
  };
  tasks: {
    phase: string;
    items: string[];
  }[];
  resources: {
    tools: string[];
    people: string[];
    materials: string[];
  };
  risks: {
    risk: string;
    mitigation?: string;
  }[];
  nextSteps: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  CHATTING = 'CHATTING',
  GENERATING_PLAN = 'GENERATING_PLAN',
}