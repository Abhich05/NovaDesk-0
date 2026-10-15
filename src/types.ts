export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Orders & Shipping' | 'Returns & Refunds' | 'Billing & Account' | 'Products & Services' | 'Technical Support' | 'General';
  keywords: string[];
  helpfulCount: number;
  notHelpfulCount: number;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  matchedFaqs?: { id: string; question: string }[];
  feedback?: 'helpful' | 'unhelpful';
  feedbackComment?: string;
  suggestEscalation?: boolean;
  suggestedFollowUps?: string[];
  ticketCreated?: SupportTicket;
}

export interface SupportTicket {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  summary: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  category: string;
  createdAt: string;
  chatExcerpt?: string;
}

export type BrandTone = 'friendly' | 'professional' | 'concise' | 'technical';

export interface CompanyProfile {
  name: string;
  tagline: string;
  industry: 'Ecommerce' | 'SaaS' | 'Services';
  brandColor: 'indigo' | 'emerald' | 'blue' | 'purple' | 'amber';
  supportEmail: string;
  supportHours: string;
  tone: BrandTone;
  greetingMessage: string;
}
