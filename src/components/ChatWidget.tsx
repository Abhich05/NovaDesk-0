import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  User,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Volume2,
  VolumeX,
  Headphones,
  FileQuestion,
  Download,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { ChatMessage, FAQItem, CompanyProfile, SupportTicket } from '../types';
import { playChime } from '../utils/audio';

interface ChatWidgetProps {
  company: CompanyProfile;
  faqs: FAQItem[];
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onOpenEscalate: (subject?: string, summary?: string) => void;
  onFaqClick?: (faqId: string) => void;
  isFloating?: boolean;
  onCloseFloating?: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  company,
  faqs,
  messages,
  setMessages,
  onOpenEscalate,
  onFaqClick,
  isFloating = false,
  onCloseFloating,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [feedbackPromptId, setFeedbackPromptId] = useState<string | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    if (soundEnabled) playChime('send');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: newHistory.map((m) => ({ role: m.role, content: m.content })),
          contextFaqs: faqs.map((f) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            category: f.category,
            keywords: f.keywords,
          })),
          companyProfile: company,
          tone: company.tone,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      // Resolve matched FAQ objects
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
        content: data.reply || "I'm here to assist you! What details can I look up for you?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedFaqs: matchedFaqObjects,
        suggestEscalation: data.suggestEscalation,
        suggestedFollowUps: data.suggestedFollowUps || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (soundEnabled) playChime('message');
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `I am currently experiencing a momentary sync issue, but our knowledge base is available. Please feel free to rephrase or speak to our human support team directly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestEscalation: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleFeedback = (messageId: string, rating: 'helpful' | 'unhelpful') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback: rating } : m))
    );
    setFeedbackPromptId(messageId);
    setFeedbackNotes('');
  };

  const handleSaveFeedbackComment = (messageId: string) => {
    if (feedbackNotes.trim()) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, feedbackComment: feedbackNotes.trim() } : m
        )
      );
    }
    setFeedbackPromptId(null);
    setFeedbackNotes('');
  };

  const handleClearChat = () => {
    if (window.confirm('Reset conversation and restart customer session?')) {
      setMessages([
        {
          id: 'welcome-init',
          role: 'assistant',
          content: company.greetingMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedFollowUps: [
            'How do I track my order?',
            'What is your return policy?',
            'Do you ship internationally?',
          ],
        },
      ]);
    }
  };

  const handleDownloadTranscript = () => {
    const text = messages
      .map((m) => `[${m.timestamp}] ${m.role === 'user' ? 'Customer' : 'Nova AI'}: ${m.content}`)
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickStarters = [
    'How do I track my order?',
    'What is your return policy?',
    'Do you ship internationally?',
    'Can I modify my order?',
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"
              title="Assistant Online"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">{company.name} AI</span>
              <span className="text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                Verified FAQ
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Avg response &lt; 1s · {company.supportHours.split('(')[0].trim()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-300">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownloadTranscript}
            title="Download Chat Transcript"
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Download Transcript"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearChat}
            title="Restart conversation"
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Restart chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {isFloating && onCloseFloating && (
            <button
              onClick={onCloseFloating}
              title="Close chat window"
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors ml-1"
              aria-label="Minimize"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Escalation announcement banner */}
      <div className="px-4 py-2 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
        <span className="flex items-center gap-1.5 font-medium">
          <Headphones className="w-3.5 h-3.5 text-indigo-600" />
          Need customized human agent help?
        </span>
        <button
          onClick={() => onOpenEscalate('Customer Assistance Request', 'Customer requested support via live chat')}
          className="text-indigo-700 font-semibold hover:text-indigo-950 underline underline-offset-2"
        >
          Talk to a Human
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex gap-2.5 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-semibold ${
                  msg.role === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-3.5 h-3.5" />}
              </div>

              {/* Message Content */}
              <div className="space-y-1.5">
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Matched FAQ References */}
                  {msg.matchedFaqs && msg.matchedFaqs.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                      <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">
                        Verified Knowledge Sources:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.matchedFaqs.map((faq) => (
                          <button
                            key={faq.id}
                            onClick={() => onFaqClick && onFaqClick(faq.id)}
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-md transition-colors text-left"
                            title="Click to view full FAQ article"
                          >
                            <FileQuestion className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span className="truncate max-w-[200px]">{faq.question}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggest Escalation Button */}
                  {msg.suggestEscalation && (
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Requires account lookup or agent intervention?</span>
                        </div>
                        <p className="text-slate-600">
                          Our care team can access your account, check warehouse logistics, or process transactions.
                        </p>
                        <button
                          onClick={() => onOpenEscalate('Order & Account Verification', msg.content)}
                          className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors text-center block mt-1"
                        >
                          Create Expedited Support Ticket
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata & Feedback bar for assistant */}
                <div
                  className={`flex items-center gap-2 text-2xs text-slate-600 px-1 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-between'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleFeedback(msg.id, 'helpful')}
                        className={`p-1 rounded hover:bg-slate-200 transition-colors ${
                          msg.feedback === 'helpful' ? 'text-emerald-600 bg-emerald-50' : ''
                        }`}
                        title="Helpful answer"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'unhelpful')}
                        className={`p-1 rounded hover:bg-slate-200 transition-colors ${
                          msg.feedback === 'unhelpful' ? 'text-rose-600 bg-rose-50' : ''
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Feedback comment input */}
                {feedbackPromptId === msg.id && (
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs space-y-2 shadow-xs">
                    <p className="text-slate-600 font-medium">
                      {msg.feedback === 'helpful'
                        ? 'Glad that helped! Anything we could add?'
                        : 'Sorry about that! How can we improve this answer?'}
                    </p>
                    <input
                      type="text"
                      placeholder="Optional feedback note..."
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setFeedbackPromptId(null)}
                        className="px-2 py-1 text-slate-500 hover:text-slate-700 text-2xs"
                      >
                        Skip
                      </button>
                      <button
                        onClick={() => handleSaveFeedbackComment(msg.id)}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded text-2xs font-medium"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {/* Follow up suggestions */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full transition-all text-left shadow-2xs hover:border-indigo-200"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-slate-400 ml-2">Searching FAQs...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick starters on fresh conversation */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-200/60">
          <span className="text-2xs font-semibold text-slate-500 block mb-1.5">POPULAR QUESTIONS</span>
          <div className="flex flex-wrap gap-1.5">
            {quickStarters.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 transition-colors shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-3.5 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about shipping, refunds, orders..."
              className="w-full pl-3.5 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs flex items-center justify-center shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1 text-2xs text-slate-600">
          <span>NovaDesk AI answers using verified policy documents.</span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};
