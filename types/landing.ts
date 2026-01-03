// Types for the landing page components

export interface CompetitorData {
  feature: string;
  googleAdX: string;
  magnite: string;
  ourStartup: string;
  tooltip?: string;
}

export interface MoneyFlowItem {
  label: string;
  amount: number;
  isDeduction: boolean;
}

export interface TechnicalMoatCard {
  id: string;
  title: string;
  description: string;
  icon: "dollar-down" | "database-chains";
}

export interface ArchitectureStep {
  id: number;
  title: string;
  subtitle: string;
  highlight?: string;
}

export interface CTAFormData {
  email: string;
}
