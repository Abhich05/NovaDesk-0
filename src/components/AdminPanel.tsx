import React, { useState } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Sparkles,
  Building2,
  FileQuestion,
  CheckCircle,
  HelpCircle,
  Tag
} from 'lucide-react';
import { CompanyProfile, FAQItem, BrandTone } from '../types';
import { DEFAULT_COMPANY, DEFAULT_FAQS } from '../data/defaultFaqs';

interface AdminPanelProps {
  company: CompanyProfile;
  setCompany: React.Dispatch<React.SetStateAction<CompanyProfile>>;
  faqs: FAQItem[];
  setFaqs: React.Dispatch<React.SetStateAction<FAQItem[]>>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  company,
  setCompany,
  faqs,
  setFaqs,
}) => {
  const [activeTab, setActiveTab] = useState<'faqs' | 'company'>('faqs');
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // New FAQ form state
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState<FAQItem['category']>('General');
  const [newKeywords, setNewKeywords] = useState('');

  const showNotification = (msg: string) => {
    setSaveBanner(msg);
    setTimeout(() => setSaveBanner(null), 3000);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification('Company branding and bot configuration saved!');
  };

  const handleApplyPreset = (preset: 'ecommerce' | 'saas' | 'fintech') => {
    if (preset === 'ecommerce') {
      setCompany(DEFAULT_COMPANY);
      setFaqs(DEFAULT_FAQS);
      showNotification('Loaded AuraStyle E-commerce preset!');
    } else if (preset === 'saas') {
      setCompany({
        name: 'CloudPulse Metrics',
        tagline: 'Real-time observability and telemetry for cloud infrastructure',
        industry: 'SaaS',
        brandColor: 'blue',
        supportEmail: 'care@cloudpulse.io',
        supportHours: '24/7/365 Global SRE Support',
        tone: 'technical',
        greetingMessage: 'Hello engineer! I am CloudPulse AI. Ask me about API rate limits, SSO integration, webhook retries, or billing.',
      });
      setFaqs([
        {
          id: 'saas-1',
          question: 'What are the API rate limits and quotas?',
          answer: 'Standard plans include 1,000 requests per minute with burst allowance up to 2,500 rpm. Enterprise plans have uncapped dedicated endpoints with 99.99% SLA. Headers X-RateLimit-Remaining and X-RateLimit-Reset are returned on every request.',
          category: 'Technical Support',
          keywords: ['api', 'rate limit', 'quota', 'burst', 'headers'],
          helpfulCount: 142,
          notHelpfulCount: 4,
          updatedAt: '2026-03-01',
        },
        {
          id: 'saas-2',
          question: 'How do I set up SAML 2.0 / Okta Single Sign-On (SSO)?',
          answer: 'Navigate to Organization Settings > Security > Single Sign-On. Upload your Identity Provider (IdP) metadata XML or paste your SSO URL and x.509 certificate. We support Okta, Azure AD, Google Workspace, and PingFederate with SCIM provisioning.',
          category: 'Billing & Account',
          keywords: ['sso', 'saml', 'okta', 'azure', 'authentication', 'scim'],
          helpfulCount: 98,
          notHelpfulCount: 2,
          updatedAt: '2026-02-15',
        },
        {
          id: 'saas-3',
          question: 'How does team seat billing work on prorated plans?',
          answer: 'When you invite new team members mid-billing cycle, their access is prorated to the exact remaining days of the current month. If a seat is de-provisioned, the remaining credit automatically applies to your next invoice.',
          category: 'Billing & Account',
          keywords: ['seats', 'pricing', 'billing', 'prorated', 'invoice'],
          helpfulCount: 77,
          notHelpfulCount: 1,
          updatedAt: '2026-03-10',
        },
        {
          id: 'saas-4',
          question: 'Where can I find compliance certificates (SOC 2, HIPAA, GDPR)?',
          answer: 'You can download our SOC 2 Type II audit report, ISO 27001 certificate, and request a signed Business Associate Agreement (BAA) directly inside the Trust Center or by emailing security@cloudpulse.io.',
          category: 'General',
          keywords: ['compliance', 'soc2', 'hipaa', 'gdpr', 'security', 'trust center'],
          helpfulCount: 112,
          notHelpfulCount: 3,
          updatedAt: '2026-02-28',
        },
      ]);
      showNotification('Loaded CloudPulse SaaS preset!');
    } else if (preset === 'fintech') {
      setCompany({
        name: 'Apex Digital Bank',
        tagline: 'Modern high-yield banking & business treasury',
        industry: 'Services',
        brandColor: 'emerald',
        supportEmail: 'priority@apexbank.com',
        supportHours: 'Mon-Sun, 7:00 AM - 11:00 PM EST',
        tone: 'professional',
        greetingMessage: 'Welcome to Apex Bank customer care. How can I assist with your cards, wire transfers, or FDIC protection today?',
      });
      setFaqs([
        {
          id: 'fin-1',
          question: 'What is the FDIC insurance coverage on high-yield accounts?',
          answer: 'Deposits are FDIC-insured up to $2,500,000 through our sweep network of partner banks. Standard individual accounts maintain baseline $250,000 per depositor per ownership category.',
          category: 'Billing & Account',
          keywords: ['fdic', 'insurance', 'coverage', 'sweep', 'deposit'],
          helpfulCount: 220,
          notHelpfulCount: 5,
          updatedAt: '2026-03-05',
        },
        {
          id: 'fin-2',
          question: 'How do I freeze a lost debit card or report unauthorized charges?',
          answer: 'Tap "Cards" in your mobile app and toggle "Instant Lock" to prevent all transactions immediately. To dispute a charge, tap the specific transaction and select "Report Suspicious Activity". A replacement card is dispatched via priority courier at no cost.',
          category: 'Billing & Account',
          keywords: ['freeze card', 'lost card', 'fraud', 'unauthorized', 'dispute'],
          helpfulCount: 310,
          notHelpfulCount: 8,
          updatedAt: '2026-03-11',
        },
      ]);
      showNotification('Loaded Apex Digital Bank preset!');
    }
  };

  const handleCreateFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newItem: FAQItem = {
      id: `custom-faq-${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      category: newCategory,
      keywords: newKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      helpfulCount: 0,
      notHelpfulCount: 0,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setFaqs([newItem, ...faqs]);
    setNewQuestion('');
    setNewAnswer('');
    setNewKeywords('');
    setIsCreatingNew(false);
    showNotification('New FAQ article published to bot knowledge base!');
  };

  const handleUpdateFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;

    setFaqs((prev) =>
      prev.map((f) =>
        f.id === editingFaq.id
          ? {
              ...editingFaq,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : f
      )
    );

    setEditingFaq(null);
    showNotification('FAQ article updated successfully!');
  };

  const handleDeleteFaq = (id: string) => {
    if (window.confirm('Delete this FAQ from the knowledge base?')) {
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      showNotification('FAQ article deleted.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Notification */}
      {saveBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Bot & Knowledge Base Studio
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure company branding, customer tone, and modify live FAQs used by the Gemini AI assistant.
          </p>
        </div>

        {/* Quick Industry Presets */}
        <div className="flex items-center gap-2">
          <span className="text-2xs uppercase font-semibold text-slate-400">Presets:</span>
          <button
            onClick={() => handleApplyPreset('ecommerce')}
            className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
          >
            E-Commerce
          </button>
          <button
            onClick={() => handleApplyPreset('saas')}
            className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
          >
            SaaS
          </button>
          <button
            onClick={() => handleApplyPreset('fintech')}
            className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Fintech
          </button>
        </div>
      </div>

      {/* Tab controls */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('faqs')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'faqs'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>Manage Knowledge Base ({faqs.length} FAQs)</span>
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'company'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Bot Personality & Company Settings</span>
        </button>
      </div>

      {/* TAB 1: FAQ Management */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Changes update immediately in both the FAQ Explorer and the Chatbot AI's reference context.
            </span>
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreatingNew ? 'Cancel' : 'Add New FAQ'}</span>
            </button>
          </div>

          {/* New FAQ Form */}
          {isCreatingNew && (
            <form
              onSubmit={handleCreateFaq}
              className="p-5 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-3"
            >
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                Create New FAQ Article
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Question
                </label>
                <input
                  type="text"
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. How do I change my subscription billing frequency?"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Orders & Shipping">Orders & Shipping</option>
                    <option value="Returns & Refunds">Returns & Refunds</option>
                    <option value="Billing & Account">Billing & Account</option>
                    <option value="Products & Services">Products & Services</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Search Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newKeywords}
                    onChange={(e) => setNewKeywords(e.target.value)}
                    placeholder="e.g. annual, monthly, billing, switch"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Answer / Policy
                </label>
                <textarea
                  rows={3}
                  required
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Detailed, clear step-by-step instructions or policy details for the customer..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Publish Article
                </button>
              </div>
            </form>
          )}

          {/* Edit Existing Modal */}
          {editingFaq && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
              <form
                onSubmit={handleUpdateFaq}
                className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900 text-sm">Edit FAQ Article</h3>
                  <button
                    type="button"
                    onClick={() => setEditingFaq(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFaq.question}
                    onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editingFaq.category}
                    onChange={(e) =>
                      setEditingFaq({ ...editingFaq, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Orders & Shipping">Orders & Shipping</option>
                    <option value="Returns & Refunds">Returns & Refunds</option>
                    <option value="Billing & Account">Billing & Account</option>
                    <option value="Products & Services">Products & Services</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Answer Policy
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editingFaq.answer}
                    onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingFaq(null)}
                    className="px-3 py-1.5 text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* FAQ Table List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-2xs">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2 text-2xs text-slate-400">
                    <span className="font-medium text-indigo-600">{faq.category}</span>
                    <span>·</span>
                    <span>Updated {faq.updatedAt}</span>
                    <span>·</span>
                    <span>
                      {faq.helpfulCount} helpful ({faq.notHelpfulCount} unhelpful)
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">{faq.question}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{faq.answer}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pt-1">
                  <button
                    onClick={() => setEditingFaq(faq)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit FAQ"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Company & Personality Settings */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Brand Name
              </label>
              <input
                type="text"
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={company.tagline}
                onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={company.supportEmail}
                onChange={(e) => setCompany({ ...company, supportEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operating Support Hours
              </label>
              <input
                type="text"
                value={company.supportHours}
                onChange={(e) => setCompany({ ...company, supportHours: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                AI Persona Tone
              </label>
              <select
                value={company.tone}
                onChange={(e) => setCompany({ ...company, tone: e.target.value as BrandTone })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              >
                <option value="friendly">Friendly & Empathetic (Warm, conversational)</option>
                <option value="professional">Professional & Direct (Formal, polite)</option>
                <option value="concise">Concise & Swift (Bullet points, minimal chit-chat)</option>
                <option value="technical">Technical & Precise (Exact terminology, code/specs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Industry Segment
              </label>
              <select
                value={company.industry}
                onChange={(e) => setCompany({ ...company, industry: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              >
                <option value="Ecommerce">E-Commerce & Retail</option>
                <option value="SaaS">SaaS & Developer Tools</option>
                <option value="Services">Financial Services & Banking</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bot Initial Greeting Message
            </label>
            <textarea
              rows={2}
              value={company.greetingMessage}
              onChange={(e) => setCompany({ ...company, greetingMessage: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Bot Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
