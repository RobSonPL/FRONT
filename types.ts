
export enum StepId {
  DIAGNOSIS = 1,
  JOURNEY = 2,
  MANIFESTO = 3,
  DASHBOARD = 4,
  VOC = 5,
  SELF_SERVICE = 6,
  SPRINT = 7,
  FEEDBACK = 8,
  PROACTIVE = 9
}

export interface AppState {
  currentStep: StepId;
  diagnosis: {
    feeling: string;
    goal: string;
    problem: string;
    mission?: string;
  };
  journey: {
    channels: string;
    tools: string;
    exampleResponse: string;
    analysis?: string;
  };
  manifesto: {
    adjectives: string;
    form: string;
    forbidden: string;
    preferred: string;
    result?: string;
  };
  dashboard: {
    selectedKpis: string[];
  };
  voc: {
    rawMessages: string;
    analysis?: VocItem[];
  };
  selfService: {
    questions: string;
    faqItems?: FaqItem[];
  };
  proactive: {
    strategy?: string;
  };
}

export interface VocItem {
  problem: string;
  cause: string;
  response: string;
  systemAction: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  proactiveAction: string;
}
