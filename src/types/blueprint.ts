export type ProvenanceOrigin = 'user' | 'ai_proposed' | 'ai_assumed' | 'imported';
export type ReviewStatus = 'draft' | 'proposed' | 'accepted' | 'rejected' | 'superseded';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type PriorityLevel = 'must' | 'should' | 'could' | 'wont';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TestVerification = 'not_run' | 'passed' | 'failed' | 'blocked';

export interface ProvenanceMetadata {
  origin: ProvenanceOrigin;
  status: ReviewStatus;
  confidence?: ConfidenceLevel;
  confidenceReason?: string;
  locked?: boolean;
}

export interface RequirementItem extends ProvenanceMetadata {
  displayId: string; // e.g. FR-001, NFR-002
  kind: 'functional' | 'non_functional';
  statement: string;
  priority: PriorityLevel;
  category: string;
  rationale: string;
  acceptanceCriteria: string[];
  derivesFrom: string[];
}

export interface UserStoryItem extends ProvenanceMetadata {
  displayId: string; // e.g. US-001
  persona: string;
  statement: string;
  acceptanceCriteria: string[];
  derivesFrom?: string[];
}

export interface ArchitectureComponent extends ProvenanceMetadata {
  displayId: string; // e.g. CMP-001
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'service' | 'gateway' | 'worker';
  technology: string;
  responsibilities: string[];
  satisfies: string[];
}

export interface DatabaseEntity extends ProvenanceMetadata {
  displayId: string; // e.g. ENT-001
  name: string;
  description: string;
  fields: {
    name: string;
    type: string;
    isPrimary?: boolean;
    isNullable?: boolean;
    references?: string;
    description?: string;
  }[];
  rlsPolicies: string[];
}

export interface ApiEndpoint extends ProvenanceMetadata {
  displayId: string; // e.g. API-001
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  summary: string;
  authRequired: boolean;
  parameters: string[];
  responseSchema: string;
  satisfiesReq: string;
}

export interface TaskItem extends Omit<ProvenanceMetadata, 'status'> {
  displayId: string; // e.g. TSK-001
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  milestoneId: string;
  effortMinDays: number;
  effortMaxDays: number;
  dependencies: string[]; // e.g. ['TSK-002']
  implementsReq: string; // e.g. 'FR-001'
}

export interface MilestoneItem {
  id: string; // e.g. MS-01
  title: string;
  phase: string;
  dueDate: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface TestCaseItem extends ProvenanceMetadata {
  displayId: string; // e.g. TC-001
  category: 'functional' | 'security' | 'permissions' | 'edge' | 'accessibility' | 'reliability';
  objective: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  verifiesReq: string;
  verification: TestVerification;
  lastRun?: {
    executedBy: string;
    executedAt: string;
    notes: string;
  };
}

export interface DecisionItem extends ProvenanceMetadata {
  displayId: string; // e.g. DEC-001
  context: string;
  decision: string;
  alternatives: string[];
  consequences: string;
  motivatedBy: string[];
}

export interface RiskItem {
  displayId: string; // e.g. RSK-001
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  mitigatedBy?: string;
}

export interface ProjectData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  type: string;
  stage: 'capture' | 'define' | 'design' | 'plan' | 'deliver';
  updatedAt: string;
  constraints: {
    appType: string;
    stack: string[];
    skills: string;
    budget: string;
    timeline: string;
    hosting: string;
  };
  requirements: RequirementItem[];
  userStories: UserStoryItem[];
  components: ArchitectureComponent[];
  entities: DatabaseEntity[];
  endpoints: ApiEndpoint[];
  tasks: TaskItem[];
  milestones: MilestoneItem[];
  testCases: TestCaseItem[];
  decisions: DecisionItem[];
  risks: RiskItem[];
}
