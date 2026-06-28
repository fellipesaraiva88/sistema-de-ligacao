export interface PromptConfig {
  id: string;
  name: string; // Name of the saved template configuration
  agentName: string;
  agentAge: number;
  agentRole: string;
  companyName: string;
  productFocus: string;
  leadSource: string;
  targetCity: string;
  focusNeighborhoods: string;
  experienceYears: number;
  childrenText: string;
  agentTone: string;
  mainPains: string[];
  humanTouchVariation: string;
  objections: {
    title: string;
    response: string;
  }[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
