/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  BookOpen,
  Inbox,
  Sliders,
  Code2,
  Headphones,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  X,
  Store,
  Monitor
} from 'lucide-react';
import { CompanyProfile, FAQItem, ChatMessage, SupportTicket } from './types';
import { DEFAULT_COMPANY, DEFAULT_FAQS } from './data/defaultFaqs';
import { ChatWidget } from './components/ChatWidget';
import { FaqExplorer } from './components/FaqExplorer';
import { TicketManager } from './components/TicketManager';
import { AdminPanel } from './components/AdminPanel';
import { StoreMockup } from './components/StoreMockup';
import { EscalationModal } from './components/EscalationModal';
import { EmbedCodeModal } from './components/EmbedCodeModal';
import { playChime } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge' | 'tickets' | 'admin'>('chat');
  const [chatLayoutMode, setChatLayoutMode] = useState<'portal' | 'store'>('store');
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY);
  const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQS);
  const [isFloatingWidgetOpen, setIsFloatingWidgetOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateSubject, setEscalateSubject] = useState('');
  const [escalateSummary, setEscalateSummary] = useState('');
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TICK-9081',
      customerName: 'Sarah Jenkins',
      customerEmail: 'sarah.j@example.com',
      subject: 'Carrier marked package as delivered but not found',
      summary: 'Customer checked porch and mailroom, carrier tracking says delivered 2 hours ago.',
      priority: 'high',
      status: 'in_progress',
      category: 'Orders & Shipping',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      chatExcerpt: 'User: Carrier shows delivered but nothing is here.\nBot: Advised checking neighbors and opened expedited trace ticket.',
    },
    {
      id: 'TICK-9045',
      customerName: 'Marcus Vance',
      customerEmail: 'm.vance@company.org',
      subject: 'Request wholesale tax exemption invoice',
      summary: 'Bulk order inquiry with 501(c)(3) certificate request.',
      priority: 'medium',
      status: 'open',
      category: 'Billing & Account',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      chatExcerpt: 'User: How do I submit my tax exemption form for our order?\nBot: Offered to open ticket for billing department.',
    },
  ]);

  // Initial welcome message for the chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: DEFAULT_COMPANY.greetingMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'How do I track my order status?',
        'What is your return policy?',
        'Do you ship internationally?',
        'What if an item is damaged?',
      ],
    },
  ]);

  // Fetch initial tickets from backend if available
  useEffect(() => {
    fetch('/api/tickets')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.tickets && Array.isArray(data.tickets)) {
          setTickets(data.tickets);
        }
      })
      .catch(() => {
        // In-memory fallback
      });
  }, []);

  const handleOpenEscalate = (subject?: string, summary?: string) => {
    setEscalateSubject(subject || 'Customer Care Escalation');
    setEscalateSummary(summary || '');
    setIsEscalateModalOpen(true);
    playChime('escalate');
  };

  const handleSubmitTicket = async (ticketData: {
    customerName: string;
    customerEmail: string;
    subject: string;
    summary: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
  }): Promise<SupportTicket | null> => {
    try {
      const chatExcerpt = messages
        .slice(-4)
        .map((m) => `${m.role === 'user' ? 'Customer' : 'Bot'}: ${m.content}`)
        .join('\n');

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ticketData, chatExcerpt }),
      });

      if (!res.ok) throw new Error('Failed to create ticket');
      const data = await res.json();
      const newTicket: SupportTicket = data.ticket;

      setTickets((prev) => [newTicket, ...prev]);

      // Inform user in chat
      const botConfirmMsg: ChatMessage = {
        id: `ticket-confirm-${Date.now()}`,
        role: 'assistant',
        content: `I've opened support ticket #${newTicket.id} with priority level "${newTicket.priority.toUpperCase()}". An agent from the ${company.name} customer care team will contact you at ${newTicket.customerEmail} promptly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ticketCreated: newTicket,
      };
      setMessages((prev) => [...prev, botConfirmMsg]);

      return newTicket;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleRateFaq = (faqId: string, helpful: boolean) => {
    setFaqs((prev) =>
      prev.map((f) => {
        if (f.id !== faqId) return f;
        return {
          ...f,
          helpfulCount: helpful ? f.helpfulCount + 1 : f.helpfulCount,
          notHelpfulCount: !helpful ? f.notHelpfulCount + 1 : f.notHelpfulCount,
        };
      })
    );
  };

  const handleAskBotAboutFaq = (questionText: string) => {
    setActiveTab('chat');
    if (chatLayoutMode === 'store') {
      setIsFloatingWidgetOpen(true);
    }

    // Trigger message immediately
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Send query to /api/chat
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: questionText,
        history: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        contextFaqs: faqs,
        companyProfile: company,
        tone: company.tone,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const matchedFaqObjects = Array.isArray(data.matchedFaqIds)
          ? data.matchedFaqIds
              .map((id: string) => {
                const item = faqs.find((f) => f.id === id);
                return item ? { id: item.id, question: item.question } : null;
              })
              .filter(Boolean) as { id: string; question: string }[]
          : [];

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: data.reply || "Here is what I found in our policy documents.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          matchedFaqs: matchedFaqObjects,
          suggestEscalation: data.suggestEscalation,
          suggestedFollowUps: data.suggestedFollowUps || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
        playChime('message');
      })
      .catch(() => {
        // Fallback
      });
  };

  const handleUpdateTicketStatus = (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
  };

  const openTicketCount = tickets.filter((t) => t.status === 'open').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Product Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900">NovaDesk</span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini 3.8 AI
                </span>
              </div>
              <p className="text-2xs text-slate-500 hidden sm:block">
                Customer Support FAQ Assistant & Knowledge Hub
              </p>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Customer Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'knowledge'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>FAQ Knowledge Base</span>
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'tickets'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Inbox className="w-4 h-4 text-indigo-600" />
              <span>Escalations</span>
              {openTicketCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-2xs font-bold flex items-center justify-center">
                  {openTicketCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Bot Studio</span>
            </button>
          </nav>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEmbedModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
              title="Get website integration code"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Embed Widget</span>
            </button>

            <button
              onClick={() => handleOpenEscalate('Live Customer Care Escalation')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Human Agent</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* TAB 1: CUSTOMER CHAT */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            {/* View Mode Switcher: Dedicated Portal vs Storefront Simulation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {chatLayoutMode === 'store'
                    ? 'Customer Storefront with Floating Widget'
                    : 'Customer Self-Service Support Portal'}
                </h2>
                <p className="text-xs text-slate-500">
                  Active company: <span className="font-semibold text-indigo-600">{company.name}</span> ({company.industry}) · Tone: <span className="capitalize">{company.tone}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xs text-slate-400 font-semibold uppercase">Layout:</span>
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => {
                      setChatLayoutMode('store');
                      setIsFloatingWidgetOpen(true);
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                      chatLayoutMode === 'store'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Store Mockup & Widget</span>
                  </button>

                  <button
                    onClick={() => setChatLayoutMode('portal')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                      chatLayoutMode === 'portal'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Standalone Portal</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Layout 1: Storefront with Floating Widget */}
            {chatLayoutMode === 'store' && (
              <div className="relative">
                <StoreMockup
                  company={company}
                  onOpenWidget={(prompt) => {
                    setIsFloatingWidgetOpen(true);
                    if (prompt) handleAskBotAboutFaq(prompt);
                  }}
                  isWidgetOpen={isFloatingWidgetOpen}
                />

                {/* Floating Widget Launcher Button (Bottom Right) */}
                {!isFloatingWidgetOpen && (
                  <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Speech teaser prompt bubble */}
                    <div
                      onClick={() => setIsFloatingWidgetOpen(true)}
                      className="hidden sm:flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200 text-xs font-medium text-slate-800 cursor-pointer hover:border-indigo-300 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Have a question? Ask {company.name} AI</span>
                    </div>

                    <button
                      onClick={() => {
                        setIsFloatingWidgetOpen(true);
                        playChime('message');
                      }}
                      className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-indigo-300 cursor-pointer"
                      title="Open Support Chat"
                    >
                      <MessageSquare className="w-6 h-6" />
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                    </button>
                  </div>
                )}

                {/* Floating Chat Modal Window (Bottom Right) */}
                {isFloatingWidgetOpen && (
                  <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[600px] max-h-[85vh] animate-in fade-in slide-in-from-bottom-6 duration-200">
                    <ChatWidget
                      company={company}
                      faqs={faqs}
                      messages={messages}
                      setMessages={setMessages}
                      onOpenEscalate={handleOpenEscalate}
                      onFaqClick={(faqId) => {
                        const target = faqs.find((f) => f.id === faqId);
                        if (target) {
                          setActiveTab('knowledge');
                        }
                      }}
                      isFloating={true}
                      onCloseFloating={() => setIsFloatingWidgetOpen(false)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Layout 2: Standalone Full Portal View */}
            {chatLayoutMode === 'portal' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[720px]">
                {/* Left: Chat Widget */}
                <div className="lg:col-span-8 h-full">
                  <ChatWidget
                    company={company}
                    faqs={faqs}
                    messages={messages}
                    setMessages={setMessages}
                    onOpenEscalate={handleOpenEscalate}
                    onFaqClick={() => setActiveTab('knowledge')}
                  />
                </div>

                {/* Right: Quick Knowledge Reference & Support Info */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Verified policies card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Knowledge Base</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      This chatbot answers questions using {faqs.length} verified policies approved by {company.name}.
                    </p>
                    <div className="space-y-1.5 pt-1">
                      {faqs.slice(0, 4).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => handleAskBotAboutFaq(f.question)}
                          className="w-full text-left p-2 rounded-xl text-xs text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-between group"
                        >
                          <span className="truncate pr-2">{f.question}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveTab('knowledge')}
                      className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 pt-2 block"
                    >
                      Browse All {faqs.length} FAQ Articles →
                    </button>
                  </div>

                  {/* Customer Care Operating Hours */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <Headphones className="w-4 h-4 text-indigo-600" />
                      <span>Human Support Hours</span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hours:</span>
                        <span className="font-medium text-slate-800">{company.supportHours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="font-medium text-slate-800">{company.supportEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Response SLA:</span>
                        <span className="font-medium text-emerald-600">&lt; 15 minutes</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenEscalate('Customer Portal Assistance')}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition-colors"
                    >
                      Open Human Support Ticket
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FAQ KNOWLEDGE BASE EXPLORER */}
        {activeTab === 'knowledge' && (
          <FaqExplorer
            faqs={faqs}
            company={company}
            onAskBot={handleAskBotAboutFaq}
            onRateFaq={handleRateFaq}
          />
        )}

        {/* TAB 3: TICKET ESCALATIONS DESK */}
        {activeTab === 'tickets' && (
          <TicketManager
            tickets={tickets}
            onUpdateTicketStatus={handleUpdateTicketStatus}
          />
        )}

        {/* TAB 4: BOT & FAQ STUDIO */}
        {activeTab === 'admin' && (
          <AdminPanel
            company={company}
            setCompany={setCompany}
            faqs={faqs}
            setFaqs={setFaqs}
          />
        )}
      </main>

      {/* Escalation Ticket Modal */}
      <EscalationModal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        onSubmit={handleSubmitTicket}
        company={company}
        prefillSubject={escalateSubject}
        prefillSummary={escalateSummary}
      />

      {/* Embed Code Modal */}
      <EmbedCodeModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        company={company}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">NovaDesk Customer FAQ AI</span>
            <span>·</span>
            <span>Powered by Gemini 3.8 Flash SDK</span>
            <span>·</span>
            <span>Strict Knowledge Base Grounding</span>
          </div>
          <div className="flex items-center gap-4 text-2xs">
            <button onClick={() => setIsEmbedModalOpen(true)} className="hover:text-indigo-600">
              Embed on Website
            </button>
            <button onClick={() => setActiveTab('admin')} className="hover:text-indigo-600">
              Configure FAQs
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
