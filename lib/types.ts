// Shapes mirror the Architect `/apps/{id}/state` payload.
// Everything is optional/defensive — Architect apps vary in how much state they carry.

export interface ChatMessage {
  id?: string;
  content?: string;
  sender?: string; // "user" | "agent"
  type?: string; // for lyra build-log events: Status, Write, Architect, Agent, ...
  eventType?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentConfig {
  agent_id?: string;
  name?: string;
  description?: string;
  agent_role?: string;
  agent_goal?: string;
  agent_instructions?: string;
  provider_id?: string;
  model?: string;
  temperature?: number;
  top_p?: number;
  features?: unknown[];
  has_memory?: boolean;
  has_knowledge_base?: boolean;
  tool_configs?: unknown[];
  created_at?: string;
}

export interface WorkflowNode {
  id: string;
  type?: string;
  label?: string;
  nodeCategory?: string;
}

export interface WorkflowEdge {
  source: string;
  target: string;
}

export interface Workflow {
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  created_at?: string;
}

export interface AppState {
  app_uri?: string;
  sandbox_url?: string;
  repository_init_status?: string;
  repository_initialized?: boolean;
  currentCommitId?: string;
  user_email?: string;
  user_name?: string;
  prdContent?: string;
  colorPalette?: string;
  mermaidDiagram?: string;
  selectedThemeId?: string;
  changePlannerMode?: string;
  requirementsMessages?: ChatMessage[];
  myraChatMessages?: ChatMessage[];
  lyraChatMessages?: ChatMessage[];
  agents?: AgentConfig[];
  workflow?: Workflow;
  workflowData?: Workflow;
  [key: string]: unknown;
}

export interface AppStateResponse {
  app_id: string;
  state: AppState;
}
