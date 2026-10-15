import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Clock,
  Tag
} from 'lucide-react';
import { FAQItem, CompanyProfile } from '../types';

interface FaqExplorerProps {
  faqs: FAQItem[];
  company: CompanyProfile;
  onAskBot: (question: string) => void;
  onRateFaq: (faqId: string, helpful: boolean) => void;
}

export const FaqExplorer: React.FC<FaqExplorerProps> = ({
  faqs,
  company,
  onAskBot,
  onRateFaq,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(faqs[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((f) => set.add(f.category));
    return ['All', ...Array.from(set)];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'All' || faq.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesText =
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        (faq.keywords && faq.keywords.some((k) => k.toLowerCase().includes(query)));

      return matchesCategory && matchesText;
    });
  }, [faqs, selectedCategory, searchQuery]);

  const handleCopy = (faq: FAQItem) => {
    navigator.clipboard.writeText(`${faq.question}\n\n${faq.answer}`);
    setCopiedId(faq.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Search Section */}
      <div className="text-center space-y-3 py-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          How can we help you today?
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Explore our official knowledge base for {company.name}. Every answer is verified by our customer care team and synced live with our AI assistant.
        </p>

        {/* Search bar */}
        <div className="relative max-w-xl mx-auto mt-4">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by keyword, topic, or policy (e.g. tracking, refund, customs)..."
            className="w-full pl-11 pr-10 py-3 text-sm bg-white border border-slate-300 rounded-2xl shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-semibold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Interactive Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-800">No matching articles found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any articles matching "{searchQuery}". You can ask our AI assistant directly in the chat!
            </p>
            <button
              onClick={() => onAskBot(searchQuery || 'I have a customer question')}
              className="inline-flex items-center gap-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Chatbot Instead</span>
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Header row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1 pr-2">
                    {/* Clean unboxed metadata with separators */}
                    <div className="flex items-center gap-2 text-2xs text-slate-600 font-medium">
                      <span>{faq.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        Updated {faq.updatedAt}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{faq.helpfulCount} helpful</span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                      {faq.question}
                    </h3>
                  </div>

                  <div className="text-slate-400 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/30 space-y-4">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </p>

                    {/* Keywords tags */}
                    {faq.keywords && faq.keywords.length > 0 && (
                      <div className="flex items-center gap-2 text-2xs text-slate-600">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>Keywords: {faq.keywords.join(', ')}</span>
                      </div>
                    )}

                    {/* Bottom actions row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60 text-xs">
                      {/* Helpful votes */}
                      <div className="flex items-center gap-2 text-slate-500">
                        <span>Was this article helpful?</span>
                        <button
                          onClick={() => onRateFaq(faq.id, true)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors flex items-center gap-1 text-2xs"
                          title="Vote helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{faq.helpfulCount}</span>
                        </button>
                        <button
                          onClick={() => onRateFaq(faq.id, false)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors flex items-center gap-1 text-2xs"
                          title="Vote unhelpful"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>{faq.notHelpfulCount}</span>
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(faq)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-xs transition-colors"
                        >
                          {copiedId === faq.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-medium">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Answer</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onAskBot(faq.question)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Ask Bot About This</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
