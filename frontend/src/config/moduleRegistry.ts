import { 
  Building2, 
  History, 
  Target, 
  TrendingUp, 
  Map, 
  CalendarDays, 
  PenTool, 
  Send, 
  BarChart2,
  Users,
  BarChart3,
  BrainCircuit,
  Lightbulb,
  Settings,
  type LucideIcon
} from 'lucide-react';

export type ModuleStatus = 'Completed' | 'Available' | 'Active' | 'Pending' | 'Waiting' | 'Running' | 'Processing' | 'Locked' | 'Error';

export interface ModuleDependency {
  id: string;
  name: string;
}

export interface AIModule {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  route: string;
  status: ModuleStatus;
  dependencies: ModuleDependency[];
  estimatedSetupTime: string;
  nextAction: string;
  available: boolean;
  completed: boolean;
  order: number;
  category: 'core' | 'strategy' | 'execution' | 'analytics';
}

export const moduleRegistry: AIModule[] = [
  {
    id: 'business-profile',
    name: 'Business Profile',
    description: 'Provide core details about your business so the AI can understand your value proposition and brand voice.',
    icon: Building2,
    route: '/business-profile',
    status: 'Completed',
    dependencies: [],
    estimatedSetupTime: '5 Minutes',
    nextAction: 'Update Profile Details',
    available: true,
    completed: true,
    order: 1,
    category: 'core'
  },
  {
    id: 'historical-analysis',
    name: 'Content Intelligence',
    description: 'Analyze historical LinkedIn posts to understand previous content, engagement, writing style, and posting behavior.',
    icon: History,
    route: '/historical-analysis',
    status: 'Available',
    dependencies: [{ id: 'business-profile', name: 'Business Profile' }],
    estimatedSetupTime: '2 Minutes',
    nextAction: 'Import LinkedIn History',
    available: true,
    completed: false,
    order: 2,
    category: 'core'
  },
  {
    id: 'brand-intelligence',
    name: 'Brand Intelligence',
    description: 'The single source of truth for your AI Agent. Generated from your content history.',
    icon: Target,
    route: '/brand-intelligence',
    status: 'Available',
    dependencies: [{ id: 'historical-analysis', name: 'Content Intelligence' }],
    estimatedSetupTime: 'Automatic',
    nextAction: 'View Brand Profile',
    available: true,
    completed: true,
    order: 3,
    category: 'core'
  },
  {
    id: 'competitor-analysis',
    name: 'Competitor Analysis',
    description: 'Analyze competitor profiles to identify successful content strategies, audience gaps, and growth opportunities.',
    icon: Target,
    route: '/competitor-analysis',
    status: 'Available',
    dependencies: [{ id: 'brand-intelligence', name: 'Brand Intelligence' }],
    estimatedSetupTime: '5 Minutes',
    nextAction: 'Add Competitors',
    available: true,
    completed: false,
    order: 3,
    category: 'core'
  },
  {
    id: 'trend-research',
    name: 'Trend Research',
    description: 'Discover emerging industry trends and viral discussion topics relevant to your target audience.',
    icon: TrendingUp,
    route: '/trend-research',
    status: 'Available',
    dependencies: [{ id: 'competitor-analysis', name: 'Competitor Analysis' }],
    estimatedSetupTime: 'Automatic',
    nextAction: 'Start Market Research',
    available: true,
    completed: false,
    order: 4,
    category: 'strategy'
  },
  {
    id: 'strategy-planner',
    name: 'Strategy Planner',
    description: 'Generate high-level monthly and quarterly content strategies based on insights and business goals.',
    icon: Map,
    route: '/strategy-planner',
    status: 'Available',
    dependencies: [{ id: 'trend-research', name: 'Trend Research' }],
    estimatedSetupTime: '3 Minutes',
    nextAction: 'Generate Monthly Strategy',
    available: true,
    completed: false,
    order: 5,
    category: 'strategy'
  },
  {
    id: 'weekly-planner',
    name: 'Weekly Planner',
    description: 'Break down high-level strategies into actionable weekly content calendars.',
    icon: CalendarDays,
    route: '/weekly-planner',
    status: 'Available',
    dependencies: [{ id: 'strategy-planner', name: 'Strategy Planner' }],
    estimatedSetupTime: '2 Minutes',
    nextAction: 'Generate Weekly Plan',
    available: true,
    completed: false,
    order: 6,
    category: 'strategy'
  },
  {
    id: 'content-generator',
    name: 'Content Generator',
    description: 'Automatically draft LinkedIn posts based on the weekly plan and AI insights.',
    icon: PenTool,
    route: '/content-generator',
    status: 'Available',
    dependencies: [{ id: 'weekly-planner', name: 'Weekly Planner' }],
    estimatedSetupTime: '1 Minute',
    nextAction: 'Generate First Content',
    available: true,
    completed: false,
    order: 7,
    category: 'execution'
  },
  {
    id: 'publishing-assistant',
    name: 'Publishing Assistant',
    description: 'Review, schedule, and automatically publish generated content to LinkedIn.',
    icon: Send,
    route: '/publishing-assistant',
    status: 'Available',
    dependencies: [{ id: 'content-generator', name: 'Content Generator' }],
    estimatedSetupTime: 'API Auth',
    nextAction: 'Connect LinkedIn Account',
    available: true,
    completed: false,
    order: 8,
    category: 'execution'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Measure content performance and feed data back into the AI to improve future strategies.',
    icon: BarChart2,
    route: '/analytics',
    status: 'Available',
    dependencies: [{ id: 'publishing-assistant', name: 'Publishing Assistant' }],
    estimatedSetupTime: 'Automatic',
    nextAction: 'View Performance',
    available: true,
    completed: true,
    order: 9,
    category: 'analytics'
  },
  {
    id: 'performance-intelligence',
    name: 'AI Intelligence',
    description: 'Transform raw analytics into actionable AI-driven business intelligence and strategy insights.',
    icon: BrainCircuit,
    route: '/performance-intelligence',
    status: 'Available',
    dependencies: [{ id: 'analytics', name: 'Analytics' }],
    estimatedSetupTime: 'Automatic',
    nextAction: 'View Insights',
    available: true,
    completed: true,
    order: 10,
    category: 'analytics'
  },
  {
    id: 'recommendations',
    name: 'Optimization Engine',
    description: 'Autonomous recommendation engine that continuously optimizes your content strategy.',
    icon: Lightbulb,
    route: '/recommendations',
    status: 'Available',
    dependencies: [{ id: 'performance-intelligence', name: 'AI Intelligence' }],
    estimatedSetupTime: 'Automatic',
    nextAction: 'View Recommendations',
    available: true,
    completed: true,
    order: 11,
    category: 'analytics'
  },
  {
    id: 'settings',
    name: 'Settings Center',
    description: 'Centralized configuration hub and AI Memory diagnostics.',
    icon: Settings,
    route: '/settings',
    status: 'Available',
    dependencies: [],
    estimatedSetupTime: 'Automatic',
    nextAction: 'Configure Workspace',
    available: true,
    completed: false,
    order: 12,
    category: 'foundation'
  }
];

export const getModuleById = (id: string): AIModule | undefined => {
  return moduleRegistry.find(m => m.id === id);
};
